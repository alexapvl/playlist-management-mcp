import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  // Get the origin of the request
  const origin = request.headers.get("origin") || "*";

  // Create a new response
  const response = NextResponse.next();

  // Set CORS headers
  response.headers.set("Access-Control-Allow-Origin", origin);
  response.headers.set(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  response.headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  );
  response.headers.set("Access-Control-Max-Age", "86400");

  // For OPTIONS requests (preflight), just return with CORS headers
  if (request.method === "OPTIONS") {
    return response;
  }

  // Simpler auth check - just verify token exists without using Prisma
  const token = request.cookies.get("auth_token")?.value;
  const userAuthenticated = !!token;

  console.log("Middleware path:", request.nextUrl.pathname);
  console.log("Middleware method:", request.method);
  console.log("User authenticated:", userAuthenticated ? "Yes" : "No");

  // Check for protected admin API routes
  if (request.nextUrl.pathname.startsWith("/api/admin")) {
    // For admin routes, we'll still need server-side verification
    // but we'll let the actual API route handler do the role check
    if (!userAuthenticated) {
      return NextResponse.json(
        { error: "Authentication required for admin access." },
        { status: 401 }
      );
    }
  }

  // Check for any non-GET API requests (create, update, delete operations)
  // These operations require authentication
  if (
    request.nextUrl.pathname.startsWith("/api/") &&
    request.method !== "GET" &&
    !request.nextUrl.pathname.startsWith("/api/auth")
  ) {
    console.log(
      "Protected API route detected, user authenticated:",
      userAuthenticated ? "Yes" : "No"
    );
    // If no user, return 401 unauthorized
    if (!userAuthenticated) {
      console.log("Authentication failed, returning 401");
      return NextResponse.json(
        { error: "Please login in order to perform any actions." },
        { status: 401 }
      );
    }
  }

  return response;
}

export const config = {
  matcher: ["/api/:path*", "/admin/:path*"],
};
