import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Users,
  ShoppingBag,
  BarChart,
  Settings,
  LogOut,
  Menu,
  FileText, // Импортируем иконку для статьи
} from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';
import Modal from 'react-modal';
import { toast } from 'react-toastify';

Modal.setAppElement('#root');

interface NavItem {
  to: string;
  icon: JSX.Element;
  text: string;
}

export interface Session {
  id: string;
  user_id?: string;
  guest_id?: string;
  last_activity: string;
  is_online: boolean;
}

export const AdminLayout: React.FC = () => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoadingSessions, setIsLoadingSessions] = useState(true);
  const [sessionsError, setSessionsError] = useState('');
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Добавляем новый пункт «Статті» в массив навигации
  const navItems = useMemo<NavItem[]>(() => [
    { to: '/admin', icon: <LayoutDashboard />, text: 'Панель' },
    { to: '/admin/products', icon: <Package />, text: 'Товари' },
    { to: '/admin/orders', icon: <ShoppingBag />, text: 'Замовлення' },
    { to: '/admin/sessions', icon: <Users />, text: 'Сесії' },
    { to: '/admin/analytics', icon: <BarChart />, text: 'Аналітика' },
    { to: '/admin/settings', icon: <Settings />, text: 'Налаштування' },
    { to: '/admin/articles', icon: <FileText />, text: 'Статті' },
  ], []);

  const refreshSessions = useCallback(async () => {
    try {
      setIsLoadingSessions(true);
      const { data, error } = await supabase
        .from('sessions')
        .select('*')
        .order('last_activity', { ascending: false });
      if (error) throw error;
      setSessions(data || []);
      setSessionsError('');
    } catch (error) {
      setSessionsError('Не удалось загрузить данные сессий');
      console.error('Ошибка загрузки сессий:', error);
      toast.error('Ошибка загрузки данных сессий');
    } finally {
      setIsLoadingSessions(false);
    }
  }, []);

  // Генерация guest_id с использованием валидного UUID
  const generateGuestId = () => {
    return crypto.randomUUID();
  };

  // Функция обновления сессии до гостевой без создания новой записи.
  // Если уже существует session_id, то обновляем соответствующую запись.
  const updateSessionToGuest = async () => {
    try {
      const storedSessionId = localStorage.getItem('session_id');
      const now = new Date().toISOString();
      if (storedSessionId) {
        let guestId = localStorage.getItem('guest_id');
        if (!guestId) {
          guestId = generateGuestId();
          localStorage.setItem('guest_id', guestId);
        }
        const updatedSession = {
          user_id: null,
          guest_id: guestId,
          last_activity: now,
          is_online: true,
        };
        const { data, error } = await supabase
          .from('sessions')
          .update(updatedSession)
          .eq('id', storedSessionId)
          .select();
        if (error) {
          console.error('Ошибка обновления сессии до гостевой:', error);
          toast.error(`Ошибка обновления сессии: ${error.message}`);
          throw error;
        }
        console.log('Сессия успешно обновлена до гостевой:', data);
        return data;
      } else {
        // Если session_id отсутствует, создаём новую гостевую сессию
        const guestId = generateGuestId();
        const newSession = {
          user_id: null,
          guest_id: guestId,
          last_activity: new Date().toISOString(),
          is_online: true,
        };
        const { data, error } = await supabase
          .from('sessions')
          .insert(newSession)
          .select();
        if (error) {
          console.error('Ошибка создания гостевой сессии:', error);
          toast.error(`Ошибка гостевой сессии: ${error.message}`);
          throw error;
        }
        console.log('Гостевая сессия успешно создана:', data);
        if (data && data.length > 0) {
          localStorage.setItem('session_id', data[0].id);
          localStorage.setItem('guest_id', guestId);
        }
        return data;
      }
    } catch (err) {
      console.error('Ошибка в updateSessionToGuest:', err);
      toast.error('Не удалось обновить сессию до гостевой');
      return null;
    }
  };

  // Функция создания или обновления сессии с учетом миграции гостевой сессии.
  // Если пользователь авторизован, выполняется миграция гостевой сессии (если она есть) и upsert сессии.
  const createSession = async () => {
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) {
        console.error('Ошибка получения пользователя:', userError);
        throw userError;
      }
      const user = userData?.user;
      const now = new Date().toISOString();

      if (user) {
        // Пользователь авторизован
        const guestId = localStorage.getItem('guest_id');
        if (guestId) {
          const { data: migratedId, error: migrateError } = await supabase.rpc('migrate_guest_data', {
            p_guest_id: guestId,
            p_user_id: user.id,
          });
          if (migrateError) {
            // Если ошибка связана с дублированием, удаляем guest_id чтобы не повторять миграцию
            if (migrateError.message.includes("duplicate key value violates unique constraint")) {
              localStorage.removeItem('guest_id');
            } else {
              console.error('Ошибка миграции:', migrateError);
              toast.error(`Ошибка миграции: ${migrateError.message}`);
            }
          } else if (migratedId) {
            toast.success('Данные гостя успешно перенесены');
            localStorage.removeItem('guest_id');
            localStorage.setItem('session_id', migratedId as string);
            // Показываем уведомление об успешной авторизации, только если ранее не показывали
            if (!localStorage.getItem('loggedInToastShown')) {
              toast.success('Вы успешно авторизовались');
              localStorage.setItem('loggedInToastShown', 'true');
            }
            return migratedId;
          }
        }
        // Выполняем upsert для авторизованного пользователя
        const newSession = {
          user_id: user.id,
          guest_id: null,
          last_activity: now,
          is_online: true,
        };
        const { data, error } = await supabase
          .from('sessions')
          .upsert(newSession, { onConflict: 'user_id' })
          .select();
        if (error) {
          console.error('Ошибка создания/обновления сессии:', error);
          toast.error(`Ошибка сессии: ${error.message}`);
          throw error;
        }
        console.log('Сессия успешно создана/обновлена:', data);
        if (data && data.length > 0) {
          localStorage.setItem('session_id', data[0].id);
        }
        if (!localStorage.getItem('loggedInToastShown')) {
          toast.success('Вы успешно авторизовались');
          localStorage.setItem('loggedInToastShown', 'true');
        }
        return data;
      } else {
        // Пользователь не авторизован: обновляем или создаем гостевую сессию
        return await updateSessionToGuest();
      }
    } catch (err) {
      console.error('Ошибка в createSession:', err);
      toast.error('Не удалось создать сессию');
      return null;
    }
  };

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      try {
        if (isMounted) {
          await createSession();
          await refreshSessions();
        }
      } catch (err) {
        console.error('Ошибка в fetchData:', err);
        if (isMounted) {
          setSessionsError('Не удалось загрузить или создать сессию');
        }
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [refreshSessions]);

  const sessionStats = useMemo(() => ({
    total: sessions.length,
    active: sessions.reduce((acc, s) => s.is_online ? acc + 1 : acc, 0),
    guests: sessions.reduce((acc, s) => s.guest_id ? acc + 1 : acc, 0),
    users: sessions.reduce((acc, s) => s.user_id ? acc + 1 : acc, 0)
  }), [sessions]);

  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
      setIsSidebarOpen(false);
    }
  }, []);

  useEffect(() => {
    if (isSidebarOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isSidebarOpen, handleClickOutside]);

  // При выходе обновляем сессию до гостевой и сбрасываем флаг авторизации
  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await updateSessionToGuest();
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      localStorage.removeItem('sb-auth-token');
      sessionStorage.removeItem('sb-session');
      // Сбрасываем флаг, чтобы при повторной авторизации уведомление показывалось
      localStorage.removeItem('loggedInToastShown');
      navigate('/', { replace: true });
      toast.success('Выход выполнен успешно');
    } catch (_error) {
      toast.error('Ошибка при выходе. Пожалуйста, попробуйте снова.');
    } finally {
      setIsLoggingOut(false);
      setIsLogoutModalOpen(false);
    }
  };

  const sidebarVariants = {
    open: { x: 0 },
    closed: { x: '-100%' },
  };

  const renderNavLink = useCallback(({ to, icon, text }: NavItem) => (
    <NavLink
      key={to}
      to={to}
      onClick={() => setIsSidebarOpen(false)}
      className={({ isActive }) =>
        `flex items-center px-4 py-2 rounded-lg transition-colors 
         ${isActive ? 'bg-blue-800 text-white' : 'text-gray-300 hover:bg-blue-800 hover:text-white'}`
      }
    >
      {React.cloneElement(icon, { className: 'w-5 h-5 mr-3' })}
      {text}
    </NavLink>
  ), []);

  return (
    <div className="min-h-screen bg-gray-100 relative overflow-hidden">
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="absolute top-4 right-4 p-2 bg-blue-900 text-white rounded-lg z-50 lg:hidden"
        aria-label="Меню"
      >
        <Menu className="w-6 h-6" />
      </button>

      <div className="flex relative">
        <motion.div
          ref={sidebarRef}
          className="hidden lg:block w-64 bg-blue-900 min-h-screen p-4 z-40"
          initial="open"
          animate="open"
        >
          <div className="text-white font-bold text-xl mb-8 mt-16">SHINAGO Admin</div>
          <nav className="space-y-2">
            {navItems.map(renderNavLink)}
            <div className="px-4 py-2 space-y-2 text-gray-300">
              {isLoadingSessions ? (
                <div className="animate-pulse flex space-x-4">
                  <div className="flex-1 space-y-2 py-1">
                    <div className="h-4 bg-blue-800 rounded"></div>
                    <div className="h-4 bg-blue-800 rounded"></div>
                  </div>
                </div>
              ) : sessionsError ? (
                <div className="text-red-300 text-sm">{sessionsError}</div>
              ) : (
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className={`p-2 rounded ${sessionStats.active > 0 ? 'bg-green-500' : 'bg-gray-500'} text-white`}>
                    Активных: {sessionStats.active}
                  </div>
                  <div className="p-2 rounded bg-blue-500 text-white">
                    Всего: {sessionStats.total}
                  </div>
                  <div className="p-2 rounded bg-purple-500 text-white">
                    Гостей: {sessionStats.guests}
                  </div>
                  <div className="p-2 rounded bg-orange-500 text-white">
                    Пользователей: {sessionStats.users}
                  </div>
                </div>
              )}
            </div>
            <button
              onClick={() => setIsLogoutModalOpen(true)}
              className="flex items-center text-gray-300 hover:text-white hover:bg-blue-800 px-4 py-2 rounded-lg w-full transition-colors"
            >
              <LogOut className="w-5 h-5 mr-3" />
              Вийти
            </button>
          </nav>
        </motion.div>

        <AnimatePresence>
          {isSidebarOpen && (
            <motion.div
              ref={sidebarRef}
              variants={sidebarVariants}
              initial="closed"
              animate="open"
              exit="closed"
              className="fixed lg:hidden w-64 bg-blue-900 min-h-screen p-4 z-40"
            >
              <div className="text-white font-bold text-xl mb-8 mt-16">SHINAGO Admin</div>
              <nav className="space-y-2">
                {navItems.map(renderNavLink)}
                <button
                  onClick={() => setIsLogoutModalOpen(true)}
                  className="flex items-center text-gray-300 hover:text-white hover:bg-blue-800 px-4 py-2 rounded-lg w-full transition-colors"
                >
                  <LogOut className="w-5 h-5 mr-3" />
                  Вийти
                </button>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex-1 p-8 mt-16">
          {sessionsError ? (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg">
              {sessionsError}
            </div>
          ) : (
            <Outlet context={{ sessions, refreshSessions, isLoading: isLoadingSessions }} />
          )}
        </div>
      </div>

      <Modal
        isOpen={isLogoutModalOpen}
        onRequestClose={() => setIsLogoutModalOpen(false)}
        shouldCloseOnOverlayClick={true}
        className="modal"
        overlayClassName="modal-overlay"
        ariaHideApp={true}
        contentLabel="Підтвердження виходу"
      >
        <h2 className="text-xl font-bold mb-4">Ви впевнені, що хочете вийти?</h2>
        <div className="flex justify-end space-x-4">
          <button
            onClick={() => setIsLogoutModalOpen(false)}
            className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400 transition-colors"
          >
            Скасувати
          </button>
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="px-4 py-2 bg-red-500 text-white rounded-lg flex items-center gap-2 hover:bg-red-600 transition-colors"
          >
            {isLoggingOut && (
              <div className="w-4 h-4 border-2 border-white rounded-full animate-spin" />
            )}
            {isLoggingOut ? 'Выход...' : 'Вийти'}
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default AdminLayout;
