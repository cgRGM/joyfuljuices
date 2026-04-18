export type ProductSize = "8oz" | "16oz" | "32oz";

export interface Product {
  id: string;
  name: string;
  type: "juice" | "hotdog" | "subscription";
  description: string;
  image: string;
  basePrice: number;
  availableSizes?: ProductSize[];
}

export interface CartItem {
  cartItemId: string; // Unique ID for the cart entry
  productId: string;
  name: string;
  type: "juice" | "hotdog" | "subscription" | "deal";
  size?: ProductSize;
  quantity: number;
  price: number;
  image?: string;
  subItems?: { name: string; quantity: number; image?: string }[];
}

export interface DiscountPolicy {
  name: string;
  description: string;
  calculateDiscount: (cart: CartItem[]) => number;
}

export const PRODUCTS: Product[] = [
  {
    id: "oj-1",
    name: "Sunshine Orange",
    type: "juice",
    description: "100% real Florida oranges, made to order, and sweetened exclusively with a touch of honey.",
    image: "🍊",
    basePrice: 3,
    availableSizes: ["8oz", "16oz", "32oz"],
  },
  {
    id: "pj-1",
    name: "Tropical Pineapple",
    type: "juice",
    description: "100% real pineapple bliss, made to order, and sweetened exclusively with a touch of honey.",
    image: "🍍",
    basePrice: 4,
    availableSizes: ["8oz", "16oz", "32oz"],
  },
  {
    id: "dl-1",
    name: "Double Trouble",
    type: "deal",
    description: "2 Juices (8oz) for just $5",
    image: "🍹",
    basePrice: 5,
  },
  {
    id: "dl-2",
    name: "The Classic Bundle",
    type: "deal",
    description: "2 Hotdogs + Any 8oz Juice for $8",
    image: "🌭",
    basePrice: 8,
  },
  {
    id: "lm-1",
    name: "Classic Lemonade",
    type: "juice",
    description: "100% real lemons, made to order, and sweetened exclusively with a touch of honey.",
    image: "🍋",
    basePrice: 3,
    availableSizes: ["8oz", "16oz", "32oz"],
  },
  {
    id: "sl-1",
    name: "Strawberry Lemonade",
    type: "juice",
    description: "100% real strawberries and lemons, made to order, and sweetened exclusively with honey.",
    image: "🍓",
    basePrice: 4,
    availableSizes: ["8oz", "16oz", "32oz"],
  },
  {
    id: "hd-1",
    name: "Classic Hotdog",
    type: "hotdog",
    description: "Premium all-beef hotdog bundled in a fresh bun with your choice of condiments.",
    image: "🌭",
    basePrice: 3,
  },
  {
    id: "sub-1",
    name: "Fresh Gallon Weekly",
    type: "subscription",
    description: "4 Gallons a month. Delivered fresh every single week. Mix and match your flavors!",
    image: "🚚",
    basePrice: 40,
  }
];

export type AdminOrder = {
  id: string;
  customer: string;
  address?: string;
  items: string;
  type: "pickup" | "delivery";
  status: "pending" | "preparing" | "ready" | "out_for_delivery" | "delivered";
  total: number;
  date: string;
};

export const DUMMY_ORDERS: AdminOrder[] = [
  { id: "ORD-001", customer: "Alice D.", items: "2x Sunshine Orange", type: "pickup", status: "pending", total: 10.00, date: "10:42 AM" },
  { id: "ORD-002", customer: "Bob M.", items: "1x Hotdog, 1x Lemonade", type: "pickup", status: "preparing", total: 6.00, date: "10:45 AM" },
  { id: "ORD-003", customer: "Charlie S.", address: "123 Citrus Ave", items: "4x Strawberry Lemonade", type: "delivery", status: "ready", total: 21.00, date: "10:50 AM" },
  { id: "ORD-004", customer: "Diana R.", address: "404 Main St", items: "1x Fresh Gallon Weekly", type: "delivery", status: "out_for_delivery", total: 40.00, date: "09:00 AM" },
];

let SERVER_ORDERS = [...DUMMY_ORDERS];
export const getOrders = async () => SERVER_ORDERS;
export const updateOrderStatus = async (id: string, status: AdminOrder['status']) => {
  SERVER_ORDERS = SERVER_ORDERS.map(o => o.id === id ? { ...o, status } : o);
  return SERVER_ORDERS;
};
export const resetDb = async () => {
    SERVER_ORDERS = [...DUMMY_ORDERS];
};

// Mock database interactions
export const getProducts = async (): Promise<Product[]> => {
  return PRODUCTS;
};

// Pricing Utility
export const calculateBasePrice = (basePrice: number, size?: ProductSize) => {
  if (size === "16oz") return basePrice + 2;
  if (size === "32oz") return basePrice + 4;
  return basePrice;
};
