---
id: TASK-11
title: 'Research: backlog.md to GitHub Issues sync options'
status: Done
assignee:
  - '@copilot'
created_date: '2026-03-14 21:46'
updated_date: '2026-03-14 21:50'
labels:
  - research
  - infrastructure
  - github
dependencies: []
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Research how to sync backlog.md task files with GitHub Issues. Investigate: (1) GitHub CLI gh issue create/edit commands and how to map backlog task fields to issue fields, (2) existing GitHub Actions for markdown-to-issues sync (e.g. github-issue-sync, project-sync actions), (3) how to detect which backlog tasks are new/changed on a push, (4) how to tag/label a GitHub Issue with the branch name that triggered the push, (5) how to store the mapping between backlog task IDs and GitHub issue numbers (e.g. in task frontmatter or a JSON map file), (6) bidirectional vs unidirectional sync considerations. Produce a short findings doc and recommended approach before implementation tasks are created.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Findings written to backlog task notes covering all 6 research areas
- [x] #2 Recommended sync approach chosen (unidirectional backlog→GitHub or bidirectional)
- [x] #3 Recommended tool/library identified (gh CLI, octokit, existing action, or custom script)
- [x] #4 Branch-tagging mechanism documented
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Review task details and structure
2. Run gh CLI help commands to document capabilities
3. Search for existing sync tools/actions
4. Read sample task files to document frontmatter schema
5. Evaluate changed-file detection strategies
6. Evaluate mapping storage options
7. Write findings to implementation notes
8. Mark task done with final summary
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
## Findings

### 1. GitHub CLI Capabilities

**gh issue create** flags: -t/--title, -b/--body, -F/--body-file, -l/--label (multiple), -a/--assignee, -m/--milestone, -p/--project.

**gh issue edit** flags: -t/--title, -b/--body, --add-label, --remove-label, --add-assignee, --remove-assignee, --milestone. NOTE: no --state flag; use `gh issue close` / `gh issue reopen` instead.

**gh issue list** flags: --label, --assignee, --state (open|closed|all), --search (title query), --json (fields: number, title, labels, state, body, etc.), --limit. To find an existing issue: `gh issue list --label "task:TASK-11" --json number,title --limit 1`.

**gh label create** flags: name (positional), -c/--color (hex), -d/--description, -f/--force (update if exists, no error). The --force flag makes label creation idempotent.

### 2. Existing Actions / Tools

No npm package named github-issues-sync was found. No pre-built GitHub Action was found that syncs markdown frontmatter files to GitHub Issues.

Found tools going the opposite direction (issues->markdown): eunjae-lee/issue-to-markdown, mattduck/gh2md.

Viable options:
- **gh CLI bash script** in a workflow step: zero dependencies, full control, readable, debuggable.
- **actions/github-script**: runs JS with octokit injected; good for complex logic. Requires writing inline JS in YAML.
- **Custom Node.js script** with @octokit/rest (v22.0.1) + js-yaml (v4.1.1): most powerful, best for complex parsing. Adds a build step or requires node_modules committed.

**Verdict: gh CLI bash script** is the best first choice -- no extra dependencies, straightforward to read and maintain.

### 3. Backlog Task File Format

Files live in `backlog/tasks/task-<id> - <title-slug>.md`.

Frontmatter (YAML between --- delimiters):
```yaml
id: TASK-11
title: "Research: backlog.md to GitHub Issues sync options"
status: In Progress  # To Do | In Progress | Done | Blocked
assignee: ["@copilot"]
created_date: "2026-03-14 21:46"
updated_date: "2026-03-14 21:47"
labels: [research, infrastructure, github]
dependencies: []
priority: high  # high | medium | low
```

Parsing strategy: use `awk` to extract the frontmatter block (between first and second `---` lines), then use `grep` + `sed` for individual fields. Example:
```bash
TITLE=$(grep '^title:' "$FILE" | sed "s/^title: *'\\?//;s/'\\? *$//")
STATUS=$(grep '^status:' "$FILE" | sed 's/^status: *//')
```

### 4. Detecting Changed Files on Push

**Strategy A -- git diff only changed files:**
```bash
git diff --name-only BEFORE_SHA AFTER_SHA -- 'backlog/tasks/*.md'
```
Pros: faster, lower API usage. Cons: first push on a new branch has no before SHA; force-pushes can miss files.

**Strategy B -- always sync all task files (idempotent):**
```bash
find backlog/tasks -name "task-*.md" | sort
```
Pros: simple, reliable, no edge cases. Cons: more API calls (~4 per task). With <=50 tasks this is well within GitHub API limits.

**Recommendation: Strategy B (sync all)**. The overhead is negligible and it avoids edge cases with first push to a branch, force pushes, and merge commits. The sync logic is idempotent so re-running is safe.

### 5. Branch Name to GitHub Label

In a GitHub Actions workflow: `${{ github.ref_name }}` yields the branch name (e.g. `main`, `feature/my-thing`).

For label naming: prefix `branch:` and sanitize slashes: `branch:main`, `branch:feature-my-thing`.

