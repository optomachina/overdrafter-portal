# Overdrafter Portal

## Project Overview
Customer portal for CAD file upload, project management, and PDM services.

## Architecture
- **Framework:** Next.js 14 (App Router)
- **Auth:** Supabase Magic Links
- **Database:** Supabase PostgreSQL
- **Storage:** Cloudflare R2
- **Testing:** Vitest (unit), Playwright (E2E)
- **Styling:** Tailwind CSS

## Key Constraints
- Free tier: 100MB storage, 30-day retention
- Paid tiers: 5GB-∞, permanent storage
- Supported files: .sldprt, .sldasm, .slddrw, .step, .pdf
- Max file size: 100MB (free), 500MB (paid)

## Database Schema (Supabase)
See supabase/migrations/ for current schema

## Testing Strategy
1. Write test first (specify expected behavior)
2. Run test (should fail - RED)
3. Implement feature
4. Run test (should pass - GREEN)
5. Refactor if needed

## File Structure
```
src/
  app/           # Next.js routes
  components/    # React components
  hooks/         # Custom React hooks
  lib/           # Utilities (supabase, storage)
  types/         # TypeScript definitions
tests/
  unit/          # Vitest tests
  integration/   # API tests
  e2e/           # Playwright tests
```

## Environment Variables
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=
```

## Commands
- `npm run dev` - Start dev server
- `npm run test:unit` - Run unit tests (watch)
- `npm run test:unit:run` - Run unit tests (once)
- `npm run test:e2e` - Run E2E tests
- `npm run typecheck` - TypeScript check