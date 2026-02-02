#!/bin/bash
# Status checker for Overdrafter portal

echo "📊 Overdrafter Portal Status"
echo "============================"
echo ""

cd ~/.openclaw/workspace/overdrafter-portal

# Git status
echo "📝 Git Status:"
git log --oneline -3
echo ""

# Test status
echo "🧪 Test Status:"
npm run test:unit:run 2>&1 | tail -5
echo ""

# GitHub Actions status
echo "🚀 Recent GitHub Actions:"
gh run list --limit 3 2>/dev/null || echo "Install gh CLI to see actions status"
echo ""

# Vercel deployments
echo "🌐 Vercel Deployments:"
curl -s "https://api.vercel.com/v6/deployments?projectId=MVsc3QS3sB1K0tYKoV4WJbEMAJq&limit=3" \
  -H "Authorization: Bearer $VERCEL_TOKEN" 2>/dev/null | \
  grep -o '"url":"[^"]*"' | head -3 | cut -d'"' -f4 | sed 's/^/  - https:/'
echo ""

echo "📋 Automation Status:"
echo "  - Cron jobs: $(crontab -l 2>/dev/null | grep -c overdrafter) active"
echo "  - Last deploy log: $(ls -la ~/.overdrafter-deploy.log 2>/dev/null | awk '{print $6, $7, $8}' || echo 'N/A')"
echo ""

echo "🔧 Quick Commands:"
echo "  ./deploy.sh       - Push and trigger deployment"
echo "  npm run dev       - Start local dev server"
echo "  npm run test:unit - Run tests in watch mode"