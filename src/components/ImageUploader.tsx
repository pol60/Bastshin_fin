import { useState, Dispatch, SetStateAction } from 'react'; // Добавлен импорт типов
import { motion } from 'framer-motion';
import { uploadFile, getPublicUrl } from '../lib/storage';

interface ImageUploaderProps {
  onUpload: (urls: string[]) => void; // Функция для передачи URL загруженных файлов
  onUploading?: Dispatch<SetStateAction<boolean>>; // Функция для управления состоянием загрузки
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export const ImageUploader = ({ onUpload, onUploading }: ImageUploaderProps) => {
  const [progress, setProgress] = useState(0); // Прогресс загрузки
  const [uploadedCount, setUploadedCount] = useState(0); // Количество успешно загруженных файлов
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null); // Выбранные файлы
  const [isUploading, setIsUploading] = useState(false); // Состояние загрузки

  const handleFileUpload = async (files: FileList | null) => {
    if (isUploading) {
      alert('Завантаження вже виконується. Будь ласка, зачекайте.');
      return;
    }

    if (!files || files.length === 0) {
      alert('Будь ласка, виберіть файли для завантаження');
      return;
    }

    setIsUploading(true); // Устанавливаем состояние загрузки в true
    setSelectedFiles(files);
    onUploading?.(true); // Устанавливаем состояние загрузки в true для родительского компонента

    const urls: string[] = []; // Массив для хранения URL загруженных файлов
    let successCount = 0; // Счетчик успешно загруженных файлов

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        let publicUrl = '';

        try {
          // Валидация файла
          if (!ALLOWED_FILE_TYPES.includes(file.type)) {
            throw new Error(`Файл "${file.name}": недопустимий формат`);
          }

          if (file.size > MAX_FILE_SIZE) {
            throw new Error(`Файл "${file.name}": перевищує 5MB`);
          }

          // Загрузка файла
          const { path } = await uploadFile(file, 'products', 'tires'); // Загружаем файл в хранилище
          publicUrl = getPublicUrl('products', path); // Получаем публичный URL файла

          urls.push(publicUrl); // Добавляем URL в массив
          successCount++; // Увеличиваем счетчик успешных загрузок
        } catch (error) {
          console.error(`Помилка з файлом ${file.name}:`, error);
          alert(error instanceof Error ? error.message : 'Невідома помилка');
          continue; // Продолжаем загрузку остальных файлов, если произошла ошибка
        }

        // Обновление прогресса
        setProgress(((i + 1) / files.length) * 100); // Обновляем прогресс
        setUploadedCount(successCount); // Обновляем счетчик загруженных файлов
      }

      onUpload(urls); // Передаем массив URL загруженных файлов в родительский компонент
    } finally {
      setIsUploading(false); // Сбрасываем состояние загрузки
      onUploading?.(false); // Устанавливаем состояние загрузки в false для родительского компонента
      setProgress(0); // Сбрасываем прогресс
      setUploadedCount(0); // Сбрасываем счетчик загруженных файлов
    }
  };

  return (
    <div className="space-y-4">
      <label className="block">
        <input
          type="file"
          multiple
          accept={ALLOWED_FILE_TYPES.join(',')} // Разрешенные типы файлов
          onChange={(e) => handleFileUpload(e.target.files)} // Обработчик выбора файлов
          className="block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-full file:border-0
            file:text-sm file:font-semibold
            file:bg-blue-50 file:text-blue-700
            hover:file:bg-blue-100"
          disabled={isUploading} // Блокируем input во время загрузки
        />
      </label>

      {progress > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="relative pt-1"
        >
          <div className="flex h-2 overflow-hidden bg-gray-200 rounded">
            <div
              className="transition-all duration-300 ease-out bg-blue-500"
              style={{ width: `${progress}%` }} // Отображение прогресса
            />
          </div>
          <span className="text-sm text-gray-600">
            {`Завантажено ${uploadedCount} з 
            ${selectedFiles?.length || 0} файлів 
            (${Math.round(progress)}%)`} // Отображение количества загруженных файлов
          </span>
        </motion.div>
      )}
    </div>
  );
};