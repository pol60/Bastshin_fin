import React, { useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Product } from '../Home';
import { useNavigate } from 'react-router-dom';

interface SaleProductsSectionProps {
  saleProducts: Product[];
  lastProductRef: (node: HTMLDivElement | null) => void;
  renderProductCard: (product: Product, isLazy?: boolean, className?: string) => JSX.Element;
  isLoading?: boolean;
  isMobile: boolean;
}

const SaleProductsSection: React.FC<SaleProductsSectionProps> = ({
  saleProducts,
  lastProductRef,
  renderProductCard,
  isLoading = false,
  isMobile,
}) => {
  // Определяем количество товаров на странице: для мобильной – 2, для десктопа – 4.
  const itemsPerPage = isMobile ? 2 : 4;
  const totalSlides = Math.ceil(saleProducts.length / itemsPerPage);
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();

  // Ref для контейнера мобильного скролла
  const containerRef = useRef<HTMLDivElement>(null);

  // Обработчик скролла для мобильной версии
  const handleScroll = () => {
    if (containerRef.current) {
      const scrollLeft = containerRef.current.scrollLeft;
      const containerWidth = containerRef.current.clientWidth;
      const slideIndex = Math.round(scrollLeft / containerWidth);
      setCurrentSlide(slideIndex);
    }
  };

  // Обработчики для десктопной версии
  const handlePrev = () => {
    setCurrentSlide(currentSlide > 0 ? currentSlide - 1 : totalSlides - 1);
  };

  const handleNext = () => {
    setCurrentSlide(currentSlide < totalSlides - 1 ? currentSlide + 1 : 0);
  };

  // Для мобильной версии группируем товары по слайдам (по 2 товара)
  const slides = isMobile
    ? Array.from({ length: totalSlides }, (_, slideIndex) =>
        saleProducts.slice(slideIndex * itemsPerPage, (slideIndex + 1) * itemsPerPage)
      )
    : [];

  return (
    <section id="sale" className="mb-10">
      {/* Заголовок и кнопки переключения в одном flex-контейнере */}
      <div className="flex items-center mb-6 justify-center lg:justify-between">
        <h2 className="text-2xl lg:text-3xl font-bold text-center lg:text-left">Акційні пропозиції</h2>
        {!isMobile && !isLoading && saleProducts.length > 0 && (
          <div className="flex space-x-2">
            <Button
              onClick={handlePrev}
              className="bg-blue-600/80 text-white hover:bg-blue-400 transition-transform duration-150"
              size="icon"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              onClick={handleNext}
              className="bg-blue-600/80 text-white hover:bg-blue-400 transition-transform duration-150"
              size="icon"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Отображение товаров */}
      {isMobile ? (
        // Мобильная версия: использование нативного горизонтального скролла с CSS scroll snap
        <div
          ref={containerRef}
          onScroll={handleScroll}
          className="relative overflow-x-auto rounded-[12px] scroll-smooth snap-x snap-mandatory"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          <div className="flex">
            {slides.map((slide, slideIndex) => (
              <div key={slideIndex} className="flex-shrink-0 w-full snap-start">
                <div className="grid grid-cols-2 gap-4 md:gap-6">
                  {isLoading
                    ? Array.from({ length: itemsPerPage }).map((_, idx) => (
                        <div key={idx} className="h-48 w-full bg-gray-300 rounded" />
                      ))
                    : slide.map((product, index, array) => (
                        <div
                          key={`sale-${product.id}`}
                          ref={
                            slideIndex === slides.length - 1 && index === array.length - 1
                              ? lastProductRef
                              : null
                          }
                          className="flex justify-center"
                        >
                          {renderProductCard(product, false)}
                        </div>
                      ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        // Десктопная версия: вывод товаров в виде сетки
        <div className="grid grid-cols-4 gap-4 md:gap-6">
          {isLoading
            ? Array.from({ length: itemsPerPage }).map((_, idx) => (
                <div key={idx} className="h-48 w-full bg-gray-300 rounded" />
              ))
            : saleProducts
                .slice(currentSlide * itemsPerPage, (currentSlide + 1) * itemsPerPage)
                .map((product, index, array) => (
                  <div
                    key={`sale-${product.id}`}
                    ref={index === array.length - 1 ? lastProductRef : null}
                    className="flex justify-center"
                  >
                    {renderProductCard(product, false)}
                  </div>
                ))}
        </div>
      )}

      {/* Нижняя часть: индикаторы слайдов и кнопка "Дивитись всі" */}
      <div className="flex flex-col items-center mt-4">
        <div className="flex space-x-2 mb-2">
          {Array.from({ length: totalSlides }).map((_, i) => (
            <div
              key={i}
              className={`h-2 rounded-full transition-transform duration-300 ${
                i === currentSlide ? 'bg-blue-600 w-4 scale-125' : 'bg-gray-300 w-2'
              }`}
            />
          ))}
        </div>
        <Button
          onClick={() => navigate("/tires?sale=true")}
          className="text-black border-2 border-green-600 bg-transparent hover:bg-blue-50 px-4 py-2 rounded transition-all mt-2"
        >
          Дивитись всі
        </Button>
      </div>
    </section>
  );
};

export default SaleProductsSection;
