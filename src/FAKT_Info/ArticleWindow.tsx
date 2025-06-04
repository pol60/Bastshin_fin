import React, { useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import { useNavigate, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

export interface Article {
  id: number;
  title: string;
  content: string;
  image_path: string;
}

const ArticleWindow: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isFullPage = location.pathname === "/articles";

  // Загрузка статей с кэшированием на 6 часов (360 минут)
  const { data: articles = [], isLoading } = useQuery<Article[]>({
    queryKey: ["articles"],
    queryFn: async () => {
      const { data, error } = await supabase.from("articles").select("*");
      if (error) throw new Error(error.message);
      return data;
    },
    staleTime: 6 * 60 * 60 * 1000,
  });

  // Предзагрузка изображений статей для кэширования в браузере
  useEffect(() => {
    if (!isLoading && articles.length > 0) {
      articles.forEach((article) => {
        if (article.image_path) {
          const {
            data: { publicUrl },
          } = supabase.storage.from("articles-images").getPublicUrl(article.image_path);
          if (publicUrl) {
            const img = new Image();
            img.src = publicUrl;
          }
        }
      });
    }
  }, [isLoading, articles]);

  return (
    <div className="container mx-auto p-1 sm:p-4 ">
      <h1 className="text-2xl font-bold text-center mb-6">Блог та Статті</h1>
      {isFullPage ? (
        // Полноэкранный режим: сетка с 3 колонками на десктопе
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {articles.map((article) => {
            const publicUrl =
              article.image_path &&
              supabase.storage.from("articles-images").getPublicUrl(article.image_path).data.publicUrl;
            return (
              <div
                key={article.id}
                className="cursor-pointer"
                onClick={() => navigate(`/articles/${article.id}`)}
              >
                {publicUrl ? (
                  <img
                    src={publicUrl}
                    alt={article.title}
                    className="w-full h-64 object-cover rounded-lg"
                  />
                ) : (
                  <div className="w-full h-64 bg-gray-300 rounded-lg flex items-center justify-center">
                    Нет изображения
                  </div>
                )}
                <h2 className="text-xl font-semibold text-center mt-2">
                  {article.title}
                </h2>
              </div>
            );
          })}
        </div>
      ) : (
        <>
          <ArticleCarousel articles={articles} />
          <div className="text-center mt-6">
            <button
              className="px-2 py-2 rounded text-black border-2 border-green-600 bg-transparent hover:bg-blue-50 transition-all"
              onClick={() => navigate("/articles")}
            >
              дивитись всі публікації
            </button>
          </div>
        </>
      )}
    </div>
  );
};

interface ArticleCarouselProps {
  articles: Article[];
}

const ArticleCarousel: React.FC<ArticleCarouselProps> = ({ articles }) => {
  const navigate = useNavigate();

  // Всегда вызываем хуки в начале компонента
  const [isMobile, setIsMobile] = React.useState(window.innerWidth < 640);
  const [currentSlide, setCurrentSlide] = React.useState(0);
  const containerRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleScroll = () => {
    if (containerRef.current) {
      const scrollLeft = containerRef.current.scrollLeft;
      const slideWidth = containerRef.current.clientWidth;
      const index = Math.round(scrollLeft / slideWidth);
      setCurrentSlide(index);
    }
  };

  // Если статей нет, выводим сообщение, но хуки вызываются всегда
  if (articles.length === 0) {
    return <div>Нет статей для отображения</div>;
  }

  return (
    <>
      {/* Карусель с поддержкой scroll snap для мобильных устройств */}
      <div
        ref={containerRef}
        onScroll={isMobile ? handleScroll : undefined}
        className="flex space-x-4 overflow-x-auto scroll-smooth snap-x snap-mandatory"
      >
        {articles.map((article) => {
          const publicUrl =
            article.image_path &&
            supabase.storage.from("articles-images").getPublicUrl(article.image_path).data.publicUrl;
          return (
            <div
              key={article.id}
              onClick={() => navigate(`/articles/${article.id}`)}
              className="flex-shrink-0 w-full sm:w-1/2 md:w-1/3 cursor-pointer snap-start"
            >
              {publicUrl ? (
                <img
                  src={publicUrl}
                  alt={article.title}
                  className="w-full h-64 object-cover rounded-lg"
                />
              ) : (
                <div className="w-full h-64 bg-gray-300 rounded-lg flex items-center justify-center">
                  Нет изображения
                </div>
              )}
              <h2 className="text-xl font-semibold text-center mt-2">
                {article.title}
              </h2>
            </div>
          );
        })}
      </div>
      {/* Индикатор текущего слайда (точки) – только для мобильной версии */}
      {isMobile && (
        <div className="flex justify-center mt-2">
          {articles.map((_, i) => (
            <div
              key={i}
              className={`mx-1 w-3 h-3 rounded-full ${i === currentSlide ? "bg-blue-600" : "bg-gray-300"}`}
            />
          ))}
        </div>
      )}
    </>
  );
};

export default ArticleWindow;
