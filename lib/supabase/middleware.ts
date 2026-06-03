import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const ONE_YEAR = 60 * 60 * 24 * 365;

function withDefaults(options: CookieOptions): CookieOptions {
  return {
    sameSite: "lax",
    path: "/",
    ...options,
    maxAge: options.maxAge ?? ONE_YEAR,
  };
}

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request: { headers: request.headers } });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          const merged = withDefaults(options);
          request.cookies.set({ name, value, ...merged });
          response = NextResponse.next({ request: { headers: request.headers } });
          response.cookies.set({ name, value, ...merged });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: "", ...options });
          response = NextResponse.next({ request: { headers: request.headers } });
          response.cookies.set({ name, value: "", ...options });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { response, user };
}
