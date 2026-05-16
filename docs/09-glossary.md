# 9. Glossary

Every weird word you're likely to hit in this project, in alphabetical order.

### Anon key
The Supabase "public" API key, safe to ship to the browser. Access is gated by RLS policies inside the database.

### API route
A backend endpoint defined as a file in `src/app/api/...`. Next.js turns the file into an HTTP handler. Example: `src/app/api/donations/route.ts` → `/api/donations`.

### App Router
Next.js's modern routing system (since Next 13). Routes are folders, and special files like `page.tsx`, `layout.tsx`, `route.ts` give them behavior. The older system was called "Pages Router".

### Barrel file
An `index.ts` file that re-exports the public surface of a folder so consumers can do `import { X } from "@/features/foo"` instead of `import { X } from "@/features/foo/components/foo-form"`.

### Bucket (storage)
A namespace inside Supabase Storage where files live. We use `cnic-documents`, `student-documents`, `donation-receipts`.

### Bun
A faster alternative to npm/yarn. Same package.json, faster installs.

### CNIC
Computerized National Identity Card — Pakistan's government-issued ID. Donors and volunteers upload both sides.

### Client component
A React component that runs in the browser. Marked with `"use client"` at the top. Has access to `useState`, hooks, browser APIs. The default in Next.js App Router is *server* components.

### Cookie (auth)
Supabase stores the user session as a signed cookie. The server reads it via the SSR helper; the browser never directly sees the secret.

### CSEAS
Community Support and Education Aid System — this project's name.

### CTA
"Call to action" — the button you want users to click ("Get Started", "Donate Now").

### Dashboard
The logged-in area at `/dashboard`. Layout includes a sidebar + main panel.

### Defense in depth
Validating the same thing on both client and server. Client validation is for UX speed, server validation is for security.

### Donation kind
This project's term for *cash vs in-kind*. Cash = money you send. In-kind = items you deliver. Stored as `donation_type` style behavior via `payment_method` set to `"Direct Delivery"`.

### env var
Environment variable. Lives in `.env.local`. Anything prefixed `NEXT_PUBLIC_` ships to the browser; everything else stays on the server.

### Feature folder
A folder under `src/features/<name>/` that contains all UI, hooks, and constants for one feature. Keeps the codebase tidy.

### Glob
A pattern like `**/*.tsx` that matches a set of files. Used by build tools and search.

### GSAP
GreenSock Animation Platform. The animation library used on the landing page.

### Hook (React)
A function whose name starts with `use`. Hooks let components subscribe to state, lifecycle, context, etc.

### Hot reload
When you save a file and the browser updates instantly without losing state. Provided by Next.js dev mode.

### Hydration
The process where React attaches event listeners to server-rendered HTML so the page becomes interactive.

### Idempotent
An operation you can repeat without changing the result the second time. `PATCH /notifications/:id { is_read: true }` is idempotent.

### Invalidation (TanStack Query)
Telling the query cache "this data is stale; refetch on next render". Triggered after mutations.

### JSX / TSX
HTML-looking syntax inside JavaScript/TypeScript files. Compiled into `React.createElement(...)` calls.

### Mutation
A TanStack Query term for any state-changing call (POST/PATCH/DELETE). Returns `{ mutate, isPending, isError }`.

### OTP
One-Time Password. The 6-digit code emailed during signup.

### Path alias
The `@/...` shortcut. Defined in `tsconfig.json` so `@/` means `src/`.

### Postgres
The SQL database under Supabase.

### Prefetch
Telling TanStack Query to fetch data in advance so it's already cached when the user reaches the page that needs it.

### Provider
A React component (usually wrapping `Context.Provider`) that supplies state to its descendants. `QueryProvider`, `AuthProvider`.

### Query (TanStack Query)
A read operation. Returns `{ data, isLoading, error }`.

### Rate limit
A cap on how many of a kind of request you can send in a window. Supabase rate-limits auth calls to prevent abuse.

### Realtime (Supabase)
A WebSocket channel that pushes database changes to subscribed clients. Used for live notifications.

### RLS — Row Level Security
SQL-level rules saying which rows a user can read/write. Enforced by Postgres itself.

### Route group
A folder name in parentheses like `(auth)` that organizes routes without affecting the URL.

### Server client
The Supabase client created from a server context (API route or server component) using cookies.

### Server component
A component that runs on the server only. Default in App Router. Cannot use hooks like `useState`.

### Service role key
Supabase's god-mode key. Bypasses RLS. Must NEVER be shipped to the browser. Not used by CSEAS in client code.

### Session
The currently signed-in state. Stored in a cookie. Auto-refreshed by the middleware.

### Signed URL
A short-lived URL that lets the holder download a private storage file without auth. Used for documents.

### SSR
Server-Side Rendering. The first HTML is generated on the server.

### Supabase
The backend-as-a-service powering this app: Postgres + Auth + Storage + Realtime.

### Tailwind CSS
Utility-first CSS framework. You add classes like `text-sm`, `bg-primary`, `rounded-lg`.

### Toast
A small popup notification (the corner messages). Provided by Sonner.

### Turbopack
Next.js's fast bundler. Used by `bun run dev` and `bun run build`.

### Webhook
An HTTP callback called when something happens externally. Not used much in CSEAS yet.

### Zod
A schema validation library. Not currently used in CSEAS — we hand-roll validators in `src/global/lib/`. Could be adopted later.

### Zustand
A tiny client-state library. The `useAuthStore` is built with it.

---

➡️ Next: [FAQ & troubleshooting](./10-faq-troubleshooting.md)
