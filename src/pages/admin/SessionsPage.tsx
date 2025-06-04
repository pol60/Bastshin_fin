import { useOutletContext } from 'react-router-dom';
import { Session } from './AdminLayout';
import { useState, useMemo, useCallback } from 'react';
import { ArrowDownAZ, ArrowUpZA, Clock, RefreshCw, Trash2, UserX } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { toast } from 'react-toastify';

export const SessionsPage = () => {
  const { sessions, refreshSessions } = useOutletContext<{ 
    sessions: Session[];
    refreshSessions: () => Promise<void>;
  }>();

  const [sortConfig, setSortConfig] = useState<{ 
    key: 'user_id' | 'guest_id' | 'last_activity' | 'is_online'; 
    direction: 'asc' | 'desc' 
  }>({
    key: 'last_activity',
    direction: 'desc'
  });

  const sortedSessions = useMemo(() => {
    return [...sessions].sort((a, b) => {
      switch (sortConfig.key) {
        case 'last_activity': {
          const aDate = new Date(a.last_activity).getTime();
          const bDate = new Date(b.last_activity).getTime();
          return sortConfig.direction === 'asc' ? aDate - bDate : bDate - aDate;
        }
        case 'user_id':
        case 'guest_id': {
          const aValue = a[sortConfig.key] || '';
          const bValue = b[sortConfig.key] || '';
          return sortConfig.direction === 'asc'
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }
        case 'is_online': {
          return sortConfig.direction === 'asc'
            ? Number(a.is_online) - Number(b.is_online)
            : Number(b.is_online) - Number(a.is_online);
        }
        default:
          return 0;
      }
    });
  }, [sessions, sortConfig]);

  // Функция проверки прав администратора
  const isAdmin = async (): Promise<boolean> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error('Пользователь не найден');
      return false;
    }
    const { data: adminData, error: adminError } = await supabase
      .from('admins')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (adminError || !adminData) {
      toast.error('Недостаточно прав для удаления');
      return false;
    }
    return true;
  };

  const deleteSession = async (sessionId: string) => {
    if (!(await isAdmin())) return;

    try {
      const { error } = await supabase
        .from('sessions')
        .delete()
        .eq('id', sessionId);

      if (error) throw error;
      
      await refreshSessions();
      toast.success('Сессия успешно удалена');
    } catch (error) {
      toast.error('Ошибка при удалении сессии');
      console.error('Delete error:', error);
    }
  };

  const deleteInactiveSessions = async () => {
    if (!(await isAdmin())) return;

    try {
      const { error } = await supabase
        .from('sessions')
        .delete()
        .eq('is_online', false);

      if (error) throw error;
      
      await refreshSessions();
      toast.success(`Удалено ${sessions.filter(s => !s.is_online).length} неактивных сессий`);
    } catch (error) {
      toast.error('Ошибка при удалении сессий');
      console.error('Delete inactive error:', error);
    }
  };

  const getSessionDuration = useCallback((session: Session) => {
    const start = new Date(session.last_activity).getTime();
    const now = Date.now();
    const diff = now - start;
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}ч ${minutes}м`;
  }, []);

  const handleSort = (key: typeof sortConfig.key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 md:p-6 mx-2 md:mx-0 h-[calc(100vh-160px)] md:h-auto">
      <div className="flex flex-wrap gap-3 items-center justify-between mb-4 md:mb-6">
        <h2 className="text-xl md:text-2xl font-bold text-foreground">
          Активные сессии ({sessions.length})
        </h2>
        
        <div className="flex gap-2">
          <button
            onClick={deleteInactiveSessions}
            className="p-2 hover:bg-red-50 rounded-lg transition-colors text-red-600"
            title="Удалить все неактивные сессии"
          >
            <UserX className="w-5 h-5" />
          </button>
          
          <button 
            onClick={refreshSessions}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
            aria-label="Обновить данные"
          >
            <RefreshCw className="w-5 h-5 text-primary" />
          </button>
        </div>
      </div>

      <div className="md:hidden space-y-3 overflow-y-auto h-[calc(100%-60px)]">
        {sortedSessions.map((session) => (
          <div key={session.id} className="border-b pb-3 animate-fadeIn">
            <div className="flex justify-between items-start">
              <div>
                <div className="font-medium text-sm text-foreground">
                  {session.user_id ? 'Пользователь' : 'Гость'}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  ID: {session.user_id || session.guest_id?.slice(0, 8)}
                </div>
              </div>
              <div className="flex gap-2 items-center">
                <span className={`px-2 py-1 rounded-full text-xs ${
                  session.is_online 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {session.is_online ? 'Онлайн' : 'Офлайн'}
                </span>
                <button 
                  onClick={() => deleteSession(session.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            
            <div className="mt-2 flex items-center justify-between">
              <div className="flex items-center gap-1 text-muted-foreground">
                <Clock className="w-3 h-3" />
                <span className="text-xs">{getSessionDuration(session)}</span>
              </div>
              <span className="text-xs text-muted-foreground">
                {new Date(session.last_activity).toLocaleTimeString()}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="hidden md:block overflow-x-auto max-h-[70vh]">
        <table className="w-full">
          <thead className="sticky top-0 bg-background">
            <tr className="border-b">
              <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Действия</th>
              <th 
                className="px-4 py-3 text-left text-sm font-medium text-foreground cursor-pointer"
                onClick={() => handleSort('user_id')}
              >
                <div className="flex items-center gap-2">
                  ID
                  {sortConfig.key === 'user_id' && (
                    sortConfig.direction === 'asc' 
                      ? <ArrowDownAZ size={14} className="text-primary" /> 
                      : <ArrowUpZA size={14} className="text-primary" />
                  )}
                </div>
              </th>
              <th 
                className="px-4 py-3 text-left text-sm font-medium text-foreground cursor-pointer"
                onClick={() => handleSort('is_online')}
              >
                Статус
              </th>
              <th 
                className="px-4 py-3 text-left text-sm font-medium text-foreground cursor-pointer"
                onClick={() => handleSort('last_activity')}
              >
                <div className="flex items-center gap-2">
                  Последняя активность
                  {sortConfig.key === 'last_activity' && (
                    sortConfig.direction === 'asc' 
                      ? <ArrowDownAZ size={14} className="text-primary" /> 
                      : <ArrowUpZA size={14} className="text-primary" />
                  )}
                </div>
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-foreground">
                Время активности
              </th>
            </tr>
          </thead>
          
          <tbody>
            {sortedSessions.map((session) => (
              <tr key={session.id} className="border-b hover:bg-muted/50 transition-colors">
                <td className="px-4 py-3">
                  <button 
                    onClick={() => deleteSession(session.id)}
                    className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
                <td className="px-4 py-3 text-sm text-foreground font-mono">
                  {session.user_id || session.guest_id}
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-sm ${
                    session.is_online 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {session.is_online ? 'Онлайн' : 'Офлайн'}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-foreground">
                  {new Date(session.last_activity).toLocaleString()}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>{getSessionDuration(session)}</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {sortedSessions.length === 0 && (
        <div className="text-center py-6 text-muted-foreground text-sm md:text-base">
          Нет активных сессий
        </div>
      )}
    </div>
  );
};
