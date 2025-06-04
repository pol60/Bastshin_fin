import { memo, FC, useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { Star } from 'lucide-react';
import CustomCarIcon from '../components/icons/CustomCarIcon';
import SnowflakeIcon from '../components/icons/SnowflakeIcon';
import SunIcon from '../components/icons/SunIcon';
import SnowSunIcon from '../components/icons/SnowSunIcon';
import ReactCountryFlag from 'react-country-flag';
import { Product } from '../types/database.types';
import { useCartStore } from '../stores/cartStore';
import { supabase } from '../lib/supabaseClient';
import { useTouchHandlers, useIsMobile } from '../hooks/useIsMobile';
import { User } from '@supabase/supabase-js';

interface Review {
  id: string;
  product_id: string;
  comment: string;
  created_at: string;
  user_id: string;
  rating: number;
}

// Компонент для загрузки изображения с эффектом fadeIn
const FadeInImage: FC<{ src: string; alt: string }> = ({ src, alt }) => {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <img
      src={src}
      alt={alt}
      onLoad={() => setIsLoaded(true)}
      className={`w-full h-full object-contain ${isLoaded ? 'fadeIn' : 'opacity-0'}`}
      loading="eager"
      decoding="async"
    />
  );
};

const ThumbnailButton = memo(({ img, active, onClick }: { img: string; active: boolean; onClick: () => void; }) => (
  <button
    onClick={onClick}
    className={`border rounded-lg overflow-hidden transition-all duration-300 ${active ? 'ring-2 ring-blue-500' : ''}`}
  >
    <img
      src={img}
      alt="Превью товара"
      className="w-full h-8 object-contain"
      loading="lazy"
      width={40}
      height={40}
    />
  </button>
));

const DotsIndicator: FC<{ count: number; activeIndex: number; onChange: (index: number) => void; }> = ({ count, activeIndex, onChange }) => (
  <div className="flex justify-center gap-2 mt-4">
    {Array.from({ length: count }).map((_, index) => (
      <button
        key={index}
        onClick={() => onChange(index)}
        className={`w-2 h-2 rounded-full transition-all duration-300 ${index === activeIndex ? 'bg-blue-500 scale-125' : 'bg-gray-300 hover:bg-gray-400'}`}
      />
    ))}
  </div>
);

