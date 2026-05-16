# 10. FAQ & troubleshooting

Common problems with their fixes.

## Setup

### `bun: command not found`
Install Bun: `npm install -g bun`, then open a new terminal.

### "Cannot find module 'next' / 'react'"
You forgot `bun install`. Run it from the project root.

### Build fails with `Module not found: '@/...'`
That path alias is configured in `tsconfig.json` and `next.config.ts`. If editing those files broke it, restore them and run `bun install` again. Then restart VS Code (TypeScript needs a fresh start).

### `.env.local` not loading
- Must be in the project root, not in `src/`.
- Variable names must match exactly: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- After editing it, kill the dev server (Ctrl+C) and start it again. Next.js only reads env vars on startup.

## Auth

### "Email rate limit exceeded" or "For security purposes, you can only request this after X seconds"
Supabase has aggressive rate limits on auth. The retry wrapper handles most of these automatically. If you still see it:
- Wait a minute and try again.
- In dev, you can configure higher limits in the Supabase dashboard → Authentication → Rate Limits.

### Login button doesn't do anything
- Check the browser network tab. A 401 means wrong password. A 429 means rate-limited.
- The form silently ignores submits within 1.5s of the previous submit (to prevent rate-limit storms). Wait a moment and try again.

### "Please verify your email" loop
- Check your inbox (and spam) for the 6-digit OTP code.
- If the link is expired, click "Resend code" on `/verify-otp` (30-second cooldown).

### Stuck on `/upload-documents`
- File must be JPEG/PNG/WebP and ≤ 5 MB.
- Check the browser console for the actual error.

## Database & API

### `403 Forbidden` from an API route
- Probably an RLS policy is rejecting your request. Open the Supabase dashboard → Logs → Postgres to see why.
- Make sure the user's `profiles.role` is set correctly.

### `column "X" does not exist`
- The DB schema is out of sync with the code. Run pending migrations in the Supabase dashboard.

### Donation amount rejected
- Min Rs. 100, max Rs. 1,000,000. Defined in `features/donations/constants.ts` and enforced both client- and server-side.

## Frontend

### "Hydration mismatch" warning in console
Usually means a server-rendered HTML differs from the client render. Common cause: using `Date.now()` or `Math.random()` directly in JSX. Wrap in `useEffect` or a stable seed.

### GSAP animations playing in the wrong order
The order in `useEffect` matters. Each `gsap.timeline()` runs independently; if you need sequencing, chain `.from(...).to(...)` on the timeline instead of writing two separate `gsap.from()` calls.

### Tailwind class doesn't apply
- Make sure the class is *actually* in the source (Tailwind scans files to know which classes to compile). Dynamic strings like `text-${color}` don't work — use full names or a `class-variance-authority` (cva) map.
- Tailwind v4 uses `@theme inline` blocks for custom tokens. Check `src/app/globals.css`.

### Hot reload stopped working
- Some IDEs hold file handles. Close VS Code's terminal panel, kill `bun run dev`, restart.

## Production build

### `bun run build` succeeds but `bun run start` shows 404 for `/api/...`
- API routes need `runtime` set if you have any edge incompatibilities. Most CSEAS routes use the Node.js runtime (default), which is fine.

### Build is slow
- Turbopack caches in `.next/`. Don't delete it unless you're debugging. First build is the slowest; subsequent builds are 5–10s.

## When all else fails

1. Re-read the page in this docs folder that matches your problem.
2. Look at recent git commits — maybe a teammate already fixed something similar.
3. Search the error message verbatim. 99% of Next.js / Supabase errors have results on GitHub or Stack Overflow.
4. Check the Supabase dashboard → Logs for backend errors.
5. Last resort: delete `.next/` and `node_modules/`, run `bun install`, then `bun run dev`.

---

You've reached the end. ✅ For deeper technical reference, see [`architecture.md`](./architecture.md) and [`api-endpoints.md`](./api-endpoints.md).