Sanitize in bash: `BRANCH_LABEL="branch:$(echo "$BRANCH" | sed 's|/|-|g')"`

Create idempotently (--force updates if exists, never errors):
```bash
gh label create "$BRANCH_LABEL" --color 0075ca --force
```

Then add to the issue: `gh issue edit "$NUM" --add-label "$BRANCH_LABEL"`

### 6. Mapping Storage Options

**A. Frontmatter field `github_issue: 123`** -- Requires the workflow to commit a file change back to the repo. Creates a commit loop risk (each commit triggers the workflow again). Risk of merge conflicts on active branches. Not recommended.

**B. `.github/backlog-issue-map.json`** -- Central JSON file. Same commit-back problem as A; concurrent pushes from different branches will produce conflicts. Not recommended.

**C. Search by title each run** -- Embed task ID in issue title: `[TASK-11] Research: ...`. Use `gh issue list --search "[TASK-11] in:title"`. Always accurate, no stored state, fully idempotent. Simple and reliable.

**D. GitHub issue label `task:TASK-11`** -- Apply a unique label to each issue on creation. Look up by label: `gh issue list --label "task:TASK-11" --json number --limit 1 --state all`. No file writes, GitHub is the source of truth, fully idempotent. Most robust.

**Recommendation: Option D (label-based mapping)**. The label `task:<ID>` is applied at create time and never changes. Lookup by label is fast and reliable. No git write-back required. Works across branches.

### 7. Recommended Approach

**Tool:** `gh` CLI bash script inside a `run:` step in GitHub Actions. No extra dependencies.

**Trigger:**
```yaml
on:
  push:
    branches: ["**"]
    paths: ["backlog/tasks/**"]
```
The `paths` filter keeps the workflow quiet on unrelated commits.

**Mapping:** Option D -- label `task:<ID>` (e.g. `task:TASK-11`) on each GitHub Issue.

**Sync direction:** Unidirectional -- backlog -> GitHub Issues only.

**Fields to sync:**
- title: `[TASK-ID] <title from frontmatter>`
- body: Description section + Acceptance Criteria (extracted between section comment markers)
- labels: `task:<id>`, `status:<status>`, each task label, `branch:<branch-name>`
- state: open when status != Done; closed when status == Done

**Per-task algorithm:**
```bash
# 1. Ensure branch label exists
gh label create "branch:$BRANCH" --color 0075ca --force

# 2. Find existing issue by task label
ISSUE_NUM=$(gh issue list --label "task:$TASK_ID" \
  --json number --limit 1 --state all -q ".[0].number")

# 3. Create or update
if [ -z "$ISSUE_NUM" ]; then
  gh issue create --title "[$TASK_ID] $TITLE" \
    --body "$BODY" --label "task:$TASK_ID" --label "status:$STATUS"
else
  gh issue edit "$ISSUE_NUM" --title "[$TASK_ID] $TITLE" --body "$BODY"
fi

# 4. Sync status and branch labels
gh issue edit "$ISSUE_NUM" --add-label "status:$STATUS" --add-label "branch:$BRANCH"

# 5. Open/close based on Done status
if [ "$STATUS" = "Done" ]; then
  gh issue close "$ISSUE_NUM" --reason completed
else
  gh issue reopen "$ISSUE_NUM" 2>/dev/null || true
fi
```

**Permissions needed in workflow:**
```yaml
permissions:
  issues: write
  contents: read
```

**Rate limits:** GitHub Actions token: 1000 req/hr. With <=50 tasks x ~4 API calls each = 200 calls per push -- well within limits.
<!-- SECTION:NOTES:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
Researched 7 areas for backlog.md -> GitHub Issues sync:

1. **gh CLI capabilities**: `gh issue create/edit/list/close/reopen` + `gh label create --force` provide all required operations. Issues can be found by label, title search, or number.

2. **Existing tools**: No pre-built action found for markdown frontmatter -> GitHub Issues sync. Custom gh CLI bash script is the right approach.

3. **Task file format**: YAML frontmatter with id, title, status (To Do/In Progress/Done/Blocked), labels (array), assignee (array), priority. Body sections delimited by HTML comment markers.

4. **Changed-file detection**: Recommend Strategy B (sync all tasks every push) -- simpler, idempotent, avoids edge cases with first branch push and force-pushes. With <=50 tasks, ~200 API calls/push is well within limits.

5. **Branch labeling**: `github.ref_name` in workflow; sanitize `/` to `-`; create with `gh label create "branch:NAME" --force` (idempotent).

6. **Mapping storage**: Recommend Option D -- unique label `task:<ID>` on each GitHub Issue. No git write-back needed, GitHub is source of truth, no merge conflicts.

7. **Recommended approach**: gh CLI bash script, `on: push branches: ["**"] paths: ["backlog/tasks/**"]`, unidirectional backlog->issues, label-based mapping, sync title/body/labels/state per task.
<!-- SECTION:FINAL_SUMMARY:END -->
