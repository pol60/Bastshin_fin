// ArticleDetailPage.tsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

interface Article {
  id: number;
  title: string;
  content: string;
  image_path?: string;
}

const ArticleDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);

  const getPublicUrl = (imagePath: string) => {
    const { data } = supabase.storage
      .from('articles-images')
      .getPublicUrl(imagePath);
    return data.publicUrl;
  };

  useEffect(() => {
    const fetchArticle = async () => {
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching article:', error);
      } else {
        setArticle(data);
      }
      setLoading(false);
    };

    fetchArticle();
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (!article) return <div>Article not found</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">{article.title}</h1>
      {article.image_path && (
        <img
          src={getPublicUrl(article.image_path)}
          alt={article.title}
          className="w-full h-64 object-cover mb-4 rounded-lg"
        />
      )}
      <div className="prose max-w-none">
        <pre className="whitespace-pre-wrap">{article.content}</pre>
      </div>
    </div>
  );
};

export default ArticleDetailPage;