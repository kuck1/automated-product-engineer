#!/usr/bin/env bash
set -euo pipefail

BASE_BRANCH="${1:-}"
PR_TITLE="${2:-}"
BODY_FILE="${3:-templates/automation/PR_BODY.md}"

if [[ -z "$BASE_BRANCH" || -z "$PR_TITLE" ]]; then
  echo "Usage: $0 <base-branch> <pr-title> [body-file]" >&2
  exit 2
fi

command -v git >/dev/null || { echo "git is required" >&2; exit 1; }
command -v gh >/dev/null || { echo "GitHub CLI is required" >&2; exit 1; }
[[ -f "$BODY_FILE" ]] || { echo "PR body file not found: $BODY_FILE" >&2; exit 1; }

BRANCH="$(git branch --show-current)"
if [[ -z "$BRANCH" || "$BRANCH" == "$BASE_BRANCH" || "$BRANCH" == "main" || "$BRANCH" == "master" ]]; then
  echo "Run from a non-default feature branch. Current branch: ${BRANCH:-detached}" >&2
  exit 1
fi

if [[ -n "$(git status --porcelain)" ]]; then
  echo "Worktree must be clean before opening a PR." >&2
  exit 1
fi

git push --set-upstream origin "$BRANCH"

if gh pr view "$BRANCH" >/dev/null 2>&1; then
  echo "A pull request already exists for $BRANCH."
  gh pr view "$BRANCH" --json url --jq .url
else
  gh pr create \
    --draft \
    --base "$BASE_BRANCH" \
    --head "$BRANCH" \
    --title "$PR_TITLE" \
    --body-file "$BODY_FILE"
fi
