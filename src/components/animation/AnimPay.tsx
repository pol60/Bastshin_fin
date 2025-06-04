import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface AnimPayProps {
  startPos: { x: number; y: number };
  onComplete: () => void;
}

const AnimPay: React.FC<AnimPayProps> = ({ startPos, onComplete }) => {
  const [targetPos, setTargetPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const cartIcons = Array.from(
      document.querySelectorAll<HTMLElement>('[data-testid="cart-icon"]')
    );
    const visibleIcon = cartIcons.find(icon => icon.offsetParent !== null);

    if (visibleIcon && 'getBoundingClientRect' in visibleIcon) {
      const rect = visibleIcon.getBoundingClientRect();
      setTargetPos({
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      });
    } else {
      // Fallback, если иконка корзины не найдена
      setTargetPos({
        x: window.innerWidth - 50,
        y: 20,
      });
    }
  }, []);

  return (
    <motion.div
      initial={{
        x: startPos.x,
        y: startPos.y,
        scale: 1,
        opacity: 1,
      }}
      animate={{
        x: [startPos.x, (startPos.x + targetPos.x) / 3, targetPos.x],
        y: [startPos.y, startPos.y - 50, targetPos.y],
        scale: [1, 1.2, 0],
        opacity: [1, 0.8, 0],
      }}
      transition={{ duration: 2, ease: "easeInOut" }}
      onAnimationComplete={onComplete}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        pointerEvents: "none",
        zIndex: 9999,
      }}
    >
      <div className="w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center text-xs text-black font-bold">
        +1
      </div>
    </motion.div>
  );
};

export default AnimPay;
