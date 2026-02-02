#!/bin/bash
# Auto-deploy script - works with GitHub Actions or local

set -e

echo "🚀 Starting deployment pipeline..."

# 1. Run tests
echo "Running tests..."
npm run test:unit:run

# 2. Type check
echo "Type checking..."
npm run typecheck

# 3. Build locally to verify
echo "Building..."
npm run build

# 4. Commit any changes
echo "Checking for changes..."
if [[ -n $(git status -s) ]]; then
    git add .
    git commit -m "Auto-commit: $(date '+%Y-%m-%d %H:%M')"
    git push origin main
    echo "✅ Changes pushed to GitHub"
    echo "📡 GitHub Actions will auto-deploy to Vercel"
else
    echo "ℹ️ No changes to commit"
fi

# 5. Check deployment status
echo ""
echo "Check deployment status at:"
echo "https://github.com/optomachina/overdrafter-portal/actions"

echo ""
echo "✅ Pipeline complete!"

exit 0