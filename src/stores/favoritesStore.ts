import { createWithEqualityFn } from 'zustand/traditional';
import { persist, createJSONStorage } from 'zustand/middleware';
import { shallow } from 'zustand/shallow';
import { supabase } from '../lib/supabaseClient';

interface FavoriteData {
  product_id: string;
}

interface FavoritesStore {
  favorites: string[];
  toggleFavorite: (productId: string) => void;
  loadFavorites: () => Promise<void>;
}

export const useFavoritesStore = createWithEqualityFn<FavoritesStore>()(
  persist(
    (set) => ({
      favorites: [],
      toggleFavorite: async (productId: string) => {
        // Immediate local state update
        set((state) => {
          const isFav = state.favorites.includes(productId);
          return {
            favorites: isFav
              ? state.favorites.filter((id) => id !== productId)
              : [...state.favorites, productId],
          };
        });

        // Sync with server for authenticated users
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data } = await supabase
            .from('favorites')
            .select('*')
            .eq('user_id', user.id)
            .eq('product_id', productId)
            .single();

          if (data) {
            await supabase
              .from('favorites')
              .delete()
              .eq('user_id', user.id)
              .eq('product_id', productId);
          } else {
            await supabase
              .from('favorites')
              .insert([{ user_id: user.id, product_id: productId }]);
          }
        }
      },
      loadFavorites: async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data, error } = await supabase
            .from('favorites')
            .select('product_id')
            .eq('user_id', user.id);

          if (!error && data) {
            const favoritesIds = (data as FavoriteData[]).map(
              (item) => item.product_id
            );
            set({ favorites: favoritesIds });
          }
        }
      },
    }),
    {
      name: 'favorites-store',
      storage: createJSONStorage(() => localStorage),
    }
  ),
  shallow
);