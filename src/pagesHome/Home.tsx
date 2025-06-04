import React, {
  useCallback,
  useState,
  Suspense,
  lazy,
  useEffect,
  useRef,
  useMemo,
  createContext,
  useContext,
} from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'react-router-dom';
import { HeroSection } from './HeroSection';
import { ProductCard, ProductCardProps } from './ProductCard';
import { supabase } from '../lib/supabaseClient';
import { useIsMobile } from '../hooks/useIsMobile';
import ArticleWindow from '../FAKT_Info/ArticleWindow';

/* ------------------- Интерфейсы и глобальный стор для Home ------------------- */

interface ReviewCount {
  count: number;
}

export interface Product {
  id: string;
  brand: string;
  model: string;
  price: number;
  sale_price: number | null;
  image_url: string[];
  noise_level: number | null;
  year: number;
  country: string;
  created_at: string;
  type: 'tire' | 'wheel';
  width?: number;
  profile?: number;
  diameter?: number;
  season?: 'summer' | 'winter' | 'all-season';
  reviews: ReviewCount[];
  comment_count?: number;
  rating: number;
  spikes?: boolean;
  fuel_efficiency?: string;
  wet_grip?: string;
  load_index?: string;
  speed_index?: string;
}

interface HomeState {
  hasVisited: boolean;
}

const defaultHomeState: HomeState = {
  hasVisited: false,
};

const HomeStateContext = createContext<
  [HomeState, React.Dispatch<React.SetStateAction<HomeState>>]
>([defaultHomeState, () => {}]);

const HomeStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<HomeState>(() => {
    const saved = sessionStorage.getItem('homeState');
    return saved ? JSON.parse(saved) : defaultHomeState;
  });

  useEffect(() => {
    sessionStorage.setItem('homeState', JSON.stringify(state));
  }, [state]);

  return (
    <HomeStateContext.Provider value={[state, setState]}>
      {children}
    </HomeStateContext.Provider>
  );
};

/* ------------------- Ленивые секции ------------------- */

const LazySaleProductsSection = lazy(() => import('./HomeSections/SaleProductsSection'));
const LazyNewArrivalsSection = lazy(() => import('./HomeSections/NewArrivalsSection'));
const LazyTopRatedSection = lazy(() => import('./HomeSections/TopRatedSection'));
const LazyFooterSection = lazy(() => import('./HomeSections/FooterSection'));

const prefetchComponent = (importFunc: () => Promise<unknown>): void => {
  importFunc();
};

/* ------------------- Компонент HomeContent ------------------- */

