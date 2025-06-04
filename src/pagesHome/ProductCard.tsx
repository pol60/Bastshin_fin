import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
  memo
} from 'react';
import { Heart, Star } from 'lucide-react';
import ReactCountryFlag from 'react-country-flag';
import { Button } from "../components/ui/button";
import { useCartStore } from '../stores/cartStore';
import { useFavoritesStore } from '../stores/favoritesStore';
import { supabase } from '../lib/supabaseClient';
import { useQueryClient } from '@tanstack/react-query';
import { useIsMobile } from '../hooks/useIsMobile';
import { useNavigate, Link } from 'react-router-dom';
import Stock from '../components/icons/StockIcons';
import CustomCarIcon from '../components/icons/CustomCarIcon';
import GasPumpIcon from '../components/icons/GasPumpIcon';
import CloudRainIcon from '../components/icons/CloudRainIcon';
import VolumIcon from '../components/icons/VolumIcon';
import SnowflakeIcon from '../components/icons/SnowflakeIcon';
import SunIcon from '../components/icons/SunIcon';
import SnowSunIcon from '../components/icons/SnowSunIcon';
import MessageCircle from '../components/icons/MessageCircle';
import DiscountIcon from '../components/icons/Discount';
import { debounce } from 'lodash-es';

// Компонент TooltipIcon для отображения подсказки с тенью на стрелочке
const TooltipIcon = ({
  tooltip,
  children
}: {
  tooltip: string;
  children: React.ReactNode;
}) => {
  const isMobile = useIsMobile();
  const [visible, setVisible] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [offsetX, setOffsetX] = useState(0);

  // Генерируем уникальный идентификатор для данного тултипа
  const tooltipIdRef = useRef<number>(Date.now() + Math.random());

  const handleMouseEnter = (_e: React.MouseEvent) => {
    if (!isMobile) setVisible(true);
  };

  const handleMouseLeave = (_e: React.MouseEvent) => {
    if (!isMobile) setVisible(false);
  };

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isMobile) {
      // Если подсказка закрыта – открываем её и уведомляем все остальные
      if (!visible) {
        window.dispatchEvent(new CustomEvent('tooltip:open', { detail: tooltipIdRef.current }));
        setVisible(true);
      } else {
        setVisible(false);
      }
    }
  };

  // Закрытие подсказки через 2 секунды в мобильной версии
  useEffect(() => {
    if (isMobile && visible) {
      const timer = setTimeout(() => setVisible(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [isMobile, visible]);

  // Слушатель события для закрытия подсказок, если открывается другая
  useEffect(() => {
    const handleTooltipOpen = (e: CustomEvent) => {
      if (e.detail !== tooltipIdRef.current) {
        setVisible(false);
      }
    };
    window.addEventListener('tooltip:open', handleTooltipOpen as EventListener);
    return () => {
      window.removeEventListener('tooltip:open', handleTooltipOpen as EventListener);
    };
  }, []);

  // Пересчёт смещения подсказки, если она близко к краям окна
  useEffect(() => {
    if (visible && tooltipRef.current) {
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      let newOffset = 0;
      const padding = 4;
      if (tooltipRect.left < padding) {
         newOffset = padding - tooltipRect.left;
      } else if (tooltipRect.right > window.innerWidth - padding) {
         newOffset = window.innerWidth - padding - tooltipRect.right;
      }
      setOffsetX(newOffset);
    }
  }, [visible]);

  return (
    <div
      className="relative inline-block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
    >
      {children}
      {visible && (
        <div
          className="absolute bottom-full left-1/2 z-20"
          ref={tooltipRef}
          style={{ transform: `translateX(calc(-50% + ${offsetX}px))` }}
        >
          <div className="bg-white text-black text-xs px-2 py-1 rounded shadow whitespace-nowrap">
            {tooltip}
          </div>
          <div className="flex justify-center">
            <svg
              className="w-2 h-2 fill-current text-white"
              style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.2))' }}
              viewBox="0 0 4 4"
            >
              <polygon points="0,0 4,0 2,2" />
            </svg>
          </div>
        </div>
      )}
    </div>
  );
};

export interface ProductCardProps {
  id: string;
  brand: string;
  model: string;
  price: number;
  oldPrice?: number | null;
  discount?: number;
  image?: string[];
  'data-images'?: string[];
  specs: {
    noise?: number | null;
    size?: string;
    profile?: number;
    season?: 'winter' | 'summer' | 'all-season';
    width?: number;
    offset?: string;
    diameter?: number;
    load_index?: string;
    speed_index?: string;
    wheel_width?: number;
    spikes?: boolean;
    fuel_Efficiency?: string;
    wetGrip?: string;
  };
  year: number;
  country: string;
  articleNumber: string;
  productType?: 'tire' | 'wheel';
  commentCount?: number;
  initialRating: number;
  imageHeight?: string;
  iconSize?: 4 | 6 | 8;
  heartSize?: 4 | 6 | 8;
  className?: string;
  previewImage?: JSX.Element;
  isFavoritesView?: boolean;
  onRemoveFavorite?: () => void;
  showAvailability?: boolean;
  discountIconClass?: string;
  heartClass?: string;
}

interface TouchInfo {
  startTime: number;
  startX: number;
  startY: number;
  moved: boolean;
}

const sizeClasses = {
  4: 'w-4 h-4',
  6: 'w-6 h-6',
  8: 'w-8 h-8',
} as const;

const optimizeImage = (url: string, width: number) =>
  `${url}?width=${width}&format=webp&quality=85`;

export const ProductCard = memo(function ProductCard({
  id,
  brand,
  model,
  price,
  oldPrice,
  discount,
  image = [],
  'data-images': dataImages = [],
  specs,
  year,
  country,
  articleNumber,
  productType,
  commentCount = 0,
  initialRating = 0,
  imageHeight = "h-36",
  iconSize = 4,
  heartSize = 6,
  className,
  previewImage,
  showAvailability = true,
  discountIconClass,
  heartClass,
}: ProductCardProps) {
  const queryClient = useQueryClient();
  const addItem = useCartStore(state => state.addItem);
  const favorites = useFavoritesStore((state) => state.favorites);
  const toggleFavorite = useFavoritesStore((state) => state.toggleFavorite);
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  // Предзагрузка изображений и выборка данных товара
  const preloadImages = useCallback((urls: string[]) => {
    urls.forEach(url => {
      const img = new Image();
      img.src = `${url}?width=300`;
      img.loading = 'eager';
      img.decoding = 'async';
    });
  }, []);

  const fetchProductDetails = async (productId: string) => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .single();
    if (error) {
      throw new Error(error.message);
    }
    return data;
  };

  const prefetchProduct = useCallback(() => {
    queryClient.prefetchQuery({
      queryKey: ['product', id],
      queryFn: () => {
        preloadImages(dataImages.slice(0, 2));
        return fetchProductDetails(id);
      }
    });
  }, [id, dataImages, queryClient, preloadImages]);

  const prefetchProductDetails = useCallback(() => {
    import('../pages/ProductDetail');
  }, []);

  // ------------------------------------------------------------------------------

  const imagesToLoad = useMemo(() => {
    const imgs = image.length > 0 ? image : dataImages;
    return imgs.map((img) => optimizeImage(img, 300));
  }, [image, dataImages]);

  const [rating, setRating] = useState(initialRating);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [discountHovered, setDiscountHovered] = useState(false);
  const [errorLoading, setErrorLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const touchInfoRef = useRef<TouchInfo | null>(null);
  const interactionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const LONG_PRESS_DURATION = 500;
  const MOVE_THRESHOLD = 10;

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !mounted) {
          setMounted(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px', threshold: 0.1 }
    );
    const currentRef = imageContainerRef.current;
    if (currentRef) observer.observe(currentRef);
    return () => {
      if (currentRef) observer.unobserve(currentRef);
      observer.disconnect();
    };
  }, [mounted]);

  useEffect(() => {
    if (!mounted) return;
    const preloadImage = (url: string) => {
      const img = new Image();
      img.src = url;
      return new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });
    };
    Promise.all(imagesToLoad.slice(0, 2).map(preloadImage))
      .catch(() => setErrorLoading(true));
  }, [mounted, imagesToLoad]);

  // Циклическая смена изображения при hover
  useEffect(() => {
    if (isHovered && imagesToLoad.length > 1) {
      intervalRef.current = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % imagesToLoad.length);
      }, 3000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isHovered, imagesToLoad.length]);

  const handleImageContainerMouseEnter = useCallback(() => {
    setIsHovered(true);
    if (imagesToLoad.length > 1) {
      setCurrentImageIndex(1);
    }
  }, [imagesToLoad.length]);

  const handleImageContainerMouseLeave = useCallback(() => {
    setIsHovered(false);
    setCurrentImageIndex(0);
  }, []);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('button')) return;
    prefetchProduct();
    prefetchProductDetails();
    touchInfoRef.current = {
      startTime: Date.now(),
      startX: e.touches[0].clientX,
      startY: e.touches[0].clientY,
      moved: false,
    };
    if (imagesToLoad.length > 1) {
      interactionTimeoutRef.current = setTimeout(() => {
        setIsHovered(true);
      }, LONG_PRESS_DURATION);
    }
  }, [imagesToLoad.length, prefetchProduct, prefetchProductDetails]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!touchInfoRef.current) return;
    const { clientX, clientY } = e.touches[0];
    const deltaX = Math.abs(clientX - touchInfoRef.current.startX);
    const deltaY = Math.abs(clientY - touchInfoRef.current.startY);
    if (deltaX > MOVE_THRESHOLD || deltaY > MOVE_THRESHOLD) {
      touchInfoRef.current.moved = true;
      if (interactionTimeoutRef.current) {
        clearTimeout(interactionTimeoutRef.current);
      }
      setIsHovered(false);
    }
  }, []);

  const handleTouchEnd = useCallback((_e: React.TouchEvent) => {
    if (interactionTimeoutRef.current) {
      clearTimeout(interactionTimeoutRef.current);
    }
    setIsHovered(false);
    setCurrentImageIndex(0);
    touchInfoRef.current = null;
  }, []);

  const updateRating = useCallback(debounce(async (newRating: number) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ rating: newRating })
        .eq('id', id);
      if (!error) {
        await queryClient.invalidateQueries({
          queryKey: ['home-products'],
          exact: false,
        });
        setRating(newRating);
      }
    } catch (_error) {
      console.error('Помилка оновлення рейтингу:', _error);
    }
  }, 300), [id, queryClient]);

  const [isClicked, setIsClicked] = useState(false);
  const handleInteraction = useCallback(async (handler: () => Promise<void>) => {
    if (isClicked) return;
    setIsClicked(true);
    try {
      await handler();
    } finally {
      setTimeout(() => setIsClicked(false), 100);
    }
  }, [isClicked]);

  const isFavorited = favorites.includes(id);
  const handleFavoriteToggle = useCallback(async () => {
    if (!isFavorited) {
      toggleFavorite(id);
      await updateRating(rating + 1);
    } else {
      toggleFavorite(id);
    }
  }, [toggleFavorite, id, isFavorited, rating, updateRating]);

  const handleBuy = useCallback(async () => {
    addItem(id);
    await updateRating(rating + 1);
  }, [addItem, id, rating, updateRating]);

  const handleComments = useCallback(() => {
    navigate(`/product/${id}#comments`);
  }, [id, navigate]);

  const formatSize = useCallback(() => {
    if (productType === 'tire' && specs.width && specs.profile && specs.diameter) {
      return `${specs.width}/${specs.profile} R${specs.diameter}`;
    }
    if (productType === 'wheel' && specs.width && specs.diameter) {
      return `${specs.width}J x R${specs.diameter}`;
    }
    return specs.size || '';
  }, [productType, specs]);
  

  const ratingStars = useMemo(() => Math.min(Math.floor(rating / 20), 5), [rating]);

  const formatPrice = useCallback(
    (value: number) =>
      value.toLocaleString('uk-UA', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }) + ' ₴',
    []
  );

  const countryCode = useMemo(
    () => (country && country.length === 2 ? country.toUpperCase() : 'US'),
    [country]
  );

  return (
    <Link
      to={`/product/${id}`}
      state={{ preserveScroll: true }}
      className="block"
    >
      <div
        className={`group rounded-lg p-0 relative transition-shadow w-full pb-2 select-none bg-transparent border border-transparent md:group-hover:bg-white md:group-hover:border-gray-100 md:group-hover:shadow-lg ${className || ''}`}
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            handleInteraction(handleFavoriteToggle);
          }}
          className={`absolute right-2 z-10 ${heartClass ? heartClass : 'top-0'}`}
          disabled={isClicked}
          aria-label="Додати до улюблених"
        >
          <Heart
            className={`${sizeClasses[heartSize]} stroke-2 transition-all duration-300 ${
              isFavorited ? 'text-red-500 fill-red-500' : 'text-gray-300 fill-gray-100'
            } ${isClicked ? 'animate-pulse scale-125' : ''}`}
          />
        </button>

        {discount && discount > 0 && (
          <div
            {...(!isMobile && {
              onMouseEnter: () => setDiscountHovered(true),
              onMouseLeave: () => setDiscountHovered(false)
            })}
            className={`absolute top-1 ${discountIconClass ? discountIconClass : 'left-4 lg:translate-x-4'} z-10 transition-transform duration-300 ${
              discountHovered ? 'rotate-45' : ''
            }`}
          >
            <DiscountIcon className="w-4 h-4 lg:w-5 lg:h-5" />
          </div>
        )}

        <div
          ref={imageContainerRef}
          className={`relative ${imageHeight} mb-2 flex items-center justify-center overflow-hidden rounded-lg bg-white`}
          {...(!isMobile && {
            onMouseEnter: handleImageContainerMouseEnter,
            onMouseLeave: handleImageContainerMouseLeave,
          })}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onTouchCancel={() => {
            if (interactionTimeoutRef.current) {
              clearTimeout(interactionTimeoutRef.current);
            }
            setIsHovered(false);
            setCurrentImageIndex(0);
            touchInfoRef.current = null;
          }}
        >
          {errorLoading ? (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100">
              <p className="text-red-500 text-sm mb-2">Помилка завантаження</p>
              <Button variant="outline" size="sm" onClick={() => setErrorLoading(false)}>
                Спробувати знову
              </Button>
            </div>
          ) : previewImage ? (
            previewImage
          ) : (
            imagesToLoad.map((img, index) => (
              <img
                key={img}
                src={img}
                alt={`${brand} ${model}`}
                className={`absolute max-h-full w-auto object-contain transition-all duration-500 ${
                  index === currentImageIndex ? 'opacity-100' : 'opacity-0'
                }`}
                loading={mounted ? 'lazy' : 'eager'}
                decoding="async"
                onError={() => setErrorLoading(true)}
              />
            ))
          )}
          {showAvailability && (
            <Stock className="absolute top-24 -left-3 z-10" />
          )}
        </div>

        <div className="px-2 pb-2">
          <div className="flex flex-wrap items-center gap-1 mb-1">
            <h3 className="text-sm font-bold text-black break-words">
              {brand} {model}
            </h3>
            <span className="text-sm font-bold text-black whitespace-nowrap">
              {formatSize()}
            </span>
            {specs.load_index && specs.speed_index && (
              <span className="text-sm font-bold text-black whitespace-nowrap">
                {specs.load_index}
                {specs.speed_index}
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-between mb-2 gap-y-1">
            <span className="text-xs text-gray-500">Арт: {articleNumber}</span>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`${sizeClasses[iconSize]} ${
                      i < ratingStars ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                    }`}
                  />
                ))}
                <span className="text-xs text-gray-500 ml-1">({rating})</span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  handleComments();
                }}
                className="flex items-center gap-1 hover:opacity-75 transition-opacity"
                aria-label="Коментарі"
              >
                <MessageCircle className={sizeClasses[iconSize]} />
                {commentCount > 0 && (
                  <span className="text-xs text-gray-500">{commentCount}</span>
                )}
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 mb-2">
            <div className="flex items-center gap-2">
              <TooltipIcon tooltip="Легкові шини">
                <CustomCarIcon className={`${sizeClasses[iconSize]} text-blue-600`} />
              </TooltipIcon>
              {specs.season === 'winter' ? (
                <TooltipIcon tooltip="Зимова шина">
                  <SnowflakeIcon className={`${sizeClasses[iconSize]} text-blue-600`} />
                </TooltipIcon>
              ) : specs.season === 'summer' ? (
                <TooltipIcon tooltip="Літня шина">
                  <SunIcon className={sizeClasses[iconSize]} />
                </TooltipIcon>
              ) : specs.season === 'all-season' ? (
                <TooltipIcon tooltip="Універсальна шина">
                  <SnowSunIcon className={sizeClasses[iconSize]} />
                </TooltipIcon>
              ) : null}
              {specs.spikes && (
                <TooltipIcon tooltip="Шиповані шини">
                  <div className="bg-red-500 text-white text-xs px-1 py-0.5 rounded-sm">
                    Ш
                  </div>
                </TooltipIcon>
              )}
            </div>
            <div className="flex items-center gap-2">
            <TooltipIcon tooltip={`Країна: ${country}`}>
  <div className="aspect-square rounded-full overflow-hidden border w-4 h-4 relative">
    <ReactCountryFlag
      countryCode={countryCode}
      svg
      className="absolute top-1/2 left-1/2 w-[135%] h-[135%] -translate-x-1/2 -translate-y-1/2 object-cover"
      title={country}
      aria-label={country}
    />
  </div>
