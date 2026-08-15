# Kitchen Ordering

A simple kitchen ordering app. Chefs mark which items are available.
Senior Chefs see what's not available and create orders for it.

Not an inventory system — no stock levels, suppliers, or expiry dates.
Just: what's missing, and what order gets it.

## Stack

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS
- Supabase (Postgres + Auth)
- Deployed on Vercel

## How it works

1. **Chef** opens their dashboard and adjusts each item's on-hand amount with
   `+` / `−` buttons (in the unit that item is tracked in — pcs, kg, g, L, or
   ml). Every change saves immediately.
2. Each item's status is worked out automatically from that quantity against
   a **reorder threshold** you set per item:
   - **Available** — comfortably above the threshold
   - **Low Stock** — at or below the threshold, but not at zero
   - **Needs Order** — at zero
3. **Senior Chef** opens their dashboard and sees every Low Stock and Needs
   Order item, with how much is currently on hand for context. They tick the
   items they want, enter the quantity to order (and an optional note), and
   create an order.
4. The order starts as **Draft**, moves to **Ordered** once it's been placed
   with a supplier, and **Completed** once it's arrived. Previous orders are
   listed with their status, date, and who created them.
5. **Admin** manages the item list (add / rename / remove, plus each item's
   unit and reorder threshold) and user accounts (create users, assign them
   as Chef / Senior Chef / Admin).

## Project structure

```
src/
  app/
    login/            Login page
    chef/              Chef dashboard
    senior-chef/        Senior Chef dashboard + order detail pages
    admin/              Admin dashboard
  components/           Shared UI (buttons, forms, lists)
  lib/
    actions/            Server actions (mutations)
    supabase/            Supabase client helpers (browser / server / admin)
    types.ts             Shared TypeScript types
supabase/
  schema.sql             Full database schema, RLS policies, triggers
scripts/
  seed.ts                 Demo users + demo items
```

## 1. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and create a new project.
2. In the SQL editor, paste and run the contents of `supabase/schema.sql`.
   This creates the `users`, `items`, `orders`, and `order_items` tables,
   sets up Row Level Security policies for each role, and adds a trigger
   that creates a `public.users` row whenever a new person signs up.
3. In **Project Settings → API**, copy:
   - Project URL
   - `anon` public key
   - `service_role` secret key

> **Already deployed with an earlier version of this app?** That version
> used a simple available/not-available flag. Run
> `supabase/migration_stock_levels.sql` in the SQL editor once to switch
> your existing `items` table over to quantity-based tracking without
> losing data.

## 2. Configure environment variables

Copy `.env.example` to `.env.local` and fill in the three values from step 1:

```bash
cp .env.example .env.local
```

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

The service role key is only ever used in server actions (admin user
management, seeding) — it's never sent to the browser.

## 3. Install and run

```bash
npm install
npm run dev
```

The app runs at http://localhost:3000.

## 4. Seed demo data

```bash
npm run seed
```

This creates one user per role and a starter list of kitchen items with
varied stock levels (Chicken, Tomatoes, Milk, Rice, Onions, Olive Oil,
Eggs, Butter) — some Available, some Low Stock, and Milk starts at zero
so you can see a Needs Order item right away.

Demo logins (password: `kitchen123`):

| Role         | Email                    |
| ------------ | ------------------------ |
| Chef         | chef@example.com         |
| Senior Chef  | seniorchef@example.com   |
| Admin        | admin@example.com        |

Log in as Chef, mark a couple of items Not Available, then log in as
Senior Chef in another browser/incognito window to see them appear
under "What Needs Ordering" and create an order.

## Roles & access

Access is enforced in two places:

- **Middleware** (`middleware.ts`) redirects each signed-in user to their
  own section of the app and keeps them out of the others. Admins can
  also view the Senior Chef dashboard.
- **Row Level Security** on every table means the database itself refuses
  reads/writes that don't match the user's role, even if someone bypassed
  the UI.

New users get a role via the Admin dashboard's "Create user" form, which
sets it in the invite metadata; the database trigger picks it up
automatically. Admins can change anyone's role at any time from the same
dashboard.

## Deploy to Vercel

1. Push this project to a GitHub repository.
2. In [Vercel](https://vercel.com), click **New Project** and import the repo.
3. Add the three environment variables from `.env.example` under
   **Project Settings → Environment Variables**.
4. Deploy. Vercel will build and host the app automatically on every push.
5. In your Supabase project, under **Authentication → URL Configuration**,
   add your Vercel deployment URL to the allowed redirect URLs.

## Notes on scope

This intentionally does not include: stock levels, expiry dates,
suppliers, minimum stock thresholds, inventory history, or stock
valuation. It's an ordering workflow, not an inventory system.
