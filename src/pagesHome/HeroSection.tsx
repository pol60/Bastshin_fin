import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { Button } from "../components/ui/button";
import { Select, SelectItem } from "../components/ui/select";
import { supabase } from "../lib/supabaseClient";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

type FilterType = "width" | "profile" | "diameter" | "season" | "brand";

// Интерфейс для динамически загружаемых опций фильтров
type DynamicFilterOptions = Record<FilterType, string[]>;

const filterLabels: Record<FilterType, string> = {
  width: "Ширина",
  profile: "Профіль",
  diameter: "Діаметр",
  season: "Сезон",
  brand: "Бренд",
};

// Маппинг для перевода значений сезона на украинский
const seasonMapping: Record<string, string> = {
  summer: "Літній",
  winter: "Зимній",
  "all-season": "Всесезонний",
};

// Функция для загрузки фильтров из базы через Supabase
const fetchDynamicFilters = async (): Promise<DynamicFilterOptions> => {
  const { data, error } = await supabase
    .from("products")
    .select("width, profile, diameter, season, brand");
  if (error) throw new Error(error.message);
  if (data && data.length > 0) {
    const widths = Array.from(
      new Set(
        data
          .map((item) => item.width)
          .filter((val) => val !== null)
          .map((val) => Number(val))
      )
    )
      .filter((val) => !isNaN(val))
      .sort((a, b) => a - b)
      .map(String);
    const profiles = Array.from(
      new Set(
        data
          .map((item) => item.profile)
          .filter((val) => val !== null)
          .map((val) => Number(val))
      )
    )
      .filter((val) => !isNaN(val))
      .sort((a, b) => a - b)
      .map(String);
    const diameters = Array.from(
      new Set(
        data
          .map((item) => item.diameter)
          .filter((val) => val !== null)
          .map((val) => Number(val))
      )
    )
      .filter((val) => !isNaN(val))
      .sort((a, b) => a - b)
      .map(String);
    const seasons = Array.from(
      new Set(data.map((item) => item.season).filter(Boolean))
    ).sort((a, b) => a.localeCompare(b));
    const brands = Array.from(
      new Set(data.map((item) => item.brand).filter(Boolean))
    ).sort((a, b) => a.localeCompare(b));

    return {
      width: widths,
      profile: profiles,
      diameter: diameters,
      season: seasons,
      brand: brands,
    };
  }
  return { width: [], profile: [], diameter: [], season: [], brand: [] };
};

