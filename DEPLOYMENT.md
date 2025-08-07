# Augmind AI Assistant - Deployment Guide

This guide ensures your Augmind application runs smoothly on any server with real data.

## Current Status Check

The application currently has **demo mode fallbacks** implemented because Supabase connectivity was failing in the development environment. This is NOT suitable for production.

### How to Check if You're Using Real vs Demo Data:

1. **Login Page**: If you see "Demo mode activated!" after login, you're in demo mode
2. **Admin Panel**: Look for messages starting with "Demo mode:" 
3. **Dashboard**: Demo data will show unrealistic perfect numbers
4. **Browser Console**: Look for logs like "Demo mode: Loaded demo users"

## Pre-Deployment Checklist

### 1. Database Setup (Supabase)

**Required Tables and Schema:**
```sql
-- Enable RLS
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Create user_profiles table
CREATE TABLE user_profiles (
  id UUID REFERENCES auth.users NOT NULL PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('Admin', 'Business Dev User')),
  token_limit INTEGER DEFAULT 5000,
  word_limit INTEGER DEFAULT 1000,
  tokens_used INTEGER DEFAULT 0,
  words_used INTEGER DEFAULT 0,
  daily_requests INTEGER DEFAULT 0,
  last_request_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create system_settings table
CREATE TABLE system_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key TEXT UNIQUE NOT NULL,
  setting_value TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create conversations table
CREATE TABLE conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT,
  user_id UUID REFERENCES auth.users NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create messages table
CREATE TABLE messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  sender TEXT NOT NULL CHECK (sender IN ('user', 'ai')),
  content TEXT NOT NULL,
  tokens_used INTEGER DEFAULT 0,
  words_count INTEGER DEFAULT 0,
  preset_question_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create preset_questions table
CREATE TABLE preset_questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  prompt TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  usage_count INTEGER DEFAULT 0,
  created_by UUID REFERENCES auth.users NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create documents table
CREATE TABLE documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  filename TEXT NOT NULL,
  original_filename TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  file_type TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  storage_path TEXT NOT NULL,
  storage_bucket TEXT NOT NULL,
  content_processed BOOLEAN DEFAULT false,
  content_text TEXT,
  uploaded_by UUID REFERENCES auth.users NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create client_prospects table
CREATE TABLE client_prospects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_name TEXT NOT NULL,
  website TEXT,
  linkedin_company TEXT,
  kdm_name TEXT NOT NULL,
  kdm_role TEXT,
  kdm_email TEXT,
  kdm_linkedin TEXT,
  additional_info TEXT,
  user_id UUID REFERENCES auth.users NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create usage_analytics table
CREATE TABLE usage_analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  feature_used TEXT NOT NULL,
  tokens_consumed INTEGER DEFAULT 0,
  words_generated INTEGER DEFAULT 0,
  success BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Row Level Security (RLS) Policies:**
```sql
-- Enable RLS on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE preset_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_prospects ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_analytics ENABLE ROW LEVEL SECURITY;

-- User profiles: Users can only see/edit their own profile, admins see all
CREATE POLICY "Users can view own profile" ON user_profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON user_profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can view all profiles" ON user_profiles FOR SELECT USING (
  EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'Admin')
);

-- Conversations: Users can only access their own
CREATE POLICY "Users own conversations" ON conversations FOR ALL USING (auth.uid() = user_id);

-- Messages: Users can only access messages from their conversations
CREATE POLICY "Users own messages" ON messages FOR ALL USING (
  EXISTS (SELECT 1 FROM conversations WHERE id = conversation_id AND user_id = auth.uid())
);

-- Add similar policies for other tables...
```

### 2. Environment Variables

**Required Environment Variables:**
```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# API Keys (Set via Admin Panel)
OPENAI_API_KEY=your-openai-key
SERPER_API_KEY=your-serper-key
ANTHROPIC_API_KEY=your-anthropic-key

