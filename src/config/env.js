function readEnv(name, fallback = "") {
  return String(process.env[name] ?? fallback).trim();
}

export const SUPABASE_URL = readEnv("REACT_APP_SUPABASE_URL");
export const SUPABASE_ANON_KEY = readEnv("REACT_APP_SUPABASE_ANON_KEY");
export const SUPABASE_PROJECT_REF = readEnv("REACT_APP_SUPABASE_PROJECT_REF");
export const SUPABASE_AUTH_REDIRECT_URL = readEnv(
  "REACT_APP_SUPABASE_AUTH_REDIRECT_URL"
);
export const AUTH_PROVIDER = readEnv("REACT_APP_AUTH_PROVIDER", "local");

export function isSupabaseConfigured() {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
}

export function getConfiguredAuthProviderLabel() {
  if (AUTH_PROVIDER === "supabase" && isSupabaseConfigured()) {
    return "Supabase";
  }

  return "Local";
}
