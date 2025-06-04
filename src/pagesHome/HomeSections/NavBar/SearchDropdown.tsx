import React, { useState, useEffect, useMemo, memo, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { RiCloseLine, RiErrorWarningLine } from "react-icons/ri";
import { supabase } from "../../../lib/supabaseClient";
import { useIsMobile } from "../../../hooks/useIsMobile";

interface Product {
  id: string;
  brand: string;
  rating: number;
  width?: number;
  profile?: number | string;
  diameter?: number;
}

interface SearchDropdownProps {
  onClose: () => void;
  externalFilter?: string;
  onSearchChange?: (value: string) => void;
}

const SearchDropdown: React.FC<SearchDropdownProps> = ({
  onClose,
  externalFilter = "",
  onSearchChange,
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const isMobile = useIsMobile();

  const containerRef = useRef<HTMLDivElement>(null);

  // Обработчик клика вне окна: первое нажатие закрывает окно и предотвращает дальнейшие клики на элементы под ним
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        event.stopPropagation();
        event.preventDefault();
        onClose();
      }
    };

    document.addEventListener("click", handleClickOutside, { capture: true });
    return () => {
      document.removeEventListener("click", handleClickOutside, { capture: true });
    };
  }, [onClose]);

  useEffect(() => {
    const fetchProducts = async () => {
      const { data, error } = await supabase
        .from("products")
        .select("id, brand, rating, width, profile, diameter")
        .gte("rating", 20);

      if (error) {
        console.error("Supabase error:", error);
        setError("Ошибка загрузки данных");
      } else if (data) {
        setProducts(data as Product[]);
      }
      setIsLoaded(true);
    };
    fetchProducts();
  }, []);

  const popularSizes = useMemo(() => {
    const sizesMap = new Map<string, number>();
    products.forEach((product) => {
      if (product.width && product.profile && product.diameter) {
        const size = `${product.width}/${product.profile} R${product.diameter}`;
        sizesMap.set(size, (sizesMap.get(size) || 0) + 1);
      }
    });
    return Array.from(sizesMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map((entry) => entry[0]);
  }, [products]);

  const popularBrands = useMemo(() => {
    const brandsMap = new Map<string, number>();
    products.forEach((product) => {
      if (product.brand) {
        brandsMap.set(product.brand, (brandsMap.get(product.brand) || 0) + 1);
      }
    });
    return Array.from(brandsMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map((entry) => entry[0]);
  }, [products]);

  const filteredSizes = useMemo(() => {
    if (!externalFilter.trim()) return popularSizes;
    return popularSizes.filter((size) =>
      size.toLowerCase().includes(externalFilter.toLowerCase())
    );
  }, [externalFilter, popularSizes]);

  const filteredBrands = useMemo(() => {
    if (!externalFilter.trim()) return popularBrands;
    return popularBrands.filter((brand) =>
      brand.toLowerCase().includes(externalFilter.toLowerCase())
    );
  }, [externalFilter, popularBrands]);

  if (!isLoaded) return null;

  const hasNoResults =
    externalFilter.trim() !== "" &&
    filteredSizes.length === 0 &&
    filteredBrands.length === 0;

  // Варианты анимации для мобильной и десктопной версий
  const slideVariants = isMobile
    ? {
        initial: { y: "-100%", opacity: 0 },
        animate: { y: 0, opacity: 1, transition: { duration: 0.5, ease: "easeInOut" } },
        exit: { y: "-100%", opacity: 0, transition: { duration: 0.5, ease: "easeInOut" } },
      }
    : {
        initial: { y: "-10%", opacity: 0 },
        animate: { y: "0%", opacity: 1, transition: { duration: 0.3, ease: "easeInOut" } },
        exit: { y: "-10%", opacity: 0, transition: { duration: 0.3, ease: "easeInOut" } },
      };

  const baseClasses = isMobile
    ? "fixed inset-x-0 top-16 z-50 bg-white shadow-lg p-4 overflow-hidden max-h-[80vh]"
    : "absolute z-50 top-full left-0 w-full bg-white shadow-lg rounded-lg mt-1 p-4 max-h-[80vh] overflow-y-auto";

  return (
    <motion.div
      ref={containerRef}
      className={baseClasses}
      onClick={(e) => e.stopPropagation()}
      variants={slideVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        className="absolute top-2 right-2 text-gray-600 text-2xl p-2 hover:bg-gray-100 rounded-full transition-transform duration-150 active:scale-150"
        aria-label="Закрыть поиск"
      >
        <RiCloseLine />
      </button>

      {isMobile && (
        <div className="mb-4" onTouchStart={(e) => e.stopPropagation()}>
          <input
            type="text"
            value={externalFilter}
            onChange={(e) => onSearchChange?.(e.target.value)}
            onPointerDown={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            placeholder="Пошук..."
            className="w-full px-3 py-2 border border-gray-300 text-black rounded-lg focus:outline-none text-lg"
          />
        </div>
      )}

      {/* Анимация для результатов поиска */}
      <AnimatePresence>
        {(externalFilter.trim() === "" ||
          filteredSizes.length > 0 ||
          filteredBrands.length > 0 ||
          hasNoResults) && (
          <motion.div
            key="search-results"
            initial={{ opacity: 0, height: 0 }}
            animate={{
              opacity: 1,
              height: "auto",
              transition: { duration: 0.3, ease: "easeInOut" },
            }}
            exit={{
              opacity: 0,
              y: -10,
              transition: { duration: 0.3, ease: "easeInOut" },
            }}
            style={{ overflow: "hidden" }}
            onClick={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
          >
            {error ? (
              <div className="flex items-center text-red-500 gap-2 p-4">
                <RiErrorWarningLine className="text-2xl" />
                <p>{error}</p>
              </div>
            ) : products.length === 0 ? (
              <p className="text-center p-4 text-gray-500">Нет данных</p>
            ) : hasNoResults ? (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center p-4 bg-yellow-50 rounded-lg"
              >
                <RiErrorWarningLine className="text-yellow-600 text-3xl mb-2" />
                <p className="text-yellow-800 text-center">
                  За вашим запитом{" "}
                  <span className="font-semibold">"{externalFilter}"</span> нічого не знайдено
                </p>
                <p className="text-yellow-700 text-sm mt-1 text-center">
                  Спробуйте інші ключові слова або перевірте правильність введення
                </p>
              </motion.div>
            ) : (
              <>
                <div className="mt-6">
                  {externalFilter.trim() === "" && (
                    <h2 className="text-xl text-black md:text-lg font-bold mb-2">
                      Популярні типорозміри
                    </h2>
                  )}
                  <div className="grid grid-cols-4 gap-2">
                    {filteredSizes.map((size, index) => (
                      <Link
                        to={`/search?size=${encodeURIComponent(size)}`}
                        key={index}
                        className="text-xs font-medium p-2 text-black bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                        onClick={onClose}
                      >
                        {size}
                      </Link>
                    ))}
                  </div>
                </div>
                <div className="mt-6">
                  {externalFilter.trim() === "" && (
                    <h2 className="text-xl text-black md:text-lg font-bold mb-2">
                      Популярні бренди
                    </h2>
                  )}
                  <div className="grid grid-cols-4 gap-2">
                    {filteredBrands.map((brand, index) => (
                      <Link
                        to={`/search?brand=${encodeURIComponent(brand)}`}
                        key={index}
                        className="text-xs font-medium p-2 text-black bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                        onClick={onClose}
                      >
                        {brand}
                      </Link>
                    ))}
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default memo(SearchDropdown);
