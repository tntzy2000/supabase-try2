import { createClient } from '@supabase/supabase-js';

// These environment variables should be set in your Supabase project's Edge Function settings
// For local development, Supabase CLI injects them based on your local config.
const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

if (!supabaseUrl) {
  console.error('Missing SUPABASE_URL environment variable');
}

if (!supabaseServiceKey) {
  console.error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable');
}

// Create a single supabase client for interacting with your database
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    // It's important to set autoRefreshToken to false for server-side operations
    // to prevent the client from trying to refresh a token that doesn't exist.
    autoRefreshToken: false,
    persistSession: false,
    // detectSessionInUrl: false, // Not typically needed for server-side
  }
});

// Helper to get user from JWT
import { decode } from 'https://deno.land/x/djwt@v2.9.1/mod.ts';

export async function getUserFromRequest(req: Request) {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = decode(token);
    if (!decoded || !decoded[1] || !(decoded[1] as any).sub) { // Check for payload and sub claim
      console.error('Invalid JWT payload');
      return null;
    }
    return { id: (decoded[1] as any).sub, token }; // sub is the user ID
  } catch (error) {
    console.error('Error decoding JWT:', error);
    return null;
  }
}
