import { useState, useEffect, useRef } from 'react';

interface UseTouchHandlersProps {
  onSwipe?: (direction: 'left' | 'right') => void;
}

// Хук теперь инициализирует начальное значение на основе window.innerWidth,
// если window доступен. Это позволяет сразу правильно определить, нужно ли показывать мобильную версию.
export const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 768;
    }
    return false;
  });

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return isMobile;
};

export const useTouchHandlers = ({ onSwipe }: UseTouchHandlersProps = {}) => {
  const [isTouching, setIsTouching] = useState(false);
  const touchTimer = useRef<NodeJS.Timeout | null>(null);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const minSwipeDistance = 50;

  const handleTouchStart = (e: React.TouchEvent) => {
    if (touchTimer.current) {
      clearTimeout(touchTimer.current);
    }

    setTouchStart(e.targetTouches[0].clientX);
    setTouchEnd(e.targetTouches[0].clientX);

    touchTimer.current = setTimeout(() => {
      setIsTouching(true);
    }, 100);
  };

  const handleTouchEnd = () => {
    if (touchTimer.current) {
      clearTimeout(touchTimer.current);
    }
    setIsTouching(false);

    const distance = touchStart - touchEnd;
    if (Math.abs(distance) > minSwipeDistance) {
      const direction = distance > 0 ? 'left' : 'right';
      onSwipe?.(direction);
    }
  };

  const handleTouchCancel = () => {
    if (touchTimer.current) {
      clearTimeout(touchTimer.current);
    }
    setIsTouching(false);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  useEffect(() => {
    return () => {
      if (touchTimer.current) {
        clearTimeout(touchTimer.current);
      }
    };
  }, []);

  return {
    isTouching,
    handleTouchStart,
    handleTouchEnd,
    handleTouchCancel,
    handleTouchMove,
  };
};
