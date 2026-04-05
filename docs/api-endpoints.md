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
| approved | boolean | default false | Admin approval status |
| created_at | timestamptz | default now() | Registration timestamp |

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
| POST | `/api/auth/register` | Register user + create profile row | Done |
| POST | `/api/auth/login` | Login (email/password) | Done |
| POST | `/api/auth/logout` | Clear session | Done |
| GET | `/api/auth/me` | Get current user + profile | Done |

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
| GET | `/api/admin/users` | List all users (admin only) | Done |
| PATCH | `/api/admin/users/[id]` | Update user (approve/role) | Done |
| GET | `/api/admin/stats` | System-wide statistics | Done |
