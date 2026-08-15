#!/usr/bin/env bash
# Deploy the current branch to the staging GitHub Pages site so it can be
# previewed at https://joadoumie.github.io/natalieandjordi-staging/
# without touching natalieandjordi.com.
#
# Usage: ./deploy-preview.sh   (from any branch; uncommitted changes are ignored)
set -euo pipefail

STAGING_REPO="https://github.com/joadoumie/natalieandjordi-staging.git"
BRANCH=$(git rev-parse --abbrev-ref HEAD)
SHA=$(git rev-parse --short HEAD)

TMP=$(mktemp -d)
trap 'git worktree remove --force "$TMP" 2>/dev/null || true' EXIT

git worktree add --detach --quiet "$TMP" HEAD
cd "$TMP"

# Strip the CNAME so staging never tries to claim natalieandjordi.com
if [ -f CNAME ]; then
  git rm -q CNAME
  git commit -qm "Preview deploy of $BRANCH ($SHA)"
fi

git push --force "$STAGING_REPO" HEAD:refs/heads/main
echo ""
echo "Deployed $BRANCH ($SHA) to staging."
echo "View in ~1 minute at: https://joadoumie.github.io/natalieandjordi-staging/"
