#!/bin/bash
# Usage: run from repository root.
# This script removes committed local secrets/debug captures from git history.
# WARNING: This rewrites git history. Coordinate with your team before running and force-push afterwards.

set -euo pipefail

if [ ! -d .git ]; then
  echo "This script must be run from the repository root"
  exit 1
fi

# Backup current refs
git branch -m main main-backup || true

echo "Removing .env* and API response dumps from git history..."

# Remove files from history
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch \
    .env .env.local .env.development .env.production .env.render \
    backend-ease-brain/.env backend-ease-brain/.env.local backend-ease-brain/.env.development backend-ease-brain/.env.production \
    frontend-ease-brain/.env frontend-ease-brain/.env.local frontend-ease-brain/.env.development frontend-ease-brain/.env.production \
    backend-ease-brain/response.txt backend-ease-brain/headers.txt response.txt headers.txt" \
  --prune-empty --tag-name-filter cat -- --all

# Remove backup refs left by filter-branch
rm -rf .git/refs/original/ && git reflog expire --expire=now --all && git gc --prune=now --aggressive

cat <<EOF
Finished. Review changes with 'git log --stat'.
To push the cleaned history to GitHub, run:

  git push --force origin main

Make sure other collaborators re-clone or run commands to sync.
EOF
