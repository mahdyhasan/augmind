# Supabase Setup Instructions

## Current Issue

The application is failing to connect to Supabase with "Failed to fetch" errors because the configured Supabase URL is not reachable.

## Required Steps

### 1. Get Valid Supabase Credentials

1. Visit [supabase.com](https://supabase.com)
2. Sign in and create a new project (or access existing)
3. Go to Settings → API in your project dashboard
4. Copy these values:
   - **Project URL** (starts with https://...supabase.co)
   - **anon/public key** (long string starting with eyJ...)

### 2. Update Environment Variables

Use the DevServerControl tool or update deployment settings with:

```
VITE_SUPABASE_URL=your_project_url_here
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

### 3. Setup Database Schema

Once connected, you'll need to create the required tables:

- user_profiles
- messages
- conversations
- documents
- preset_questions
- client_prospects
- prospect_analysis
- system_settings

### 4. Enable Row Level Security (RLS)

Make sure RLS is enabled on all tables for proper security.

## Current Status

- ❌ Supabase URL not reachable
- ❌ Database connection failing
- ❌ Authentication not working
- ❌ File uploads not working

## After Fix

- ✅ Database connectivity restored
- ✅ Authentication working
- ✅ All admin panel functions working
- ✅ File uploads working
- ✅ AI chat with real data
