# Bheemasena Admin

Operations dashboard for the Bheemasena restaurant. Vite + React 19 + TypeScript
SPA, deployed alongside Vercel Serverless Functions in `/api/`. Data lives in
Supabase (Postgres).

## Tabs

- **Overview** — site online toggle + today's stats.
- **Menu Items** — toggle items, override prices, add new items + categories.
- **Lunch Orders / Dinner Orders** — live ops view (8 s polling, smart merge).
- **Past Orders** — 7-day archive with per-day filter.
- **Show Off** — bestseller tally with WhatsApp / Excel export.

## Local development

```bash
# from repo root
npm install                     # installs API deps
cd bheemasena-admin && npm install

# in one terminal — run the serverless API
vercel dev                      # serves /api/* on :3000

# in another — run the SPA (auto-proxies /api → :3000)
cd bheemasena-admin && npm run dev   # opens http://localhost:5174
```

### Environment

Copy `.env.example` to `.env` at the repo root and fill in:

| variable | scope | purpose |
| --- | --- | --- |
| `SUPABASE_URL` | server | Supabase project URL |
| `SUPABASE_SERVICE_KEY` | server | `service_role` key (keep secret) |
| `ADMIN_SECRET` | server | required `x-admin-secret` for protected routes |
| `VITE_API_URL` | client | leave blank for same-origin deploys |
| `VITE_ADMIN_SECRET` | client | what the admin login compares against |

## Supabase setup

1. Create a fresh Supabase project.
2. Open the SQL Editor and paste the contents of `supabase-schema.sql` from the
   repo root. Run it. The schema is idempotent.
3. Project settings → API → copy the `URL` and `service_role` key into your
   `.env`.
4. Reset the token sequence at any time with:

   ```sql
   SELECT reset_token_sequence();
   ```

## Vercel deployment

This repo is a single Vercel project:

- **Build command:** `cd bheemasena-admin && npm install && npm run build`
- **Output directory:** `bheemasena-admin/dist`
- **API routes:** `/api/*` map to `/api/*.js` automatically.
- **Crons:** archive runs at 03:00 UTC and 19:00 UTC (≈ 08:30 / 00:30 IST).

Set the env vars in Vercel project settings before the first deploy.

## Connecting the user site

If the customer-facing `bheemasena/` project is deployed separately, point its
`VITE_API_URL` to this admin's deployed URL (e.g.
`https://bheemasena-admin.vercel.app`). Both projects share the same Supabase
database — the user site reads `/api/config` for the site-online flag and posts
new orders to `/api/orders`.

## Extending the menu

Static menu items live in `src/data/menuData.ts`. Keep this file in sync with
`bheemasena/src/data/menu.ts` (same IDs, prices, names). Admin-added items live
in the Supabase `menu_items` table and are displayed dynamically.

## Resetting tokens

Tokens never reset on order deletion. To start the sequence from 1 again:

```sql
SELECT reset_token_sequence();
```
