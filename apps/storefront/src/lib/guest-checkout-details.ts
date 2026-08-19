const STORAGE_KEY = "luxe-guest-checkout-details";

export interface GuestCheckoutDetails {
  fullName: string;
  email: string;
  phone: string;
  deliveryRegionId: string;
  address: string;
}

// Only used for guests (no account) — logged-in customers get the same
// convenience server-side, from their Customer/CustomerAddress record.
// localStorage can throw in private browsing or when storage is full;
// neither is worth failing checkout over, so both directions are silent.
export function saveGuestCheckoutDetails(details: GuestCheckoutDetails): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(details));
  } catch {
    // Ignore.
  }
}

export function loadGuestCheckoutDetails(): GuestCheckoutDetails | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as GuestCheckoutDetails) : null;
  } catch {
    return null;
  }
}
