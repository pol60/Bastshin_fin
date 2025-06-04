import { useLocation, useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { supabase } from './lib/supabaseClient';

const BC = () => {
  const { id } = useParams<{ id?: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { pathname } = location;

  // История навигации
  const [navHistory, setNavHistory] = useState([{ pathname: '/', title: 'Головна' }]);
  // Состояние для заголовка (товара или статьи)
  const [itemTitle, setItemTitle] = useState<string | null>(null);

  // Ссылка на последний элемент хлебных крошек
  const lastBreadcrumbRef = useRef<HTMLLIElement>(null);
  // Контейнер для скроллинга
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Для drag scroll
  const isDown = useRef(false);
  const startX = useRef(0);
  const scrollLeftRef = useRef(0);

  // Функция для получения перевода для определённого маршрута
  const getTitle = (path: string) => {
    if (path === '/') return 'Головна';
    const translations: { [key: string]: string } = {
      'detailed-search': 'Розширений пошук',
      'search-results': 'Результати пошуку',
      'product': 'Товар',
      'tires': 'Шини',
      'wheels': 'Диски',
      'auth': 'Авторизація',
      'profile': 'Профіль',
      'checkout': 'Оформлення',
      'admin': 'Адмінпанель',
      'articles': 'Статті'
    };
    const segment = path.split('/')[1];
    return translations[segment] || segment.replace(/-/g, ' ');
  };

  // Обновление истории при смене маршрута
  useEffect(() => {
    setNavHistory(prev => {
      const existingIndex = prev.findIndex(entry => entry.pathname === pathname);
      if (existingIndex !== -1) return prev.slice(0, existingIndex + 1);
      // Если id есть и заголовок уже получен, используем его, иначе получаем перевод для маршрута
      const title = id && itemTitle ? itemTitle : getTitle(pathname);
      return [...prev, { pathname, title }];
    });
  }, [pathname, id, itemTitle]);

  // Получение данных для деталей товара или статьи в зависимости от маршрута
  useEffect(() => {
    if (id) {
      if (pathname.startsWith('/product/')) {
        // Получаем данные товара
        const fetchProduct = async () => {
          const { data, error } = await supabase
            .from('products')
            .select('brand, model')
            .eq('id', id)
            .single();
          if (!error && data) {
            const title = `${data.brand} ${data.model}`;
            setItemTitle(title);
            setNavHistory(prev =>
              prev.map(entry =>
                entry.pathname === pathname ? { ...entry, title } : entry
              )
            );
          } else {
            console.error('Error fetching product data:', error);
          }
        };
        fetchProduct();
      } else if (pathname.startsWith('/articles/')) {
        // Получаем данные статьи
        const fetchArticle = async () => {
          const { data, error } = await supabase
            .from('articles')
            .select('title')
            .eq('id', id)
            .single();
          if (!error && data) {
            const title = data.title;
            setItemTitle(title);
            setNavHistory(prev =>
              prev.map(entry =>
                entry.pathname === pathname ? { ...entry, title } : entry
              )
            );
          } else {
            console.error('Error fetching article data:', error);
          }
        };
        fetchArticle();
      }
    }
  }, [id, pathname]);

  // Обработчик клика по хлебной крошке
  const handleBreadcrumbClick = (index: number, path: string) => (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    setNavHistory(prev => prev.slice(0, index + 1));
    navigate(path);
  };

  // Автоскролл с bounce-эффектом для последней крошки
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container && container.scrollWidth > container.clientWidth) {
      const startScroll = container.scrollLeft;
      const targetScroll = container.scrollWidth - container.clientWidth;
      const duration = 800; // длительность анимации в мс
      let startTime: number | null = null;

      const animate = (timestamp: number) => {
        if (!startTime) startTime = timestamp;
        const elapsed = timestamp - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeOutProgress = 1 - Math.pow(1 - progress, 3);
        container.scrollLeft = startScroll + (targetScroll - startScroll) * easeOutProgress;
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          // Запускаем bounce-эффект у последнего элемента
          if (lastBreadcrumbRef.current) {
            lastBreadcrumbRef.current.classList.add('bounce');
            setTimeout(() => {
              if (lastBreadcrumbRef.current) {
                lastBreadcrumbRef.current.classList.remove('bounce');
              }
            }, 500);
          }
        }
      };

      requestAnimationFrame(animate);
    }
  }, [navHistory]);

  // Drag scroll (мышь)
  const handleMouseDown = (e: React.MouseEvent) => {
    const container = scrollContainerRef.current;
    if (!container) return;
    isDown.current = true;
    startX.current = e.pageX - container.offsetLeft;
    scrollLeftRef.current = container.scrollLeft;
  };

  const handleMouseLeave = () => {
    isDown.current = false;
  };

  const handleMouseUp = () => {
    isDown.current = false;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const container = scrollContainerRef.current;
    if (!container || !isDown.current) return;
    e.preventDefault();
    const x = e.pageX - container.offsetLeft;
    const walk = x - startX.current;
    container.scrollLeft = scrollLeftRef.current - walk;
  };

  // Drag scroll (сенсорные события)
  const handleTouchStart = (e: React.TouchEvent) => {
    const container = scrollContainerRef.current;
    if (!container) return;
    isDown.current = true;
    startX.current = e.touches[0].pageX - container.offsetLeft;
    scrollLeftRef.current = container.scrollLeft;
  };

  const handleTouchEnd = () => {
    isDown.current = false;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const container = scrollContainerRef.current;
    if (!container || !isDown.current) return;
    const x = e.touches[0].pageX - container.offsetLeft;
    const walk = x - startX.current;
    container.scrollLeft = scrollLeftRef.current - walk;
  };

  return (
    <>
      {/* Встроенные стили для bounce-анимации */}
      <style>{`
        @keyframes bounce {
          0% { transform: translateY(0); }
          30% { transform: translateY(-8px); }
          50% { transform: translateY(0); }
          70% { transform: translateY(-4px); }
          100% { transform: translateY(0); }
        }
        .bounce {
          animation: bounce 0.5s ease-out;
        }
      `}</style>
      <nav aria-label="breadcrumb" className="p-3 bg-gray-100 text-xs">
        <div
          ref={scrollContainerRef}
          className="overflow-x-auto whitespace-nowrap select-none"
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseLeave}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onTouchMove={handleTouchMove}
        >
          <ol className="flex items-center space-x-1">
            {navHistory.map((entry, index) => {
              const isLast = index === navHistory.length - 1;
              return (
                <li key={index} className="flex items-center" ref={isLast ? lastBreadcrumbRef : undefined}>
                  {index !== 0 && <span className="mx-1">-•-</span>}
                  {isLast ? (
                    <span className="text-gray-500">{entry.title}</span>
                  ) : (
                    <a href={entry.pathname} onClick={handleBreadcrumbClick(index, entry.pathname)}>
                      {entry.title}
                    </a>
                  )}
                </li>
              );
            })}
          </ol>
        </div>
      </nav>
    </>
  );
};

export default BC;
