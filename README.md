# Iron Tide 4 — PFT Companion

12-week USCG PFT training companion with cloud login: users sign up with an
email address and their workout checkmarks stay saved when they log back in.

**Mission:** 35 push-ups · 2:52 plank · 7:50 row
**Profile:** Male 45–49 · 90 pts/event · 270 total

## Contents

- `index.html` — app shell and tabs
- `styles.css` — naval/athletic briefing theme
- `plan.js` — the full 12-week plan (12 weeks × 6 sessions × 3 tasks = 216 tasks)
- `app.js` — training UI, stopwatch, target calculator, readiness log, auth, cloud sync
- `config.js` — Supabase project URL + anon key
- `supabase.sql` — database table + security policies

## Setup

1. **Create the database table.** In your Supabase dashboard, open the SQL Editor,
   paste the contents of `supabase.sql`, and run it. This creates the `progress`
   table with row-level security so each user can only access their own data.

2. **Confirm email auth is enabled.** In Supabase: Authentication → Providers →
   make sure **Email** is enabled. (Confirm-email can stay on; the app handles it.)

3. **Wire your anon key.** `config.js` in this repo ships with a
   `PASTE_ANON_KEY_HERE` placeholder. For a new deployment, copy the **anon
   public** key from your Supabase dashboard (Project Settings → Data API) into
   `config.js` before deploying. The live deployment already has its key wired
   directly — do not overwrite the deployed `config.js` with the placeholder
   copy or cloud login will stop working.

4. **Deploy as a static site.** This repo has no build step — deploy it as-is:
   - **Vercel:** import the repo, framework preset "Other", no build command, output directory `/`.
   - **Netlify:** connect the repo, build command empty, publish directory `/`.
   - **Cloudflare Pages:** connect the repo, no build command, output directory `/`.

Once deployed, visitors can train as guests (progress stays on their device) or
create an account in the **Account** tab — their checkmarks then sync to the
cloud and follow them across devices and logins.

## Weekly rhythm

Concept2 rowing: three required sessions plus an optional fourth. Wednesday and
Friday: follow the guided stretch routine. Sunday: rest.
