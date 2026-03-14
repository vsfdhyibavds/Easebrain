#!/bin/bash
# Usage: run from repository root (backend-ease-brain)
# This script will remove .env and any files matching .env* from git history using git filter-branch.
# WARNING: This rewrites git history. Coordinate with your team before running and force-push afterwards.

set -euo pipefail

if [ ! -d .git ]; then
  echo "This script must be run from the repository root (backend-ease-brain)"
  exit 1
fi

# Backup current refs
git branch -m main main-backup || true

echo "Removing .env* from git history..."

# Remove files from history
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch .env .env.local .env.development .env.production" \
  --prune-empty --tag-name-filter cat -- --all

# Remove backup refs left by filter-branch
rm -rf .git/refs/original/ && git reflog expire --expire=now --all && git gc --prune=now --aggressive

cat <<EOF
Finished. Review changes with 'git log --stat'.
To push the cleaned history to GitHub, run:

  git push --force origin main

Make sure other collaborators re-clone or run commands to sync.
EOF
