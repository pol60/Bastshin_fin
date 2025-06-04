// frontend/src/lib/settings.ts

import { supabase } from './supabaseClient';

// Определите тип для значений настроек
type SettingValue = string | number | boolean | object | null;

// Кэш для хранения настроек
const settingsCache = new Map<string, SettingValue>();

/**
 * Получение значения настройки по ключу.
 * @param key Ключ настройки.
 * @returns Значение настройки или null, если настройка не найдена.
 */
export async function getSetting(key: string): Promise<SettingValue> {
  // Проверка кэша
  if (settingsCache.has(key)) {
    return settingsCache.get(key) as SettingValue; // Приведение типа
  }

  try {
    const { data, error } = await supabase
      .from('store_settings')
      .select('value')
      .eq('key', key)
      .single();

    if (error) throw error;

    // Сохранение в кэш
    settingsCache.set(key, data?.value);
    return data?.value;
  } catch (error) {
    console.error(`Error getting setting ${key}:`, error);
    return null;
  }
}

/**
 * Установка или обновление значения настройки.
 * @param key Ключ настройки.
 * @param value Значение настройки.
 * @returns true, если операция успешна, иначе false.
 */
export async function setSetting(key: string, value: SettingValue): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('store_settings')
      .upsert({ key, value })
      .select()
      .single();

    if (error) throw error;

    // Обновление кэша
    settingsCache.set(key, value);
    return true;
  } catch (error) {
    console.error(`Error setting ${key}:`, error);
    return false;
  }
}

/**
 * Обновление значения настройки (аналогично setSetting).
 * @param key Ключ настройки.
 * @param value Значение настройки.
 * @returns true, если операция успешна, иначе false.
 */
export const updateSettings = async (key: string, value: SettingValue): Promise<boolean> => {
  return setSetting(key, value); // Используем setSetting для обновления
};

/**
 * Удаление настройки по ключу.
 * @param key Ключ настройки.
 * @returns true, если операция успешна, иначе false.
 */
export async function deleteSetting(key: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('store_settings')
      .delete()
      .eq('key', key);

    if (error) throw error;

    // Удаление из кэша
    settingsCache.delete(key);
    return true;
  } catch (error) {
    console.error(`Error deleting setting ${key}:`, error);
    return false;
  }
}

// Конфигурация Google OAuth
export const GOOGLE_SCOPES = [
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile',
];

export const GOOGLE_AUTH_URI = 'https://accounts.google.com/o/oauth2/auth';
export const GOOGLE_TOKEN_URI = 'https://accounts.google.com/o/oauth2/token';
export const GOOGLE_USER_INFO_URI = 'https://www.googleapis.com/oauth2/v1/userinfo';

// Использование переменных окружения для конфиденциальных данных
export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID';
export const GOOGLE_CLIENT_SECRET = import.meta.env.VITE_GOOGLE_CLIENT_SECRET || 'YOUR_GOOGLE_CLIENT_SECRET';
export const GOOGLE_REDIRECT_URI = import.meta.env.VITE_GOOGLE_REDIRECT_URI || 'https://xfaifnwoslflqswcmmiv.supabase.co/auth/v1/callback';