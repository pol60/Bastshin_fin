import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Cart } from "./Cart";

interface SlidingCartProps {
  isOpen: boolean;
  onClose: () => void;
}

const useMediaQuery = (query: string) => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    setMatches(media.matches);
    
    const listener = () => setMatches(media.matches);
    media.addEventListener("change", listener);
    
    return () => media.removeEventListener("change", listener);
  }, [query]);

  return matches;
};

const SlidingCart: React.FC<SlidingCartProps> = ({ isOpen, onClose }) => {
  const isMobile = useMediaQuery("(max-width: 768px)");
  // visualState управляет анимацией окна: открыто, закрывается или закрыто
  const [visualState, setVisualState] = useState<'closed' | 'open' | 'closing'>('closed');

  useEffect(() => {
    if (isOpen) {
      setVisualState('open');
    }
  }, [isOpen]);
  
  // При закрытии окна запускается анимация закрытия
  const handleCloseCart = () => {
    setVisualState('closing');
    setTimeout(() => {
      onClose();
      setVisualState('closed');
    }, 100); // длительность анимации – 0.1 сек
  };

  const handleBackgroundClick = () => handleCloseCart();
  const handleCartClick = (e: React.MouseEvent) => e.stopPropagation();

  return (
    <AnimatePresence>
      {(isOpen || visualState === 'closing') && (
        <motion.div
          className="fixed inset-0 z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          onClick={handleBackgroundClick}
          key="cart-backdrop"
        >
          {isMobile ? (
            <motion.div
              className="absolute w-full bg-white shadow-lg overflow-y-auto"
              style={{ top: "4rem", maxHeight: "90vh" }}
              initial={{ y: "-100%" }}
              animate={{ y: 0 }}
              exit={{ y: "-100%" }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              onClick={handleCartClick}
              key="cart-content-mobile"
            >
              <Cart onClose={handleCloseCart} isClosing={visualState === 'closing'} />
            </motion.div>
          ) : (
            <motion.div
              className="absolute right-0 bg-white shadow-lg overflow-y-auto"
              style={{ 
                top: "4rem",
                width: "400px",
                maxWidth: "90vw",
                maxHeight: "90vh",
                minHeight: "150px"
              }}
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              onClick={handleCartClick}
              key="cart-content-desktop"
            >
              <Cart onClose={handleCloseCart} isClosing={visualState === 'closing'} />
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SlidingCart;