const HomeContent: React.FC = () => {
  const isMobile = useIsMobile();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [currentTopIndex, setCurrentTopIndex] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const touchStartX = useRef<number>(0);
  const touchStartY = useRef<number>(0);
  const isHorizontalSwipe = useRef<boolean>(false);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    isHorizontalSwipe.current = false;
    setIsDragging(true);
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging) return;
    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    const deltaX = Math.abs(currentX - touchStartX.current);
    const deltaY = Math.abs(currentY - touchStartY.current);

    if (!isHorizontalSwipe.current && (deltaX > 10 || deltaY > 10)) {
      isHorizontalSwipe.current = deltaX > deltaY;
    }

    if (isHorizontalSwipe.current) {
      e.preventDefault();
      setDragOffset(currentX - touchStartX.current);
    }
  }, [isDragging]);

  useEffect(() => {
    const handleGlobalTouchMove = (e: TouchEvent) => {
      if (isDragging && isHorizontalSwipe.current) {
        e.preventDefault();
      }
    };
    document.addEventListener('touchmove', handleGlobalTouchMove, { passive: false });
    return () => {
      document.removeEventListener('touchmove', handleGlobalTouchMove);
    };
  }, [isDragging]);

  // Используем react-query для загрузки товаров с кэшированием на 30 минут (1800000 мс)
  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ['home-products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select(`
          id,
          brand,
          model,
          price,
          sale_price,
          image_url,
          noise_level,
          year,
          country,
          created_at,
          type,
          width,
          profile,
          diameter,
          season,
          reviews (count),
          rating,
          spikes,
          fuel_efficiency,
          wet_grip,
          load_index,
          speed_index
        `)
        .order('created_at', { ascending: false })
        .limit(12);
      if (error) throw error;
      return data.map((p) => ({
        ...p,
        comment_count: p.reviews[0]?.count || 0,
      })) as Product[];
    },
    staleTime: 1800000, // 30 минут
  });

  // Предзагрузка изображений товаров для кэширования в браузере
  useEffect(() => {
    if (!isLoading && products.length > 0) {
      products.forEach((product) => {
        product.image_url.forEach((url) => {
          const img = new Image();
          img.src = url;
        });
      });
    }
  }, [isLoading, products]);

  const getProductSpecs = useCallback((product: Product) => {
    return product.type === 'tire'
      ? {
          size: `${product.width}/${product.profile}R${product.diameter}`,
          season: product.season,
          spikes: product.spikes,
          fuel_Efficiency: product.fuel_efficiency,
          wetGrip: product.wet_grip,
          noise: product.noise_level,
        }
      : {
          size: `${product.width}J x R${product.diameter}`,
        };
  }, []);

  const renderProductCard = useCallback(
    (
      product: Product,
      isLazy = true,
      className?: string,
      customProps?: Partial<ProductCardProps>
    ) => (
      <ProductCard
        key={product.id}
        id={product.id}
        brand={product.brand}
        model={product.model}
        price={product.sale_price || product.price}
        oldPrice={product.sale_price ? product.price : undefined}
        discount={
          product.sale_price
            ? Math.round(((product.price - product.sale_price) / product.price) * 100)
            : undefined
        }
        image={isLazy ? [] : product.image_url}
        data-images={product.image_url}
        specs={getProductSpecs(product)}
        articleNumber={product.id.slice(0, 8).toUpperCase()}
        commentCount={product.comment_count || 0}
        initialRating={product.rating}
        productType={product.type}
        year={product.year}
        country={product.country}
        className={className}
        {...customProps}
      />
    ),
    [getProductSpecs]
  );

  const saleProducts = useMemo(
    () => products.filter((p) => p.sale_price !== null && p.sale_price < p.price),
    [products]
  );
  const newArrivals = useMemo(
    () =>
      products.filter((p) => !saleProducts.some((sp) => sp.id === p.id)).slice(0, 8),
    [products, saleProducts]
  );
  const topRated = useMemo(() => {
    const sorted = [...products].sort((a, b) => (b.rating || 0) - (a.rating || 0));
    return sorted.slice(0, 4);
  }, [products]);

  const handleSlideChange = useCallback(
    (direction: 'next' | 'prev') => {
      const slidesToShow = 4;
      const totalItems = products.filter((p) => !p.sale_price || p.sale_price >= p.price)
        .length;
      const totalSlides = Math.ceil(totalItems / slidesToShow);
      setCurrentSlide((prev) =>
        direction === 'next'
          ? (prev + 1) % totalSlides
          : (prev - 1 + totalSlides) % totalSlides
      );
    },
    [products]
  );

  const handleTopRatedPrev = useCallback(() => {
    setCurrentTopIndex((prev) => (prev - 1 + topRated.length) % topRated.length);
  }, [topRated.length]);

  const handleTopRatedNext = useCallback(() => {
    setCurrentTopIndex((prev) => (prev + 1) % topRated.length);
  }, [topRated.length]);

  const handleTouchEnd = useCallback(() => {
    const swipeThreshold = 50;
    if (isDragging && isHorizontalSwipe.current) {
      if (dragOffset > swipeThreshold) {
        handleTopRatedPrev();
      } else if (dragOffset < -swipeThreshold) {
        handleTopRatedNext();
      }
    }
    setIsDragging(false);
    setDragOffset(0);
    isHorizontalSwipe.current = false;
  }, [isDragging, dragOffset, handleTopRatedPrev, handleTopRatedNext]);

  const lastProductCallbackRef = useCallback((_: HTMLDivElement | null) => {}, []);

  const handleNavClick = useCallback(
    (targetId: string) => (e: React.MouseEvent<HTMLAnchorElement>) => {
      e.preventDefault();
      const targetElement = document.getElementById(targetId);
      if (targetElement) {
        const offset = targetElement.getBoundingClientRect().top + window.scrollY - 80;
        window.scrollTo({ top: offset, behavior: 'smooth' });
      }
      if (useIsMobile()) {
        e.currentTarget.blur();
      }
    },
    []
  );

  return (
    <div>
      <nav className="py-4">
        <ul className="flex justify-center gap-4">
          <li onMouseEnter={() => prefetchComponent(() => import('./HomeSections/TopRatedSection'))}>
            <a
              href="#top"
              onClick={handleNavClick('top')}
              className="bg-gray-100 hover:bg-gray-200 rounded-lg px-4 py-2 transition-colors"
            >
              Топові
            </a>
          </li>
          <li onMouseEnter={() => prefetchComponent(() => import('./HomeSections/NewArrivalsSection'))}>
            <a
              href="#new"
              onClick={handleNavClick('new')}
              className="bg-gray-100 hover:bg-gray-200 rounded-lg px-4 py-2 transition-colors"
            >
              Новинки
            </a>
          </li>
          <li onMouseEnter={() => prefetchComponent(() => import('./HomeSections/SaleProductsSection'))}>
            <a
              href="#sale"
              onClick={handleNavClick('sale')}
              className="bg-gray-100 hover:bg-gray-200 rounded-lg px-4 py-2 transition-colors"
            >
              Акції
            </a>
          </li>
        </ul>
      </nav>
      <main className="py-8">
        <Suspense fallback={<div className="min-h-[400px]" />}>
          <LazySaleProductsSection
            saleProducts={saleProducts}
            renderProductCard={renderProductCard}
            lastProductRef={lastProductCallbackRef}
            isLoading={isLoading}
            isMobile={isMobile}
          />
        </Suspense>
        <Suspense fallback={<div className="min-h-[400px]" />}>
          <LazyNewArrivalsSection
            newArrivals={newArrivals}
            currentSlide={currentSlide}
            onSlideChange={handleSlideChange}
            isMobile={isMobile}
            renderProductCard={renderProductCard}
            lastProductRef={lastProductCallbackRef}
            isLoading={isLoading}
          />
        </Suspense>
        <Suspense fallback={<div className="min-h-[400px]" />}>
          <LazyTopRatedSection
            topRated={topRated}
            currentTopIndex={currentTopIndex}
            onPrev={handleTopRatedPrev}
            onNext={handleTopRatedNext}
            isMobile={isMobile}
            renderProductCard={renderProductCard}
            dragOffset={dragOffset}
            isDragging={isDragging}
            handleTouchStart={handleTouchStart}
            handleTouchMove={handleTouchMove}
            handleTouchEnd={handleTouchEnd}
            lastProductRef={lastProductCallbackRef}
            isLoading={isLoading}
          />
        </Suspense>
      </main>
    </div>
  );
};

/* ------------------- Компонент Home с сохранением глобального состояния ------------------- */

export const Home: React.FC = () => {
  const [homeState, setHomeState] = useContext(HomeStateContext);
  const [shouldAnimate, setShouldAnimate] = useState(false);
  const location = useLocation();

  useEffect(() => {
    if (!homeState.hasVisited) {
      setShouldAnimate(true);
      setHomeState({ ...homeState, hasVisited: true });
      const timer = setTimeout(() => setShouldAnimate(false), 1500);
      return () => clearTimeout(timer);
    }
  }, [homeState, setHomeState, location.key]);

  return (
    <div className="min-h-screen">
      <div className="relative">
        <div className="absolute -top-4 left-0 right-0 h-[300px] bg-blue-800 z-[-1]" />
        <HeroSection shouldAnimate={shouldAnimate} />
      </div>
      <div className={shouldAnimate ? 'content-fadeIn' : ''}>
        <div className="w-full">
          <div className="px-2 sm:px-6 lg:mx-auto lg:max-w-[1024px] lg:px-8">
            <HomeContent />
            <section className="mt-8">
              <ArticleWindow />
            </section>
          </div>
        </div>
      </div>
      <Suspense fallback={null}>
        <LazyFooterSection />
      </Suspense>
    </div>
  );
};

/* ------------------- Обёртка для экспорта с провайдером глобального состояния ------------------- */

const HomeWithProvider: React.FC = () => (
  <HomeStateProvider>
    <Home />
  </HomeStateProvider>
);

export default HomeWithProvider;
