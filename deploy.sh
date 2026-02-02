#!/bin/bash
# Auto-deploy script - runs after tests pass

set -e

REPO="optomachina/overdrafter-portal"
PROJECT="overdrafter-portal"

echo "🚀 Starting autonomous deployment..."

# 1. Run tests
echo "Running tests..."
npm run test:unit:run

# 2. Type check
echo "Type checking..."
npm run typecheck

# 3. Build
echo "Building..."
npm run build

# 4. Commit any changes
echo "Checking for changes..."
if [[ -n $(git status -s) ]]; then
    git add .
    git commit -m "Auto-commit: $(date '+%Y-%m-%d %H:%M')"
    git push origin main
    echo "✅ Changes pushed"
fi

# 5. Deploy to Vercel (using token)
if [ -n "$VERCEL_TOKEN" ]; then
    echo "Deploying to Vercel..."
    vercel --token "$VERCEL_TOKEN" --prod --yes
    echo "✅ Deployed"
fi

# 6. Notify
echo "✅ Deployment complete!"

exit 0