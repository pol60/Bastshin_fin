import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Trash2 } from 'lucide-react';
import ReactCountryFlag from 'react-country-flag';
import { motion } from 'framer-motion';
import { useCartStore } from '../../../stores/cartStore';
import { Product } from '../../../types/database.types';
import { supabase } from '../../../lib/supabaseClient';

interface CartProps {
  onClose: () => void;
  isClosing: boolean;
}

export const Cart: React.FC<CartProps> = ({ onClose, isClosing }) => {
  const { items, removeItem, updateQuantity } = useCartStore();
  // Фиксируем, была ли корзина изначально пустой
  const initialEmpty = useRef(items.length === 0);
  // Сохраняем последний набор товаров для визуализации при удалении последнего элемента
  const [preservedItems, setPreservedItems] = useState(items);
  const [products, setProducts] = useState<Record<string, Product>>({});
  const [loading, setLoading] = useState(true);

  // Если корзина не пуста, обновляем сохранённые товары
  useEffect(() => {
    if (items.length > 0) {
      setPreservedItems(items);
    }
  }, [items]);

  // Функция форматирования сезона на русском
  const formatSeason = (season: string) => {
    switch (season.toLowerCase()) {
      case 'winter': return 'Зимние';
      case 'summer': return 'Летние';
      case 'all-season': return 'Всесезонные';
      default: return season;
    }
  };

  // Форматирование цены
  const formatPrice = (value: number) =>
    value.toLocaleString('uk-UA', {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    }) + ' ₴';

  useEffect(() => {
    const fetchProducts = async () => {
      // Используем для запроса товары из актуального состояния или из сохранённого
      const relevantItems = items.length > 0 ? items : preservedItems;
      if (relevantItems.length === 0) {
        setLoading(false);
        return;
      }
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .in('id', relevantItems.map(item => item.product_id));

      if (error) {
        console.error('Error fetching products:', error);
      } else if (data) {
        const productsMap = (data as Product[]).reduce((acc, product) => {
          acc[product.id] = product;
          return acc;
        }, {} as Record<string, Product>);
        setProducts(productsMap);
      }
      setLoading(false);
    };

    fetchProducts();
  }, [items, preservedItems]);

  // Если корзина изначально пуста, показываем статичное сообщение
  if (items.length === 0 && initialEmpty.current) {
    return (
      <div className="p-4">
        <div className="text-center">
          <h1 className="text-xl font-bold mb-2">Кошик порожній</h1>
          <p className="text-gray-600 mb-4">Додайте товари для оформлення замовлення</p>
        </div>
      </div>
    );
  }

  // Если товаров нет в items, используем сохранённые для отображения (анимация затухания)
  const displayedItems = items.length > 0 ? items : preservedItems;

  // Расчёт общей суммы для отображаемых товаров
  const calculateTotal = () => {
    return displayedItems.reduce((total, item) => {
      const product = products[item.product_id];
      if (!product) return total;
      const price =
        product.sale_price && product.sale_price < product.price
          ? product.sale_price
          : product.price;
      return total + price * item.quantity;
    }, 0);
  };

  // Обработчик удаления товара. Если это последний товар – инициируем одновременное закрытие.
  const handleRemoveItem = (productId: string) => {
    const isLastItem = displayedItems.length === 1;
    removeItem(productId);
    if (isLastItem) {
      // Запуск закрытия окна сразу после удаления
      onClose();
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
    <div className="p-4 overflow-y-auto max-h-full">
      {renderCartContent(displayedItems)}
    </div>
  );

  // Функция для отрисовки содержимого корзины (список товаров, итог и ссылки)
  function renderCartContent(cartItems: typeof items) {
    return (
      <>
        <h1 className="text-xl font-bold mb-4">Кошик</h1>
        <div className="space-y-4">
          {cartItems.map((item) => {
            const product = products[item.product_id];
            if (!product) return null;
            const imageUrl =
              product.image_url && product.image_url[0]
                ? product.image_url[0]
                : 'https://via.placeholder.com/56';
            const countryCode = product.country
              ? product.country.slice(0, 2).toUpperCase()
              : 'UA';

            return (
              <motion.div
                key={item.product_id}
                className="bg-white rounded-lg shadow p-3 flex items-center gap-3 relative"
                initial={{ opacity: 1, y: 0 }}
                animate={{ opacity: isClosing ? 0 : 1, y: isClosing ? 10 : 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.5 }}
              >
                <Link to={`/product/${product.id}`} onClick={onClose} className="block">
                  <img
                    src={imageUrl}
                    alt={`${product.brand} ${product.model}`}
                    className="w-14 h-14 object-contain"
                  />
                </Link>

                <div className="flex-1">
                  <div className="relative">
                    <Link
                      to={`/product/${product.id}`}
                      onClick={onClose}
                      className="font-medium text-black hover:text-blue-800 text-sm line-clamp-1"
                    >
                      {product.brand} {product.model}
                    </Link>
                    <span className="absolute top-0 right-[-8rem] text-xs text-gray-500 font-bold whitespace-nowrap">
                      арт: {product.id.slice(0, 8).toUpperCase()}
                    </span>
                  </div>

                  <div className="text-xs text-gray-600 mt-1">
                    Размер: {product.width}/{product.profile} R{product.diameter}
                  </div>

                  <div className="text-xs text-gray-600">
                    Сезон: {formatSeason(product.season ?? 'all-season')}
                  </div>

                  <div className="flex items-center gap-1 text-xs text-gray-600">
                    <div className="aspect-square rounded-full overflow-hidden border w-3 h-3 relative">
                      <ReactCountryFlag
                        countryCode={countryCode}
                        svg
                        className="absolute top-1/2 left-1/2 w-[135%] h-[135%] -translate-x-1/2 -translate-y-1/2 object-cover"
                        title={product.country || 'UA'}
                        aria-label={product.country || 'UA'}
                      />
                    </div>
                    <span>{product.year} рік</span>
                  </div>

                  <div className="mt-2">
                    {product.sale_price && product.sale_price < product.price ? (
                      <>
                        <span className="text-sm font-bold text-red-500">
                          {formatPrice(product.sale_price)}
                        </span>
                        <span className="text-xs text-gray-400 line-through ml-2">
                          {formatPrice(product.price)}
                        </span>
                      </>
                    ) : (
                      <span className="text-sm font-bold">
                        {formatPrice(product.price)}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center border border-gray-300 rounded">
                    <button
                      onClick={() => handleRemoveItem(item.product_id)}
                      className="px-2 py-1 text-gray-600 hover:bg-gray-100"
                      disabled={isClosing}
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) =>
                        updateQuantity(
                          item.product_id,
                          Math.max(1, parseInt(e.target.value) || 1)
                        )
                      }
                      className="w-12 text-center border-x border-gray-300 py-1 text-xs"
                      disabled={isClosing}
                    />
                    <button
                      onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                      className="px-2 py-1 text-gray-600 hover:bg-gray-100"
                      disabled={isClosing}
                    >
                      +
                    </button>
                  </div>

                  <button
                    onClick={() => handleRemoveItem(item.product_id)}
                    className="text-gray-500 hover:text-red-500"
                    disabled={isClosing}
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>

        <motion.div 
          className="mt-4 border-t pt-4"
          initial={{ opacity: 1 }}
          animate={{ opacity: isClosing ? 0 : 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex justify-between text-sm font-bold">
            <span>Товари ({displayedItems.length})</span>
            <span>{formatPrice(calculateTotal())}</span>
          </div>
          <Link
            to="/checkout"
            onClick={onClose}
            className="block mt-4 bg-green-600 text-white text-center px-4 py-2 rounded-md hover:bg-green-700 text-sm"
          >
            Оформити замовлення
          </Link>
        </motion.div>
      </>
    );
  }
};

export default Cart;
