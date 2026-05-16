# 6. Backend guide

"Backend" here = the API routes + the Supabase database + the security rules. CSEAS doesn't have a separate server app; Next.js handles both UI and backend.

## What lives where

```
src/app/api/        ← REST-style endpoints (Next.js route handlers)
src/global/lib/     ← Supabase clients, helpers
Supabase (cloud)    ← Postgres tables, Auth, Storage buckets
```

## Anatomy of an API route

Each `route.ts` file in `src/app/api/...` exports HTTP-method functions: `GET`, `POST`, `PATCH`, `DELETE`. Example: [`src/app/api/donations/route.ts`](../src/app/api/donations/route.ts).

```ts
import { createServerSupabaseClient } from "@/global/lib/supabase-server";
import { NextResponse, type NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const supabase = await createServerSupabaseClient();

  // 1. Find out who the requester is
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // 2. Parse the request body
  const body = await request.json();

  // 3. Validate
  if (!body.amount) return NextResponse.json({ error: "Amount required" }, { status: 400 });

  // 4. Talk to the database
  const { data, error } = await supabase
    .from("donations")
    .insert({ donor_id: user.id, ...body })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data, { status: 201 });
}
```

Every API route follows that 4-step pattern.

## The Supabase clients

There are **two** Supabase clients, used in different places:

### Server client — `createServerSupabaseClient()`
[`src/global/lib/supabase-server.ts`](../src/global/lib/supabase-server.ts). Used **inside API routes** and server components. It reads the auth cookie set by the browser, so `supabase.auth.getUser()` knows who's making the request.

### Browser client — `createClient()`
[`src/global/lib/supabase.ts`](../src/global/lib/supabase.ts). Used **inside client components** (e.g. for uploading files directly to Supabase Storage). Browser code never sees secrets — only the public anon key.

## Auth — how user identity actually works

1. User signs up → Supabase creates a row in its internal `auth.users` table and our `public.profiles` table.
2. User logs in → Supabase sets a signed cookie in the browser.
3. Every request after that — Next.js reads the cookie via the server Supabase client → knows who you are.
4. Row-Level Security (RLS) policies use `auth.uid()` to decide what you can see/edit.

The middleware ([`src/middleware.ts`](../src/middleware.ts)) runs on every request and refreshes the auth session so the cookie doesn't expire mid-browsing.

## Database tables

Defined in Supabase. The main ones:

| Table | What it stores |
|---|---|
| `profiles` | One row per user. `id`, `full_name`, `phone`, `role`, `is_blocked`. |
| `donations` | `donor_id`, `category`, `subcategory`, `amount`, `payment_method`, `transaction_id`, `receipt_url`, `aid_request_id`, `status`. |
| `aid_requests` | `student_id`, `aid_type`, `amount`, `description`, `status`. |
| `volunteer_tasks` | `title`, `description`, `assigned_to`, `status`. |
| `volunteer_applications` | `user_id`, `skills`, `motivation`, `status`. |
| `notifications` | `user_id`, `title`, `message`, `icon`, `is_read`, `created_at`. |
| `documents` | `user_id`, `document_type`, `bucket`, `storage_path`. |

A more detailed schema lives in [`docs/architecture.md`](./architecture.md).

## Row Level Security (RLS) — the safety net

RLS is database-level access control. Even if a bug lets a user query the wrong row, Postgres refuses.

In plain English, the policies say:

- **Donations**: a row is visible if `donor_id = auth.uid()`, **or** if the requester's `profiles.role = 'admin'`.
- **Aid requests**: visible to the student who owns it, plus admins and donors (donors need to see open requests to fund them).
- **Notifications**: visible only if `user_id = auth.uid()`.
- **Documents**: visible only to the owner or admins.

This means our API routes don't need a giant `if (user.role === 'admin') ...` block — the database does the filtering.

## API endpoints, by feature

A quick map. Full details in [`docs/api-endpoints.md`](./api-endpoints.md).

### Auth
- `POST /api/auth/register` — create a new account.
- `POST /api/auth/login` — sign in. Retries on rate-limit silently.
- `POST /api/auth/verify-otp` — confirm the email code.
- `POST /api/auth/resend-otp` — request a new code.
- `POST /api/auth/logout` — clear session.
- `POST /api/auth/reset-password` — request a reset email.
- `POST /api/auth/update-password` — set a new password.
- `GET /api/auth/me` — return the current user's profile.

### Donations
- `GET /api/donations` — list donations (yours; admins see all).
- `POST /api/donations` — create one. Validates amount limits. If linked to an `aid_request_id`, also flips that request to `fulfilled` and notifies the student.
- `PATCH /api/donations/:id` — admin marks as verified.

### Aid requests
- `GET /api/aid-requests` — list (yours if student, all if admin or donor).
- `POST /api/aid-requests` — submit one. Validates amount.
- `PATCH /api/aid-requests/:id` — admin/donor updates status.

### Volunteers
- `POST /api/volunteer-applications` — apply with skills.
- `GET/POST /api/volunteer-tasks` — list and create tasks.
- `PATCH /api/volunteer-tasks/:id` — accept/complete a task.

### Notifications
- `GET /api/notifications` — list yours.
- `PATCH /api/notifications/:id` — mark as read.

### Documents
- `POST /api/documents` — upload a file (multipart). Writes to Supabase Storage *and* the `documents` table.
- `GET /api/documents/:userId` — returns signed URLs (expire after 10 min).

### Admin / public
- `GET /api/admin/users` — list users, filter by role/blocked status.
- `PATCH /api/admin/users/:id` — block/unblock or verify.
- `GET /api/admin/stats` — totals for the admin dashboard.
- `GET /api/admin/chart-data` — data for the recharts charts.
- `GET /api/public/stats` — public counters shown on the landing page.

## Helper libraries

### [`src/global/lib/api.ts`](../src/global/lib/api.ts)
The fetch wrapper used by every TanStack Query hook. Wraps `fetch` and throws an `ApiError` if the response is non-2xx. The error has `status`, `message`, and `code` fields.

### [`src/global/lib/password-validation.ts`](../src/global/lib/password-validation.ts)
Shared validator used both in the React forms and the API routes. Same rules in both places means client UX matches server enforcement.

### [`src/global/lib/supabase-retry.ts`](../src/global/lib/supabase-retry.ts)
Wraps a Supabase auth call and retries with backoff if Supabase responds with a rate-limit error. Protects against users frantically clicking the login button.

### [`src/global/lib/create-notification.ts`](../src/global/lib/create-notification.ts)
Helpers `createNotification(supabase, userId, title, msg, icon)` and `notifyAdmins(...)`. Used by donation/aid-request routes to send realtime notifications.

## Files in Supabase Storage

Two buckets:

- `cnic-documents` — donor/volunteer CNIC photos. Private.
- `student-documents` — student supporting docs. Private.
- `donation-receipts` — optional payment receipts. Private.

Browser uploads go through the browser Supabase client to write directly to Storage (no proxy through our API), then a separate POST to `/api/documents` records the path in the database.

---

➡️ Next: [How sign-up & login work](./07-auth-flow.md)
