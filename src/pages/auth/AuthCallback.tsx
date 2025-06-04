import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { toast } from 'react-toastify';

const AuthCallback: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAccessToken = async () => {
      try {
        const code = new URLSearchParams(window.location.search).get('code');
        if (!code) {
          navigate('/login');
          return;
        }

        // Получение access token
        const response = await fetch(import.meta.env.VITE_SUPABASE_AUTH_CALLBACK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code }),
        });

        if (!response.ok) throw new Error('Ошибка при получении токена');
        
        const data = await response.json();
        
        // Аутентификация через Supabase
        const { data: { user }, error: authError } = await supabase.auth.signInWithIdToken({
          provider: 'google',
          token: data.access_token,
        });

        if (authError) throw new Error(authError.message);
        if (!user) throw new Error('Пользователь не найден');

        // Миграция гостевых данных
        const guestId = localStorage.getItem('guest_id');
        if (guestId) {
          const { error: migrateError } = await supabase.rpc('migrate_guest_data', {
            guest_id: guestId,
            user_id: user.id,
          });

          if (migrateError) {
            console.error('Ошибка миграции гостевых данных:', migrateError);
            toast.warning('Не удалось перенести гостевые данные');
          } else {
            toast.success('Данные гостя успешно перенесены');
            localStorage.removeItem('guest_id');
          }
        }

        toast.success('Успешная аутентификация!');
        navigate('/admin');

      } catch (error) {
        const message = error instanceof Error ? error.message : 'Неизвестная ошибка';
        console.error('Ошибка аутентификации:', error);
        toast.error(`Ошибка аутентификации: ${message}`);
        navigate('/login');
      }
    };

    fetchAccessToken();
  }, [navigate]);

  return (
    <div className="auth-callback-container">
      <div className="spinner"></div>
    </div>
  );
};

export default AuthCallback;