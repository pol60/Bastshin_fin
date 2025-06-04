import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import Modal from 'react-modal';
import { Product } from '../../../types/database.types';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../../lib/supabaseClient';
import { trackEvent } from '../../../lib/analytics';

interface EditProductModalProps {
  isOpen: boolean;
  product: Product;
  onClose: () => void;
  onSave: (updatedProduct: Product) => void;
}

const seasonOptions = [
  { value: 'summer', label: 'Літо' },
  { value: 'winter', label: 'Зима' },
  { value: 'all-season', label: 'Всесезон' }
];

const efficiencyGrades = ['A', 'B', 'C', 'D', 'E'];

// Определяем типы для полезной нагрузки обновления
type UpdatableProduct = Omit<
  Product,
  'id' | 'name' | 'rating' | 'reviews_count' | 'created_at' | 'type' | 'stock' | 'wheel_width'
>;

type UpdatePayload = Partial<UpdatableProduct> & {
  updated_at: string;
};

export const EditProductModal: React.FC<EditProductModalProps> = ({
  isOpen,
  product,
  onClose,
  onSave
}) => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<Product>(product);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [images, setImages] = useState<string[]>(product.image_url || []);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [changedFields, setChangedFields] = useState<Set<string>>(new Set());
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (product) {
      setFormData(product);
      setImages(product.image_url || []);
      setNewImages([]);
      setChangedFields(new Set());
    }
  }, [product]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setChangedFields(prev => new Set(prev).add(name));
    setFormData(prev => ({
      ...prev,
      [name]: ['price', 'sale_price', 'width', 'profile', 'diameter', 'year',
               'noise_level', 'wheel_width'].includes(name)
        ? (value === '' ? null : Number(value))
        : value
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setChangedFields(prev => new Set(prev).add(name));
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const validateForm = () => {
    const requiredFields: (keyof Product)[] = ['brand', 'model', 'price'];
    const missingFields = requiredFields.filter(field => !formData[field]?.toString().trim());

    if (missingFields.length > 0) {
      setError('Обовʼязкові поля: Бренд, Модель, Ціна');
      return false;
    }

    if (formData.price && formData.price <= 0) {
      setError('Ціна повинна бути більше нуля');
      return false;
    }

    return true;
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      setNewImages(prev => [...prev, ...files]);
      setChangedFields(prev => new Set(prev).add('image_url'));
    }
  };

  const handleImageRemove = (index: number, isNewImage: boolean) => {
    setChangedFields(prev => new Set(prev).add('image_url'));
    if (isNewImage) {
      setNewImages(prev => prev.filter((_, i) => i !== index));
    } else {
      setImages(prev => prev.filter((_, i) => i !== index));
    }
  };

  const uploadImage = async (file: File) => {
    const fileExt = file.name.split('.').pop();
    const filePath = `products/${formData.id}/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('product-images')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      let updatedImageUrls = [...images];

      if (newImages.length > 0) {
        const uploadPromises = newImages.map(file => uploadImage(file));
        const uploadedUrls = await Promise.all(uploadPromises);
        updatedImageUrls = [...updatedImageUrls, ...uploadedUrls];
      }

      // Собираем payload строго по типу
      const rawPayload: UpdatePayload = {
        updated_at: new Date().toISOString(),
        ...(changedFields.has('brand')     && { brand: formData.brand }),
        ...(changedFields.has('model')     && { model: formData.model }),
        ...(changedFields.has('price')     && { price: formData.price }),
        ...(changedFields.has('sale_price') && { sale_price: formData.sale_price }),
        ...(changedFields.has('width')     && { width: formData.width }),
        ...(changedFields.has('profile')   && { profile: formData.profile }),
        ...(changedFields.has('diameter')  && { diameter: formData.diameter }),
        ...(changedFields.has('season')    && { season: formData.season }),
        ...(changedFields.has('country')   && { country: formData.country }),
        ...(changedFields.has('year')      && { year: formData.year }),
        ...(changedFields.has('type')      && { type: formData.type }),
        ...(changedFields.has('noise_level') && { noise_level: formData.noise_level }),
        ...(changedFields.has('wet_grip')  && { wet_grip: formData.wet_grip }),
        ...(changedFields.has('fuel_efficiency') && { fuel_efficiency: formData.fuel_efficiency }),
        ...(changedFields.has('wheel_width') && { wheel_width: formData.wheel_width }),
        ...(changedFields.has('load_index') && { load_index: formData.load_index }),
        ...(changedFields.has('speed_index') && { speed_index: formData.speed_index }),
        ...(changedFields.has('spikes')    && { spikes: formData.spikes }),
        ...(changedFields.has('image_url') && { image_url: updatedImageUrls })
      };

      const { error } = await supabase
        .from('products')
        .update(rawPayload)
        .eq('id', formData.id);

      if (error) throw error;

      await queryClient.invalidateQueries({
        queryKey: ['products']
      });

      trackEvent('admin_product_edit', { product_id: formData.id });
      onSave({ ...product, ...rawPayload });
      onClose();
    } catch (err) {
      const errorMessage = err instanceof Error
        ? err.message
        : 'Помилка оновлення товару';
      setError(errorMessage);
      trackEvent('admin_product_edit_error', { error: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      className="modal bg-white rounded-lg p-4 sm:p-6 mx-4 sm:mx-auto max-w-[95vw] sm:max-w-2xl w-full shadow-xl"
      overlayClassName="modal-overlay fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
      closeTimeoutMS={200}
      ariaHideApp={false}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        className="max-h-[90vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg sm:text-xl font-bold">Редагування товару</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors text-2xl"
          >
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="space-y-3 sm:space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Бренд *
                </label>
                <input
                  type="text"
                  name="brand"
                  value={formData.brand || ''}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md p-2 text-sm sm:text-base focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Модель *
                </label>
                <input
                  type="text"
                  name="model"
                  value={formData.model || ''}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md p-2 text-sm sm:text-base focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <div className="space-y-3 sm:space-y-4">
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ціна *
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price || ''}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md p-2 text-sm sm:text-base focus:ring-2 focus:ring-blue-500"
                    min="0"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Акційна ціна
                  </label>
                  <input
                    type="number"
                    name="sale_price"
                    value={formData.sale_price || ''}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md p-2 text-sm sm:text-base focus:ring-2 focus:ring-blue-500"
                    min="0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ширина
                  </label>
                  <input
                    type="number"
                    name="width"
                    value={formData.width || ''}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md p-2 text-sm sm:text-base focus:ring-2 focus:ring-blue-500"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Профіль
                  </label>
                  <input
                    type="number"
                    name="profile"
                    value={formData.profile || ''}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md p-2 text-sm sm:text-base focus:ring-2 focus:ring-blue-500"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Діаметр
                  </label>
                  <input
                    type="number"
                    name="diameter"
                    value={formData.diameter || ''}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md p-2 text-sm sm:text-base focus:ring-2 focus:ring-blue-500"
                    min="0"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Зображення товару
            </label>

            <div className="flex flex-wrap gap-4 mb-4">
              {images.map((url, index) => (
                <div key={`current-${index}`} className="relative w-24 h-24 border rounded-md overflow-hidden group">
                  <img
                    src={url}
                    alt={`Товар ${formData.brand} ${formData.model}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => handleImageRemove(index, false)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    &times;
                  </button>
                </div>
              ))}

              {newImages.map((file, index) => (
                <div key={`new-${index}`} className="relative w-24 h-24 border rounded-md overflow-hidden group">
                  <img
                    src={URL.createObjectURL(file)}
                    alt={`Новое изображение ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => handleImageRemove(index, true)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    &times;
                  </button>
                </div>
              ))}

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-md flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors"
              >
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </button>

              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Країна виробник
              </label>
              <input
                type="text"
                name="country"
                value={formData.country || ''}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md p-2 text-sm sm:text-base focus:ring-2 focus:ring-blue-500"
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
                className="w-full border border-gray-300 rounded-md p-2 text-sm sm:text-base focus:ring-2 focus:ring-blue-500"
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Сезонність *
              </label>
              <select
                name="season"
                value={formData.season || 'summer'}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md p-2 text-sm sm:text-base focus:ring-2 focus:ring-blue-500"
                required
              >
                {seasonOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Тип товару *
              </label>
              <select
                name="type"
                value={formData.type || 'tire'}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md p-2 text-sm sm:text-base focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="tire">Шина</option>
                <option value="wheel">Диск</option>
              </select>
            </div>
          </div>

          {formData.type === 'tire' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Рівень шуму (dB)
                </label>
                <input
                  type="number"
                  name="noise_level"
                  value={formData.noise_level || ''}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md p-2 text-sm sm:text-base focus:ring-2 focus:ring-blue-500"
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
                  value={formData.wet_grip || 'A'}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md p-2 text-sm sm:text-base focus:ring-2 focus:ring-blue-500"
                >
                  {efficiencyGrades.map(grade => (
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
                  value={formData.fuel_efficiency || 'A'}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md p-2 text-sm sm:text-base focus:ring-2 focus:ring-blue-500"
                >
                  {efficiencyGrades.map(grade => (
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
                  value={formData.load_index || ''}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md p-2 text-sm sm:text-base focus:ring-2 focus:ring-blue-500"
                  placeholder="Наприклад: 92Y"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Индекс скорости
                </label>
                <input
                  type="text"
                  name="speed_index"
                  value={formData.speed_index || ''}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md p-2 text-sm sm:text-base focus:ring-2 focus:ring-blue-500"
                  placeholder="Наприклад: Y"
                />
              </div>

              <div className="flex items-center gap-2 mb-4">
                <input
                  type="checkbox"
                  id="spikesCheckbox"
                  name="spikes"
                  checked={formData.spikes || false}
                  onChange={handleCheckboxChange}
                  className="h-4 w-4"
                />
                <label htmlFor="spikesCheckbox" className="text-sm">Шипованные</label>
              </div>
            </div>
          )}

          {formData.type === 'wheel' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ширина диска (мм)
                </label>
                <input
                  type="number"
                  name="wheel_width"
                  value={formData.wheel_width ?? ''}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md p-2 text-sm sm:text-base focus:ring-2 focus:ring-blue-500"
                  min="100"
                  max="500"
                />
              </div>
            </div>
          )}

          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-red-600 text-sm p-2 bg-red-100 rounded"
            >
              {error}
            </motion.div>
          )}

          <div className="flex flex-col sm:flex-row justify-end gap-3 mt-6">
            <motion.button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Скасувати
            </motion.button>

            <motion.button
              type="submit"
              className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              disabled={isSubmitting}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin h-5 w-5 mr-3"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Збереження...
                </span>
              ) : (
                'Зберегти зміни'
              )}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </Modal>
  );
};
