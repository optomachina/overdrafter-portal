# Overdrafter Portal

Customer portal for CAD file upload, project management, and PDM services.

## Setup

```bash
npm install
```

## Development

```bash
npm run dev          # Start dev server
npm run test:unit    # Run tests (watch mode)
npm run typecheck    # TypeScript check
```

## Project Structure

```
src/
  app/              # Next.js routes
  components/       # React components  
  lib/              # Utilities
  types/            # TypeScript definitions
tests/
  unit/             # Vitest tests
```

## Testing Workflow

1. Write test in `tests/unit/*.test.ts`
2. Run `npm run test:unit` (should fail - RED)
3. Implement in `src/lib/*.ts`
4. Run tests (should pass - GREEN)
5. Refactor if needed

## Environment Variables

Copy `.env.example` to `.env.local` and fill in:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```