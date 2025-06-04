// useAdmin.ts
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

type UseAdminResult = {
  isAdmin: boolean;
  loading: boolean;
};

export function useAdmin(): UseAdminResult {
  const [state, setState] = useState<UseAdminResult>({
    isAdmin: false,
    loading: true,
  });

  const logEvent = (event: string, details?: Record<string, unknown>) => {
    console.log(`[useAdmin] ${event}`, details || '');
  };

  const checkAdmin = async () => {
    try {
      setState((prev) => ({ ...prev, loading: true }));

      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user) {
        logEvent('User not authenticated', { error: userError?.message });
        setState({ isAdmin: false, loading: false });
        return;
      }

      const { data, error } = await supabase
        .from('admins')
        .select('user_id')
        .eq('user_id', user.id)
        .single();

      setState({
        isAdmin: !error && !!data,
        loading: false,
      });
    } catch (error) {
      logEvent('Error in admin check', { error });
      setState({ isAdmin: false, loading: false });
    }
  };

  useEffect(() => {
    // Первоначальная проверка
    checkAdmin();

    // Подписка на изменения аутентификации
    const { data: authListener } = supabase.auth.onAuthStateChange((event) => {
      logEvent('Auth state changed', { event });
      checkAdmin();
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  return state;
}