const RatingStars: FC<{ rating: number; starSizeClass?: string; }> = ({ rating, starSizeClass = 'w-5 h-5' }) => (
  <div className="flex items-center">
    {Array.from({ length: 5 }, (_, i) => (
      <Star key={i} className={`${starSizeClass} ${i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
    ))}
  </div>
);

const hasValueForDisplay = (val: string | number | undefined): boolean => {
  if (val === undefined || val === null) return false;
  if (typeof val === 'string') return val.trim() !== '';
  return true;
};

const hasStringValue = (val: string | undefined): val is string => {
  return typeof val === 'string' && val.trim() !== '';
};

const getVehicleType = (type: string | undefined) => {
  if (!hasStringValue(type)) return '';
  return type.toLowerCase() === 'tire' ? 'Легковий' : type;
};

export const ProductDetail: FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const addItem = useCartStore((state) => state.addItem);

  // Состояния для отзывов
  const [reviews, setReviews] = useState<Review[]>([]);
  const [newComment, setNewComment] = useState('');
  const [rating, setRating] = useState(5);
  const [user, setUser] = useState<User | null>(null);

  // Запрос товара из Supabase
  const fetchProduct = useCallback(async () => {
    if (!id) return;
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*, reviews:reviews!product_id (id, rating)')
        .eq('id', id)
        .single();

      if (error) throw error;
      if (data) {
        const productData = {
          ...data,
          reviews_count: data.reviews?.length || 0,
          rating: data.rating,
        } as Product;
        setProduct(productData);
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      setProduct(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  // Загрузка отзывов для товара
  useEffect(() => {
    const loadReviews = async () => {
      const { data, error } = await supabase
        .from('reviews')
        .select('id, product_id, comment, created_at, user_id, rating')
        .eq('product_id', id)
        .order('created_at', { ascending: false });

      if (!error && data) setReviews(data as Review[]);
    };

    if (id) loadReviews();
  }, [id]);

  // Проверка авторизации пользователя
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    checkAuth();
  }, []);

  const handleQuantityChange = useCallback((value: number) => {
    setQuantity((prev) => Math.max(1, prev + value));
  }, []);

  const handleDotClick = useCallback((index: number) => {
    setCurrentImageIndex(index);
  }, []);

  // Обработка отправки нового отзыва
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      navigate('/auth', { state: { from: location.pathname } });
      return;
    }

    if (!newComment.trim()) return;

    const { data, error } = await supabase
      .from('reviews')
      .insert([{ product_id: id, comment: newComment, rating, user_id: user.id }])
      .select();

    if (!error && data) {
      setReviews([data[0] as Review, ...reviews]);
      setNewComment('');
      setRating(5);
    }
  };

  // Хуки для мобильных устройств и обработки свайпов
  const isMobile = useIsMobile();
  const { handleTouchStart, handleTouchMove, handleTouchEnd, handleTouchCancel } = useTouchHandlers({
    onSwipe: (direction) => {
      if (!product) return;
      if (direction === 'left' && currentImageIndex < product.image_url.length - 1) {
        setCurrentImageIndex(currentImageIndex + 1);
      } else if (direction === 'right' && currentImageIndex > 0) {
        setCurrentImageIndex(currentImageIndex - 1);
      }
    },
  });

  if (loading) return null;
  if (!product) {
    return (
      <div className="bg-white min-h-screen flex flex-col justify-center items-center px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Товар не знайдено</h1>
        <button onClick={() => navigate('/')} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors">
          На головну
        </button>
      </div>
    );
  }

  const countryCode = hasStringValue(product.country) && product.country.length === 2 ? product.country.toUpperCase() : 'US';

  const titleLine = [
    hasStringValue(product.brand) ? product.brand : '',
    hasStringValue(product.model) ? product.model : '',
    (hasValueForDisplay(product.width) || hasValueForDisplay(product.profile) || hasValueForDisplay(product.diameter))
      ? `${product.width ?? ''}/${product.profile ?? ''} R${product.diameter ?? ''}`
      : '',
    (hasValueForDisplay(product.load_index) || hasValueForDisplay(product.speed_index))
      ? `${product.load_index ?? ''}${product.speed_index ?? ''}`
      : '',
  ]
    .filter(Boolean)
    .join(' ');

  const characteristics = [
    { label: 'Тип:', value: getVehicleType(product.type), condition: hasStringValue(product.type) },
    { label: 'Бренд:', value: product.brand, condition: hasStringValue(product.brand) },
    { label: 'Модель:', value: product.model, condition: hasStringValue(product.model) },
    {
      label: 'Розмір:',
      value: (hasValueForDisplay(product.width) || hasValueForDisplay(product.profile) || hasValueForDisplay(product.diameter))
        ? `${product.width ?? ''}/${product.profile ?? ''} R${product.diameter ?? ''}`
        : '',
      condition: hasValueForDisplay(product.width) || hasValueForDisplay(product.profile) || hasValueForDisplay(product.diameter),
    },
    {
      label: 'Сезон:',
      value:
        product.season === 'winter'
          ? 'Зимові'
          : product.season === 'summer'
          ? 'Літні'
          : product.season === 'all-season'
          ? 'Всесезонні'
          : '',
      condition: hasStringValue(product.season),
    },
    { label: 'Рік випуску:', value: product.year, condition: hasValueForDisplay(product.year) },
    {
      label: 'Індекс Навантаження:',
      value: hasValueForDisplay(product.load_index)
        ? typeof product.load_index === 'string'
          ? product.load_index.toUpperCase()
          : String(product.load_index)
        : '',
      condition: hasValueForDisplay(product.load_index),
    },
    {
      label: 'Індекс Швидкості:',
      value: hasValueForDisplay(product.speed_index)
        ? typeof product.speed_index === 'string'
          ? product.speed_index.toUpperCase()
          : String(product.speed_index)
        : '',
      condition: hasValueForDisplay(product.speed_index),
    },
    {
      label: 'Шипи:',
      value: product.spikes !== undefined ? (product.spikes ? 'ТАК' : 'НІ') : '',
      condition: product.spikes !== undefined,
    },
    {
      label: 'Зчеплення:',
      value: hasStringValue(product.wet_grip)
        ? typeof product.wet_grip === 'string'
          ? product.wet_grip.toUpperCase()
          : String(product.wet_grip)
        : '',
      condition: hasStringValue(product.wet_grip),
    },
    {
      label: 'Паливо:',
      value: hasStringValue(product.fuel_efficiency)
        ? typeof product.fuel_efficiency === 'string'
          ? product.fuel_efficiency.toUpperCase()
          : String(product.fuel_efficiency)
        : '',
      condition: hasStringValue(product.fuel_efficiency),
    },
    {
      label: 'Рівень шуму dB:',
      value: product.noise_level,
      condition: product.noise_level !== undefined,
    },
  ];

  return (
    <div className="bg-white min-h-screen relative">
      <div className="mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Левая колонка: Слайдер изображений */}
          <div className="relative">
            {product.image_url && product.image_url.length > 1 ? (
              <div
                className="w-full  h-[320px] bg-white rounded-lg overflow-hidden"
                {...(isMobile
                  ? {
                      onTouchStart: handleTouchStart,
                      onTouchMove: handleTouchMove,
                      onTouchEnd: handleTouchEnd,
                      onTouchCancel: handleTouchCancel,
                    }
                  : {})}
              >
                <div
                  className="flex h-full transition-transform duration-300 ease-in-out"
                  style={{ transform: `translateX(-${currentImageIndex * 100}%)` }}
                >
                  {product.image_url.map((img) => (
                    <div key={img} className="w-full h-[300px] flex-shrink-0">
                      <FadeInImage src={img} alt={titleLine} />
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="w-full h-[300px] bg-white rounded-lg overflow-hidden">
                <FadeInImage src={product.image_url?.[0] || ''} alt={titleLine} />
              </div>
            )}
            {product.image_url && product.image_url.length > 1 && (
              <>
                <DotsIndicator count={product.image_url.length} activeIndex={currentImageIndex} onChange={handleDotClick} />
                <div className="mt-4 flex justify-center ">
                  <div className="grid grid-cols-4 gap-2 w-60 ">
                    {product.image_url.map((img, index) => (
                      <ThumbnailButton key={img} img={img} active={currentImageIndex === index} onClick={() => setCurrentImageIndex(index)} />
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Правая колонка: Информация о товаре */}
          <div className="md:origin-top-left inline-block md:text-[0.8rem]">
            <h1 className="text-xl font-bold mb-4">{titleLine}</h1>
            <div className="flex items-center mb-4">
              <RatingStars rating={product.rating} />
              <span className="text-sm text-gray-600 ml-2">({product.reviews_count} відгуків)</span>
              <span className="ml-4 text-sm text-gray-600">Артикул: {product.id.slice(0, 8).toUpperCase()}</span>
            </div>
            <div className="flex items-center gap-6 mb-2 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <span>Сезон:</span>
                {product.season === 'winter' ? (
                  <SnowflakeIcon className="w-5 h-5 text-blue-600" />
                ) : product.season === 'summer' ? (
                  <SunIcon className="w-5 h-5 text-yellow-500" />
                ) : product.season === 'all-season' ? (
                  <SnowSunIcon className="w-5 h-5 text-green-600" />
                ) : null}
                <span>
                  {product.season === 'winter'
                    ? 'Зимові'
                    : product.season === 'summer'
                    ? 'Літні'
                    : product.season === 'all-season'
                    ? 'Всесезонні'
                    : ''}
                </span>
              </div>
              {hasStringValue(product.type) && (
                <div className="flex items-center gap-2 ml-10">
                  <span>Тип:</span>
                  <span>{getVehicleType(product.type)}</span>
                  <CustomCarIcon className="w-5 h-5 text-blue-600 -mt-1" />
                </div>
              )}
            </div>
            <div className="mb-4">
              {product.sale_price ? (
                <div className="flex items-center gap-4">
                  <span className="text-3xl font-bold text-red-500">{product.sale_price} ₴</span>
                  <span className="text-xl text-gray-400 line-through">{product.price} ₴</span>
                </div>
              ) : (
                <span className="text-3xl font-bold">{product.price} ₴</span>
              )}
            </div>
            <div className="mb-6 flex items-center gap-4">
              <div className="flex items-center border border-gray-300 rounded-md">
                <button onClick={() => handleQuantityChange(-1)} className="px-3 py-2 text-gray-600 hover:bg-gray-100">-</button>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))}
                  className="w-16 text-center border-x border-gray-300 py-2"
                />
                <button onClick={() => handleQuantityChange(1)} className="px-3 py-2 text-gray-600 hover:bg-gray-100">+</button>
              </div>
              <button onClick={() => addItem(product.id, quantity)} className="flex-1 bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700 transition-colors">
                Купити
              </button>
            </div>
            <div className="mb-6 text-sm text-gray-700 leading-relaxed">
              <h2 className="text-lg font-semibold mb-2">Доставка</h2>
              <p>Термін доставки 1-3 дні</p>
              <p>Доставляємо службами Нова Пошта</p>
              <p>Є можливість самовивозу зі складу в Одесі згідно графіку роботи</p>
              <h2 className="text-lg font-semibold mt-4 mb-2">Оплата</h2>
              <p>Банківськими картами Visa/Mastercard</p>
              <p>Готівкою при отриманні товару</p>
              <p>Безготівковий розрахунок з ПДВ або без ПДВ</p>
            </div>
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-4">Додаткові характеристики</h2>
              <div className="space-y-3">
                {characteristics.map(
                  (item, index) =>
                    item.condition && (
                      <div key={index} className="flex justify-between">
                        <span>{item.label}</span>
                        <span>{item.value}</span>
                      </div>
                    )
                )}
                {hasStringValue(product.country) && (
                  <div className="flex justify-between">
                    <span>Країна:</span>
                    <span className="flex items-center gap-2">
                      <ReactCountryFlag
                        countryCode={countryCode}
                        svg
                        className="w-5 h-5 rounded-full border"
                        title={product.country}
                        aria-label={product.country}
                      />
                      <span>{product.country}</span>
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Блок с отзывами */}
        <div className="mt-4 md:mt-2">
          <h2 className="text-2xl font-bold mb-6">Відгуки про товар</h2>
          {user ? (
            <form onSubmit={handleSubmit} className="mb-8 bg-gray-50 p-4 rounded-lg">
              <div className="mb-4">
                <label className="block mb-2 font-medium">Ваша оцінка:</label>
                <select
                  value={rating}
                  onChange={(e) => setRating(Number(e.target.value))}
                  className="w-full p-2 border rounded"
                >
                  {[5, 4, 3, 2, 1].map((num) => (
                    <option key={num} value={num}>
                      {num} ★
                    </option>
                  ))}
                </select>
              </div>

              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="w-full p-2 border rounded mb-4"
                placeholder="Напишіть ваш відгук..."
                rows={4}
                required
              />

              <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">
                Опублікувати
              </button>
            </form>
          ) : (
            <div className="mb-8 flex justify-center">
              <button
                onClick={() => navigate('/auth', { state: { from: location.pathname } })}
                className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition-colors"
              >
                Написати відгук
              </button>
            </div>
          )}

          <div className="space-y-6">
            {reviews.slice(0, 3).map((review) => (
              <div key={review.id} className="bg-white p-4 rounded-lg shadow-sm border">
                <div className="flex items-center justify-between mb-3">
                  <RatingStars rating={review.rating} starSizeClass="w-4 h-4" />
                  <span className="text-sm text-gray-500">{new Date(review.created_at).toLocaleDateString('ru-RU')}</span>
                </div>
                <p className="text-gray-800 mb-2">{review.comment}</p>
                <div className="text-sm text-gray-500">
                  Користувач: анонімний {review.user_id.slice(0, 6)}
                </div>
              </div>
            ))}
          </div>
          {product.reviews_count > 3 && (
            <div className="mt-6 flex justify-center">
              <Link
                to={`/product/${id}/comment`}
                className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 transition-colors"
              >
                Переглянути всі коментарі ({product.reviews_count})
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default memo(ProductDetail);
