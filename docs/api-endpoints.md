# API Endpoints & Database Schema

## Supabase Project

- **Project**: cseas
- **ID**: `bnapyocnjwaizcvpgjyx`
- **Region**: ap-southeast-1
- **URL**: `https://bnapyocnjwaizcvpgjyx.supabase.co`

## Database Schema

### profiles

Extends Supabase `auth.users`. Created on user registration.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, FK -> auth.users | User ID from Supabase Auth |
| role | text | NOT NULL, CHECK (admin/donor/volunteer/student) | User role |
| full_name | text | NOT NULL | Display name |
| phone | text | nullable | Phone number |
| is_blocked | boolean | default false | Admin has disabled this account |
| created_at | timestamptz | default now() | Registration timestamp |

Note: `is_verified` is not a column — it is derived from `auth.users.email_confirmed_at`
and exposed by `/api/auth/me` and the `admin_get_users` RPC.

### documents

Identity verification documents uploaded at registration.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, gen_random_uuid() | Document ID |
| user_id | uuid | FK -> profiles, CASCADE | Owner |
| document_type | text | CHECK (cnic_front/cnic_back/student_doc) | Slot type |
| storage_path | text | NOT NULL | Path within the bucket (`${user_id}/…`) |
| bucket | text | CHECK (cnic-documents/student-documents) | Storage bucket name |
| uploaded_at | timestamptz | default now() | |

Unique index: `(user_id, document_type)` — re-uploads upsert the existing row.

Storage buckets (both **private**):
- `cnic-documents` — CNIC front + back for donors / volunteers
- `student-documents` — single supporting document for students

Storage RLS: users can read/write only within `${auth.uid()}/`; admins can read all.

### donations

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, gen_random_uuid() | Donation ID |
| donor_id | uuid | FK -> profiles | Donor who made the donation |
| category | text | NOT NULL | Category (Money/Food/Uniform/Books/Clothes) |
| subcategory | text | nullable | Specific item within category |
| amount | text | NOT NULL | Amount in Rs or item quantity |
| beneficiary_id | uuid | FK -> profiles, nullable | Student receiving donation |
| payment_method | text | nullable | Cash/JazzCash/Easypaisa |
| transaction_id | text | nullable | Payment reference |
| message | text | nullable | Optional note |
| status | text | default 'pending', CHECK | pending/approved/rejected |
| created_at | timestamptz | default now() | |

### aid_requests

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, gen_random_uuid() | Request ID |
| student_id | uuid | FK -> profiles, CASCADE | Requesting student |
| aid_type | text | NOT NULL | Type of aid needed |
| amount | text | NOT NULL | Amount or quantity |
| description | text | nullable | Explanation of need |
| status | text | default 'pending', CHECK | pending/approved/rejected/fulfilled |
| created_at | timestamptz | default now() | |

### volunteer_tasks

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, gen_random_uuid() | Task ID |
| volunteer_id | uuid | FK -> profiles, nullable | Assigned volunteer |
| student_name | text | NOT NULL | Student being helped |
| task_description | text | NOT NULL | Task details |
| due_date | date | nullable | Deadline |
| status | text | default 'pending', CHECK | pending/in_progress/completed |
| created_at | timestamptz | default now() | |

### volunteer_applications

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, gen_random_uuid() | Application ID |
| user_id | uuid | FK -> profiles, CASCADE | Applicant |
| volunteer_role | text | NOT NULL | Desired role |
| motivation | text | nullable | Why they want to volunteer |
| status | text | default 'pending', CHECK | pending/approved/rejected |
| created_at | timestamptz | default now() | |

### notifications

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, gen_random_uuid() | Notification ID |
| user_id | uuid | FK -> profiles, CASCADE | Recipient |
| title | text | NOT NULL | Notification title |
| message | text | NOT NULL | Notification body |
| icon | text | default bell | Display icon |
| read | boolean | default false | Read status |
| created_at | timestamptz | default now() | |

## RLS Policies

### User-scoped (all tables)

- Users can **SELECT** their own rows (`auth.uid() = <owner_column>`)
- Users can **UPDATE** their own rows where applicable
- Users can **INSERT** their own rows (with `auth.uid()` check)

