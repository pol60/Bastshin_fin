import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Truck, CreditCard } from 'lucide-react';
import Select from 'react-select';
import AsyncSelect from 'react-select/async';
import { supabase } from '../lib/supabaseClient';
import { useCartStore } from '../stores/cartStore';
import { getCities, getWarehouses } from '../lib/nova';

interface CityOption {
  value: string;
  label: string;
  ref: string;
}

interface WarehouseOption {
  value: string;
  label: string;
}

interface CartItem {
  product_id: string;
  quantity: number;
  price: number;
}

export const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const { items, clearCart, total } = useCartStore();
  const [loading, setLoading] = useState<boolean>(false);
  const [cities, setCities] = useState<CityOption[]>([]);
  const [isCitiesLoading, setIsCitiesLoading] = useState<boolean>(false);
  const [isWarehousesLoading, setIsWarehousesLoading] = useState<boolean>(false);
  const [warehouses, setWarehouses] = useState<WarehouseOption[]>([]);
  const [selectedCity, setSelectedCity] = useState<CityOption | null>(null);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    cityRef: '',
    warehouseRef: '',
    delivery: 'nova-poshta',
    payment: 'card',
    city: '',
    warehouse: '',
  });

  // Load cities only once when the component mounts
  useEffect(() => {
    const loadCities = async () => {
      if (cities.length > 0) return; // Prevent redundant API calls
      
      setIsCitiesLoading(true);
      try {
        const citiesData = await getCities();
        setCities(
          citiesData.map((city) => ({
            value: city.Ref,
            label: city.Description,
            ref: city.Ref,
          }))
        );
      } catch (error) {
        console.error('Error loading cities:', error);
      } finally {
        setIsCitiesLoading(false);
      }
    };

    if (formData.delivery === 'nova-poshta') {
      loadCities();
    }
  }, [formData.delivery, cities.length]);

  // Memoize the loadWarehousesBySearch function to prevent recreating it on every render
  const loadWarehousesBySearch = useCallback(
    async (inputValue: string): Promise<WarehouseOption[]> => {
      if (!formData.cityRef) return [];
      
      setIsWarehousesLoading(true);
      try {
        const warehousesData = await getWarehouses({
          CityRef: formData.cityRef,
          FindByString: inputValue,
        });
        
        const options = warehousesData.map((wh) => ({
          value: wh.Ref || '',
          label: wh.Description,
        }));
        
        return options;
      } catch (error) {
        console.error('Error loading warehouses by search:', error);
        return [];
      } finally {
        setIsWarehousesLoading(false);
      }
    },
    [formData.cityRef]
  );

  // Load default warehouses when city is selected
  const loadWarehousesDefault = useCallback(async (cityRef: string) => {
    if (!cityRef) return;
    
    setIsWarehousesLoading(true);
    try {
      const warehousesData = await getWarehouses({ CityRef: cityRef });
      
      const defaultWarehouses = warehousesData.map((wh) => ({
        value: wh.Ref || '',
        label: wh.Description,
      }));
      
      setWarehouses(defaultWarehouses);
    } catch (error) {
      console.error('Error loading warehouses:', error);
      setWarehouses([]);
    } finally {
      setIsWarehousesLoading(false);
    }
  }, []);

  // Handle city selection
  const handleCityChange = useCallback((selected: CityOption | null) => {
    if (selected) {
      setSelectedCity(selected);
      setFormData({
        ...formData,
        city: selected.label,
        cityRef: selected.value,
        warehouseRef: '',
        warehouse: '',
      });
      
      // Load warehouses for the selected city
      loadWarehousesDefault(selected.value);
    } else {
      setSelectedCity(null);
      setFormData({
        ...formData,
        city: '',
        cityRef: '',
        warehouseRef: '',
        warehouse: '',
      });
      setWarehouses([]);
    }
  }, [formData, loadWarehousesDefault]);

  // Handle warehouse selection
  const handleWarehouseChange = useCallback((selected: WarehouseOption | null) => {
    setFormData({
      ...formData,
      warehouse: selected?.label || '',
      warehouseRef: selected?.value || '',
    });
  }, [formData]);

  // Handle delivery method change
  const handleDeliveryChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    if (value === 'odessa-pickup') {
      setFormData({
        ...formData,
        delivery: value,
        city: 'Одеса',
        warehouse: 'Склад Одеса',
        cityRef: '',
        warehouseRef: '',
      });
      setSelectedCity(null);
      setWarehouses([]);
    } else {
      setFormData({
        ...formData,
        delivery: value,
        city: '',
        warehouse: '',
        cityRef: '',
        warehouseRef: '',
      });
      setSelectedCity(null);
      setWarehouses([]);
    }
  }, [formData]);

  // Validate form before submission
  const isFormValid = () => {
    if (!formData.firstName || !formData.lastName || !formData.phone) {
      return false;
    }
    
    if (formData.delivery === 'nova-poshta') {
      return Boolean(formData.cityRef && formData.warehouseRef);
    }
    
    return true;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Validate form
    if (!isFormValid()) {
      alert('Будь ласка, заповніть всі обов\'язкові поля');
      return;
    }
    
    setLoading(true);

    try {
      // Get current authenticated user
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();
      
      if (!authUser) {
        throw new Error('Користувач не авторизований');
      }
      
      const userId = authUser.id;

      // Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([
          {
            user_id: userId,
            status: 'pending',
            total: total(),
            first_name: formData.firstName,
            last_name: formData.lastName,
            customer_phone: formData.phone,
            shipping_address: formData.delivery === 'nova-poshta' 
              ? `${formData.city}, ${formData.warehouse}` 
              : 'Одеса, самовивіз',
            delivery_method: formData.delivery,
            payment_method: formData.payment,
          },
        ])
        .select('*')
        .single();

      if (orderError) throw orderError;

      // Insert order items
      const orderItems = items.map((item: CartItem) => ({
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.price,
      }));

      const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
      if (itemsError) throw itemsError;

      clearCart();
      navigate('/profile');
    } catch (error) {
      console.error('Помилка оформлення замовлення:', error);
      alert(error instanceof Error ? error.message : 'Сталася невідома помилка');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-8">Оформлення замовлення</h1>
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Contact information */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Контактні дані</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ім'я*</label>
                <input
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={(e) =>
                    setFormData({ ...formData, firstName: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Прізвище*</label>
                <input
                  type="text"
                  required
                  value={formData.lastName}
                  onChange={(e) =>
                    setFormData({ ...formData, lastName: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Телефон*</label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  pattern="[0-9]{10}"
                  placeholder="0991234567"
                />
              </div>
            </div>
          </div>

          {/* Delivery */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Доставка</h2>
            <div className="space-y-4">
              <div className="flex flex-col space-y-2">
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    value="nova-poshta"
                    checked={formData.delivery === 'nova-poshta'}
                    onChange={handleDeliveryChange}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span className="flex items-center">
                    <Truck className="w-5 h-5 mr-2" /> Нова Пошта
                  </span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    value="odessa-pickup"
                    checked={formData.delivery === 'odessa-pickup'}
                    onChange={handleDeliveryChange}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span className="flex items-center">
                    <Truck className="w-5 h-5 mr-2" /> Зібрати зі складу (Одеса)
                  </span>
                </label>
              </div>
              
              {/* Nova Poshta delivery options */}
              {formData.delivery === 'nova-poshta' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Місто*</label>
                    <Select
                      options={cities}
                      value={selectedCity}
                      onChange={handleCityChange}
                      placeholder="Оберіть місто..."
                      noOptionsMessage={() => 'Місто не знайдено'}
                      loadingMessage={() => 'Завантаження...'}
                      isSearchable
                      isLoading={isCitiesLoading}
                      className="react-select-container"
                      classNamePrefix="react-select"
                      styles={{
                        control: (base) => ({
                          ...base,
                          border: '1px solid #e5e7eb',
                          borderRadius: '0.375rem',
                          padding: '0.25rem',
                        }),
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Відділення*</label>
                    <AsyncSelect
                      key={formData.cityRef} // Re-mount when city changes
                      cacheOptions
                      defaultOptions={warehouses}
                      loadOptions={loadWarehousesBySearch}
                      onChange={handleWarehouseChange}
                      isDisabled={!formData.cityRef}
                      placeholder={formData.cityRef ? "Оберіть відділення..." : "Спочатку оберіть місто"}
                      noOptionsMessage={() => 'Відділення не знайдено'}
                      loadingMessage={() => 'Завантаження...'}
                      isLoading={isWarehousesLoading}
                      className="react-select-container"
                      classNamePrefix="react-select"
                      styles={{
                        control: (base) => ({
                          ...base,
                          border: '1px solid #e5e7eb',
                          borderRadius: '0.375rem',
                          padding: '0.25rem',
                        }),
                      }}
                    />
                    {formData.cityRef && warehouses.length === 0 && !isWarehousesLoading && (
                      <p className="text-sm text-yellow-600 mt-1">
                        Завантаження відділень... Якщо список порожній, спробуйте ввести перші букви вулиці або номер відділення.
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Payment */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Оплата</h2>
            <div className="space-y-4">
              <div className="flex flex-col space-y-2">
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    value="card"
                    checked={formData.payment === 'card'}
                    onChange={(e) =>
                      setFormData({ ...formData, payment: e.target.value })
                    }
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span className="flex items-center">
                    <CreditCard className="w-5 h-5 mr-2" /> Оплата карткою онлайн
                  </span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    value="cash"
                    checked={formData.payment === 'cash'}
                    onChange={(e) =>
                      setFormData({ ...formData, payment: e.target.value })
                    }
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span className="flex items-center">
                    <CreditCard className="w-5 h-5 mr-2" /> Оплата при отриманні
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Order summary (optional) */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Ваше замовлення</h2>
            <div className="border-t border-gray-200 pt-4">
              <div className="flex justify-between font-semibold text-lg">
                <span>Загальна сума:</span>
                <span>{total().toFixed(2)} грн</span>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !isFormValid()}
            className="w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex justify-center items-center"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
            ) : (
              'Підтвердити замовлення'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Checkout;