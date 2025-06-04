import React, { useState, useEffect } from 'react';
import { useAdmin } from '../../hooks/useAdmin';
import { trackEvent } from '../../lib/analytics';
import { supabase } from '../../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

interface DashboardStats {
  total_orders: number;
  total_revenue: number;
  products_count: number;
}

interface SessionUser {
  email?: string;
  is_admin?: boolean;
}

interface UserSession {
  id: string;
  user_id: string | null;
  guest_id: string | null;
  session_start: string;
  last_activity: string;
  is_online: boolean;
  user: SessionUser | null;
}

export const Dashboard: React.FC = () => {
  const { isAdmin, loading: adminLoading } = useAdmin();
  const [stats, setStats] = useState<DashboardStats>({
    total_orders: 0,
    total_revenue: 0,
    products_count: 0,
  });
  const [activeSessions, setActiveSessions] = useState<UserSession[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const navigate = useNavigate();

  const registeredUsers = activeSessions.filter(s => s.user_id);
  const guests = activeSessions.filter(s => s.guest_id && !s.user_id);

  useEffect(() => {
    if (!isAdmin && !adminLoading) navigate('/');
  }, [isAdmin, adminLoading, navigate]);

  useEffect(() => {
    if (!isAdmin || adminLoading) return;

    const initializeDashboard = async () => {
      await fetchDashboardStats();
      trackEvent('admin_dashboard_view');
      const realtimeCleanup = setupRealtimeSessions();
      const interval = setInterval(updateSessionsList, 5000);
      return () => {
        realtimeCleanup();
        clearInterval(interval);
      };
    };

    initializeDashboard().catch(err => {
      toast.error(`Ошибка инициализации: ${err.message}`);
    });
  }, [isAdmin, adminLoading]);

  const fetchDashboardStats = async () => {
    try {
      setDataLoading(true);
      const { data, error } = await supabase.rpc('get_dashboard_stats');
      if (error) throw error;
      setStats(data as DashboardStats);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Неизвестная ошибка';
      toast.error(`Ошибка загрузки статистики: ${msg}`);
      trackEvent('dashboard_stats_error', { error: msg });
    } finally {
      setDataLoading(false);
    }
  };

  const setupRealtimeSessions = () => {
    const channel = supabase
      .channel('sessions_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'sessions' }, () => updateSessionsList())
      .subscribe();
    return () => supabase.removeChannel(channel);
  };

  const updateSessionsList = async () => {
    try {
      const since = new Date(Date.now() - 25000).toISOString();
      const { data, error } = await supabase
        .from('sessions')
        .select(`
          id,
          user_id,
          guest_id,
          session_start,
          last_activity,
          is_online,
          user:user_id (email, is_admin)
        `)
        .gte('last_activity', since)
        .order('last_activity', { ascending: false });

      if (error) throw error;
      const sessions = (data || []).map(s => ({
        id: s.id,
        user_id: s.user_id,
        guest_id: s.guest_id,
        session_start: s.session_start,
        last_activity: s.last_activity,
        is_online: s.is_online,
        user: Array.isArray(s.user) ? s.user[0] : s.user,
      })) as UserSession[];
      setActiveSessions(sessions);
    } catch (err) {
      console.error('Ошибка загрузки сессий:', err);
      toast.error('Ошибка обновления списка сессий');
      setActiveSessions([]);
    }
  };

  if (adminLoading || dataLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-gray-600">Загрузка данных...</div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold text-red-600">Несанкционированный доступ</h1>
        <p className="mt-2 text-gray-600">У вас нет прав для просмотра этой страницы.</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 fade-in">
      <h1 className="text-xl sm:text-2xl font-bold mb-6 sm:mb-8">Панель управления</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-2">
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-xs text-gray-500">Всего заказов</p>
            <p className="text-2xl font-bold text-blue-600">{stats.total_orders}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-xs text-gray-500">Общий доход</p>
            <p className="text-2xl font-bold text-green-600">₴{stats.total_revenue}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-xs text-gray-500">Товаров в каталоге</p>
            <p className="text-2xl font-bold text-orange-600">{stats.products_count}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-bold mb-4">Активные сессии ({activeSessions.length})</h2>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {registeredUsers.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-600">Зарегистрированные пользователи ({registeredUsers.length})</h3>
                {registeredUsers.map(session => <SessionItem key={session.id} session={session} />)}
              </div>
            )}
            {guests.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-600">Гостевые сессии ({guests.length})</h3>
                {guests.map(session => <SessionItem key={session.id} session={session} />)}
              </div>
            )}
            {activeSessions.length === 0 && <p className="text-center text-gray-500 py-4">Нет активных сессий</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

const SessionItem: React.FC<{ session: UserSession }> = ({ session }) => (
  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg mb-2">
    <div>
      <p className="text-sm font-medium">{session.user?.email || `Гость (${session.guest_id?.slice(0, 8)})`}</p>
      <p className="text-xs text-gray-500">Последняя активность: {new Date(session.last_activity).toLocaleTimeString()}</p>
    </div>
    <div className="flex items-center gap-2">
      <div className={`w-3 h-3 rounded-full ${session.is_online ? 'bg-green-500' : 'bg-gray-400'}`} />
      <span className={`px-2 py-1 text-xs rounded-full ${
        session.user?.is_admin ? 'bg-blue-100 text-blue-800' : session.user_id ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
      }`}>
        {session.user?.is_admin ? 'Админ' : session.user_id ? 'Пользователь' : 'Гость'}
      </span>
    </div>
  </div>
);
