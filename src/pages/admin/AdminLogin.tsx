import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { motion } from 'framer-motion';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface WeatherData {
  temp: number;
  description: string;
  icon: string;
  city: string;
}

const Clock: React.FC = React.memo(() => {
  const [time, setTime] = useState(new Date());
  
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="text-center">
      <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-cyan-500">
        {time.toLocaleTimeString()}
      </div>
      <div className="mt-2 text-xs sm:text-sm text-gray-500">
        {time.toLocaleDateString()}
      </div>
    </div>
  );
});

export const AdminLogin: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(true);
  const navigate = useNavigate();

  const showErrorToast = (message: string) => {
    toast.error(message, {
      position: 'top-center',
      autoClose: 5000,
      hideProgressBar: true,
      closeOnClick: true,
      theme: 'colored',
      className: 'bg-red-800 text-white'
    });
  };

  const requestLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          getWeather(position.coords.latitude, position.coords.longitude);
        },
        (error) => {
          let errorMessage = 'Ошибка получения местоположения: ';
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage += 'Доступ к геолокации запрещен';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage += 'Информация о местоположении недоступна';
              break;
            case error.TIMEOUT:
              errorMessage += 'Превышено время ожидания';
              break;
            default:
              errorMessage += 'Неизвестная ошибка';
          }
          showErrorToast(errorMessage);
          setWeatherLoading(false);
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    } else {
      showErrorToast('Ваш браузер не поддерживает геолокацию');
      setWeatherLoading(false);
    }
  };

  const getWeather = async (latitude: number, longitude: number) => {
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=695605c4006a81a3e07c2f064ba1f851&units=metric&lang=ru`
      );
      
      if (!response.ok) {
        throw new Error('Ошибка получения данных о погоде');
      }
      
      const data = await response.json();
      setWeather({
        temp: Math.round(data.main.temp),
        description: data.weather[0].description,
        icon: data.weather[0].icon,
        city: data.name
      });
    } catch (_error) {
      showErrorToast('Не удалось получить данные о погоде');
    } finally {
      setWeatherLoading(false);
    }
  };

  useEffect(() => {
    requestLocation();
  }, []);

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin + '/admin',
        },
      });

      if (error) throw error;
      navigate('/admin');
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Произошла неизвестная ошибка';
      showErrorToast(`Ошибка авторизации: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-gray-900 overflow-hidden">
      <ToastContainer />
      
      <div className="absolute inset-0 bg-gray-800 opacity-20" />

      <div className="relative z-10 flex min-h-screen items-center justify-center p-4">
        <motion.div
          className="w-full max-w-md space-y-6 rounded-2xl border border-gray-800 bg-gray-900/80 p-4 sm:p-6 md:p-8 backdrop-blur-xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Clock />
          
          <div className="mt-4 rounded-lg bg-gray-800/50 p-3 sm:p-4">
            {weatherLoading ? (
              <div className="text-gray-400">Получение погоды...</div>
            ) : weather ? (
              <div className="flex items-center justify-center gap-2 sm:gap-4">
                <img
                  src={`https://openweathermap.org/img/wn/${weather.icon}@2x.png`}
                  alt="Погода"
                  className="h-10 w-10 sm:h-12 sm:w-12"
                />
                <div className="text-left">
                  <div className="text-base sm:text-lg font-semibold text-white">
                    {weather.temp}°C
                  </div>
                  <div className="text-xs sm:text-sm text-gray-400">
                    {weather.city}
                  </div>
                  <div className="text-xs text-gray-500">
                    {weather.description}
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          <div className="text-center">
            <div className="mx-auto mb-4 grid h-12 w-12 sm:h-16 sm:w-16 place-items-center rounded-full bg-cyan-500/10">
              <svg
                className="h-6 w-6 sm:h-8 sm:w-8 text-cyan-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white">
              Система управления
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-gray-400">
              Авторизация администратора
            </p>
          </div>

          <motion.button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="group relative mt-6 sm:mt-8 flex w-full items-center justify-center gap-3 overflow-hidden rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 p-1 text-white transition-all hover:from-cyan-600 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-70"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <span className="flex w-full items-center justify-center gap-3 rounded-md bg-gray-900 px-4 sm:px-5 py-2.5 sm:py-3 transition-all group-hover:bg-transparent">
              <svg className="h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.24 10.285V14.4h6.806c-.275 1.765-2.056 5.174-6.806 5.174-4.095 0-7.439-3.389-7.439-7.574s3.345-7.574 7.439-7.574c2.33 0 3.891.989 4.785 1.849l3.254-3.138C18.189 1.186 15.479 0 12.24 0c-6.635 0-12 5.365-12 12s5.365 12 12 12c6.926 0 11.52-4.869 11.52-11.726 0-.788-.085-1.39-.189-1.989H12.24z"/>
              </svg>
              <span className="text-xs sm:text-sm font-medium">
                {loading ? 'Подключение...' : 'Войти через Google'}
              </span>
            </span>
          </motion.button>

          <div className="pt-4">
            <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
              <svg
                className="h-3 w-3 sm:h-4 sm:w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
              <span className="text-xs">Защищенное соединение</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};