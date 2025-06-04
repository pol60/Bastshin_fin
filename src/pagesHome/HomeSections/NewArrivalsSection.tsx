import React, { useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Product } from '../Home';
import { useNavigate } from 'react-router-dom';

interface NewArrivalsSectionProps {
  newArrivals: Product[];
  currentSlide: number;
  onSlideChange: (direction: 'next' | 'prev') => void;
  lastProductRef: (node: HTMLDivElement | null) => void;
  renderProductCard: (product: Product, isLazy?: boolean, className?: string) => JSX.Element;
  isMobile: boolean;
  isLoading?: boolean;
}

const NewArrivalsSection: React.FC<NewArrivalsSectionProps> = ({
  newArrivals,
  currentSlide,
  onSlideChange,
  lastProductRef,
  renderProductCard,
  isMobile,
  isLoading = false,
}) => {
  // Для мобильной версии: по 2 карточки на слайд, для десктопа – 4
  const itemsPerPage = isMobile ? 2 : 4;
  const totalSlides = Math.ceil(newArrivals.length / itemsPerPage);

  const navigate = useNavigate();

  // Локальное состояние для текущего слайда в мобильной версии,
  // которое обновляется при скролле контейнера
  const [mobileCurrentSlide, setMobileCurrentSlide] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    if (containerRef.current) {
      const scrollLeft = containerRef.current.scrollLeft;
      const slideWidth = containerRef.current.clientWidth;
      const index = Math.round(scrollLeft / slideWidth);
      setMobileCurrentSlide(index);
    }
  };

  const handleViewAll = () => {
    // Переход на страницу каталога товаров без фильтрации
    navigate('/tires');
  };

  // Для мобильной версии группируем товары по слайдам (каждый слайд – сетка из 2 карточек)
  const slides = isMobile
    ? Array.from({ length: totalSlides }, (_, slideIndex) =>
        newArrivals.slice(slideIndex * itemsPerPage, (slideIndex + 1) * itemsPerPage)
      )
    : [];

  return (
    <section id="new" className="mb-10">
      <div className="flex items-center mb-10 gap-6 sm:gap-12 justify-center lg:justify-between">
        <h2 className="text-2xl lg:text-3xl font-bold text-center lg:text-left">
          Нові надходження
        </h2>
        {/* Стрелки для десктопа */}
        {!isMobile && !isLoading && newArrivals.length > 0 && (
          <div className="flex items-center space-x-6">
            <Button
              style={{ touchAction: 'manipulation' }}
              className="bg-blue-600/80 text-white active:bg-blue-600/90 transition-transform duration-150 active:scale-110 hover:bg-blue-400"
              size="icon"
              onPointerUp={() => onSlideChange('prev')}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              style={{ touchAction: 'manipulation' }}
              className="bg-blue-600/80 text-white active:bg-blue-600/90 transition-transform duration-150 active:scale-110 hover:bg-blue-400"
              size="icon"
              onPointerUp={() => onSlideChange('next')}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {isMobile ? (
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
                        <div key={idx} className="h-48 bg-gray-300 rounded" />
                      ))
                    : slide.map((product, index, array) => (
                        <div
                          key={product.id}
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
        <div className="grid grid-cols-4 gap-6 md:gap-6">
          {isLoading
            ? Array.from({ length: itemsPerPage }).map((_, idx) => (
                <div key={idx} className="h-48 bg-gray-300 rounded" />
              ))
            : newArrivals
                .slice(currentSlide * itemsPerPage, (currentSlide + 1) * itemsPerPage)
                .map((product, index, array) => (
                  <div
                    key={product.id}
                    ref={index === array.length - 1 ? lastProductRef : null}
                    className="flex justify-center"
                  >
                    {renderProductCard(product, false)}
                  </div>
                ))}
        </div>
      )}

      <div className="flex flex-col items-center mt-4">
        <div className="flex space-x-2 mb-4">
          {Array.from({ length: totalSlides }).map((_, i) => (
            <div
              key={i}
              className={`h-2 rounded-full transition-transform duration-300 ${
                (isMobile ? mobileCurrentSlide : currentSlide) === i
                  ? 'bg-blue-600 w-4 scale-125'
                  : 'bg-gray-300 w-2'
              }`}
            />
          ))}
        </div>
        <Button
          onClick={handleViewAll}
          className="text-black border-2 border-green-600 bg-transparent hover:bg-blue-50 px-4 py-2 rounded transition-all"
        >
          Дивитись всі
        </Button>
      </div>
    </section>
  );
};

export default NewArrivalsSection;