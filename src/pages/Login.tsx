import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Функция проверки корректного guest_id (UUID)
  const isValidGuestId = (guestId: string | null): guestId is string => {
    if (!guestId) return false;
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(guestId);
  };

  // Функция для миграции гостевой сессии на авторизованную
  const migrateGuestSession = async (guestId: string, userId: string) => {
    try {
      const { error: updateError } = await supabase
        .from('sessions')
        .update({
          user_id: userId,
          guest_id: null,
          is_online: true,
          session_start: new Date().toISOString(),
        })
        .eq('guest_id', guestId);

      if (updateError) throw updateError;
      // После успешной миграции удаляем guest_id из localStorage,
      // чтобы дальнейшие запросы не опирались на некорректное значение
      localStorage.removeItem('guest_id');
    } catch (error) {
      console.error('Session migration error:', error);
    }
  };

  const handleLogin = async () => {
    try {
      setError('');
      const guestId = localStorage.getItem('guest_id');

      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (authError || !data.user) {
        throw authError || new Error('Authentication failed');
      }
      const user = data.user;

      // Если guest_id присутствует и корректен, мигрируем гостевую сессию
      if (isValidGuestId(guestId)) {
        await migrateGuestSession(guestId, user.id);
      }

      // Создаем или обновляем сессию для авторизованного пользователя
      const { error: sessionError } = await supabase
        .from('sessions')
        .upsert(
          {
            user_id: user.id,
            is_online: true,
            session_start: new Date().toISOString(),
            last_activity: new Date().toISOString(),
          },
          { onConflict: 'user_id' }
        );
      if (sessionError) throw sessionError;

      // Здесь можно выполнить редирект или обновить состояние приложения
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
      console.error('Login error:', err);
    }
  };

  return (
    <div className="auth-container">
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      {error && <div className="error-message">{error}</div>}
      <button onClick={handleLogin} className="login-button">
        Login
      </button>
    </div>
  );
};

export default Login;
