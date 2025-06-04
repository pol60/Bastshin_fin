import React, {
  lazy,
  Suspense,
  useEffect,
  useState,
  useRef,
  useCallback,
  useMemo,
  memo,
} from 'react';
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
  Outlet,
  ScrollRestoration,
  useLocation,
} from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AliveScope, KeepAlive } from 'react-activation';
import { supabase } from './lib/supabaseClient';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './index.css';

// Импорт публичных компонентов
import NavBar from './pagesHome/HomeSections/NavBar/NavBar';
import { Home } from './pagesHome/Home';
import { ProductList } from './pages/ProductList';
import CommentsPage from './pages/CommentsPage';
import { Auth } from './pages/Auth';
import { Profile } from './pages/Profile';
import { Checkout } from './pages/Checkout';
import ArticleWindow from './FAKT_Info/ArticleWindow';
import ArticleDetailPage from './FAKT_Info/ArticleDetailPage';
import AuthCallback from './pages/auth/AuthCallback';
import { DetailedSearch } from './pages/DetailedSearch';
import { MiniButton } from './components/ui/MiniButton';
import BC from './BC';

// Импорт для админ-панели
import { AdminLayout } from './pages/admin/AdminLayout';
import { AdminLogin } from './pages/admin/AdminLogin';
import { Dashboard } from './pages/admin/Dashboard';
import { Products } from './pages/admin/Products';
import { ProductCreatePage } from './pages/admin/ProductCreatePage';
import NewArticle from './pages/admin/NewArticle';
import { SessionsPage } from './pages/admin/SessionsPage';
import { AdminRoute } from './middleware/AdminRoute';

const LazyProductDetail = lazy(() => import('./pages/ProductDetail'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 60 * 1000,
    },
  },
});

// Функция debounce для оптимизации обработки событий активности
function debounce<T extends (...args: unknown[]) => void>(func: T, delay: number): T {
  let timeoutId: ReturnType<typeof setTimeout>;
  return function (...args: Parameters<T>) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  } as T;
}

// PublicLayout – layout для публичной части с постоянным NavBar
const PublicLayout: React.FC = () => {
  const location = useLocation();
  const publicPaths = useMemo(
    () => ['/', '/tires', '/wheels', '/search-results', '/detailed-search'],
    []
  );
  return (
    <>
      <NavBar />
      <ScrollRestoration />
      {location.pathname !== "/" && <BC />}
      {publicPaths.some((path) => location.pathname.startsWith(path)) && <MiniButton />}
      <Outlet />
    </>
  );
};

// HomeWrapper оборачивает Home в KeepAlive, чтобы сохранять его состояние
const HomeWrapper = memo(() => (
  <div>
    {/* KeepAlive должен быть внутри AliveScope */}
    <Home />
  </div>
));

