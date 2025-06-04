import { v4 as uuidv4 } from 'uuid';
import { supabase } from './supabaseClient';

// Функция для генерации уникального имени файла (ТОЛЬКО UUID + расширение)
const generateUniqueFileName = (file: File): string => {
  const extension = file.name.split('.').pop(); // Получаем расширение файла
  return `${uuidv4()}${extension ? `.${extension}` : ''}`; // Формат: uuid.ext
};

export const uploadFile = async (
  file: File,
  bucket: string,
  folder: string
) => {
  const fileName = generateUniqueFileName(file);
  
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(`${folder}/${fileName}`, file, {
      cacheControl: '3600',
      upsert: false
    });

  if (error) throw error;
  return { ...data, fileName };
};

export const getPublicUrl = (bucket: string, path: string) => {
  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(path, {
      download: false
    });
  
  return data.publicUrl;
};