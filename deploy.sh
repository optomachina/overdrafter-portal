#!/bin/bash
# Auto-deploy script - works with GitHub Actions or local
set -e

cd ~/.openclaw/workspace/overdrafter-portal

echo "🚀 Starting deployment pipeline..."

# 1. Run tests
echo "Running tests..."
if ! npm run test:unit:run; then
    ./notify.sh "❌ Tests failed - deployment aborted" "error"
    exit 1
fi

# 2. Type check
echo "Type checking..."
if ! npm run typecheck; then
    ./notify.sh "❌ Type check failed - deployment aborted" "error"
    exit 1
fi

# 3. Build locally to verify
echo "Building..."
if ! npm run build; then
    ./notify.sh "❌ Build failed - deployment aborted" "error"
    exit 1
fi

# 4. Commit any changes
echo "Checking for changes..."
if [[ -n $(git status -s) ]]; then
    git add .
    git commit -m "Auto-commit: $(date '+%Y-%m-%d %H:%M')"
    git push origin main
    echo "✅ Changes pushed to GitHub"
    echo "📡 GitHub Actions will auto-deploy to Vercel"
    ./notify.sh "✅ Code pushed - deployment in progress" "success"
else
    echo "ℹ️ No changes to commit"
fi

echo ""
echo "✅ Pipeline complete!"
echo "🌐 Check status: ./status.sh"
echo "📊 Actions: https://github.com/optomachina/overdrafter-portal/actions"

exit 0