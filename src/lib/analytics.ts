import { supabase } from './supabaseClient';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Логирование событий в Supabase
export async function trackEvent(eventName: string, eventData: Record<string, unknown> = {}) {
  try {
    const { error } = await supabase.rpc('track_event', {
      event_name: eventName,
      event_data: JSON.stringify(eventData), // Всегда передаем JSON
    });

    if (error) throw error;
  } catch (error) {
    console.error('Error tracking event:', error);
  }
}

// Логирование нажатий кнопок
export const logButtonClick = (buttonName: string, additionalData?: Record<string, unknown>) => {
  console.log(`[FRONTEND] Button clicked: ${buttonName}`, additionalData || '');
  trackEvent('button_click', { buttonName, ...additionalData });
};

// Логирование переходов по страницам
export const usePageTracking = () => {
  const location = useLocation();

  useEffect(() => {
    console.log(`[FRONTEND] Page loaded: ${location.pathname}`);
    trackEvent('page_view', { path: location.pathname });
  }, [location]);
};

// Логирование ошибок
export const logError = (error: Error, context: string, additionalData?: Record<string, unknown>) => {
  console.error(`[FRONTEND] Error in ${context}:`, error, additionalData || '');
  trackEvent('error', { context, error: error.message, ...additionalData });
};