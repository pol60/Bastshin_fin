import { supabase } from './supabaseClient';

const API_URL = import.meta.env.VITE_API_URL;

const getHeaders = async () => {
  // Получаем актуальную сессию из Supabase
  const { data: { session }, error } = await supabase.auth.getSession();
  
  if (error || !session) {
    console.error('Error getting session:', error?.message || 'No active session');
    throw new Error('Authentication required');
  }

  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${session.access_token}`,
  };
};

export const api = {
  get: async (endpoint: string) => {
    const response = await fetch(`${API_URL}${endpoint}`, {
      headers: await getHeaders(),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Network response was not ok');
    }
    return response.json();
  },

  post: async (endpoint: string, data: Record<string, unknown>) => {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers: await getHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Network response was not ok');
    }
    return response.json();
  },

  put: async (endpoint: string, data: Record<string, unknown>) => {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'PUT',
      headers: await getHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) throw new Error('Network response was not ok');
    return response.json();
  },

  delete: async (endpoint: string) => {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'DELETE',
      headers: await getHeaders(),
    });

    if (!response.ok) throw new Error('Network response was not ok');
    return response.json();
  }
};