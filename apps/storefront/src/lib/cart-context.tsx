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

let cartItems: CartItem[] = EMPTY_ITEMS;
const listeners = new Set<() => void>();

// Runs once, when this client module first loads in the browser. The
// server (and the first client render, for hydration) always sees an
// empty cart via getServerSnapshot below; useSyncExternalStore then
// reconciles to this real value right after — the standard, mismatch-safe
// way to hydrate client-only state, same pattern as the scroll/reduced-
// motion hooks elsewhere in this app.
if (typeof window !== "undefined") {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) cartItems = JSON.parse(raw);
  } catch {
    // Malformed/inaccessible storage — start with an empty cart.
  }
}

function persist(items: CartItem[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // Storage unavailable — cart just won't persist across reloads.
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
