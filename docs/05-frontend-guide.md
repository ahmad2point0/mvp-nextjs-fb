# 5. Frontend guide

Everything the user actually sees and clicks. We'll go top-down: layout → pages → components → state → styling.

## The root layout

[`src/app/layout.tsx`](../src/app/layout.tsx) is the HTML shell wrapped around every page. It sets up:

- The `<html>` and `<body>` tags with fonts (Inter and Source Code Pro).
- The `<QueryProvider>` — gives every component access to TanStack Query.
- The `<AuthProvider>` — listens to Supabase auth changes and updates the Zustand store.
- The `<Toaster>` — the popup-message system.

```tsx
<QueryProvider>
  <AuthProvider>{children}</AuthProvider>
  <Toaster position="top-right" richColors />
</QueryProvider>
```

## Pages

### The landing page — `src/app/page.tsx`

What you see at `/`. Sections (top to bottom):

1. **Hero** — big purple section with the logo, headline, and the "Get Started" button.
2. **Impact stats** — animated numbers (total donations, students supported, etc.) fetched live from `/api/public/stats`.
3. **System Modules** — the three pillars (Donation, Volunteer, Education Aid).
4. **How It Works** — 4 numbered steps.
5. **Volunteer Jobs** (dark section).
6. **Donation Needs**.
7. **Testimonials**.
8. **FAQ** — accordion (`<details><summary>` tags).
9. **CTA banner** — "Ready to Make a Difference?"
10. **About CSEAS**.

All the scroll-triggered animations come from GSAP inside a single `useEffect`. The `gsap.context(...)` block scopes animations to `mainRef`, so they get cleaned up when the page unmounts.

### Auth pages — `src/app/(auth)/...`

The `(auth)` folder uses parentheses, which means "**route group**" in Next.js. Route groups exist for organization only — they don't show up in the URL. So `(auth)/login/page.tsx` is still at `/login`.

| Route | What it does |
|---|---|
| `/register` | Step 1 of signup — pick role, enter info |
| `/verify-otp` | Step 2 — enter the 6-digit code emailed to you |
| `/upload-documents` | Step 3 — upload CNIC or student docs |
| `/login` | Sign back in |
| `/forgot-password` | Request a reset email |
| `/update-password` | Set a new password after clicking the email link |
| `/logout` | Sign out |

### Dashboard — `src/app/dashboard/`

After login, users land here. The layout adds a sidebar; the page picks the right *panel* based on the user's role.

```
dashboard/
├── layout.tsx     # Sidebar + content area shell
└── page.tsx       # Picks <DonorOverviewPanel> / <StudentOverviewPanel> / ...
```

The **TabPanel system** ([`features/dashboard/components/tab-panel.tsx`](../src/features/dashboard/components/tab-panel.tsx)) keeps the sidebar in sync with the URL so deep-linking works.

## Reusable components

### Design-system primitives — `src/components/ui/`

- `button.tsx` — variants (primary, secondary), sizes, loading state.
- `card.tsx` — rounded white box with optional border.
- `badge.tsx`, `skeleton.tsx`, etc.

These come from [`shadcn/ui`](https://ui.shadcn.com) patterns — copy-paste components, no extra package to install.

### Global components — `src/global/components/`

- `navbar.tsx` — top bar with logo + "Community Support & Education Aid System" + nav links.
- `footer.tsx` — small dark footer.
- `sidebar.tsx` — dashboard sidebar (only rendered inside the dashboard layout).
- `card.tsx`, `button.tsx` — bigger wrappers around the `ui/` primitives with our design tokens.

## State management — two systems, different jobs

### 1. Client state → Zustand
For things like *"is the current user a donor or admin?"* — stuff every component needs.

[`src/global/stores/auth-store.ts`](../src/global/stores/auth-store.ts):

```ts
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  logout: () => set({ user: null }),
}));
```

Any component can read it:

```tsx
const { user } = useAuthStore();
if (user?.role === "admin") { /* ... */ }
```

### 2. Server state → TanStack Query
For data that lives on the server. Each feature has a `hooks.ts` file exposing query/mutation hooks.

Example, [`features/donations/hooks.ts`](../src/features/donations/hooks.ts):

```ts
export function useDonations(status?: string) {
  return useQuery<Donation[]>({
    queryKey: ["donations", status],
    queryFn: () => api.get(`/donations${status ? `?status=${status}` : ""}`),
  });
}
```

In a component:

```tsx
const { data: donations, isLoading } = useDonations("pending");
```

Behind the scenes, TanStack Query caches the data, dedupes parallel requests, and re-fetches when stale.

## How a form gets data to the server

Every form follows the same shape:

```tsx
const createDonation = useCreateDonation();   // mutation hook

function handleSubmit(e) {
  e.preventDefault();
  // 1. validate
  if (!amount) return setError("Amount required");
  // 2. fire the mutation
  createDonation.mutate(
    { amount, category, ... },
    {
      onSuccess: () => toast.success("Donation submitted!"),
      onError: (err) => toast.error(err.message),
    }
  );
}
```

The mutation calls `api.post("/donations", input)` which hits the API route, which writes to Supabase.

## Styling with Tailwind

Custom design tokens live in `src/app/globals.css`:

```css
@theme inline {
  --color-primary: #533afd;     /* purple — buttons, links */
  --color-heading: #061b31;     /* dark blue-ish — titles */
  --color-body: #64748d;        /* gray — paragraph text */
  --color-ruby: #c70039;        /* red — errors */
}
```

You then use them as Tailwind classes:

```tsx
<h2 className="text-heading text-2xl font-light">...</h2>
<p className="text-body text-sm">...</p>
<button className="bg-primary text-white">...</button>
```

## Animations cheatsheet (GSAP)

The patterns used on the landing page:

```ts
// Entrance: fade in from below
gsap.from(".hero-heading", { y: 60, opacity: 0, duration: 1 });

// Triggered when an element scrolls into view
gsap.from(el, {
  scrollTrigger: { trigger: el, start: "top 85%" },
  y: 40, opacity: 0,
});

// Infinite floating (orbs in the hero)
gsap.to(".hero-orb-1", {
  y: -40, x: 20, duration: 6, repeat: -1, yoyo: true, ease: "sine.inOut",
});
```

---

➡️ Next: [Backend guide](./06-backend-guide.md)
