import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { User } from '@supabase/supabase-js';

interface Review {
  id: string;
  product_id: string;
  comment: string;
  created_at: string;
  user_id: string;
  rating: number;
}

const CommentsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [newComment, setNewComment] = useState('');
  const [rating, setRating] = useState(5);
  const [user, setUser] = useState<User | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  // Проверка авторизации при загрузке
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoadingAuth(false);
    };
    checkAuth();
  }, []);

  // Если проверка завершена и пользователь не авторизован – редирект
  useEffect(() => {
    if (!loadingAuth && !user) {
      navigate('/auth', { state: { from: location.pathname } });
    }
  }, [loadingAuth, user, navigate, location.pathname]);

  // Загрузка отзывов для товара
  useEffect(() => {
    const loadReviews = async () => {
      const { data, error } = await supabase
        .from('reviews')
        .select('id, product_id, comment, created_at, user_id, rating')
        .eq('product_id', id)
        .order('created_at', { ascending: false });
      if (!error && data) {
        setReviews(data as Review[]);
      }
    };

    if (id) {
      loadReviews();
    }
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    if (!user) {
      navigate('/auth', { state: { from: location.pathname } });
      return;
    }

    const { data, error } = await supabase
      .from('reviews')
      .insert([{ product_id: id, comment: newComment, rating, user_id: user.id }])
      .select();

    if (!error && data) {
      setReviews([data[0] as Review, ...reviews]);
      setNewComment('');
      setRating(5);
    }
  };

  // Не рендерим ничего, пока идет проверка авторизации
  if (loadingAuth) return null;

  return (
    <div className="container mx-auto p-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-2">Відгуки про товар</h1>
        <p className="mb-6 text-sm text-gray-600">Всього відгуків: {reviews.length}</p>

        <form onSubmit={handleSubmit} className="mb-8 bg-gray-50 p-4 rounded-lg">
          <div className="mb-4">
            <label className="block mb-2 font-medium">Ваша оцінка:</label>
            <select
              value={rating}
              onChange={(e) => setRating(Number(e.target.value))}
              className="w-full p-2 border rounded"
            >
              {[5, 4, 3, 2, 1].map((num) => (
                <option key={num} value={num}>
                  {num} ★
                </option>
              ))}
            </select>
          </div>

          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="w-full p-2 border rounded mb-4"
            placeholder="Напишіть ваш відгук..."
            rows={4}
            required
          />

          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
          >
            Опублікувати
          </button>
        </form>

        <div className="space-y-6">
          {reviews.length === 0 ? (
            <p>Відгуків поки немає.</p>
          ) : (
            reviews.map((review) => (
              <div key={review.id} className="bg-white p-4 rounded-lg shadow-sm border">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <span
                        key={i}
                        className={`text-xl ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                  <span className="text-sm text-gray-500">
                    {new Date(review.created_at).toLocaleDateString('uk-UA')}
                  </span>
                </div>
                <p className="text-gray-800 mb-2">{review.comment}</p>
                <div className="text-sm text-gray-500">
                  Користувач: анонімний {review.user_id.slice(0, 6)}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default CommentsPage;
