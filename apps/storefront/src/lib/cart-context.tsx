"use client";

import {
  createContext,
  useContext,
  useSyncExternalStore,
  type ReactNode,
} from "react";

export interface CartItem {
  id: string; // `${slug}-${size}-${colorName ?? "none"}`, so same variant merges quantity
  slug: string;
  name: string;
  priceGhs: number;
  imageSrc: string;
  size: string;
  colorName?: string;
  quantity: number;
}

const STORAGE_KEY = "luxe-cart";
const EMPTY_ITEMS: CartItem[] = [];
const MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 days

// A cookie (not localStorage) so the cart survives moving between brand
// subdomains — localStorage is locked to the exact origin it was written
// on, so a bag started on chicstyle.luxeallfashion.com would look empty on
// ogluxemen.luxeallfashion.com. The domain attribute is only added when
// actually on that real domain; on localhost a cookie's Domain must match
// the current host or the browser silently refuses to set it at all.
function cookieDomain(): string | undefined {
  return window.location.hostname.endsWith("luxeallfashion.com") ? "luxeallfashion.com" : undefined;
}

function readCookie(): CartItem[] {
  const match = document.cookie.match(new RegExp(`(?:^|; )${STORAGE_KEY}=([^;]*)`));
  if (!match) return [];
  try {
    return JSON.parse(decodeURIComponent(match[1]));
  } catch {
    return [];
  }
}

function writeCookie(items: CartItem[]) {
  const domain = cookieDomain();
  const value = encodeURIComponent(JSON.stringify(items));
  document.cookie = `${STORAGE_KEY}=${value}; path=/; max-age=${MAX_AGE_SECONDS}; samesite=lax${
    domain ? `; domain=${domain}` : ""
  }`;
}

let cartItems: CartItem[] = EMPTY_ITEMS;
const listeners = new Set<() => void>();

// Runs once, when this client module first loads in the browser. The
// server (and the first client render, for hydration) always sees an
// empty cart via getServerSnapshot below; useSyncExternalStore then
// reconciles to this real value right after — the standard, mismatch-safe
// way to hydrate client-only state, same pattern as the scroll/reduced-
// motion hooks elsewhere in this app.
if (typeof window !== "undefined") {
  cartItems = readCookie();
}

function persist(items: CartItem[]) {
  try {
    writeCookie(items);
  } catch {
    // Cookie write unavailable — cart just won't persist across reloads.
  }
}

function setCartItems(updater: (current: CartItem[]) => CartItem[]) {
  cartItems = updater(cartItems);
  persist(cartItems);
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return cartItems;
}

function getServerSnapshot() {
  return EMPTY_ITEMS;
}

function addItem(item: Omit<CartItem, "quantity">, quantity = 1) {
  setCartItems((current) => {
    const existing = current.find((i) => i.id === item.id);
    if (existing) {
      return current.map((i) =>
        i.id === item.id ? { ...i, quantity: i.quantity + quantity } : i,
      );
    }
    return [...current, { ...item, quantity }];
  });
}

function removeItem(id: string) {
  setCartItems((current) => current.filter((i) => i.id !== id));
}

function setQuantity(id: string, quantity: number) {
  setCartItems((current) =>
    quantity <= 0
      ? current.filter((i) => i.id !== id)
      : current.map((i) => (i.id === id ? { ...i, quantity } : i)),
  );
}

function clearCart() {
  setCartItems(() => EMPTY_ITEMS);
}

interface CartContextValue {
  items: CartItem[];
  itemCount: number;
  subtotalGhs: number;
  addItem: typeof addItem;
  removeItem: typeof removeItem;
  setQuantity: typeof setQuantity;
  clearCart: typeof clearCart;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const items = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotalGhs = items.reduce(
    (sum, i) => sum + i.priceGhs * i.quantity,
    0,
  );

  return (
    <CartContext.Provider
      value={{ items, itemCount, subtotalGhs, addItem, removeItem, setQuantity, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}
