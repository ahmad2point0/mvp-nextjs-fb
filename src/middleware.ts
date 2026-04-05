import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const publicPaths = ["/", "/about", "/contact", "/login", "/register", "/forgot-password", "/update-password"];

// Legacy dashboard sub-routes → tab query param redirects
const legacyRedirects: Record<string, string> = {
  "/dashboard/donations": "/dashboard?tab=donations",
  "/dashboard/aid-requests": "/dashboard?tab=aid-requests",
  "/dashboard/volunteer-tasks": "/dashboard?tab=tasks",
  "/dashboard/notifications": "/dashboard?tab=notifications",
  "/dashboard/reports": "/dashboard?tab=reports",
  "/dashboard/join-volunteer": "/dashboard?tab=apply",
  "/dashboard/admin": "/dashboard?tab=users",
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Redirect legacy dashboard sub-routes to tab-based URLs
  if (legacyRedirects[pathname]) {
    const url = request.nextUrl.clone();
    const [path, query] = legacyRedirects[pathname].split("?");
    url.pathname = path;
    if (query) {
      const [key, value] = query.split("=");
      url.searchParams.set(key, value);
    }
    return NextResponse.redirect(url);
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Redirect authenticated users from landing page to dashboard
  if (user && pathname === "/") {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  // Allow public paths
  if (publicPaths.some((p) => pathname === p)) {
    return supabaseResponse;
  }

  // Allow API routes and static files
  if (pathname.startsWith("/api") || pathname.startsWith("/_next")) {
    return supabaseResponse;
  }

  // Redirect unauthenticated users to login
  if (!user && pathname.startsWith("/dashboard")) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  // Redirect authenticated users away from auth pages
  if (user && (pathname === "/login" || pathname === "/register")) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
