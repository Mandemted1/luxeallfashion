// Shared by anything that needs to persist client-side state across brand
// subdomains (ogluxemen./chicstyle./kiddiespace.luxeallfashion.com) via a
// cookie instead of localStorage, which is locked to the exact origin it
// was written on and so doesn't carry over between subdomains. The domain
// attribute is only added when actually on that real domain — on
// localhost a cookie's Domain must match the current host or the browser
// silently refuses to set it at all.
export function cookieDomain(): string | undefined {
  return window.location.hostname.endsWith("luxeallfashion.com") ? "luxeallfashion.com" : undefined;
}

// "; Secure" only applies when actually on HTTPS — a Secure cookie set
// over plain http:// (local dev) is silently rejected by the browser
// rather than just ignoring the flag, so this can't be unconditional.
export function cookieSecureFlag(): string {
  return window.location.protocol === "https:" ? "; Secure" : "";
}
