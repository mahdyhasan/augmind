# How to Get Supabase Credentials

## Step 1: Create/Access Supabase Project

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard)
2. Sign in or create account
3. Click "New Project" or select existing project

## Step 2: Get Your Credentials (NOT framework settings)

**IMPORTANT**: Ignore the framework selection (Next.js, Prisma, etc.) - that's for code generation only!

1. In your Supabase project dashboard
2. Go to **Settings** → **API** (in the left sidebar)
3. You'll see two important values:

### Project URL

- Look for "Project URL"
- Example: `https://abcd1234efgh5678.supabase.co`
- This becomes your `VITE_SUPABASE_URL`

### API Keys

- Look for "Project API keys"
- Copy the **anon/public** key (NOT the secret key)
- Example: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (very long string)
- This becomes your `VITE_SUPABASE_ANON_KEY`

## Step 3: Set Environment Variables

### For Development (Builder.io):

Use the DevServerControl tool:

```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-very-long-anon-key-here
```

### For Netlify Deployment:

1. Go to your Netlify dashboard
2. Select your site
3. Go to Site settings → Environment variables
4. Add these two variables:
   - `VITE_SUPABASE_URL` = your project URL
   - `VITE_SUPABASE_ANON_KEY` = your anon key
5. Redeploy your site

## Step 4: Create Database Tables

After connecting, you'll need to create tables. Go to Supabase Dashboard → SQL Editor and run:

```sql
-- Enable RLS
alter table if exists public.user_profiles enable row level security;

-- Create tables (run one by one)
create table if not exists public.user_profiles (
  id uuid primary key default gen_random_uuid(),
  username text unique not null,
  full_name text not null,
  role text not null check (role in ('Admin', 'Business Dev User')),
  token_limit integer default 10000,
  word_limit integer default 5000,
  tokens_used integer default 0,
  words_used integer default 0,
  daily_requests integer default 0,
  last_request_date date,
  status text default 'Active' check (status in ('Active', 'Inactive')),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);
```

## Common Issues:

- **Framework selection**: Ignore it - just get the URL and API key
- **Secret vs Anon key**: Use the anon/public key, NOT the secret key
- **Environment variables**: Must start with `VITE_` for client-side access
- **Netlify deployment**: Set environment variables in Netlify dashboard
