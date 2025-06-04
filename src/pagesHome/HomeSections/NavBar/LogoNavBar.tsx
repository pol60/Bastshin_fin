import { FC, memo, useEffect, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";

interface LogoProps {
  className?: string;
  align?: "left" | "center" | "right";
}

// Глобальный кэш для URL логотипа
let logoCache: { url: string; timestamp: number } | null = null;
const CACHE_TTL = 3600000; // 1 час

const LogoNavBar: FC<LogoProps> = memo(({ className = "w-28", align = "left" }) => {
  const [logoUrl, setLogoUrl] = useState(logoCache?.url || "");
  const [isLoading, setIsLoading] = useState(!logoCache);
  
  const alignmentClass = 
    align === 'left' ? 'ml-0' : 
    align === 'right' ? 'mr-0' : 'mx-auto';

  useEffect(() => {
    const fetchLogo = async () => {
      try {
        // Используем кэш если он валиден
        if (logoCache && Date.now() - logoCache.timestamp < CACHE_TTL) {
          setLogoUrl(logoCache.url);
          setIsLoading(false);
          return;
        }

        const bucket = import.meta.env.VITE_SUPABASE_BUCKET || "Logo";
        const fileName = import.meta.env.VITE_SUPABASE_LOGO_FILENAME || "logo.png";
        
        // Метод getPublicUrl возвращает только data
        const { data } = supabase.storage
          .from(bucket)
          .getPublicUrl(fileName);

        if (!data.publicUrl) {
          throw new Error("Logo load error: publicUrl is undefined");
        }

        // Обновляем кэш
        logoCache = { 
          url: data.publicUrl, 
          timestamp: Date.now() 
        };
        setLogoUrl(data.publicUrl);
      } catch (error) {
        console.error('Logo load error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (!logoUrl) fetchLogo();
  }, [logoUrl]);

  if (isLoading) {
    return (
      <div 
        className={`${className} ${alignmentClass} bg-gray-200 animate-pulse rounded-md`}
        aria-label="Loading logo..."
      />
    );
  }

  if (!logoUrl) {
    return (
      <div className={`${className} ${alignmentClass} bg-gray-200 flex items-center justify-center text-xs`}>
        ShinaGo
      </div>
    );
  }

  return (
    <img
      src={logoUrl}
      alt="ShinaGo"
      className={`${className} ${alignmentClass} h-auto object-contain`}
      style={{
        transform: 'translateZ(0)',
        imageRendering: 'crisp-edges',
        contentVisibility: 'auto',
      }}
      loading="eager"
      decoding="async"
    />
  );
});

export default LogoNavBar;
