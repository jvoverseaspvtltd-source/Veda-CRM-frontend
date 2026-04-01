import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || import.meta.env.SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.SUPABASE_KEY;

// Validate Supabase configuration
const isValidUrl = supabaseUrl && supabaseUrl !== 'your_supabase_url' && supabaseUrl.startsWith('http');
const isValidKey = supabaseAnonKey && supabaseAnonKey !== 'your_supabase_anon_key';

if (!isValidUrl || !isValidKey) {
    console.error(
        'CRITICAL: Supabase credentials are missing or invalid.\n' +
        'Please update VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your frontend/.env file.'
    );
}

export const supabase = (isValidUrl && isValidKey)
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;