// Конфигурация роутинга
const router = createBrowserRouter([
  {
    path: '/',
    element: <PublicLayout />,
    children: [
      { index: true, element: <HomeWrapper /> },
      { path: 'tires', element: <ProductList /> },
      { path: 'wheels', element: <ProductList /> },
      { path: 'search-results', element: <ProductList /> },
      { path: 'detailed-search', element: <DetailedSearch /> },
      {
        path: 'product/:id',
        element: (
          <Suspense fallback={null}>
            <LazyProductDetail />
          </Suspense>
        ),
      },
      { path: 'product/:id/comment', element: <CommentsPage /> },
      { path: 'auth', element: <Auth /> },
      { path: 'profile', element: <Profile /> },
      { path: 'checkout', element: <Checkout /> },
      { path: 'auth/callback', element: <AuthCallback /> },
      { path: 'articles', element: <KeepAlive><ArticleWindow /></KeepAlive> },
      { path: 'articles/:id', element: <ArticleDetailPage /> },
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
  {
    path: '/admin',
    element: (
      <AdminRoute>
        <AdminLayout />
      </AdminRoute>
    ),
    children: [
      { index: true, element: <Dashboard /> },
      { path: 'products', element: <Products /> },
      { path: 'products/new', element: <ProductCreatePage /> },
      { path: 'products/edit/:id', element: <div>Edit Product Page</div> },
      { path: 'sessions', element: <SessionsPage /> },
      { path: 'articles', element: <NewArticle /> },
    ],
  },
  {
    path: '/admin/login',
    element: <AdminLogin />,
  },
]);

// AutoReload – перезагружает страницу через 30 минут бездействия
function AutoReload() {
  useEffect(() => {
    let timer = setTimeout(reloadPage, 30 * 60 * 1000);
    function reloadPage() {
      window.location.reload();
    }
    const resetTimer = () => {
      clearTimeout(timer);
      timer = setTimeout(reloadPage, 30 * 60 * 1000);
    };
    const events = ['mousemove', 'keydown', 'scroll', 'touchstart', 'click'];
    events.forEach((event) => window.addEventListener(event, resetTimer));
    return () => {
      clearTimeout(timer);
      events.forEach((event) => window.removeEventListener(event, resetTimer));
    };
  }, []);
  return null;
}

// Главный компонент App
export default function App() {
  const [isLoaded, setIsLoaded] = useState(false);
  const lastActivityRef = useRef<Date>(new Date());
  const [appState, setAppState] = useState({ someData: 'значение' });

  // Восстановление сохранённого состояния
  useEffect(() => {
    const savedState = localStorage.getItem('savedState');
    if (savedState) {
      try {
        const parsedState = JSON.parse(savedState);
        setAppState(parsedState);
      } catch (error) {
        console.error('Ошибка парсинга сохранённого состояния:', error);
      }
    }
  }, []);

  // Ожидание полной загрузки документа
  useEffect(() => {
    const handleLoad = () => setIsLoaded(true);
    if (document.readyState === 'complete') {
      handleLoad();
    } else {
      window.addEventListener('load', handleLoad);
      return () => window.removeEventListener('load', handleLoad);
    }
  }, []);

  // Инициализация гостевой сессии, если пользователь не авторизован
  const initGuestSession = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      let storedGuestId = localStorage.getItem('guest_id');
      if (!storedGuestId) {
        storedGuestId = crypto.randomUUID();
        localStorage.setItem('guest_id', storedGuestId);
        await supabase.from('sessions').upsert(
          {
            guest_id: storedGuestId,
            last_activity: new Date().toISOString(),
            is_online: true,
          },
          { onConflict: 'guest_id' }
        );
      }
    }
  }, []);

  useEffect(() => {
    initGuestSession();
  }, [initGuestSession]);

  // Обновление статуса сессии
  const updateSessionStatus = useCallback(async (isOnline: boolean) => {
    const { data: { user } } = await supabase.auth.getUser();
    const currentGuestId = localStorage.getItem('guest_id');
    const updateData = {
      last_activity: new Date().toISOString(),
      is_online: isOnline,
    };
    try {
      if (user) {
        await supabase.from('sessions').update(updateData).eq('user_id', user.id);
      } else if (currentGuestId) {
        await supabase.from('sessions').upsert(
          { ...updateData, guest_id: currentGuestId },
          { onConflict: 'guest_id' }
        );
      }
    } catch (error) {
      console.error('Session update error:', error);
    }
  }, []);

  // Обработка активности пользователя с использованием debounce
  const handleActivity = useCallback(
    debounce(() => {
      lastActivityRef.current = new Date();
      updateSessionStatus(true);
    }, 5000),
    [updateSessionStatus]
  );

  useEffect(() => {
    const events: (keyof WindowEventMap)[] = ['mousemove', 'keydown', 'scroll', 'touchstart', 'click'];
    events.forEach((e) => window.addEventListener(e, handleActivity));
    return () => events.forEach((e) => window.removeEventListener(e, handleActivity));
  }, [handleActivity]);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      if (now.getTime() - lastActivityRef.current.getTime() > 25000) {
        updateSessionStatus(false);
      }
    }, 25000);
    return () => clearInterval(interval);
  }, [updateSessionStatus]);

  // Сохранение состояния и обновление сессии перед уходом со страницы
  useEffect(() => {
    const handleBeforeUnload = () => {
      updateSessionStatus(false);
      localStorage.setItem('savedState', JSON.stringify(appState));
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      updateSessionStatus(false);
    };
  }, [updateSessionStatus, appState]);

  if (!isLoaded) return null;

  return (
    <QueryClientProvider client={queryClient}>
      <AutoReload />
      {/* AliveScope обеспечивает работу KeepAlive */}
      <AliveScope>
        <div data-router>
          <RouterProvider router={router} />
        </div>
      </AliveScope>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </QueryClientProvider>
  );
}
