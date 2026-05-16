# 2. Tech stack explained

Every tool used in this project, with a simple explanation, why we use it, and what it replaces.

## The big building blocks

### Next.js 16
**What it is:** a framework on top of React. Think of React as Lego bricks (components), and Next.js as the instruction manual that decides which bricks render where and when.

**Why we use it:**
- **Pages from folders.** A file at `src/app/login/page.tsx` automatically becomes the URL `/login`. No router config.
- **API routes.** A file at `src/app/api/donations/route.ts` becomes a backend endpoint at `/api/donations`. Same project, no separate server needed.
- **Server-rendering.** The first time someone visits your site, Next.js builds the HTML on the server, so the page is fast and Google can index it.

**Replaces:** Create React App + Express + a separate routing library.

### React 19
**What it is:** the UI library. You write components (functions that return HTML-looking JSX) and React updates the screen when data changes.

```tsx
function HelloButton({ name }) {
  return <button>Hello, {name}!</button>;
}
```

### TypeScript 5
**What it is:** JavaScript + types. You say "this function takes a number," and the editor warns you if you pass a string.

**Why:** catches bugs before you even press save. No more "undefined is not a function" at 2 AM.

### Tailwind CSS 4
**What it is:** styling with class names instead of writing CSS files.

```html
<!-- Old way: write a CSS class somewhere -->
<div class="card-with-shadow">...</div>

<!-- Tailwind way: classes describe the styles themselves -->
<div class="rounded-lg bg-white p-6 shadow-md">...</div>
```

**Why:** no jumping between files, design tokens are consistent, file sizes stay small.

## Data & state

### TanStack Query (a.k.a. React Query)
**What it is:** the thing that fetches data from your backend, caches it, and re-fetches when stale.

Without it: you write `useEffect` + `fetch` + `useState` + loading-flag + error-flag in every component. With it: one hook, three lines.

```tsx
const { data, isLoading } = useQuery({
  queryKey: ["donations"],
  queryFn: () => fetch("/api/donations").then(r => r.json()),
});
```

### Zustand
**What it is:** a tiny store for global state. The current logged-in user is kept here so any component can read it.

**Replaces:** Redux (but 10x less code).

## Backend

### Supabase
**What it is:** a hosted Postgres database + authentication + file storage, all behind one URL. It's like Firebase but with a real SQL database underneath.

CSEAS uses Supabase for **everything that needs to persist**:
- The user accounts and passwords → Supabase Auth.
- The donations, aid requests, notifications → Supabase Postgres tables.
- The CNIC/document photos → Supabase Storage buckets.

### Row Level Security (RLS)
**What it is:** SQL rules that say *"a user can only see their own rows"*. Enforced inside the database itself, so even if someone bypasses your frontend, they still can't read other people's data.

Example rule (in plain English): *"A row in the `donations` table is only visible if `donations.donor_id = auth.uid()`, OR the requester's role is admin."*

## UI extras

### GSAP + ScrollTrigger
**What it is:** an animation library. The hero section orbs, the count-up stats, the cards that slide in when you scroll — that's GSAP.

### Lucide React
**What it is:** the icon set (the little SVGs you see everywhere: `Upload`, `Eye`, `Check`, etc.).

### Sonner
**What it is:** toast notifications — those little messages that pop up in the corner saying "Donation submitted!" or "Wrong password".

### Recharts
**What it is:** the chart library used in the admin reports panel.

## Tooling

### Bun
**What it is:** a faster alternative to npm. Run scripts with `bun run dev` instead of `npm run dev`.

### Playwright
**What it is:** runs the website in a real browser and clicks around to make sure nothing's broken (end-to-end testing).

### ESLint
**What it is:** the code-style police. Catches things like unused variables.

---

➡️ Next: [How to run it on your laptop](./03-how-to-run-it.md)
