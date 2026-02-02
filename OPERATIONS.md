# Overdrafter Operations Runbook
## Autonomous Agent Operations

---

## When I'm Autonomous

Once tokens are configured, I can:

### ✅ Fully Autonomous
- Run tests (`npm run test:unit:run`)
- Build the app (`npm run build`)
- Commit and push to GitHub (`git push origin main`)
- Deploy to Vercel (`vercel --prod`)
- Monitor logs and status
- Run database migrations
- Generate reports

### 🔒 Still Need You
- Create new accounts (TOS requires humans)
- First-time auth flows (OAuth, 2FA)
- Payment/billing changes
- Legal decisions
- Accessing new services not yet configured

---

## Daily Operations

### Morning Check (Automated via Cron)
```bash
# 6:00 AM - Run tests, deploy if passing
./deploy.sh
```

### Continuous Testing (During Active Dev)
```bash
# Run in background during coding sessions
./watch-tests.sh
```

### Manual Deploy
```bash
# Anytime you want to force deploy
./deploy.sh
```

---

## Response Procedures

### Test Failures
1. Run tests locally to identify issue
2. Fix or notify human if complex
3. Don't deploy if tests failing

### Deploy Failures
1. Check Vercel logs
2. Rollback if needed (`vercel --rollback`)
3. Notify via webhook or Telegram

### Database Issues
1. Check Supabase dashboard
2. Run migrations if needed (`supabase db push`)
3. Alert if connection issues

---

## Escalation

**Contact human when:**
- Tests fail for >1 hour
- Deploy fails 3x in a row
- Security alerts (unusual access patterns)
- Database corruption detected
- Service downtime >5 minutes

---

## Files I Manage

| File | Purpose |
|------|---------|
| `deploy.sh` | Full CI/CD pipeline |
| `watch-tests.sh` | Continuous testing |
| `CLAUDE.md` | AI context |
| `src/` | Application code |
| `tests/` | Test suites |

---

## Environment Status

Check status:
```bash
# Tests
cd ~/.openclaw/workspace/overdrafter-portal && npm run test:unit:run

# Build
npm run build

# Git status
git status

# Vercel status
vercel list
```

---

## Troubleshooting

### "Command not found: vercel"
```bash
npm install -g vercel
```

### "Permission denied" on scripts
```bash
chmod +x *.sh
```

### Tests failing but I don't know why
```bash
# Run with verbose output
npm run test:unit:run -- --reporter=verbose
```

---

## Setup Checklist

- [ ] GitHub token added to `.zshrc`
- [ ] Vercel token added to `.zshrc`
- [ ] Supabase credentials added
- [ ] R2 credentials added
- [ ] Cron jobs installed (`./setup-cron.sh`)
- [ ] Test deployment successful
- [ ] Notification webhook configured (optional)

---

**Status:** Waiting for token configuration
**Next Action:** Add tokens to shell profile per `setup-automation.sh`