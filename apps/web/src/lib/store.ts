import { Store } from '@tanstack/store';
import { useStore } from '@tanstack/react-store';
import { type CartItem } from './types';

export const cartStore = new Store<{ items: CartItem[]; isOpen: boolean }>({
  items: [],
  isOpen: false,
});

export const addToCart = (item: Omit<CartItem, "cartItemId">) => {
  cartStore.setState((state) => {
    // Check if same product + size exists to group them
    const existingIndex = state.items.findIndex(
      (i) => i.productId === item.productId && i.size === item.size
    );

    if (existingIndex >= 0) {
      const newItems = [...state.items];
      newItems[existingIndex] = {
        ...newItems[existingIndex],
        quantity: newItems[existingIndex].quantity + item.quantity,
      };
      return { ...state, items: newItems, isOpen: true }; // open drawer on add
    }

    return {
      ...state,
      items: [
        ...state.items,
        { ...item, cartItemId: Math.random().toString(36).substring(7) },
      ],
      isOpen: true,
    };
  });
};

export const removeFromCart = (cartItemId: string) => {
  cartStore.setState((state) => ({
    ...state,
    items: state.items.filter((i) => i.cartItemId !== cartItemId),
  }));
};

export const updateQuantity = (cartItemId: string, quantity: number) => {
  cartStore.setState((state) => ({
    ...state,
    items: state.items.map((i) =>
      i.cartItemId === cartItemId ? { ...i, quantity } : i
    ),
  }));
};

export const toggleCart = (isOpen?: boolean) => {
  cartStore.setState((state) => ({
    ...state,
    isOpen: isOpen !== undefined ? isOpen : !state.isOpen,
  }));
};

export const clearCart = () => {
    cartStore.setState((state) => ({
        ...state,
        items: []
    }));
}

// Hook to use Cart in React
export const useCart = () => {
  return useStore(cartStore, (state) => state);
};
