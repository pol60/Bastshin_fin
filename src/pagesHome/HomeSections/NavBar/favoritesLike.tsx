import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { useFavoritesStore } from "../../../stores/favoritesStore";
import { useCartStore } from "../../../stores/cartStore";
import { supabase } from "../../../lib/supabaseClient";
import ReactCountryFlag from "react-country-flag";
import { ShoppingCart, Trash2, XCircle } from "lucide-react";
import { motion } from "framer-motion";

interface FavoriteProduct {
  id: string;
  brand: string;
  model: string;
  width: number;
  profile: number;
  diameter: number;
  season: string;
  price: number;
  sale_price?: number | null;
  image_url?: string[];
  year: number;
  country: string;
}

const FavoritesLike: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ onClose }) => {
  const { favorites, toggleFavorite } = useFavoritesStore();
  const { items, addItem, removeItem } = useCartStore();
  const [favoriteProducts, setFavoriteProducts] = useState<FavoriteProduct[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFavoriteProducts = useCallback(async () => {
    if (!favorites.length) {
      setLoading(false);
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from("products")
        .select("id, brand, model, width, profile, diameter, season, price, sale_price, image_url, year, country")
        .in("id", favorites);
      
      if (error) throw error;
      setFavoriteProducts(data as FavoriteProduct[]);
    } catch (error) {
      console.error("Error fetching favorites:", error);
    } finally {
      setLoading(false);
    }
  }, [favorites]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (favorites.length === 0) onClose();
    }, 300);
    return () => clearTimeout(timer);
  }, [favorites, onClose]);

  useEffect(() => {
    const loadData = async () => {
      await fetchFavoriteProducts();
    };
    
    const timer = setTimeout(loadData, 200);
    return () => clearTimeout(timer);
  }, [fetchFavoriteProducts]);

  const formatPrice = (value: number) =>
    value.toLocaleString("uk-UA", {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    }) + " ₴";

  const formatSeason = (season: string) => {
    switch (season.toLowerCase()) {
      case "winter":
        return "Зимние";
      case "summer":
        return "Летние";
      case "all-season":
        return "Всесезонные";
      default:
        return season;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-800"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="p-4 border-b">
        <h3 className="text-lg font-semibold text-center">Обране</h3>
      </div>
      
      {favoriteProducts.length === 0 ? (
        <div className="p-4 text-center">Избранное пустое</div>
      ) : (
        <div className="p-4 pr-2 overflow-y-auto" style={{ maxHeight: "calc(90vh - 4rem)" }}>
          <div className="space-y-2">
            {favoriteProducts.map((product) => {
              const isInCart = items.some((item) => item.product_id === product.id);
              return (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="bg-white rounded-lg p-2 grid grid-cols-[60px_1fr] gap-3 items-center shadow-sm mb-2"
                >
                  <Link to={`/product/${product.id}`} onClick={onClose}>
                    <div className="border rounded-md p-1 h-14 w-14 flex items-center justify-center bg-gray-50">
                      {product.image_url?.[0] ? (
                        <img
                          src={product.image_url[0]}
                          alt={`${product.brand} ${product.model}`}
                          className="object-contain h-full w-full"
                        />
                      ) : (
                        <div className="text-gray-400 text-xs text-center">Нет фото</div>
                      )}
                    </div>
                  </Link>

                  <div className="flex flex-col space-y-0">
                    <div className="flex justify-between items-start">
                      <Link
                        to={`/product/${product.id}`}
                        className="font-medium text-black hover:text-blue-800 text-sm line-clamp-1"
                        onClick={onClose}
                      >
                        {product.brand} {product.model}
                      </Link>
                      <span className="text-xs text-gray-500 font-bold">
                        арт: {product.id.slice(0, 8).toUpperCase()}
                      </span>
                    </div>
                    
                    <div className="text-xs text-gray-600">
                      Размер: {product.width}/{product.profile} R{product.diameter}
                    </div>
                    
                    <div className="text-xs text-gray-600">
                      Сезон: {formatSeason(product.season)}
                    </div>

                    <div className="flex items-center justify-between mt-1">
                      <div className="font-bold text-sm">
                        {product.sale_price && product.sale_price < product.price ? (
                          <>
                            <span className="text-red-600">
                              {formatPrice(product.sale_price)}
                            </span>
                            <span className="line-through text-gray-400 text-xs ml-2">
                              {formatPrice(product.price)}
                            </span>
                          </>
                        ) : (
                          <span className="text-green-600">
                            {formatPrice(product.price)}
                          </span>
                        )}
                      </div>

                      <div className="flex gap-1">
                        <button
                          onClick={() => {
                            if (isInCart) {
                              removeItem(product.id);
                            } else {
                              addItem(product.id);
                            }
                          }}
                          className={`p-1.5 rounded-md flex items-center justify-center ${
                            isInCart ? "bg-blue-500 hover:bg-blue-600" : "bg-green-500 hover:bg-green-600"
                          }`}
                        >
                          {isInCart ? (
                            <Trash2 className="w-3.5 h-3.5 text-white" />
                          ) : (
                            <ShoppingCart className="w-3.5 h-3.5 text-white" />
                          )}
                        </button>

                        <button
                          onClick={() => toggleFavorite(product.id)}
                          className="p-1.5 bg-red-500 hover:bg-red-600 rounded-md"
                        >
                          <XCircle className="w-3.5 h-3.5 text-white" />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 text-xs text-gray-600">
                      <div className="aspect-square rounded-full overflow-hidden border w-3 h-3 relative">
                        <ReactCountryFlag
                          countryCode={product.country?.slice(0, 2).toUpperCase() || "UA"}
                          svg
                          className="absolute top-1/2 left-1/2 w-[135%] h-[135%] -translate-x-1/2 -translate-y-1/2 object-cover"
                          title={product.country || "UA"}
                          aria-label={product.country || "UA"}
                        />
                      </div>
                      <span>{product.year} рік</span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default FavoritesLike;
