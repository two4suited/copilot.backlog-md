#!/usr/bin/env bash
# sync-backlog-issues.sh
# Syncs backlog/tasks/task-*.md files to GitHub Issues.
# Usage: BRANCH="main" scripts/sync-backlog-issues.sh
# Requires: gh CLI authenticated (GH_TOKEN or gh auth login)
set -euo pipefail

# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------
TASKS_DIR="backlog/tasks"
SLEEP_BETWEEN_CALLS=0.5   # seconds – stay well under GitHub's rate limit

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

log()  { echo "[sync] $*" >&2; }
warn() { echo "[warn] $*" >&2; }

# Sanitize a string for use as a GitHub label: keep a-z 0-9 : / - .
# Convert uppercase to lower, replace spaces and illegal chars with '-'.
sanitize_label() {
  echo "$1" \
    | tr '[:upper:]' '[:lower:]' \
    | sed 's/[^a-z0-9:/.@_-]/-/g' \
    | sed 's/-\{2,\}/-/g' \
    | sed 's/^-//;s/-$//'
}

# Ensure a label exists in the repo; create it if missing.
ensure_label() {
  local name="$1"
  local color="${2:-ededed}"
  if ! gh label list --limit 500 --json name --jq '.[].name' 2>/dev/null | grep -qx "$name"; then
    log "Creating label: $name"
    gh label create "$name" --color "$color" --force >/dev/null 2>&1 || true
  fi
}

# Extract a single YAML scalar from frontmatter.
# Usage: get_field <field> <file>
get_field() {
  local field="$1" file="$2"
  awk -v f="$field" '
    /^---$/ { if(in_fm) exit; in_fm=1; next }
    in_fm && /^[[:space:]]*$/ { next }
    in_fm {
      if ($0 ~ "^" f ":") {
        sub("^" f ":[[:space:]]*","")
        # strip surrounding quotes
        gsub(/^'"'"'|'"'"'$|^"|"$/, "")
        print; exit
      }
    }
  ' "$file"
}

# Extract a YAML list field as newline-separated values.
# Handles both inline `[a, b]` and block `- item` forms.
get_list_field() {
  local field="$1" file="$2"
  awk -v f="$field" '
    /^---$/ { if(in_fm) exit; in_fm=1; next }
    in_fm {
      if ($0 ~ "^" f ":") {
        line = $0
        sub("^" f ":[[:space:]]*","",line)
        if (line ~ /^\[/) {
          # inline list
          gsub(/[\[\]]/, "", line)
          n = split(line, arr, /,[[:space:]]*/)
          for (i=1; i<=n; i++) {
            gsub(/^[[:space:]]+|[[:space:]]+$/, "", arr[i])
            gsub(/^'"'"'|'"'"'$|^"|"$/, "", arr[i])
            if (arr[i] != "") print arr[i]
          }
        } else {
          # block list – collect following lines starting with "  - "
          in_list = 1
        }
        next
      }
      if (in_list) {
        if ($0 ~ /^[[:space:]]+-[[:space:]]/) {
          item = $0
          sub(/^[[:space:]]+-[[:space:]]/, "", item)
          gsub(/^'"'"'|'"'"'$|^"|"$/, "", item)
          print item
        } else {
          in_list = 0
        }
      }
    }
  ' "$file"
}

# Extract the body of a named ## Section from a markdown file.
get_section() {
  local heading="$1" file="$2"
  awk -v h="## $heading" '
    $0 == h { found=1; next }
    found && /^## / { exit }
    found { print }
  ' "$file" \
  | sed '/^<!-- /d' \
  | sed '/^[[:space:]]*$/{ /./!d }' \
  | awk 'NF{found=1} found{print}' \
  | sed -e 's/[[:space:]]*$//'
}

# Write back github_issue: N into a task file's frontmatter.
# If the field already exists it is updated; otherwise it is inserted before the closing ---.
write_github_issue_field() {
  local file="$1" number="$2"
  if grep -q "^github_issue:" "$file"; then
    # Update existing field
    sed -i.bak "s/^github_issue:.*/github_issue: $number/" "$file" && rm -f "${file}.bak"
  else
    # Insert before closing --- of frontmatter
    # Find the second occurrence of ^---$ and insert before it
    awk -v num="$number" '
      /^---$/ {
        count++
        if (count == 2) {
          print "github_issue: " num
        }
      }
      { print }
    ' "$file" > "${file}.tmp" && mv "${file}.tmp" "$file"
  fi
}

# ---------------------------------------------------------------------------
# Determine branch name
# ---------------------------------------------------------------------------
BRANCH="${BRANCH:-}"
if [[ -z "$BRANCH" ]]; then
  BRANCH="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "unknown")"
fi

BRANCH_LABEL="branch:$(sanitize_label "$BRANCH")"
log "Branch label: $BRANCH_LABEL"

# Pre-create the branch label (dynamic, per push)
ensure_label "$BRANCH_LABEL" "0075ca"

# Pre-create static taxonomy labels
STATUS_LABELS=("status:To Do" "status:In Progress" "status:Done" "status:Blocked" "status:Archived")
PRIORITY_LABELS=("priority:high" "priority:medium" "priority:low")

for lbl in "${STATUS_LABELS[@]}"; do
  ensure_label "$lbl" "e4e669"
done
for lbl in "${PRIORITY_LABELS[@]}"; do
  case "$lbl" in
    *high*)   ensure_label "$lbl" "d93f0b" ;;
    *medium*) ensure_label "$lbl" "fbca04" ;;
    *low*)    ensure_label "$lbl" "0e8a16" ;;
  esac