# App Configuration
NODE_ENV=production
PORT=3000
```

### 3. Remove Demo Mode (CRITICAL)

**Files to Update:**

1. **client/contexts/AuthContext.tsx**
   - Remove demo credential checking
   - Remove `handleDemoLogin` function
   - Ensure all auth goes through Supabase

2. **client/pages/AdminPanel.tsx**
   - Remove `loadDemoUsers()` and `loadDemoSystemSettings()` functions
   - Remove demo mode detection logic
   - Ensure all data comes from database

3. **client/pages/Dashboard.tsx**
   - Remove any demo data fallbacks
   - Ensure all statistics come from real database queries

### 4. Dependencies and Build

**Install Dependencies:**
```bash
npm install
```

**Build for Production:**
```bash
npm run build
```

**Test Build:**
```bash
npm start
```

### 5. Server Requirements

**Minimum Requirements:**
- Node.js 18+
- Memory: 512MB minimum, 1GB recommended
- Disk: 1GB for application files
- Network: HTTPS/SSL certificate for production

**Recommended Hosting:**
- Vercel (with MCP integration available)
- Netlify (with MCP integration available)
- Railway
- Render
- DigitalOcean App Platform

### 6. Initial Admin Setup

**Create First Admin User:**
```sql
-- Insert directly into Supabase Auth via dashboard, then:
INSERT INTO user_profiles (id, username, full_name, role, token_limit, word_limit)
VALUES ('user-id-from-auth', 'admin', 'Administrator', 'Admin', 10000, 2000);
```

Or use the `seedData.ts` functions:
```javascript
import { createDemoAdmin } from './client/lib/seedData';
await createDemoAdmin();
```

### 7. System Settings Configuration

**Initial System Settings (via Admin Panel):**
- Default User Tokens: 5000
- Default User Words: 1000
- Max Tokens per Request: 2000
- Max Words per Response: 500
- Daily Request Limit: 100
- API Keys: Set your OpenAI, Serper, and Anthropic keys

## Deployment Steps

### Step 1: Prepare Supabase
1. Create new Supabase project
2. Run the database schema SQL
3. Set up RLS policies
4. Get URL and anon key

### Step 2: Configure Environment
1. Set environment variables on your hosting platform
2. Ensure VITE_ prefixed variables are available at build time

### Step 3: Remove Demo Mode
1. Update AuthContext to remove demo login logic
2. Update AdminPanel to remove demo data functions
3. Test that app fails gracefully when DB is unavailable (shows error, doesn't crash)

### Step 4: Deploy
1. Connect repository to hosting platform
2. Set build command: `npm run build`
3. Set start command: `npm start`
4. Deploy and test

### Step 5: Initialize
1. Create first admin user via Supabase dashboard
2. Login to admin panel
3. Configure system settings
4. Create additional users as needed

## Testing Checklist

- [ ] Can create new users via admin panel
- [ ] User profiles save to database
- [ ] System settings persist between sessions  
- [ ] Authentication works without demo credentials
- [ ] Dashboard shows real statistics
- [ ] All CRUD operations work
- [ ] RLS policies prevent unauthorized access
- [ ] No "Demo mode" messages appear

## Troubleshooting

**Common Issues:**

1. **"Demo mode" messages still appearing**
   - Demo logic not fully removed from codebase
   - Check AuthContext and AdminPanel files

2. **Database connection fails**
   - Verify environment variables are set correctly
   - Check Supabase URL and keys
   - Ensure RLS policies allow access

3. **Build failures**
   - Check Node.js version (18+ required)
   - Verify all dependencies installed
   - Check TypeScript errors

4. **Authentication not working**
   - Verify Supabase project is not paused
   - Check RLS policies on user_profiles table
   - Ensure auth.users table has entries

## Security Considerations

- [ ] API keys stored securely (environment variables, not code)
- [ ] RLS policies implemented and tested
- [ ] HTTPS enabled in production
- [ ] CORS configured properly
- [ ] Session management secure
- [ ] Input validation on all forms
- [ ] XSS protection enabled

## Monitoring

**Recommended Monitoring:**
- Supabase dashboard for database metrics
- Application logs for errors
- User activity and usage statistics
- API rate limiting and costs
- Performance monitoring (response times)

## Backup Strategy

- [ ] Automated Supabase backups enabled
- [ ] Code repository backed up
- [ ] Environment variables documented securely
- [ ] Recovery procedures documented
