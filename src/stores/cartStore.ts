import { createWithEqualityFn } from 'zustand/traditional';
import { persist, createJSONStorage } from 'zustand/middleware';
import { shallow } from 'zustand/shallow';
import { OrderItem } from '../types/database.types';

interface CartStore {
  items: OrderItem[];
  addItem: (productId: string, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  total: () => number;
}

export const useCartStore = createWithEqualityFn<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (productId: string, quantity = 1) =>
        set((state) => {
          const existingItem = state.items.find(
            (item) => item.product_id === productId
          );

          if (existingItem) {
            return {
              items: state.items.map((item) =>
                item.product_id === productId
                  ? { ...item, quantity: item.quantity + quantity }
                  : item
              ),
            };
          }

          return {
            items: [
              ...state.items,
              {
                id: crypto.randomUUID(),
                order_id: '', // Will be set when order is created
                product_id: productId,
                quantity,
                price: 0, // Should be populated from product data
                created_at: new Date().toISOString(),
              },
            ],
          };
        }),
      removeItem: (productId: string) =>
        set((state) => ({
          items: state.items.filter((item) => item.product_id !== productId),
        })),
      updateQuantity: (productId: string, quantity: number) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.product_id === productId ? { ...item, quantity } : item
          ),
        })),
      clearCart: () => set({ items: [] }),
      total: () =>
        get().items.reduce(
          (acc, item) => acc + item.price * item.quantity,
          0
        ),
    }),
    {
      name: 'cart-store',
      storage: createJSONStorage(() => localStorage),
    }
  ),
  shallow
);


