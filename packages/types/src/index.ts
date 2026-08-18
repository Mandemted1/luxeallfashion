// Cross-app types that aren't 1:1 with a database model
// (DB-shaped types should come from @luxe/database's generated Prisma client instead).

export interface CartLineItem {
  variantId: string;
  productId: string;
  productName: string;
  productSlug: string;
  size: string;
  colorName: string;
  colorHex: string;
  unitPriceGhs: number;
  quantity: number;
  image: string;
}

export interface Cart {
  items: CartLineItem[];
}

export interface CheckoutPayload {
  cart: CartLineItem[];
  customer: {
    name: string;
    email?: string;
    phone: string;
    marketingOptIn: boolean;
  };
  deliveryRegionSlug: string;
  deliveryAddress: string;
}
