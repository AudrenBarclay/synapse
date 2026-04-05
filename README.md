# Synapse

Pre-med networking web app (LinkedIn-style) for students and physicians: profiles, shadowing discovery, mutual-match messaging, forms, and weekly availability—backed by **Supabase** (profiles, listings, and messages read from your project database).

## Tech

- Next.js (App Router) + React + TypeScript
- Tailwind CSS
- Supabase Auth, Postgres, and Storage (`avatars`, `student-forms`)

## Getting started

1. Install **Node.js LTS**. In the project folder:

```bash
cd /Users/audrenbarclay/Documents/premed-networking
npm install
```

2. Create a **Supabase** project. In the SQL editor, run `supabase/schema.sql`, then apply migrations in order: `002_matching_schedule_prereqs.sql`, `003_opportunities.sql`, `004_profiles_location.sql`, `005_profiles_optional_columns.sql`, `006_availability_schedule_drop_legacy_week_tables.sql`. Doctor weekly AM/PM data lives in `profiles.availability_schedule` (jsonb). The app normalizes optional/alias profile columns in `normalizeProfileRowForForm`.

3. Create Storage buckets **`avatars`** and **`student-forms`** with policies so authenticated users can upload under their own user id prefix.

4. Copy environment variables:

```bash
cp .env.example .env.local
```

Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` from Supabase → Project Settings → API.

5. Run the app:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Sign up as a student or doctor—dashboards and lists stay **empty** until real rows exist in your database.

## Deploy (Vercel)

1. Push the repo to GitHub/GitLab and import it in [Vercel](https://vercel.com) as a Next.js project (default build: `next build`, output: Next).
2. In **Vercel → Project → Settings → Environment Variables**, add for **Production** and **Preview**:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Deploy. Unauthenticated visitors can open the home page and public profiles (`/doctors/[id]`, `/students/[id]`). Dashboards, messages, and **Opportunities Near Me** require sign-in (enforced in middleware).

## Project structure

- `src/app/` — routes and pages
- `src/components/` — UI
- `src/lib/` — Supabase clients, mappers, helpers
- `supabase/` — SQL schema and migrations
- `src/types/` — TypeScript types
