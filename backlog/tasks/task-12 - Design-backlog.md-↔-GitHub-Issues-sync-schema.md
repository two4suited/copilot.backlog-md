---
id: TASK-12
title: 'Design: backlog.md ↔ GitHub Issues sync schema'
status: In Progress
assignee:
  - '@copilot'
created_date: '2026-03-14 21:46'
updated_date: '2026-03-14 21:52'
labels:
  - design
  - infrastructure
  - github
dependencies: []
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Based on research findings (TASK-11), design the sync schema: which backlog fields map to which GitHub Issue fields, how task ID→issue number mapping is stored, how branch names become labels, what happens on update vs create, and how deletions/archiving are handled. Document the design in task notes.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Field mapping table defined: title, description, status, labels, assignee, priority → GitHub Issue fields
- [ ] #2 ID mapping storage approach chosen (frontmatter field or .github/backlog-issue-map.json)
- [ ] #3 Branch label format defined (e.g. branch:feature/my-feature)
- [ ] #4 Sync rules documented: create if no issue, update if changed, close if Done/archived
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
## Field Mapping

| Backlog field | GitHub Issue field | Notes |
|---|---|---|
| title | title | Direct map |
| ## Description section | body (first section) | Extract markdown between ## Description and next ## heading |
| status | state + label | To Do / In Progress / Blocked → open; Done → closed; also apply status:to-do / status:in-progress / status:blocked / status:done label |
| labels[] | labels | Apply each label as-is (e.g. backend, api, testing) |
| priority | label | Map to priority:high / priority:medium / priority:low |
| assignee | — | Skip — GitHub usernames differ from @mention aliases in backlog |
| id | label | task:TASK-N (e.g. task:TASK-12); used as stable lookup key |
| (branch from CI env) | label | branch:BRANCHNAME — sanitize github.ref_name replacing / with - |

## ID Mapping Storage

No .github/backlog-issue-map.json file needed. The task:TASK-N label on each
GitHub Issue IS the mapping. To find the issue for a given task, query:

  gh issue list --label "task:TASK-12" --json number,state --limit 1

This is idempotent and survives repo clones, forks, and branch changes.

## Script Design (pseudocode for scripts/sync-backlog-issues.sh)

```
#!/usr/bin/env bash
set -euo pipefail
REPO="OWNER/REPO"   # from: gh repo view --json nameWithOwner -q .nameWithOwner
BRANCH_LABEL="branch:$(echo "$GITHUB_REF_NAME" | tr '/' '-')"

# --- Pre-create all taxonomy labels (idempotent via --force) ---
for label in status:to-do status:in-progress status:done status:blocked \
             priority:high priority:medium priority:low; do
  gh label create "$label" --repo "$REPO" --color "#ededed" --force
done
gh label create "$BRANCH_LABEL" --repo "$REPO" --color "#0075ca" --force

for task_file in backlog/tasks/task-*.md; do
  # --- Step 1: Parse frontmatter (between first and second ---) ---
  id=$(sed -n '/^---$/,/^---$/p' "$task_file" | grep '^id:' | ...)
  title=$(...)
  status=$(...)
  priority=$(...)
  labels=$(...)   # parsed from YAML array [backend, api] → comma-separated

  # --- Step 2: Extract description body ---
  body=$(awk '/^## Description/{found=1;next} found && /^## /{exit} found{print}' "$task_file" | sed '/^[[:space:]]*$/d')
  [ -z "$body" ] && body="$title"   # fallback: no Description section

  # --- Step 3: Build full label list ---
  task_label="task:$id"                           # e.g. task:TASK-12
  status_label="status:$(map_status "$status")"   # status:in-progress
  priority_label="priority:$priority"             # priority:high
  all_labels="$task_label,$status_label,$priority_label,$BRANCH_LABEL"
  [ -n "$labels" ] && all_labels="$all_labels,$labels"   # append skill labels

  # Ensure task-id label exists
  gh label create "$task_label" --repo "$REPO" --color "#e4e669" --force

  # --- Step 4: Find existing issue by task:TASK-ID label ---
  issue_json=$(gh issue list --repo "$REPO" --label "$task_label" \
                 --json number,state --limit 1 --state all)
  issue_number=$(echo "$issue_json" | jq -r '.[0].number // empty')
  issue_state=$(echo  "$issue_json" | jq -r '.[0].state  // empty')

  # --- Step 5: Create (if new) or update (if existing) ---
  if [ -z "$issue_number" ]; then
    gh issue create --repo "$REPO" \
      --title "$title" --body "$body" --label "$all_labels"
  else
    gh issue edit "$issue_number" --repo "$REPO" \
      --title "$title" --body "$body" --add-label "$all_labels"
  fi

  # --- Step 6: Sync open/closed state ---
  if [ "$status" = "Done" ]; then
    [ "$issue_state" != "CLOSED" ] && gh issue close "$issue_number" --repo "$REPO"
  else
    [ "$issue_state" = "CLOSED" ]  && gh issue reopen "$issue_number" --repo "$REPO"
  fi
done

# --- Step 7: Archived tasks → close their issues ---
for task_file in backlog/tasks/archive/task-*.md; do
  [ -f "$task_file" ] || continue
  id=$(...)
  task_label="task:$id"
  issue_number=$(gh issue list --repo "$REPO" --label "$task_label" \
                   --json number --limit 1 --state open | jq -r '.[0].number // empty')
  [ -n "$issue_number" ] && gh issue close "$issue_number" --repo "$REPO"
done
```

## Label Taxonomy

### Status labels (managed by sync script)
- status:to-do        — task status is "To Do"
- status:in-progress  — task status is "In Progress"
- status:blocked      — task status is "Blocked"
- status:done         — task status is "Done"

### Priority labels (managed by sync script)
- priority:high
- priority:medium
- priority:low

### Task-ID labels (created dynamically, one per task)
- task:TASK-N   (e.g. task:TASK-12)
- This is the stable foreign key linking GitHub Issue <-> backlog task file.
- Created with --force before each issue create/edit call.

### Branch labels (created dynamically, one per workflow run)
- branch:BRANCHNAME  (e.g. branch:main, branch:feature-auth)
- Sanitized: $GITHUB_REF_NAME with every '/' replaced by '-'
- Created with --force at the start of each workflow run.

### Skill / domain labels (pass-through from task frontmatter)
- backend, frontend, database, aspire, testing, bug, design,
  infrastructure, performance, security, github, etc.
- The script runs gh label create --force for each to ensure they exist.

## Edge Cases

1. No ## Description section in task file
   Body falls back to the task title string so gh issue create never receives
   an empty --body argument.

2. Label names containing special characters (colons, hyphens, spaces)
   gh label create and --label accept arbitrary UTF-8 strings; the GitHub API
   URL-encodes them transparently. Standard shell quoting is sufficient.

3. First run on a repo with zero existing issues
   issue_number is empty for every task, so every task enters the create path.
   All taxonomy labels are pre-created with --force before the loop begins, so
   label-not-found errors cannot occur during issue creation.

4. Archived task files
   Archived tasks live in backlog/tasks/archive/ and are excluded from the main
   glob (backlog/tasks/task-*.md). A dedicated second pass over
   backlog/tasks/archive/task-*.md closes any still-open issues for those tasks.

5. Rate limiting
   The gh CLI uses the GITHUB_TOKEN provided by GitHub Actions (1 000 req/hr).
   For typical backlog sizes (< 100 tasks) this is well within limits. gh also
   automatically retries HTTP 429 responses.
<!-- SECTION:NOTES:END -->
