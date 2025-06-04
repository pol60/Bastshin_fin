import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { User as UserIcon, Package, LogOut } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { User, Order } from '../types/database.types';
import { toast } from 'react-toastify';

export const Profile: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [profileCreationAttempted, setProfileCreationAttempted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
  });
  const initialLogin = useRef(true);

  useEffect(() => {
    const loadData = async () => {
      await fetchUserData();
      await fetchOrders();
    };
    loadData();
  }, []);

  const fetchUserData = async () => {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) {
      navigate('/auth');
      return;
    }

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', authUser.id)
      .maybeSingle();

    if (error) {
      console.error('Error fetching user:', error);
      setLoading(false);
      return;
    }

    if (!data) {
      if (!profileCreationAttempted) {
        setProfileCreationAttempted(true);
        const { error: insertError, data: insertedData } = await supabase
          .from('users')
          .insert([{
            id: authUser.id,
            name: authUser.email,
            phone: '',
            address: '',
          }])
          .select()
          .maybeSingle();

        if (insertError) {
          console.error('Error creating profile:', insertError);
          toast.error('Помилка створення профілю');
          setLoading(false);
          return;
        }

        if (insertedData) {
          setUser(insertedData);
          setFormData({
            name: insertedData.name || '',
            phone: insertedData.phone || '',
            address: insertedData.address || '',
          });
          toast.success('Профіль успішно створено!');
        }
      }
      setLoading(false);
      return;
    }

    setUser(data);
    setFormData({
      name: data.name || '',
      phone: data.phone || '',
      address: data.address || '',
    });

    if (initialLogin.current) {
      toast.success('Вхід виконано успішно!');
      initialLogin.current = false;
    }
    setLoading(false);
  };

  const fetchOrders = async () => {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) return;

    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', authUser.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching orders:', error);
      toast.error('Помилка завантаження замовлень');
    } else {
      setOrders(data);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const { error } = await supabase
        .from('users')
        .update(formData)
        .eq('id', user.id);

      if (error) throw error;

      setEditing(false);
      await fetchUserData();
      toast.success('Профіль оновлено!');
    } catch (error) {
      console.error('Update error:', error);
      toast.error('Помилка оновлення профілю');
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success('Вихід виконано!');
    navigate('/auth');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-800"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Особистий кабінет</h1>
          <button
            onClick={handleLogout}
            className="flex items-center text-gray-600 hover:text-red-500"
          >
            <LogOut className="w-5 h-5 mr-2" />
            Вийти
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Профіль</h2>
                <button
                  onClick={() => setEditing(!editing)}
                  className="text-blue-800 hover:text-blue-700 text-sm"
                >
                  {editing ? 'Скасувати' : 'Редагувати'}
                </button>
              </div>

              {editing ? (
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ім'я
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Телефон
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Адреса
                    </label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-blue-800 text-white py-2 rounded-md hover:bg-blue-700"
                  >
                    Зберегти
                  </button>
                </form>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center">
                    <UserIcon className="w-5 h-5 text-gray-400 mr-2" />
                    <span>{user?.name || 'Не вказано'}</span>
                  </div>
                  <div className="flex items-center">
                    <Package className="w-5 h-5 text-gray-400 mr-2" />
                    <span>{user?.phone || 'Не вказано'}</span>
                  </div>
                  <div className="flex items-center">
                    <Package className="w-5 h-5 text-gray-400 mr-2" />
                    <span>{user?.address || 'Не вказано'}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="md:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Історія замовлень</h2>
              {orders.length === 0 ? (
                <p className="text-gray-500">У вас ще немає замовлень</p>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div
                      key={order.id}
                      className="border border-gray-200 rounded-md p-4"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-500">
                          {new Date(order.created_at).toLocaleDateString()}
                        </span>
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            order.status === 'delivered'
                              ? 'bg-green-100 text-green-800'
                              : order.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {order.status === 'delivered'
                            ? 'Доставлено'
                            : order.status === 'pending'
                            ? 'В обробці'
                            : 'В дорозі'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-medium">
                          Замовлення #{order.id.slice(0, 8)}
                        </span>
                        <span className="font-bold">{order.total} ₴</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;