### Admin-scoped (all tables)

Admins (profiles.role = 'admin') have:
- **SELECT** on all rows across all tables
- **UPDATE** on all rows across all tables
- **INSERT** on volunteer_tasks and notifications

## Implemented API Routes

All routes are in `src/app/api/` as Next.js Route Handlers using `createServerSupabaseClient()`.

### Auth

| Method | Path | Description | Status |
|--------|------|-------------|--------|
| POST | `/api/auth/register` | Register user + create profile row (sends OTP email) | Done |
| POST | `/api/auth/login` | Login (email/password). Returns `401 { code: "unverified" }` or `403 { code: "blocked" }` when applicable | Done |
| POST | `/api/auth/logout` | Clear session | Done |
| GET | `/api/auth/me` | Get current user + profile + `is_verified` | Done |
| POST | `/api/auth/verify-otp` | Verify 6-digit signup code and establish session | Done |
| POST | `/api/auth/resend-otp` | Resend signup OTP email | Done |
| POST | `/api/auth/reset-password` | Send password-reset email | Done |
| POST | `/api/auth/update-password` | Set new password for signed-in user | Done |

### Documents

| Method | Path | Description | Status |
|--------|------|-------------|--------|
| POST | `/api/documents` | Record a document row after a client-side storage upload | Done |
| GET | `/api/documents/[userId]` | List a user's documents with 10-minute signed download URLs (self or admin) | Done |

### Donations

| Method | Path | Description | Status |
|--------|------|-------------|--------|
| GET | `/api/donations` | List donations (own or all for admin) | Done |
| POST | `/api/donations` | Create new donation | Done |

### Aid Requests

| Method | Path | Description | Status |
|--------|------|-------------|--------|
| GET | `/api/aid-requests` | List requests (own or all for admin) | Done |
| POST | `/api/aid-requests` | Submit new request | Done |

### Volunteer Tasks

| Method | Path | Description | Status |
|--------|------|-------------|--------|
| GET | `/api/volunteer-tasks` | List tasks (own or all for admin) | Done |
| POST | `/api/volunteer-tasks` | Create new task | Done |
| PATCH | `/api/volunteer-tasks/[id]` | Update task status | Done |

### Volunteer Applications

| Method | Path | Description | Status |
|--------|------|-------------|--------|
| GET | `/api/volunteer-applications` | List applications | Done |
| POST | `/api/volunteer-applications` | Submit application | Done |

### Notifications

| Method | Path | Description | Status |
|--------|------|-------------|--------|
| GET | `/api/notifications` | List user's notifications | Done |
| PATCH | `/api/notifications/[id]` | Mark as read | Done |

### Admin

| Method | Path | Description | Status |
|--------|------|-------------|--------|
| GET | `/api/admin/users` | List users via `admin_get_users` RPC. Optional filters: `?role=`, `?verified=`, `?blocked=` | Done |
| PATCH | `/api/admin/users/[id]` | Update allowed fields: `is_blocked`, `role` | Done |
| GET | `/api/admin/stats` | System-wide statistics | Done |

### Public

Unauthenticated endpoints used by the marketing/landing pages.

| Method | Path | Description | Status |
|--------|------|-------------|--------|
| GET | `/api/public/stats` | Aggregated impact stats for the homepage counter | Done |

#### `GET /api/public/stats`

Returns aggregated platform metrics. No auth required. Edge-cached for 60s with `stale-while-revalidate=300`.

```json
{
  "totalDonations": 1250000,
  "studentsSupported": 75,
  "activeVolunteers": 48,
  "tasksCompleted": 200
}
```

| Field | Source | Definition |
|-------|--------|------------|
| `totalDonations` | `donations` | SUM(`amount`) WHERE `status = 'approved'` |
| `studentsSupported` | `aid_requests` | COUNT(DISTINCT `student_id`) WHERE `status` IN (`approved`, `fulfilled`) |
| `activeVolunteers` | `profiles` | COUNT(*) WHERE `role = 'volunteer'` AND `is_blocked = false` |
| `tasksCompleted` | `volunteer_tasks` | COUNT(*) WHERE `status = 'completed'` |
