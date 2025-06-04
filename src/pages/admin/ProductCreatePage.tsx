import React, { useState, useEffect, useCallback } from 'react';
import { useAdmin } from '../../hooks/useAdmin';
import { trackEvent } from '../../lib/analytics';
import { supabase } from '../../lib/supabaseClient';
import { Product } from '../../types/database.types';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { ImageUploader } from '../../components/ImageUploader';


export const ProductCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isAdmin, loading: adminLoading } = useAdmin();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isImageUploading, setIsImageUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [allBrands, setAllBrands] = useState<string[]>([]);
  const [allModels, setAllModels] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<{
    brands: string[];
    models: string[];
  }>({ brands: [], models: [] });

  const [formData, setFormData] = useState<Partial<Product>>({
    type: 'tire',
    brand: '',
    model: '',
    width: 195,
    diameter: 16,
    profile: 55,
    price: 0,
    sale_price: undefined,
    image_url: [],
    country: 'UA',
    year: new Date().getFullYear(),
    season: 'summer',
    noise_level: 70,
    wet_grip: 'A',
    fuel_efficiency: 'A',
    wheel_width: undefined, // bigint
    load_index: '',
    speed_index: '',
    spikes: false,
  });


  const fetchExistingData = useCallback(async () => {
    try {
      const { data: brandsData } = await supabase
        .from('products')
        .select('brand')
        .not('brand', 'is', null);

      const { data: modelsData } = await supabase
        .from('products')
        .select('model')
        .not('model', 'is', null);

      if (brandsData) {
        const uniqueBrands = [...new Set(brandsData.map(p => p.brand))];
        setAllBrands(uniqueBrands);
        setSuggestions(prev => ({ ...prev, brands: uniqueBrands.slice(0, 5) }));
      }

      if (modelsData) {
        const uniqueModels = [...new Set(modelsData.map(p => p.model))];
        setAllModels(uniqueModels);
      }
    } catch (err) {
      console.error('Ошибка загрузки данных:', err);
    }
  }, []);

  useEffect(() => {
    fetchExistingData();
  }, [fetchExistingData]);

  const handleBrandInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.trim();
    setFormData(prev => ({ ...prev, brand: value, model: '' }));
    
    const filtered = value.length > 0 
      ? allBrands
          .filter(brand => brand.toLowerCase().includes(value.toLowerCase()))
          .slice(0, 5)
      : allBrands.slice(0, 5);
    
    setSuggestions(prev => ({ ...prev, brands: filtered }));
  };

  const handleModelInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.trim();
    setFormData(prev => ({ ...prev, model: value }));
    
    const filtered = value.length > 0
      ? allModels
          .filter(model => model.toLowerCase().includes(value.toLowerCase()))
          .slice(0, 5)
      : allModels.slice(0, 5);
    
    setSuggestions(prev => ({ ...prev, models: filtered }));
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? (value === '' ? null : Number(value)) : value,
    }));
  };
  
  // Отдельный обработчик для bigint полей
  const handleBigIntChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value === '' ? undefined : BigInt(value)
    }));
  };

  const handleImageUpload = (urls: string[]) => {
    setFormData(prev => ({
      ...prev,
      image_url: [...new Set([...(prev.image_url || []), ...urls])],
    }));
  };

  const handleRemoveImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      image_url: prev.image_url?.filter((_, i) => i !== index) || [],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const formDataToSubmit = {
        ...formData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { data: productData, error: productError } = await supabase
        .from('products')
        .insert([formDataToSubmit])
        .select()
        .single();

      if (productError) throw productError;

      trackEvent('admin_product_create', {
        product_id: productData.id,
        product_name: `${formData.brand} ${formData.model}`,
      });

      await queryClient.invalidateQueries({
        queryKey: ['products'],
        exact: false,
        refetchType: 'all'
      });

      navigate('/admin/products', { 
        state: { 
          successMessage: 'Товар успішно створено',
          shouldResetPagination: true
        } 
      });

    } catch (err) {
      const errorMessage = err instanceof Error 
        ? err.message 
        : 'Помилка при створенні товару';
      
      console.error('Помилка створення:', errorMessage);
      setError(errorMessage);
      
      trackEvent('admin_product_create_error', {
        error: errorMessage,
        product_data: formData,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Функция для преобразования bigint в строку для отображения
  const bigIntToString = (value: bigint | undefined): string => {
    return value?.toString() || '';
  };

  if (adminLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <motion.div
          className="relative w-16 h-16"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
        />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold text-red-600">Несанкціонований доступ</h1>
        <p className="mt-2 text-gray-600">У вас немає прав для перегляду цієї сторінки.</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 max-w-4xl mx-auto"
    >
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Додати новий товар</h1>
        <motion.button
          onClick={() => navigate('/admin/products')}
          className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Назад до списку
        </motion.button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Тип <span className="text-red-500">*</span>
            </label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500"
            >
              <option value="tire">Шина</option>
              <option value="wheel">Диск</option>
            </select>
          </div>

          {formData.type === 'tire' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Сезон <span className="text-red-500">*</span>
                </label>
                <select
                  name="season"
                  value={formData.season}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="summer">Літо</option>
                  <option value="winter">Зима</option>
                  <option value="all-season">Всесезон</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Рівень шуму (dB)
                </label>
                <input
                  type="number"
                  name="noise_level"
                  value={formData.noise_level || ''}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500"
                  min="0"
                  max="100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Сцепление на мокрой дороге
                </label>
                <select
                  name="wet_grip"
                  value={formData.wet_grip}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500"
                >
                  {['A', 'B', 'C', 'D', 'E'].map(grade => (
                    <option key={grade} value={grade}>{grade}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Топливная эффективность
                </label>
                <select
                  name="fuel_efficiency"
                  value={formData.fuel_efficiency}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500"
                >
                  {['A', 'B', 'C', 'D', 'E'].map(grade => (
                    <option key={grade} value={grade}>{grade}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Индекс нагрузки
                </label>
                <input
                  type="text"
                  name="load_index"
                  value={formData.load_index}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500"
                  placeholder="Например: 92Y"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Индекс скорости
                </label>
                <input
                  type="text"
                  name="speed_index"
                  value={formData.speed_index}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500"
                  placeholder="Например: Y"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="spikes"
                  checked={formData.spikes || false}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    spikes: e.target.checked
                  }))}
                  className="h-4 w-4"
                />
                <label className="text-sm">Шипованные</label>
              </div>
            </>
          )}

          {formData.type === 'wheel' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ширина диска (мм)
              </label>
              <input
                type="number"
                name="wheel_width"
                value={bigIntToString(formData.wheel_width as bigint | undefined)}
                onChange={handleBigIntChange}
                className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500"
                min="100"
                max="500"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Бренд <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              list="brands-list"
              name="brand"
              value={formData.brand}
              onChange={handleBrandInput}
              className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500"
              required
            />
            <datalist id="brands-list">
              {suggestions.brands.map((brand, index) => (
                <option key={index} value={brand} />
              ))}
            </datalist>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Модель <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              list="models-list"
              name="model"
              value={formData.model}
              onChange={handleModelInput}
              className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500"
              required
            />
            <datalist id="models-list">
              {suggestions.models.map((model, index) => (
                <option key={index} value={model} />
              ))}
            </datalist>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ширина <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="width"
              value={formData.width || ''}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500"
              required
              min="100"
              max="500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Профіль (%) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="profile"
              value={formData.profile || ''}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500"
              required
              min="20"
              max="100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Діаметр <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="diameter"
              value={formData.diameter || ''}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500"
              required
              min="10"
              max="30"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ціна (грн) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="price"
              value={formData.price || ''}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500"
              required
              min="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Акційна ціна (грн)
            </label>
            <input
              type="number"
              name="sale_price"
              value={formData.sale_price || ''}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500"
              min="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Країна виробник
            </label>
            <input
              type="text"
              name="country"
              value={formData.country}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Рік виробництва
            </label>
            <input
              type="number"
              name="year"
              value={formData.year || ''}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500"
              min="2000"
              max={new Date().getFullYear() + 1}
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Зображення
            </label>
            <ImageUploader
              onUpload={handleImageUpload}
              onUploading={setIsImageUploading}
            />
            <div className="mt-2 grid grid-cols-3 gap-2">
              {formData.image_url?.map((url, index) => (
                <div key={index} className="relative group">
                  <img
                    src={url}
                    alt={`Preview ${index + 1}`}
                    className="h-24 w-full object-cover rounded border transition-opacity group-hover:opacity-75"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-red-600 p-3 bg-red-100 rounded-lg"
          >
            {error}
          </motion.div>
        )}

        <div className="flex justify-end gap-4 mt-8">
          <motion.button
            type="button"
            onClick={() => navigate('/admin/products')}
            className="bg-gray-500 text-white px-6 py-2 rounded-md hover:bg-gray-600 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Скасувати
          </motion.button>

          <motion.button
            type="submit"
            disabled={isSubmitting || isImageUploading}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isSubmitting ? (
              <span className="flex items-center">
                <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                </svg>
                Створення...
              </span>
            ) : (
              'Створити товар'
            )}
          </motion.button>
        </div>
      </form>
    </motion.div>
  );
};