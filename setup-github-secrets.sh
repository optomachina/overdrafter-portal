#!/bin/bash
# Setup GitHub Actions secrets for autonomous deployment

echo "🔐 Setting up GitHub Actions secrets..."

# Check if gh CLI is installed
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI (gh) not installed"
    echo "Install with: brew install gh"
    exit 1
fi

# Check if logged in
if ! gh auth status &> /dev/null; then
    echo "❌ Not logged into GitHub CLI"
    echo "Run: gh auth login"
    exit 1
fi

# Set secrets from environment variables
echo "Setting VERCEL_TOKEN..."
echo "$VERCEL_TOKEN" | gh secret set VERCEL_TOKEN -R optomachina/overdrafter-portal

echo "Setting VERCEL_ORG_ID..."
# Get org ID from vercel
echo "team_ysdL74PxeIBSvktxB7s7FoC6" | gh secret set VERCEL_ORG_ID -R optomachina/overdrafter-portal

echo "Setting VERCEL_PROJECT_ID..."
echo "Get this from vercel.com after first deploy" | gh secret set VERCEL_PROJECT_ID -R optomachina/overdrafter-portal

echo "✅ Secrets configured!"
echo ""
echo "Next steps:"
echo "1. Push code: git push origin main"
echo "2. Watch deployment: https://github.com/optomachina/overdrafter-portal/actions"