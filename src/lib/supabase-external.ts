import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://ewiqwpsxahxigcbdwdid.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV3aXF3cHN4YWh4aWdjYmR3ZGlkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMwNjkxNTIsImV4cCI6MjA3ODY0NTE1Mn0.ic3xHsL7LSkLO9PgufDo1sgzZMEPj-lGgTG6tr_d0Y0";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});
