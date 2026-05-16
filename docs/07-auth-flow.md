# 7. How sign-up & login actually work

This is the most confusing flow in the project, so it gets its own page. We'll trace what happens when a new user signs up, click by click.

## The big picture

Sign-up is **3 steps** spread over 3 pages:

```
/register           →   /verify-otp        →   /upload-documents     →   /dashboard
(pick role, set     ↑   (enter 6-digit     ↑   (CNIC or student      ↑
 password)          ↓   code from email)   ↓    proof docs)          ↓
```

Each step is a different page, but they share state through:
- The URL (`?email=...` query param)
- The Supabase auth cookie (set after step 2)
- The Zustand auth store (read by step 3)

## Step 1 — Register

**Page:** `/register` → [`register-form.tsx`](../src/features/auth/components/register-form.tsx)

User fills:
- Role (Donor / Volunteer / Student)
- Full name, email, phone, password, confirm

Frontend validates password against the rules:
- 8–64 characters
- Uppercase + lowercase + number + special char

When valid, fires `useRegister().mutate(...)` which `POST`s to `/api/auth/register`.

**Backend:** [`api/auth/register/route.ts`](../src/app/api/auth/register/route.ts)
1. Validates password again (defense in depth).
2. Calls `supabase.auth.signUp({ email, password, options: { data: { full_name, phone, role } } })`.
3. Supabase emails the user a 6-digit OTP code.
4. Inserts a row into `profiles` with the same `id` as the auth user.
5. Returns the new user.

Frontend then redirects to `/verify-otp?email=<email>`.

## Step 2 — Verify OTP

**Page:** `/verify-otp` → [`otp-verify-form.tsx`](../src/features/auth/components/otp-verify-form.tsx)

User types the 6-digit code from their email. Form fires `useVerifyOtp().mutate(...)`.

**Backend:** [`api/auth/verify-otp/route.ts`](../src/app/api/auth/verify-otp/route.ts)
1. Calls `supabase.auth.verifyOtp({ email, token, type: "signup" })`.
2. If the code is valid, Supabase marks `email_confirmed_at` and returns a session.
3. The session is automatically written as a cookie thanks to the SSR helper.

If anything goes wrong with rate limits (Supabase has aggressive limits on auth calls), our wrapper [`supabase-retry.ts`](../src/global/lib/supabase-retry.ts) silently retries with exponential backoff. From the user's perspective, it just takes a tiny bit longer.

A **"Resend code"** button is included with a 30-second cooldown so people don't spam Supabase.

After success → redirect to `/upload-documents`.

## Step 3 — Upload documents

**Page:** `/upload-documents` → [`document-upload-form.tsx`](../src/features/documents/components/document-upload-form.tsx)

Different UI per role:
- **Donor / Volunteer** — upload CNIC front + CNIC back.
- **Student** — upload one supporting document (Student ID, fee challan, financial-need proof, or CNIC/B-Form). The page now shows a detailed list of acceptable docs.

Files are validated client-side:
- Type must be `image/jpeg | image/png | image/webp`.
- Size ≤ 5 MB.

Upload flow per file:
1. Browser calls `useUploadDocument().mutateAsync(...)`.
2. The hook posts a FormData (file + bucket + document_type) to `POST /api/documents`.
3. The API route uploads to Supabase Storage and inserts a row in the `documents` table.
4. Returns a signed URL (expires in 10 min).

After all required slots are uploaded → redirect to `/dashboard`. Admin will later review the documents before approving the account fully.

## Logging in (returning user)

**Page:** `/login` → [`login-form.tsx`](../src/features/auth/components/login-form.tsx)

1. Submit fires `useLogin().mutate(...)` → `POST /api/auth/login`.
2. Server calls `supabase.auth.signInWithPassword(...)` (wrapped in retry-with-backoff).
3. Three outcomes:
   - **Success** → Supabase sets the session cookie. We fetch `/api/auth/me` to load the profile into the Zustand store, then push to `/dashboard`.
   - **Email not verified** → server responds with `code: "unverified"`. Hook redirects user to `/verify-otp`.
   - **Account blocked** → server responds with `code: "blocked"`. Show toast.
   - **Rate limited** → server retried internally; if still rate-limited, show "Please wait a moment and try again."

A **1.5-second guard** in the login form prevents double-submits even if the button isn't yet disabled.

## Logout

`/logout` → calls `POST /api/auth/logout` which calls `supabase.auth.signOut()`, then clears the Zustand store and redirects home.

## Forgotten password

1. User goes to `/forgot-password` and enters their email.
2. `POST /api/auth/reset-password` calls `supabase.auth.resetPasswordForEmail(...)`.
3. Supabase emails a link → `/update-password?...code=...`.
4. User sets new password → `POST /api/auth/update-password` → `supabase.auth.updateUser({ password })`.
5. New password is validated against the same 8–64 char + complexity rules.

## Why so many steps?

- Email verification stops fake accounts and bots.
- Document upload ensures only real students get aid and only real adults can donate.
- The admin gets a chance to review accounts before they go fully live.

---

➡️ Next: [Features walkthrough](./08-features-walkthrough.md)
