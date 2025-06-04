import { supabase } from '../lib/supabaseClient';
import { useEffect } from 'react';

const Logout = () => {
  const handleSessionClose = async (userId?: string, guestId?: string) => {
    try {
      if (userId) {
        await supabase
          .from('sessions')
          .update({ 
            is_online: false,
            last_activity: new Date().toISOString()
          })
          .eq('user_id', userId);
      } else if (guestId) {
        await supabase
          .from('sessions')
          .update({ 
            is_online: false,
            last_activity: new Date().toISOString()
          })
          .eq('guest_id', guestId);
      }
    } catch (error) {
      console.error('Session close error:', error);
    }
  };

  const handleLogout = async () => {
    const guestId = localStorage.getItem('guest_id');
    const { data: { user } } = await supabase.auth.getUser();

    try {
      await handleSessionClose(user?.id, guestId || undefined);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      await supabase.auth.signOut();
      if (guestId) {
        localStorage.removeItem('guest_id');
        // Для полной очистки гостевых данных
        await supabase
          .from('sessions')
          .delete()
          .eq('guest_id', guestId);
      }
    }
  };

  // Обработчик при размонтировании компонента
  useEffect(() => {
    return () => {
      const guestId = localStorage.getItem('guest_id');
      handleSessionClose(undefined, guestId || undefined);
    };
  }, []);

  return <button onClick={handleLogout}>Logout</button>;
};

export default Logout;