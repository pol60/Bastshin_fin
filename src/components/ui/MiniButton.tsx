import React, { useState, useEffect, useCallback } from 'react';
import { ChevronUp, Filter } from 'lucide-react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { throttle } from 'lodash-es';

export const MiniButton: React.FC = () => {
  const [showMiniFilter, setShowMiniFilter] = useState(false);
  const [icon, setIcon] = useState<'chevron' | 'filter'>('chevron');
  const shouldReduceMotion = useReducedMotion();

  // Оптимизированный обработчик скролла
  useEffect(() => {
    const handleScroll = throttle(() => {
      const shouldShow = window.scrollY > 150;
      setShowMiniFilter(prev => (prev !== shouldShow ? shouldShow : prev));
    }, 100);

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Переключение иконок только при видимой кнопке
  useEffect(() => {
    if (!showMiniFilter) return;
    const interval = setInterval(() => {
      setIcon(prev => (prev === 'chevron' ? 'filter' : 'chevron'));
    }, 5000);
    return () => clearInterval(interval);
  }, [showMiniFilter]);

  const scrollToTop = useCallback(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }, []);

  // Выбор конфигурации анимации в зависимости от shouldReduceMotion
  const transitionConfig = shouldReduceMotion
    ? { type: 'tween', duration: 0.3 }
    : { type: 'spring', stiffness: 200, damping: 25, mass: 0.5 };

  const animationConfig = {
    initial: { opacity: 0, y: 100 },
    animate: { 
      opacity: 1,
      y: 0,
      transition: transitionConfig
    },
    exit: {
      opacity: 0,
      y: 100,
      transition: { duration: 0.2 }
    }
  };

  return (
    <AnimatePresence mode="wait">
      {showMiniFilter && (
        <motion.button
          key="mini-btn" // Заменить ключ
          {...animationConfig}
          className="fixed z-50 flex items-center justify-center w-12 h-12 rounded-full bg-blue-600/60 shadow-lg bottom-20 right-4 backdrop-blur-sm hover:bg-blue-700/70 transition-colors"
          onTouchStart={(e) => e.preventDefault()}
          onClick={scrollToTop}
          aria-label="Scroll to top"
        >
          {/* Удалить вложенный AnimatePresence */}
          <motion.div
            key={icon}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
          >
            {icon === 'chevron' ? (
              <ChevronUp className="w-6 h-6 text-white" strokeWidth={2.5} />
            ) : (
              <Filter className="w-6 h-6 text-white" strokeWidth={2.5} />
            )}
          </motion.div>
        </motion.button>
      )}
    </AnimatePresence>
  );
};