done

sleep "$SLEEP_BETWEEN_CALLS"

# ---------------------------------------------------------------------------
# Process each task file
# ---------------------------------------------------------------------------
shopt -s nullglob
task_files=("$TASKS_DIR"/task-*.md)

if [[ ${#task_files[@]} -eq 0 ]]; then
  log "No task files found in $TASKS_DIR – nothing to sync."
  exit 0
fi

log "Found ${#task_files[@]} task file(s) to sync."

for task_file in "${task_files[@]}"; do
  log "Processing: $task_file"

  # --- Parse frontmatter fields ---
  task_id="$(get_field 'id' "$task_file")"
  task_title="$(get_field 'title' "$task_file")"
  task_status="$(get_field 'status' "$task_file")"
  task_priority="$(get_field 'priority' "$task_file")"
  github_issue_num="$(get_field 'github_issue' "$task_file")"

  if [[ -z "$task_id" || -z "$task_title" ]]; then
    warn "Skipping $task_file – could not parse id or title."
    continue
  fi

  # Normalise task ID to uppercase for consistency
  task_id_upper="${task_id^^}"  # e.g. task-13 → TASK-13

  # --- Parse labels list ---
  mapfile -t raw_labels < <(get_list_field 'labels' "$task_file")

  # --- Extract Description ---
  description="$(get_section 'Description' "$task_file" || echo '')"

  # --- Build issue title ---
  issue_title="[$task_id_upper] $task_title"

  # --- Build issue body ---
  meta_section="**Task ID:** $task_id_upper  
**Status:** ${task_status:-unknown}  
**Priority:** ${task_priority:-unset}  
**Source file:** \`$task_file\`"

  if [[ -n "$description" ]]; then
    issue_body="$meta_section

---

$description"
  else
    issue_body="$meta_section"
  fi

  # --- Determine open/closed ---
  should_close=false
  case "${task_status,,}" in
    done|archived) should_close=true ;;
  esac

  # --- Build label set ---
  declare -a issue_labels=()

  # task identity label
  task_label="task:$(sanitize_label "$task_id_upper")"
  ensure_label "$task_label" "c5def5"
  issue_labels+=("$task_label")

  # status label
  if [[ -n "$task_status" ]]; then
    status_label="status:$task_status"
    ensure_label "$status_label" "e4e669"
    issue_labels+=("$status_label")
  fi

  # priority label
  if [[ -n "$task_priority" ]]; then
    priority_label="priority:$(sanitize_label "$task_priority")"
    ensure_label "$priority_label" "fbca04"
    issue_labels+=("$priority_label")
  fi

  # pass-through labels from task frontmatter
  for lbl in "${raw_labels[@]}"; do
    [[ -z "$lbl" ]] && continue
    sanitized="$(sanitize_label "$lbl")"
    ensure_label "$sanitized" "ededed"
    issue_labels+=("$sanitized")
  done

  # branch label
  issue_labels+=("$BRANCH_LABEL")

  # Build comma-separated label string for gh CLI
  labels_csv="$(IFS=','; echo "${issue_labels[*]}")"

  sleep "$SLEEP_BETWEEN_CALLS"

  # --- Find existing issue (by stored number or by label lookup) ---
  existing_issue=""

  if [[ -n "$github_issue_num" ]]; then
    # Verify the stored issue number still exists
    if gh issue view "$github_issue_num" --json number --jq '.number' >/dev/null 2>&1; then
      existing_issue="$github_issue_num"
    else
      warn "Stored github_issue $github_issue_num not found; will search by label."
    fi
  fi

  if [[ -z "$existing_issue" ]]; then
    existing_issue="$(gh issue list \
      --label "$task_label" \
      --state all \
      --json number \
      --jq '.[0].number // empty' \
      --limit 1 2>/dev/null || echo '')"
  fi

  sleep "$SLEEP_BETWEEN_CALLS"

  # Write body to a temp file to safely handle newlines, quotes, and special chars
  local body_file
  body_file="$(mktemp /tmp/sync-issue-body.XXXXXX)"
  printf '%s' "$issue_body" > "$body_file"
  trap 'rm -f "$body_file"' RETURN

  # --- Create or update ---
  if [[ -z "$existing_issue" ]]; then
    log "Creating issue for $task_id_upper ..."
    local create_out create_err create_rc
    create_out="$(gh issue create \
      --title "$issue_title" \
      --body-file "$body_file" \
      --label "$labels_csv" \
      --json number \
      --jq '.number' 2>/tmp/sync-gh-err.txt)" && create_rc=0 || create_rc=$?

    if [[ $create_rc -eq 0 && -n "$create_out" ]]; then
      new_number="$create_out"
      log "Created issue #$new_number for $task_id_upper"
      write_github_issue_field "$task_file" "$new_number"
      existing_issue="$new_number"
    else
      warn "Failed to create issue for $task_id_upper (rc=$create_rc): $(cat /tmp/sync-gh-err.txt 2>/dev/null | head -3)"
      rm -f "$body_file"
      continue
    fi
  else
    log "Updating issue #$existing_issue for $task_id_upper ..."
    gh issue edit "$existing_issue" \
      --title "$issue_title" \
      --body-file "$body_file" \
      --add-label "$labels_csv" \
      2>/tmp/sync-gh-err.txt || warn "Failed to edit issue #$existing_issue: $(cat /tmp/sync-gh-err.txt | head -3)"
  fi

  sleep "$SLEEP_BETWEEN_CALLS"

  # --- Open / close ---
  if [[ "$should_close" == "true" ]]; then
    current_state="$(gh issue view "$existing_issue" --json state --jq '.state' 2>/dev/null || echo 'OPEN')"
    if [[ "${current_state^^}" != "CLOSED" ]]; then
      log "Closing issue #$existing_issue (status: $task_status)"
      gh issue close "$existing_issue" >/dev/null 2>&1 || warn "Failed to close issue #$existing_issue"
    fi
  else
    current_state="$(gh issue view "$existing_issue" --json state --jq '.state' 2>/dev/null || echo 'OPEN')"
    if [[ "${current_state^^}" == "CLOSED" ]]; then
      log "Re-opening issue #$existing_issue (status: $task_status)"
      gh issue reopen "$existing_issue" >/dev/null 2>&1 || warn "Failed to reopen issue #$existing_issue"
    fi
  fi

  sleep "$SLEEP_BETWEEN_CALLS"

  unset issue_labels
  declare -a issue_labels=()
done

log "Sync complete."
