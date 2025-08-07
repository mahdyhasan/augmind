import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types for TypeScript
export interface UserProfile {
  id: string;
  username: string;
  full_name: string;
  role: "Admin" | "Business Dev User";
  token_limit: number;
  word_limit: number;
  tokens_used: number;
  words_used: number;
  daily_requests: number;
  last_request_date: string;
  status: "Active" | "Inactive";
  created_at: string;
  updated_at: string;
}

export interface PresetQuestion {
  id: string;
  title: string;
  prompt: string;
  category: string;
  description?: string;
  is_active: boolean;
  usage_count: number;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface Document {
  id: string;
  filename: string;
  original_filename: string;
  file_size: number;
  file_type: string;
  category: string;
  description?: string;
  storage_path: string;
  storage_bucket: string;
  content_processed: boolean;
  content_text?: string;
  uploaded_by: string;
  created_at: string;
  updated_at: string;
}

export interface Conversation {
  id: string;
  title?: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender: "user" | "ai";
  content: string;
  tokens_used: number;
  words_count: number;
  preset_question_id?: string;
  created_at: string;
}

export interface ClientProspect {
  id: string;
  company_name: string;
  website?: string;
  linkedin_company?: string;
  kdm_name: string;
  kdm_role?: string;
  kdm_email?: string;
  kdm_linkedin?: string;
  additional_info?: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface ProspectAnalysis {
  id: string;
  prospect_id: string;
  question: string;
  analysis_results: any;
  tokens_used: number;
  created_at: string;
}
