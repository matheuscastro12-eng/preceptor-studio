import { createBrowserClient } from "@supabase/ssr";

const ONE_YEAR = 60 * 60 * 24 * 365;

export function getBrowserSupabase() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookieOptions: {
        maxAge: ONE_YEAR,
        sameSite: "lax",
        path: "/",
        secure: typeof window !== "undefined" && window.location.protocol === "https:",
      },
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    }
  );
}
