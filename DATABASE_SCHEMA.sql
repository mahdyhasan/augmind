-- Augmind Database Schema
-- Run this in your Supabase SQL Editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('Admin', 'Business Dev User')),
  token_limit INTEGER DEFAULT 10000,
  word_limit INTEGER DEFAULT 5000,
  tokens_used INTEGER DEFAULT 0,
  words_used INTEGER DEFAULT 0,
  daily_requests INTEGER DEFAULT 0,
  last_request_date DATE,
  status TEXT DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create conversations table
CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create messages table
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender TEXT NOT NULL CHECK (sender IN ('user', 'ai')),
  content TEXT NOT NULL,
  tokens_used INTEGER DEFAULT 0,
  words_count INTEGER DEFAULT 0,
  preset_question_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create preset_questions table
CREATE TABLE IF NOT EXISTS public.preset_questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  prompt TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  usage_count INTEGER DEFAULT 0,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create documents table
CREATE TABLE IF NOT EXISTS public.documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  filename TEXT NOT NULL,
  original_filename TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  file_type TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  storage_path TEXT NOT NULL,
  storage_bucket TEXT NOT NULL,
  content_processed BOOLEAN DEFAULT false,
  content_text TEXT,
  uploaded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create client_prospects table
CREATE TABLE IF NOT EXISTS public.client_prospects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_name TEXT NOT NULL,
  website TEXT,
  linkedin_company TEXT,
  kdm_name TEXT NOT NULL,
  kdm_role TEXT,
  kdm_email TEXT,
  kdm_linkedin TEXT,
  additional_info TEXT,
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create prospect_analysis table
CREATE TABLE IF NOT EXISTS public.prospect_analysis (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  prospect_id UUID REFERENCES public.client_prospects(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  analysis_results JSONB,
  tokens_used INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create system_settings table
CREATE TABLE IF NOT EXISTS public.system_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  setting_key TEXT UNIQUE NOT NULL,
  setting_value TEXT NOT NULL,
  setting_type TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default system settings
INSERT INTO public.system_settings (setting_key, setting_value, setting_type, description) VALUES
('default_user_tokens', '10000', 'number', 'Default token limit for new users'),
('default_user_words', '5000', 'number', 'Default word limit for new users'),
('max_tokens_per_request', '1000', 'number', 'Maximum tokens per API request'),
('daily_request_limit', '100', 'number', 'Daily request limit per user'),
('openai_api_key', '', 'secret', 'OpenAI API key for AI functionality'),
('anthropic_api_key', '', 'secret', 'Anthropic API key for AI functionality')
ON CONFLICT (setting_key) DO NOTHING;

-- Create storage bucket for documents
INSERT INTO storage.buckets (id, name, public) VALUES ('documents', 'documents', false)
ON CONFLICT (id) DO NOTHING;

-- Enable Row Level Security on all tables
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.preset_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_prospects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prospect_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- Create policies (basic admin access - adjust as needed)
CREATE POLICY "Admin full access" ON public.user_profiles FOR ALL USING (auth.jwt() ->> 'role' = 'Admin');
CREATE POLICY "Admin full access" ON public.conversations FOR ALL USING (auth.jwt() ->> 'role' = 'Admin');
CREATE POLICY "Admin full access" ON public.messages FOR ALL USING (auth.jwt() ->> 'role' = 'Admin');
CREATE POLICY "Admin full access" ON public.preset_questions FOR ALL USING (auth.jwt() ->> 'role' = 'Admin');
CREATE POLICY "Admin full access" ON public.documents FOR ALL USING (auth.jwt() ->> 'role' = 'Admin');
CREATE POLICY "Admin full access" ON public.client_prospects FOR ALL USING (auth.jwt() ->> 'role' = 'Admin');
CREATE POLICY "Admin full access" ON public.prospect_analysis FOR ALL USING (auth.jwt() ->> 'role' = 'Admin');
CREATE POLICY "Admin full access" ON public.system_settings FOR ALL USING (auth.jwt() ->> 'role' = 'Admin');

-- Create storage policies
CREATE POLICY "Admin storage access" ON storage.objects FOR ALL USING (bucket_id = 'documents' AND auth.jwt() ->> 'role' = 'Admin');
