# 8. Features walkthrough

End-to-end stories for the main features. Each one traces a user action from button click to database row.

## Feature: Make a donation

**Goal:** A donor wants to give Rs. 5,000 toward "Books & Stationery" or hand-deliver a stack of textbooks.

### What the donor sees

1. Logs in → dashboard → "Make a Donation" tab.
2. The form ([`donation-form.tsx`](../src/features/donations/components/donation-form.tsx)) shows two big buttons at the top:
   - **Donate Money** — fill in amount + payment method + transaction ID.
   - **Donate Items Directly** — fill in estimated value + pickup/drop-off details.
3. Picks a category from the dropdown.
4. If cash: enters amount, payment method (Cash / JazzCash / Easypaisa), transaction ID, optional receipt.
5. If in-kind: enters estimated value of the items + pickup/drop-off instructions (address, contact, preferred time).
6. Hits "Confirm Donation".

### What the form validates

- Category selected.
- Amount within **Rs. 100 – Rs. 1,000,000** (the bounds live in [`features/donations/constants.ts`](../src/features/donations/constants.ts)).
- For cash: payment method picked.
- For in-kind: pickup details provided.

### Behind the scenes

1. `useCreateDonation().mutate(input)` posts to `/api/donations`.
2. [`api/donations/route.ts`](../src/app/api/donations/route.ts) validates amount again, then inserts:
   ```ts
   {
     donor_id: <current user id>,
     category, subcategory, amount,
     payment_method: kind === "in_kind" ? "Direct Delivery" : payment,
     transaction_id, receipt_url, message,
     aid_request_id: <if linked>,
     status: "pending",
   }
   ```
3. If `aid_request_id` is set, the linked aid request is flipped to `"fulfilled"` and the student gets a notification.
4. All admins get a notification too via `notifyAdmins(...)`.
5. The mutation's `onSuccess` invalidates the `["donations"]` query, so the donor's list refreshes automatically.

## Feature: Submit an aid request

**Goal:** A student needs Rs. 3,000 for next term's books.

1. Student logs in → dashboard → "Apply for Aid".
2. The form ([`aid-request-form.tsx`](../src/features/aid-requests/components/aid-request-form.tsx)) shows a documents reminder box up top — "to qualify, upload Student ID, fee challan, financial-need proof, etc." with a link to `/upload-documents`.
3. Student picks an aid type, amount (Rs. 100 – Rs. 1,000,000), and describes the need.
4. Submit → `POST /api/aid-requests` → inserts with `status: "pending"`.
5. Admin reviews the request. Donors browsing the public list can choose to fund it directly (which sets `status: "fulfilled"`).

## Feature: Donor funds a specific request

1. Donor browses pending aid requests in their dashboard panel.
2. Clicks "Fund this request" → opens the `<DonationForm>` with `aidRequestId` pre-set.
3. The form switches to "Fund Aid Request" mode — fixed amount (`Rs. 1,200`), category locked to "General Fund".
4. Donor picks payment method, submits.
5. Server processes the donation **and** marks the aid request as `fulfilled`.
6. The student gets a notification: *"Your aid request has been funded with a donation of Rs. 1,200."*

## Feature: Become a volunteer

1. User registers with role `volunteer`.
2. After verification, they go to dashboard → "Join as Volunteer".
3. The form ([`join-form.tsx`](../src/features/volunteers/components/join-form.tsx)) collects skills, availability, motivation.
4. `POST /api/volunteer-applications` saves the application.
5. Admin reviews and approves.
6. Approved volunteers see open tasks in "Volunteer Tasks" tab.
7. Take a task → `PATCH /api/volunteer-tasks/:id` sets `assigned_to = me`.
8. Mark done → `PATCH` sets `status: "completed"`.

## Feature: Realtime notifications

[`features/notifications/use-realtime-notifications.ts`](../src/features/notifications/use-realtime-notifications.ts) subscribes to Supabase's realtime channel for the `notifications` table filtered by `user_id`. When a row inserts:

1. Supabase pushes the new row over a WebSocket.
2. The hook invalidates the `["notifications"]` query.
3. TanStack Query refetches, the bell icon updates, a toast appears.

This is why donations and aid-request updates "instantly" show up across the app.

## Feature: Admin dashboard

Admins see extra panels:
- **User Management** — list, filter by role/blocked status, block/unblock, mark verified.
- **Reports** — recharts charts pulled from `/api/admin/chart-data`.
- **All Donations** / **All Aid Requests** — global lists (the RLS policy lets admins read everything).
- **Stats** — totals shown on the public stats endpoint too.

## Feature: Document viewer (admins)

When an admin opens a user's profile, they see the documents that user uploaded. The component ([`user-documents-viewer.tsx`](../src/features/documents/components/user-documents-viewer.tsx)) calls `GET /api/documents/:userId`, which returns **signed URLs** that expire after 10 minutes. The cache is set to refetch just before that expiry.

---

➡️ Next: [Glossary of jargon](./09-glossary.md)
