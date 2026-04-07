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
│   │   ├── upload-documents/page.tsx   # /upload-documents (step 2 of signup)
│   │   ├── verify-otp/page.tsx         # /verify-otp (step 3 of signup)
│   │   ├── forgot-password/page.tsx
│   │   ├── update-password/page.tsx
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
│       │   ├── me/route.ts
│       │   ├── verify-otp/route.ts     # OTP email verification
│       │   ├── resend-otp/route.ts
│       │   ├── reset-password/route.ts
│       │   └── update-password/route.ts
│       ├── documents/
│       │   ├── route.ts                # POST — record uploaded doc
│       │   └── [userId]/route.ts       # GET — signed URLs (self or admin)
│       ├── donations/route.ts
│       ├── aid-requests/route.ts
│       ├── volunteer-tasks/
│       │   ├── route.ts
│       │   └── [id]/route.ts
│       ├── volunteer-applications/route.ts
│       ├── notifications/
│       │   ├── route.ts
│       │   └── [id]/route.ts
│       ├── admin/
│       │   ├── users/route.ts
│       │   ├── users/[id]/route.ts
│       │   └── stats/route.ts
│       └── public/
│           └── stats/route.ts    # Unauthenticated homepage impact stats
│
├── features/                     # Feature modules (domain logic)
│   ├── auth/
│   │   ├── components/           # LoginForm, RegisterForm, OtpVerifyForm
│   │   ├── hooks.ts              # useLogin, useRegister, useLogout, useVerifyOtp, useResendOtp
│   │   └── index.ts
│   ├── documents/
│   │   ├── components/           # DocumentUploadForm, UserDocumentsViewer
│   │   ├── hooks.ts              # useUploadDocument, useUserDocuments
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
│   │   ├── components/           # UserManagementTable (block/unblock + document viewer)
│   │   ├── hooks.ts              # useAdminUsers, useAdminStats
│   │   └── index.ts
│   ├── notifications/
│   │   ├── components/           # NotificationCard, NotificationList
│   │   ├── hooks.ts              # useNotifications, useMarkRead
│   │   └── index.ts
│   ├── reports/
│   │   ├── components/           # StatsCard
│   │   └── index.ts
│   └── home/
│       ├── hooks.ts              # usePublicStats (homepage impact counter)
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

1. User registers via `/api/auth/register` → creates Supabase auth user + profiles row. Supabase sends a 6-digit OTP email automatically.
2. Client redirects to `/upload-documents`. User uploads CNIC (donor/volunteer) or a supporting document (student). Files go directly to the private `cnic-documents` / `student-documents` storage buckets under `${user.id}/` and a row is recorded in `documents` via `POST /api/documents`.
3. Client redirects to `/verify-otp?email=…`. User enters the 6-digit code → `POST /api/auth/verify-otp` calls `supabase.auth.verifyOtp({ type: 'signup' })`, confirming `email_confirmed_at`.
4. On subsequent logins, `/api/auth/login` returns `401 { code: "unverified" }` if the email is unconfirmed (client routes back to `/verify-otp`) or `403 { code: "blocked" }` if `profiles.is_blocked` is true.
5. `AuthProvider` detects the session, loads `profiles` + derives `is_verified` from `email_confirmed_at` → sets the Zustand store.
6. `middleware.ts` protects `/dashboard/*` routes — redirects unauthenticated users to `/login`. `/upload-documents` and `/verify-otp` are allowed for partially-signed-up users.
7. Admins can block/unblock any user from the User Management panel and view their uploaded documents (short-lived signed URLs from `GET /api/documents/[userId]`).

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
