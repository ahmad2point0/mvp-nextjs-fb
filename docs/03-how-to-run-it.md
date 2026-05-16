# 3. How to run it on your laptop

## What you need installed

- **Node.js 20+** — download from [nodejs.org](https://nodejs.org).
- **Bun** — install with `npm install -g bun` (or follow [bun.sh](https://bun.sh)).
- **Git** — to clone the repo.
- A **code editor** — VS Code is the standard choice.

## Step 1 — Get the code

```bash
git clone <repo-url>
cd mvp-nextjs-fb
```

## Step 2 — Install the dependencies

```bash
bun install
```

This downloads everything listed in `package.json` (Next.js, React, Supabase, etc.) into a `node_modules/` folder.

## Step 3 — Set up environment variables

Create a file called `.env.local` in the project root (it's gitignored, so it never leaves your machine).

```bash
NEXT_PUBLIC_SUPABASE_URL=https://bnapyocnjwaizcvpgjyx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key-here>
```

You can grab the keys from the Supabase dashboard → Project Settings → API.

**Why two keys?**
- `NEXT_PUBLIC_SUPABASE_URL` — where Supabase lives. Public, safe to expose.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — the public key the browser uses. RLS policies inside the database keep it safe.

The `NEXT_PUBLIC_` prefix tells Next.js: *"yes, ship this value to the browser."* Anything without that prefix stays server-side only.

## Step 4 — Start the dev server

```bash
bun run dev
```

You should see:
```
▲ Next.js 16.2.2 (Turbopack)
- Local:        http://localhost:3000
```

Open **http://localhost:3000** in your browser. Save a file and the page refreshes automatically (hot reload).

## Other useful commands

| Command | What it does |
|---|---|
| `bun run dev` | Start the dev server (with hot reload) |
| `bun run build` | Build the production bundle (catches TypeScript errors) |
| `bun run start` | Run the production build locally |
| `bun run lint` | Check the code for style issues |
| `bunx playwright test` | Run the end-to-end tests in a real browser |

## What if something goes wrong?

| Problem | Fix |
|---|---|
| `bun: command not found` | Install Bun, then re-open your terminal. |
| Errors mention missing env vars | Double-check `.env.local` exists and has both `NEXT_PUBLIC_SUPABASE_*` keys. |
| "Port 3000 already in use" | Either kill the old process or run `bun run dev -- --port 3001`. |
| TypeScript red squiggles everywhere on a fresh clone | Run `bun install` again, then restart VS Code. |

More fixes in [FAQ & troubleshooting](./10-faq-troubleshooting.md).

---

➡️ Next: [A tour of the project folders](./04-project-tour.md)