export const HeroSection: React.FC<{ 
  className?: string;
  shouldAnimate?: boolean;
}> = ({ className, shouldAnimate = false }) => {
  const navigate = useNavigate();
  const heroRef = useRef<HTMLDivElement>(null);

  // Состояние для выбранных значений фильтров
  const [quickFilters, setQuickFilters] = useState<Record<FilterType, string[]>>({
    width: [],
    profile: [],
    diameter: [],
    season: [],
    brand: [],
  });

  // Загрузка динамических опций фильтров через React Query
  const { data: dynamicOptions, isLoading, error, refetch } = useQuery<DynamicFilterOptions>({
    queryKey: ["dynamicFilters"],
    queryFn: fetchDynamicFilters,
    staleTime: 6 * 60 * 60 * 1000,    
    initialData: { 
      width: [], 
      profile: [], 
      diameter: [], 
      season: [], 
      brand: [] 
    },
  });
  
  useEffect(() => {
    if (dynamicOptions && !dynamicOptions.width.length) {
      refetch();
    }
  }, [dynamicOptions, refetch]);

  // Состояние для отображаемых опций с пагинацией (начинаем с первых 6 элементов)
  const [visibleOptions, setVisibleOptions] = useState<DynamicFilterOptions>({
    width: [],
    profile: [],
    diameter: [],
    season: [],
    brand: [],
  });

  useEffect(() => {
    if (dynamicOptions) {
      setVisibleOptions({
        width: dynamicOptions.width.slice(0, 6),
        profile: dynamicOptions.profile.slice(0, 6),
        diameter: dynamicOptions.diameter.slice(0, 6),
        season: dynamicOptions.season.slice(0, 6),
        brand: dynamicOptions.brand.slice(0, 6),
      });
    }
  }, [dynamicOptions]);

  // Обработчик выбора опций фильтра
  const handleFilterSelect = useCallback(
    (filterType: FilterType, values: string[]) => {
      setQuickFilters((prev) => ({ ...prev, [filterType]: values }));
    },
    []
  );

  // Быстрый поиск по выбранным фильтрам
  const handleQuickSearch = useCallback(() => {
    const params = new URLSearchParams();
    Object.entries(quickFilters).forEach(([key, values]) => {
      if (values.length > 0) params.set(key, values.join(","));
    });
    if (!params.toString().length) {
      alert("Виберіть хоча б один параметр для пошуку");
      return;
    }
    navigate(`/search-results?${params.toString()}`);
  }, [quickFilters, navigate]);

  const handleDetailedSearch = useCallback(() => {
    navigate("/detailed-search");
  }, [navigate]);

  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);
  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const imageUrl = useMemo(() => {
    const { data } = supabase.storage
      .from("Fon")
      .getPublicUrl(import.meta.env.VITE_BACKGROUND_IMAGE_NAME);
    return data.publicUrl;
  }, []);

  useEffect(() => {
    const img = new Image();
    img.src = imageUrl;
  }, [imageUrl]);

  const backgroundStyle = useMemo(
    () => ({
      backgroundImage: `linear-gradient(
        to bottom,
        rgba(30,63,172,1) 0%,
        rgba(30,63,172,0.7) 30%,
        rgba(30,63,172,0.3) 150%,
        rgba(30,63,172,1) 180%
      ), url(${imageUrl})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
      height: isDesktop ? "280px" : "320px",
    }),
    [imageUrl, isDesktop]
  );

  if (isLoading) {
    return (
      <section
        ref={heroRef}
        className={`relative min-h-[200px] max-h-[400px] ${className || ""} ${shouldAnimate ? "fade-in" : ""}`}
        style={backgroundStyle}
      >
        <div className="container mx-auto px-4 h-full flex items-center justify-center">
          <div>Загрузка фільтрів...</div>
        </div>
      </section>
    );
  }

  if (error) {
    console.error("Error loading dynamic filters:", error);
  }

  const filters: FilterType[] = ["width", "profile", "diameter", "season", "brand"];

  return (
    <section
      ref={heroRef}
      className={`relative min-h-[200px] max-h-[400px] ${className || ""} ${shouldAnimate ? "fade-in" : ""}`}
      style={backgroundStyle}
    >
      <div className="container mx-auto px-4 h-full flex items-center justify-center">
        <div className="w-full md:max-w-[600px] mx-auto">
          {/* Мобильная версия */}
          <div className="block md:hidden">
            <div className="mb-4 grid grid-cols-2 gap-0 sm:grid-cols-3 md:grid-cols-7">
              {filters.map((filter) => {
                let extraClasses = "rounded-none";
                if (filter === "width") extraClasses = "rounded-none rounded-tl-xl";
                else if (filter === "profile") extraClasses = "rounded-none rounded-tr-xl";

                return (
                  <div key={filter} className={`relative ${filter === "brand" ? "col-span-2 sm:col-span-1" : ""}`}>
                    <Select
                      multiple
                      value={quickFilters[filter]}
                      onValueChange={(newValue) => handleFilterSelect(filter, newValue as string[])}
                      placeholder={filterLabels[filter]}
                      className={`bg-white text-gray-500 hover:bg-gray-100 transition-colors active:!bg-gray-100 active:!opacity-100 
                        px-8 py-3 text-base sm:px-8 sm:py-3 sm:text-sm h-auto min-w-[120px] w-full ${extraClasses}`}
                      // Для фильтра "season" отображаем выбранные значения по-украински
                      {...(filter === "season"
                        ? {
                            displayValue: (values: string[]) =>
                              values.map((val) => seasonMapping[val.toLowerCase()] || val).join(", "),
                          }
                        : {})}
                    >
                      {visibleOptions[filter].map((option: string) => (
                        <SelectItem key={option} value={option}>
                          {filter === "season"
                            ? seasonMapping[option.toLowerCase()] || option
                            : option}
                        </SelectItem>
                      ))}
                    </Select>
                  </div>
                );
              })}
              {/* Поменяли местами кнопки: сначала Детальний пошук, затем Підібрати */}
              <div className="relative">
                <Button
                  onClick={handleDetailedSearch}
                  className="bg-blue-600 hover:bg-blue-700 text-white/90 
                    px-6 py-2 text-base sm:px-8 sm:py-2 sm:text-sm h-auto min-w-[120px] w-full flex items-center justify-center 
                    rounded-none rounded-bl-xl active:!bg-blue-800 active:!opacity-100"
                >
                  Детальний пошук
                </Button>
              </div>
              <div className="relative">
                <Button
                  onClick={handleQuickSearch}
                  className="bg-green-600 hover:bg-green-700 text-white/90 
                    px-6 py-2 text-base sm:px-8 sm:py-2 sm:text-sm h-auto min-w-[120px] w-full flex items-center justify-center 
                    rounded-none rounded-br-xl active:!bg-green-800 active:!opacity-100"
                >
                  Підібрати
                </Button>
              </div>
            </div>
          </div>

          {/* Десктоп и планшет версия */}
          <div className="hidden md:block">
            <div className="grid grid-cols-5 gap-0">
              {filters.map((filter) => {
                let extraClasses = "rounded-none min-h-[56px]";
                if (filter === "width") extraClasses = "rounded-none rounded-tl-xl min-h-[56px]";
                else if (filter === "brand") extraClasses = "rounded-none rounded-tr-xl min-h-[56px]";

                return (
                  <div key={filter} className="relative">
                    <Select
                      multiple
                      value={quickFilters[filter]}
                      onValueChange={(newValue) => handleFilterSelect(filter, newValue as string[])}
                      placeholder={filterLabels[filter]}
                      className={`bg-white text-gray-500 hover:bg-gray-300 transition-colors active:!bg-gray-100 active:!opacity-100 
                        px-4 py-2 text-base w-full flex items-center justify-center ${extraClasses}`}
                      {...(filter === "season"
                        ? {
                            displayValue: (values: string[]) =>
                              values.map((val) => seasonMapping[val.toLowerCase()] || val).join(", "),
                          }
                        : {})}
                    >
                      {visibleOptions[filter].map((option: string) => (
                        <SelectItem key={option} value={option}>
                          {filter === "season"
                            ? seasonMapping[option.toLowerCase()] || option
                            : option}
                        </SelectItem>
                      ))}
                    </Select>
                  </div>
                );
              })}
            </div>
            {/* Поменяли кнопки местами */}
            <div className="flex">
              <Button
                onClick={handleDetailedSearch}
                className="bg-blue-600 hover:bg-blue-700 text-white/90 
                  px-6 py-2 text-base w-1/2 flex items-center justify-center 
                  rounded-none rounded-bl-xl active:!bg-blue-800 active:!opacity-100"
              >
                Детальний пошук
              </Button>
              <Button
                onClick={handleQuickSearch}
                className="bg-green-600 hover:bg-green-700 text-white/90 
                  px-6 py-2 text-base w-1/2 flex items-center justify-center 
                  rounded-none rounded-br-xl active:!bg-green-800 active:!opacity-100"
              >
                Підібрати
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