</TooltipIcon>
              <span className="text-xs text-gray-500">{year}</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 mb-2">
            {specs.fuel_Efficiency && (
              <TooltipIcon tooltip={`Ефективність палива: ${specs.fuel_Efficiency}`}>
                <div className="flex items-center gap-1">
                  <GasPumpIcon className={sizeClasses[iconSize]} />
                  <span className="text-xs text-gray-700">{specs.fuel_Efficiency}</span>
                </div>
              </TooltipIcon>
            )}
            {specs.wetGrip && (
              <TooltipIcon tooltip={`Зчеплення на мокрій дорозі: ${specs.wetGrip}`}>
                <div className="flex items-center gap-1">
                  <CloudRainIcon className={sizeClasses[iconSize]} />
                  <span className="text-xs text-gray-700">{specs.wetGrip}</span>
                </div>
              </TooltipIcon>
            )}
            {specs.noise && (
              <TooltipIcon tooltip={`Рівень шуму: ${specs.noise} dB`}>
                <div className="flex items-center gap-1">
                  <VolumIcon className={`${sizeClasses[iconSize]} text-blue-600`} />
                  <span className="text-xs text-gray-700">{specs.noise} dB</span>
                </div>
              </TooltipIcon>
            )}
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="flex-grow">
              {discount ? (
                <>
                  <div className="text-red-600 font-bold text-sm break-words">
                    {formatPrice(price)}
                  </div>
                  <div className="text-gray-400 line-through text-xs">
                    {oldPrice ? formatPrice(oldPrice) : ''}
                  </div>
                </>
              ) : (
                <div className="text-green-600 font-bold text-sm break-words">
                  {formatPrice(price)}
                </div>
              )}
            </div>
            <Button
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-xs md:text-sm shadow-md transition-transform hover:scale-105 ml-3 z-20"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                handleInteraction(handleBuy);
              }}
              onTouchStart={(e) => {
                e.stopPropagation();
                e.preventDefault();
              }}
              onTouchEnd={(e) => {
                e.stopPropagation();
                e.preventDefault();
                handleInteraction(handleBuy);
              }}
              aria-label="Купити"
            >
              Купити
            </Button>
          </div>
        </div>
      </div>
    </Link>
  );
});

export default memo(ProductCard);
