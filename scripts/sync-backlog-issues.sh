#!/usr/bin/env bash
# sync-backlog-issues.sh
# Syncs backlog/tasks/task-*.md files to GitHub Issues.
#
# Modes:
#   FULL SYNC (default / scheduled):   processes every task file
#   INCREMENTAL (on push):             set CHANGED_FILES env var to a
#       newline-separated list of task file paths; only those files plus
#       any task that has never been synced (no github_issue: field) are
#       processed.  Tasks whose status hasn't changed are skipped entirely.
#
# Usage: BRANCH="main" scripts/sync-backlog-issues.sh
# Requires: gh CLI authenticated (GH_TOKEN or gh auth login)
set -euo pipefail

# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------
TASKS_DIR="backlog/tasks"
SLEEP_BETWEEN_CALLS=2   # seconds – stay well under GitHub's rate limit

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

log()  { echo "[sync] $*" >&2; }
warn() { echo "[warn] $*" >&2; }

# Retry wrapper with exponential backoff for rate-limited gh API calls.
gh_with_backoff() {
  local attempt=0
  local max_attempts=4
  local delay=2
  until output=$(eval "$@" 2>&1); do
    if echo "$output" | grep -q "rate limit"; then
      attempt=$((attempt + 1))
      if [[ $attempt -ge $max_attempts ]]; then
        warn "Rate limit: max retries exceeded for: $*"
        return 1
      fi
      warn "Rate limit hit — backing off ${delay}s (attempt $attempt/$max_attempts)"
      sleep "$delay"
      delay=$((delay * 2))
    else
      warn "Command failed: $output"
      return 1
    fi
  done
  echo "$output"
}

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
# Check rate limit before starting bulk operations
# ---------------------------------------------------------------------------
remaining=$(gh api rate_limit --jq '.resources.graphql.remaining' 2>/dev/null || echo "999")
if [[ "$remaining" -lt 100 ]]; then
  warn "GitHub GraphQL rate limit too low ($remaining remaining) — aborting sync."
  exit 0
fi
log "GitHub rate limit: $remaining GraphQL points remaining"

# ---------------------------------------------------------------------------
# Determine which task files to process
# ---------------------------------------------------------------------------
shopt -s nullglob
all_task_files=("$TASKS_DIR"/task-*.md)

if [[ ${#all_task_files[@]} -eq 0 ]]; then
  log "No task files found in $TASKS_DIR – nothing to sync."
  exit 0
fi

# Build the candidate list:
#   - If CHANGED_FILES is set (incremental push mode): start with only those files,
#     then add any task that has never been synced (no github_issue: in frontmatter).
#   - If CHANGED_FILES is unset (full / scheduled mode): use every task file.
declare -a task_files=()

if [[ "${INCREMENTAL:-false}" == "true" ]]; then
  log "Incremental mode — processing changed files + any unsynced tasks."
  log "INCREMENTAL=true — changed files from env: $(echo "$CHANGED_FILES" | wc -l | tr -d ' ') file(s)"

  # Add explicitly changed task files (filter to only files that exist)
  while IFS= read -r f; do
    [[ -z "$f" ]] && continue
    [[ -f "$f" ]] && task_files+=("$f")
  done <<< "$CHANGED_FILES"

  # Also add any task file that has never been synced (no github_issue field)
  for f in "${all_task_files[@]}"; do
    issue_num="$(get_field 'github_issue' "$f")"
    if [[ -z "$issue_num" ]]; then
      # Avoid duplicates
      already=false
      for existing in "${task_files[@]+"${task_files[@]}"}"; do
        [[ "$existing" == "$f" ]] && { already=true; break; }
      done
      [[ "$already" == false ]] && task_files+=("$f")
    fi
  done
else
  log "Full sync mode — processing all ${#all_task_files[@]} task file(s)."
  task_files=("${all_task_files[@]}")
fi

if [[ ${#task_files[@]} -eq 0 ]]; then
  log "Nothing to sync (no changed files and no unsynced tasks)."
  exit 0
fi

MAX_ISSUES_PER_RUN="${MAX_ISSUES_PER_RUN:-20}"
if [[ ${#task_files[@]} -gt $MAX_ISSUES_PER_RUN ]]; then
  log "Capping to $MAX_ISSUES_PER_RUN files (MAX_ISSUES_PER_RUN). Full sync will continue on next run."
  task_files=("${task_files[@]:0:$MAX_ISSUES_PER_RUN}")
fi

log "Syncing ${#task_files[@]} of ${#all_task_files[@]} task file(s)."

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

  # --- Find existing issue (by stored number → label → title) ---
  existing_issue=""

  if [[ -n "$github_issue_num" ]]; then
    # Verify the stored issue number still exists
    if gh issue view "$github_issue_num" --json number --jq '.number' >/dev/null 2>&1; then
      existing_issue="$github_issue_num"
    else
      warn "Stored github_issue $github_issue_num not found; will search by label."
    fi
  fi

  # Second: search by task-identity label (catches issues created before frontmatter was written back)
  if [[ -z "$existing_issue" ]]; then
    existing_issue="$(gh issue list \
      --label "$task_label" \
      --state all \
      --json number \
      --jq 'sort_by(.number) | .[0].number // empty' \
      --limit 10 2>/dev/null || echo '')"
  fi

  # Third: search by exact title (dedup guard against concurrent runs)
  if [[ -z "$existing_issue" ]]; then
    existing_issue="$(gh issue list \
      --search "\"${issue_title}\" in:title" \
      --state all \
      --json number,title \
      --jq --arg t "$issue_title" '[.[] | select(.title == $t)] | sort_by(.number) | .[0].number // empty' \
      --limit 10 2>/dev/null || echo '')"
  fi

  sleep "$SLEEP_BETWEEN_CALLS"

  # Write body to a temp file to safely handle newlines, quotes, and special chars
  body_file="$(mktemp /tmp/sync-issue-body.XXXXXX)"
  printf '%s' "$issue_body" > "$body_file"

  # --- Create or update ---
  if [[ -z "$existing_issue" ]]; then
    log "Creating issue for $task_id_upper ..."
    create_out=""
    create_rc=0
    # gh issue create outputs the issue URL to stdout (not --json/--jq — not supported on create)
    create_out="$(gh issue create \
      --title "$issue_title" \
      --body-file "$body_file" \
      --label "$labels_csv" \
      2>/tmp/sync-gh-err.txt)" && create_rc=0 || create_rc=$?

    # Parse issue number from URL e.g. https://github.com/owner/repo/issues/42
    new_number="$(echo "$create_out" | grep -oE '[0-9]+$' || true)"

    if [[ $create_rc -eq 0 && -n "$new_number" ]]; then
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

  # Clean up temp body file
  rm -f "$body_file"

  unset issue_labels
  declare -a issue_labels=()
done

log "Sync complete."
