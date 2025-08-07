import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Debug environment variables
console.log("Supabase Environment Check:");
console.log("VITE_SUPABASE_URL:", supabaseUrl ? "✓ Set" : "✗ Missing");
console.log("VITE_SUPABASE_ANON_KEY:", supabaseAnonKey ? "✓ Set" : "✗ Missing");

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing Supabase environment variables!");
  console.error("Expected: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY");
  throw new Error("Missing Supabase environment variables. Please check your environment configuration.");
}

// Validate URL format
try {
  new URL(supabaseUrl);
} catch (e) {
  console.error("Invalid Supabase URL format:", supabaseUrl);
  throw new Error("Invalid Supabase URL format");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  global: {
    fetch: (url, options = {}) => {
      return fetch(url, {
        ...options,
        // Add timeout to prevent hanging
        signal: AbortSignal.timeout(10000), // 10 second timeout
      }).catch(error => {
        console.error('Supabase fetch error:', error);
        // Just re-throw the original error to let the auth context handle it
        throw error;
      });
    },
  },
});

// Test connectivity and store status
export let isSupabaseConnected = true;

export const testSupabaseConnection = async (): Promise<boolean> => {
  try {
    const { data, error } = await supabase.from('user_profiles').select('count', { count: 'exact', head: true });
    isSupabaseConnected = !error;
    return !error;
  } catch (error) {
    console.warn('Supabase connection test failed:', error);
    isSupabaseConnected = false;
    return false;
  }
};

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
