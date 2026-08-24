import { NextResponse, type NextRequest } from "next/server";

const ROOT_DOMAIN = "luxeallfashion.com";

// Subdomain -> the brand catalog page it should show at its root ("/").
const BRAND_SUBDOMAINS: Record<string, string> = {
  ogluxemen: "/og-luxemen",
  chicstyle: "/chicstyle",
  kiddiespace: "/kiddies-space-gh",
};

// The reverse mapping, for redirecting the old path-based URLs once the
// brand subdomains exist — luxeallfashion.com/og-luxemen now belongs at
// ogluxemen.luxeallfashion.com instead.
const BRAND_PATHS: Record<string, string> = {
  "/og-luxemen": "ogluxemen",
  "/chicstyle": "chicstyle",
  "/kiddies-space-gh": "kiddiespace",
};

export function middleware(request: NextRequest) {
  const hostname = request.headers.get("host") || "";
  const { pathname } = request.nextUrl;

  const subdomain = hostname.endsWith(`.${ROOT_DOMAIN}`)
    ? hostname.slice(0, -(ROOT_DOMAIN.length + 1))
    : null;

  if (subdomain && subdomain in BRAND_SUBDOMAINS && pathname === "/") {
    const url = request.nextUrl.clone();
    url.pathname = BRAND_SUBDOMAINS[subdomain];
    return NextResponse.rewrite(url);
  }

  const isApex = hostname === ROOT_DOMAIN || hostname === `www.${ROOT_DOMAIN}`;
  if (isApex && pathname in BRAND_PATHS) {
    const url = request.nextUrl.clone();
    url.hostname = `${BRAND_PATHS[pathname]}.${ROOT_DOMAIN}`;
    url.pathname = "/";
    return NextResponse.redirect(url, 308);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|api|.*\\..*).*)"],
};
