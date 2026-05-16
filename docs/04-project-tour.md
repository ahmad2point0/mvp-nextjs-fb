# 4. A tour of the project folders

Open the project in VS Code. You'll see something like this at the top level:

```
mvp-nextjs-fb/
├── public/         # Static files (logos, SVGs) served as-is
├── src/            # All the source code
├── tests/          # Playwright end-to-end tests
├── docs/           # ← you are reading this
├── package.json    # List of dependencies + scripts
├── tsconfig.json   # TypeScript settings
├── next.config.ts  # Next.js settings
└── .env.local      # Your local secrets (gitignored)
```

The interesting part is `src/`. Let's open it up.

## Inside `src/`

```
src/
├── app/         # Next.js pages and API routes (file-based routing)
├── features/    # Feature modules — one folder per "thing the app does"
├── global/      # Shared stuff: layout components, utilities, providers
├── components/  # Reusable design-system primitives (button, card, etc.)
└── middleware.ts # Runs on every request (handles auth redirects)
```

### Big idea: **feature-based architecture**

Instead of grouping by file type (`components/`, `hooks/`, `api/`), we group by **what the code does**. Everything about donations — the form, the data hooks, the constants — lives in `features/donations/`. This means when you delete a feature, you delete one folder.

The exception is the *global* shared stuff (navbar, footer, auth provider, button) which lives in `global/` or `components/`.

## `src/app/` — pages and APIs

Next.js's **App Router** rule: a file named `page.tsx` inside a folder *is* that URL.

```
app/
├── page.tsx                    → /              (the home page)
├── about/page.tsx              → /about
├── (auth)/login/page.tsx       → /login         (parens mean "no layout impact")
├── dashboard/
│   ├── layout.tsx              → wraps every /dashboard/* page
│   └── page.tsx                → /dashboard
└── api/
    ├── auth/login/route.ts     → POST /api/auth/login
    └── donations/route.ts      → GET/POST /api/donations
```

| Special file | What it does |
|---|---|
| `page.tsx` | Renders a route |
| `layout.tsx` | Wraps child pages with shared UI (header, sidebar) |
| `route.ts` | Backend API endpoint (no UI) |
| `loading.tsx` | Shown while a server component is loading |
| `not-found.tsx` | Custom 404 |

## `src/features/<name>/`

Each feature folder usually has:

```
features/donations/
├── components/             # React UI components specific to donations
│   └── donation-form.tsx
├── hooks.ts                # TanStack Query hooks (useDonations, useCreateDonation)
├── constants.ts            # Static data (categories, amount limits)
└── index.ts                # Barrel file — re-exports the public API
```

The **barrel file** (`index.ts`) is what other parts of the app import:

```ts
import { DonationForm, useDonations } from "@/features/donations";
```

Behind the scenes that grabs from `index.ts`, which re-exports from the right files.

## `src/global/`

Stuff used everywhere:

```
global/
├── components/   # Navbar, Footer, Card, Button, Sidebar, IconCircle, ...
├── lib/          # Helper functions: supabase clients, password validation, api client
├── providers/    # React context providers (QueryProvider, AuthProvider)
└── stores/       # Zustand stores (auth-store.ts)
```

## `src/components/ui/`

Tiny presentational components based on shadcn-style patterns: `button.tsx`, `card.tsx`, `badge.tsx`, `skeleton.tsx`. They have no business logic — they just *look* nice.

## Path aliases

Anywhere you see `@/`, it means `src/`. Configured in `tsconfig.json`:

```ts
import { Button } from "@/global/components";   // ← src/global/components
import { useAuthStore } from "@/global/stores/auth-store";
```

This avoids ugly `../../../` paths.

---

➡️ Next: [Frontend guide](./05-frontend-guide.md)
