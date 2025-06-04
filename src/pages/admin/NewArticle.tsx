import React, { useState, useEffect } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useNavigate } from "react-router-dom";

interface Article {
  id: number;
  title: string;
  content: string;
  image_path?: string;
}

const NewArticle: React.FC = () => {
  // Состояния для формы загрузки статьи
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  // Состояние для списка статей
  const [articles, setArticles] = useState<Article[]>([]);
  const navigate = useNavigate();

  // Загружаем статьи при монтировании компонента
  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    const { data, error } = await supabase
      .from("articles")
      .select("*")
      .order("id", { ascending: false });
    if (error) {
      console.error("Ошибка загрузки статей:", error.message);
    } else if (data) {
      setArticles(data as Article[]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    let imagePath = "";

    if (imageFile) {
      const fileName = `${Date.now()}_${imageFile.name}`;
      const { error: uploadError } = await supabase.storage
        .from("articles-images")
        .upload(fileName, imageFile);
      if (uploadError) {
        console.error("Ошибка загрузки изображения:", uploadError.message);
        setLoading(false);
        return;
      }
      imagePath = fileName;
    }

    const { error: insertError } = await supabase
      .from("articles")
      .insert([{ title, content, image_path: imagePath }]);
    if (insertError) {
      console.error("Ошибка добавления статьи:", insertError.message);
    } else {
      setTitle("");
      setContent("");
      setImageFile(null);
      alert("Статья успешно добавлена!");
      fetchArticles(); // Обновляем список статей после добавления
    }
    setLoading(false);
  };

  // Функция для получения публичного URL изображения
  const getPublicUrl = (imagePath: string) => {
    const { data } = supabase.storage
      .from("articles-images")
      .getPublicUrl(imagePath);
    return data.publicUrl;
  };

  // Обработчик клика по карточке статьи для перехода на страницу подробного просмотра
  const handleArticleClick = (article: Article) => {
    navigate(`/admin/articles/${article.id}`); // Предполагается, что данный маршрут существует
  };

  // Обработчик для перемещения карточки в начало списка
  const handleMoveToTop = (article: Article) => {
    setArticles((prev) => {
      const filtered = prev.filter((a) => a.id !== article.id);
      return [article, ...filtered];
    });
  };

  // Обработчик удаления статьи
  const handleDelete = async (article: Article) => {
    if (window.confirm(`Удалить статью "${article.title}"?`)) {
      const { error } = await supabase
        .from("articles")
        .delete()
        .eq("id", article.id);
      if (error) {
        console.error("Ошибка удаления статьи:", error.message);
      } else {
        setArticles((prev) => prev.filter((a) => a.id !== article.id));
      }
    }
  };

  return (
    <div className="container mx-auto p-4">
      {/* Форма загрузки статьи */}
      <div className="max-w-3xl mx-auto bg-white shadow rounded-lg p-6 mb-8">
        <h1 className="text-2xl font-bold mb-6 text-center">
          Добавить новую статью
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-2 font-medium">Заголовок</label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block mb-2 font-medium">Контент</label>
            <textarea
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={6}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block mb-2 font-medium">Изображение</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) =>
                e.target.files && setImageFile(e.target.files[0])
              }
              className="w-full"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            {loading ? "Загрузка..." : "Добавить статью"}
          </button>
        </form>
      </div>

      {/* Список статей */}
      <div>
        <h2 className="text-xl font-bold mb-4">Все статьи</h2>
        {articles.length === 0 ? (
          <p>Статей нет</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {articles.map((article) => (
              <div
                key={article.id}
                className="bg-white shadow rounded p-6 cursor-pointer flex flex-col"
              >
                <div onClick={() => handleArticleClick(article)} className="flex-1">
                  <h3 className="font-bold mb-3 text-lg">{article.title}</h3>
                  {article.image_path && (
                    <img
                      src={getPublicUrl(article.image_path)}
                      alt={article.title}
                      className="w-full h-40 object-cover mb-3 rounded"
                    />
                  )}
                  <p
                    className="text-sm text-gray-600 line-clamp-3"
                    style={{ whiteSpace: "pre-wrap" }}
                  >
                    {article.content}
                  </p>
                </div>
                <div className="mt-4 flex justify-between">
                  <button
                    onClick={() => handleMoveToTop(article)}
                    className="bg-green-500 hover:bg-green-600 text-white text-xs py-1 px-2 rounded transition-colors"
                  >
                    В начало
                  </button>
                  <button
                    onClick={() => handleDelete(article)}
                    className="bg-red-500 hover:bg-red-600 text-white text-xs py-1 px-2 rounded transition-colors"
                  >
                    Удалить
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NewArticle;
