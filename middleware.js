// import { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { auth0 } from "./lib/auth0";

export async function middleware(request) {
  // Add CORS headers to all responses
  const response =
    request.method === "OPTIONS"
      ? new NextResponse(null, { status: 200 })
      : await handleRequest(request);

  // Add CORS headers
  response.headers.set("Access-Control-Allow-Credentials", "true");
  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set(
    "Access-Control-Allow-Methods",
    "GET,OPTIONS,PATCH,DELETE,POST,PUT"
  );
  response.headers.set(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization"
  );

  return response;
}

async function handleRequest(request) {
  // Public paths that don't require authentication
  if (
    request.nextUrl.pathname === "/" ||
    request.nextUrl.pathname.startsWith("/api/auth/") ||
    request.nextUrl.pathname.startsWith("/_next/")
  ) {
    return auth0.middleware(request);
  }

  const session = await auth0.getSession();
  if (!session) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return auth0.middleware(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};

//   // Skip authentication check for root path and auth-related paths
//   if (
//     request.nextUrl.pathname === "/" ||
//     request.nextUrl.pathname.startsWith("/api/auth/") ||
//     request.nextUrl.pathname.startsWith("/_next/")
//   ) {
//     return auth0.middleware(request);
//   }

//   const session = await auth0.getSession();
//   if (!session) {
//     return NextResponse.redirect(new URL("/", request.url));
//   }

//   return auth0.middleware(request);
// }

// export const config = {
//   matcher: [
//     /*
//      * Match all request paths except for the ones starting with:
//      * - _next/static (static files)
//      * - _next/image (image optimization files)
//      * - favicon.ico, sitemap.xml, robots.txt (metadata files)
//      */
//     "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
//   ],
// };
