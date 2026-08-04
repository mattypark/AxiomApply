/**
 * Supabase env presence check. The app must build and browse fine with no
 * Supabase project configured — auth/account surfaces degrade gracefully.
 * Values are set by Matthew in .env.local / Vercel (see SETUP.md).
 */
export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
export const hasSupabaseEnv = supabaseUrl.length > 0 && supabaseAnonKey.length > 0;
