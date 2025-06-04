import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Product } from '../Home';
import { ProductCardProps } from '../ProductCard';

interface TopRatedSectionProps {
  topRated: Product[];
  currentTopIndex: number;
  onPrev: () => void;
  onNext: () => void;
  isMobile: boolean;
  dragOffset: number;
  isDragging: boolean;
  handleTouchStart: (e: React.TouchEvent) => void;
  handleTouchMove: (e: React.TouchEvent) => void;
  handleTouchEnd: () => void;
  lastProductRef: (node: HTMLDivElement | null) => void;
  isLoading: boolean;
  renderProductCard: (
    product: Product,
    isLazy?: boolean,
    className?: string,
    customProps?: Partial<ProductCardProps>
  ) => JSX.Element | null;
}

const TopRatedSection: React.FC<TopRatedSectionProps> = ({
  topRated = [],
  currentTopIndex = 0,
  onPrev,
  onNext,
  isMobile,
  dragOffset = 0,
  isDragging = false,
  handleTouchStart,
  handleTouchMove,
  handleTouchEnd,
  lastProductRef,
  renderProductCard,
}) => {
  const [desktopActive, setDesktopActive] = useState(false);

  const safeIndex = Math.max(0, Math.min(currentTopIndex, topRated.length - 1));

  if (topRated.length === 0) return null;

  return (
    <section id="top" className="mb-2">
      <h2 className="text-2xl lg:text-2xl font-bold mb-6 text-center">
        Хіти продажу
      </h2>

      {isMobile ? (
        <div
          className="relative border-2 border-yellow-400 pb-6 rounded-[12px] px-2 pt-2 mx-2 overflow-hidden"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div
            className="flex"
            style={{
              transform: `translateX(calc(-${safeIndex * 100}% + ${dragOffset}px))`,
              transition: isDragging ? 'none' : 'transform 500ms ease',
            }}
          >
            {topRated.map((product, index) => (
              product && (
                <div
                  key={product.id || index}
                  className="flex-shrink-0 w-full"
                  ref={index === topRated.length - 1 ? lastProductRef : null}
                >
                  <div className="mx-auto w-full pb-8">
                    {renderProductCard(product, false, undefined, {
                      imageHeight: "h-48",
                      showAvailability: false,
                      discountIconClass: "ml-8 top-4 scale-125",
                      heartClass: "absolute bottom-2 left-auto right-5 -top-4 scale-110",
                    })}
                  </div>
                </div>
              )
            ))}
          </div>

          <div className="absolute bottom-3 left-0 right-0">
            <div className="flex items-center justify-between bg-white/80 backdrop-blur-sm py-2 px-4 rounded-full shadow-sm mx-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={onPrev}
                className="h-8 w-8 bg-blue-600/20 hover:bg-blue-600/30"
              >
                <ChevronLeft className="h-5 w-5 text-blue-600" />
              </Button>

              <div className="flex gap-1.5">
                {topRated.map((_, i) => (
                  <div
                    key={i}
                    className={`w-2.5 h-2.5 rounded-full transition-all ${i === safeIndex ? 'bg-yellow-400 scale-125' : 'bg-blue-200'}`}
                  />
                ))}
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={onNext}
                className="h-8 w-8 bg-blue-600/20 hover:bg-blue-600/30"
              >
                <ChevronRight className="h-5 w-5 text-blue-600" />
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="border-2 border-yellow-400 rounded-[12px] p-2 max-w-sm mx-auto overflow-hidden">
          <div
            className="flex"
            style={{
              transform: `translateX(-${safeIndex * 100}%)`,
              transition: 'transform 500ms ease',
            }}
            onMouseDown={() => setDesktopActive(true)}
            onMouseUp={() => setDesktopActive(false)}
            onMouseLeave={() => setDesktopActive(false)}
          >
            {topRated.map((product, index) => (
              <div key={product.id || index} className="flex-shrink-0 w-full">
                {renderProductCard(product, false, desktopActive ? 'shadow-lg' : '', {
                  imageHeight: "lg:h-48",
                  showAvailability: false,
                  discountIconClass: "lg:scale-125 lg:ml-10 lg:top-4",
                  heartClass: "lg:bottom-4 lg:top-6 lg:left-auto lg:right-5 lg:scale-110",
                })}
              </div>
            ))}
          </div>

          <div className="mt-2 flex justify-center gap-4 py-2">
            <Button
              variant="outline"
              size="icon"
              onClick={onPrev}
              className="h-8 w-8 bg-blue-600/80 hover:bg-blue-600/90 text-white transition-transform active:scale-95"
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>

            <div className="flex items-center gap-3">
              {topRated.map((_, i) => (
                <div
                  key={i}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${i === safeIndex ? 'bg-yellow-400 scale-125' : 'bg-blue-200'}`}
                />
              ))}
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={onNext}
              className="h-8 w-8 bg-blue-600/80 hover:bg-blue-600/90 text-white transition-transform active:scale-95"
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
          </div>
        </div>
      )}
    </section>
  );
};

export default TopRatedSection;
