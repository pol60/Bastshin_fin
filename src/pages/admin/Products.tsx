import React, { useState, useEffect, useCallback } from 'react';
import { useAdmin } from '../../hooks/useAdmin';
import { trackEvent } from '../../lib/analytics';
import { supabase } from '../../lib/supabaseClient';
import { Product } from '../../types/database.types';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Modal from 'react-modal';
import { Pagination } from '../../components/ui/adminProducts/Pagination';
import { Filters, SortOptions } from '../../components/ui/adminProducts/Filters';
import { useNavigate, useLocation } from 'react-router-dom';
import { EditProductModal } from '../../components/ui/adminProducts/EditProductModal';

Modal.setAppElement('#root');

type SeasonMap = {
  summer: string;
  winter: string;
  'all-season': string;
};

const seasonLabels: SeasonMap = {
  summer: 'Літо',
  winter: 'Зима',
  'all-season': 'Всесезон'
};

interface EnhancedProduct extends Product {
  reviews_count: number;
  wheel_width?: number; // number | undefined
}

export const Products: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAdmin, loading: adminLoading } = useAdmin();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ 
    type: '', 
    minPrice: 0, 
    maxPrice: 1000000
  });
  const [sort, setSort] = useState<SortOptions>('created_at_desc');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  const [editProduct, setEditProduct] = useState<EnhancedProduct | null>(null);
  const [totalCount, setTotalCount] = useState(0);

  const stableRefetch = useCallback(() => {
    return queryClient.refetchQueries({ 
      queryKey: ['products', page, filters, sort] 
    });
  }, [page, filters, sort, queryClient]);

  const { 
    data: products, 
    isLoading, 
    error 
  } = useQuery<EnhancedProduct[]>({
    queryKey: ['products', page, filters, sort],
    queryFn: async () => {
      const [field, order] = sort.split('_');
      
      let query = supabase
        .from('products')
        .select(`
          *,
          reviews:reviews(count)
        `, { 
          count: 'exact' 
        })
        .gte('price', Math.max(0, filters.minPrice))
        .lte('price', Math.max(filters.minPrice, filters.maxPrice));
  
      if (filters.type) {
        query = query.eq('type', filters.type);
      }
  
      const { data, error, count } = await query
        .order(field === 'created' ? 'created_at' : field, { 
          ascending: order === 'asc' 
        })
        .range((page - 1) * 10, page * 10 - 1);
  
      if (error) throw error;
      
      setTotalCount(count || 0);
      
      return data?.map(product => ({
        ...product,
        reviews_count: product.reviews?.length || 0,
        wheel_width: product.wheel_width ? Number(product.wheel_width) : undefined
        
      })) || [];
    },
    enabled: isAdmin,
    retry: 1
  });

  useEffect(() => {
    if (location.state?.shouldResetPagination) {
      setPage(1);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, navigate, location.pathname]);

  useEffect(() => {
    let channel: ReturnType<typeof supabase.channel>;
    
    const subscribe = async () => {
      channel = supabase
        .channel('realtime-products')
        .on('postgres_changes', 
          { 
            event: '*', 
            schema: 'public', 
            table: 'products' 
          }, 
          () => stableRefetch()
        )
        .subscribe();
    };

    subscribe();

    return () => {
      channel?.unsubscribe().catch(console.error);
    };
  }, [stableRefetch]);

  const deleteMutation = useMutation<void, Error, string>({
    mutationFn: async (id) => {
      const product = products?.find(p => p.id === id);
      
      if (product?.image_url) {
        await Promise.all(
          product.image_url.map(async (url: string) => {
            const path = url.split('/').pop();
            if (path) {
              const folder = product.type === 'tire' ? 'tires' : 'wheels';
              const { error } = await supabase.storage
                .from('products')
                .remove([`${folder}/${path}`]);
              
              if (error && error.message !== 'Object not found') throw error;
            }
          })
        );
      }

      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      trackEvent('admin_product_delete', { product_id: productToDelete });
    },
    onError: (err) => {
      trackEvent('admin_product_delete_error', { error: err.message });
      console.error('Delete error:', err);
    },
    onSettled: () => {
      setProductToDelete(null);
      setIsDeleteModalOpen(false);
    }
  });

  if (adminLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="border-4 border-blue-200 rounded-full w-16 h-16"
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
    <div className="p-4 sm:p-6">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3">
        <h1 className="text-xl sm:text-2xl font-bold">Управління товарами</h1>
        <motion.button
          onClick={() => navigate('/admin/products/new')}
          className="bg-blue-500 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded hover:bg-blue-600 text-sm sm:text-base"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Додати товар
        </motion.button>
      </header>

      <Filters onFilterChange={setFilters} onSortChange={setSort} />

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mb-3 p-2 sm:p-3 bg-red-100 text-red-600 rounded-lg text-xs sm:text-sm"
          >
            {error.message}
          </motion.div>
        )}
      </AnimatePresence>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.2, repeat: Infinity }}
            className="border-3 border-blue-400 rounded-full w-12 h-12"
          />
        </div>
      ) : (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4"
          >
            {products?.map((product) => (
              <motion.div
                key={product.id}
                whileHover={{ y: -3 }}
                transition={{ duration: 0.2 }}
                className="border p-2 sm:p-3 rounded shadow bg-white"
              >
                {product.image_url?.[0] && (
                  <img 
                    src={product.image_url[0]} 
                    alt={product.name} 
                    className="w-full h-28 sm:h-32 md:h-40 object-cover mb-2 rounded"
                  />
                )}
                <h3 className="font-bold text-sm sm:text-base mb-1">
                  {product.brand} {product.model}
                </h3>

                <div className="text-gray-600 text-xs sm:text-sm space-y-1">
                  <div className="flex flex-col gap-0.5">
                    <span className={`font-medium ${product.sale_price ? 'text-red-500 line-through' : 'text-gray-800'}`}>
                      {product.price} грн
                    </span>
                    {product.sale_price && (
                      <span className="font-medium text-green-600">
                        {product.sale_price} грн
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                    <p>Тип: {product.type === 'tire' ? 'Шина' : 'Диск'}</p>
                    <p>Розмір: {product.width}/{product.profile}R{product.diameter}</p>
                    <p>Країна: {product.country}</p>
                    <p>Рік: {product.year}</p>
                  </div>

                  {product.type === 'tire' && (
                    <div className="grid grid-cols-2 gap-x-2">
                      <p>Сезон: {seasonLabels[product.season as keyof SeasonMap]}</p>
                      <p>Шум: {product.noise_level}dB</p>
                      {product.wet_grip && <p>Сцепление: {product.wet_grip}</p>}
                      {product.fuel_efficiency && <p>Экономия: {product.fuel_efficiency}</p>}
                      {product.load_index && <p>Нагрузка: {product.load_index}</p>}
                      {product.speed_index && <p>Скорость: {product.speed_index}</p>}
                      <p>Шипы: {product.spikes ? 'Да' : 'Нет'}</p>
                    </div>
                  )}

{product.type === 'wheel' && product.wheel_width !== undefined && (
  <div className="grid grid-cols-2 gap-x-2">
    <p>Ширина диска: {product.wheel_width}мм</p>
  </div>
)}

                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="text-gray-500 text-xs">
                      Відгуків: {product.reviews_count}
                    </span>
                  </div>
                </div>

                <div className="mt-2 flex items-center justify-between">
                  <div className="flex gap-1.5 sm:gap-2">
                    <motion.button
                      onClick={() => setEditProduct(product)}
                      className="text-blue-600 hover:text-blue-800 text-xs sm:text-sm"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Редагувати
                    </motion.button>
                    <motion.button
                      onClick={() => {
                        setProductToDelete(product.id);
                        setIsDeleteModalOpen(true);
                      }}
                      className="text-red-600 hover:text-red-800 text-xs sm:text-sm"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Видалити
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          <Pagination 
            currentPage={page} 
            totalPages={Math.ceil(totalCount / 10) || 1}
            onPageChange={setPage} 
          />
        </>
      )}

      <Modal
        isOpen={isDeleteModalOpen}
        onRequestClose={() => setIsDeleteModalOpen(false)}
        className="modal bg-white rounded-lg p-4 sm:p-6 max-w-md mx-auto shadow-xl"
        overlayClassName="modal-overlay fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
      >
        <h2 className="text-lg sm:text-xl font-bold mb-3">Видалити товар?</h2>
        <div className="space-y-3">
          <p className="text-sm sm:text-base">Ви дійсно хочете видалити цей товар? Цю дію не можна скасувати.</p>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              className="px-3 py-1.5 text-gray-600 hover:bg-gray-100 rounded text-sm sm:text-base"
            >
              Скасувати
            </button>
            <button
              onClick={() => productToDelete && deleteMutation.mutate(productToDelete)}
              className="px-3 py-1.5 bg-red-500 text-white rounded hover:bg-red-600 text-sm sm:text-base"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Видалення...' : 'Видалити'}
            </button>
          </div>
        </div>
      </Modal>

      {editProduct && (
        <EditProductModal
          isOpen={!!editProduct}
          product={editProduct}
          onClose={() => setEditProduct(null)}
          onSave={async (updatedProduct) => {
            await supabase
              .from('products')
              .update(updatedProduct)
              .eq('id', updatedProduct.id);
            
            await queryClient.invalidateQueries({ 
              queryKey: ['products'] 
            });
            setEditProduct(null);
          }}
        />
      )}
    </div>
  );
};
