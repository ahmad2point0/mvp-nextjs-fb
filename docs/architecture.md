# CSEAS Architecture

## Overview

The Community Support & Education Aid System (CSEAS) is built with Next.js 16 (App Router), React 19, Tailwind CSS 4, and Supabase. It follows a **feature-based architecture** with clear separation between global shared code and domain-specific features.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16.2.2 (App Router, Turbopack) |
| UI | React 19.2.4, Tailwind CSS 4 |
| State Management | Zustand 5 |
| Data Fetching | TanStack Query 5 |
| Backend / DB | Supabase (Postgres, Auth, RLS) |
| Animation | GSAP 3.14.2 + ScrollTrigger |
| Testing | Playwright |
| Package Manager | Bun |
| Language | TypeScript 5 (strict mode) |

## Directory Structure

```
src/
├── app/                          # Next.js App Router (routes)
│   ├── layout.tsx                # Root layout (fonts, providers)
│   ├── page.tsx                  # Home page (/) — animated landing
│   ├── globals.css               # Design tokens + Tailwind theme
│   ├── about/page.tsx            # /about
│   ├── contact/page.tsx          # /contact
│   ├── (auth)/                   # Route group (no layout impact)
│   │   ├── login/page.tsx        # /login
│   │   ├── register/page.tsx     # /register
│   │   └── logout/page.tsx       # /logout
│   ├── dashboard/                # Protected area
│   │   ├── layout.tsx            # Dashboard layout (sidebar + content)
│   │   ├── page.tsx              # /dashboard (overview)
│   │   ├── donations/page.tsx
│   │   ├── aid-requests/page.tsx
│   │   ├── volunteer-tasks/page.tsx
│   │   ├── notifications/page.tsx
│   │   ├── reports/page.tsx
│   │   ├── join-volunteer/page.tsx
│   │   └── admin/page.tsx
│   └── api/                      # API Route Handlers
│       ├── auth/
│       │   ├── register/route.ts
│       │   ├── login/route.ts
│       │   ├── logout/route.ts
│       │   └── me/route.ts
│       ├── donations/route.ts
│       ├── aid-requests/route.ts
│       ├── volunteer-tasks/
│       │   ├── route.ts
│       │   └── [id]/route.ts
│       ├── volunteer-applications/route.ts
│       ├── notifications/
│       │   ├── route.ts
│       │   └── [id]/route.ts
│       └── admin/
│           ├── users/route.ts
│           ├── users/[id]/route.ts
│           └── stats/route.ts
│
├── features/                     # Feature modules (domain logic)
│   ├── auth/
│   │   ├── components/           # LoginForm, RegisterForm
│   │   ├── hooks.ts              # useLogin, useRegister, useLogout
│   │   └── index.ts
│   ├── donations/
│   │   ├── components/           # DonationForm
│   │   ├── hooks.ts              # useDonations, useCreateDonation
│   │   └── index.ts
│   ├── volunteers/
│   │   ├── components/           # TaskTable, JoinVolunteerForm
│   │   ├── hooks.ts              # useVolunteerTasks, useApplyVolunteer
│   │   └── index.ts
│   ├── aid-requests/
│   │   ├── components/           # AidRequestForm
│   │   ├── hooks.ts              # useAidRequests, useCreateAidRequest
│   │   └── index.ts
│   ├── admin/
│   │   ├── components/           # ApprovalTable
│   │   ├── hooks.ts              # useAdminUsers, useAdminStats
│   │   └── index.ts
│   ├── notifications/
│   │   ├── components/           # NotificationCard, NotificationList
│   │   ├── hooks.ts              # useNotifications, useMarkRead
│   │   └── index.ts
│   └── reports/
│       ├── components/           # StatsCard
│       └── index.ts
│
├── global/                       # Shared/reusable code
│   ├── components/
│   │   ├── navbar.tsx
│   │   ├── footer.tsx
│   │   ├── sidebar.tsx           # Imported directly (not via barrel)
│   │   ├── card.tsx
│   │   ├── button.tsx
│   │   ├── icon-circle.tsx
│   │   └── index.ts              # Barrel export (excludes Sidebar)
│   ├── lib/
│   │   ├── supabase.ts           # Browser client
│   │   ├── supabase-server.ts    # Server client (cookies-based)
│   │   └── api.ts                # Typed fetch wrapper
│   ├── providers/
│   │   ├── query-provider.tsx    # TanStack Query provider
│   │   └── auth-provider.tsx     # Supabase auth session provider
│   ├── stores/
│   │   └── auth-store.ts         # Zustand auth store
│   └── index.ts
│
├── middleware.ts                  # Auth route protection
│
└── e2e/                          # Playwright E2E tests
    ├── public-pages.spec.ts
    ├── auth-flow.spec.ts
    └── dashboard.spec.ts
```

## Architecture Patterns

### 1. Feature-Based Module Structure

Each feature is self-contained:
```
features/<name>/
  components/    → UI components specific to this feature
  hooks.ts       → TanStack Query hooks (mutations + queries)
  index.ts       → Barrel export (public API of the feature)
```

### 2. State Management

- **Zustand** — Global client state (auth user, loading). Defined in `global/stores/auth-store.ts`.
- **TanStack Query** — Server state (API data). Each feature has a `hooks.ts` with query/mutation hooks.
- **AuthProvider** — Syncs Supabase auth session → Zustand store on mount + auth state changes.

### 3. API Layer

- `global/lib/api.ts` — Typed fetch wrapper with error handling (get, post, patch)
- Feature hooks call the API wrapper: `api.get("/donations")` → `fetch("/api/donations")`
- API routes use `createServerSupabaseClient()` for server-side Supabase with cookie auth

### 4. Auth Flow

1. User registers via `/api/auth/register` → creates Supabase auth user + profiles row
2. User logs in via `/api/auth/login` → sets session cookies
3. `AuthProvider` detects session, loads profile from `profiles` table → sets Zustand store
4. `middleware.ts` protects `/dashboard/*` routes — redirects unauthenticated users to `/login`
5. Sidebar shows user name/role, admin-only links conditionally rendered

### 5. Server vs Client Components

- Pages are **Server Components** by default
- Interactive components (forms, sidebar) use `"use client"`
- Hooks files use `"use client"` since they depend on React hooks
- Sidebar is excluded from barrel export to avoid pulling client deps into server pages

## Design System

Based on `DESIGN.md` (Stripe-inspired):

| Token | Value | Usage |
|-------|-------|-------|
| `--color-primary` | `#533afd` | CTAs, links, active states |
| `--color-heading` | `#061b31` | Headings (deep navy, not black) |
| `--color-body` | `#64748d` | Body text |
| `--color-brand-dark` | `#1c1e54` | Dark sections, sidebar |
| `--color-border` | `#e5edf5` | Card/input borders |
| `--shadow-elevated` | Blue-tinted multi-layer | Cards, dropdowns |

Font: Inter (substitute for proprietary sohne-var), weight 300 for headings, 400 for UI.
