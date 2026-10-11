import { createClient } from '@supabase/supabase-js';

const fallbackUrl = 'https://vimusrczrjvefsbljtmf.supabase.co';
const fallbackAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZpbXVzcmN6cmp2ZWZzYmxqdG1mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE5ODg1MDksImV4cCI6MjA5NzU2NDUwOX0.2fSiWqfYKs3fadwRkS9Nvdq9b9JqnsmtMTHg-wN5m6k';

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL || fallbackUrl,
  import.meta.env.VITE_SUPABASE_ANON_KEY || fallbackAnonKey,
  {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, flowType: 'pkce' },
    realtime: { params: { eventsPerSecond: 10 } },
  },
);

export const supabaseProjectUrl = import.meta.env.VITE_SUPABASE_URL || fallbackUrl;
