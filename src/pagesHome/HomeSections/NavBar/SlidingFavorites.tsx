// SlidingFavorites.tsx
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import FavoritesLike from "./favoritesLike";

interface SlidingFavoritesProps {
  isOpen: boolean;
  onClose: () => void;
}

const useMediaQuery = (query: string) => {
  const [matches, setMatches] = React.useState(false);

  React.useEffect(() => {
    const media = window.matchMedia(query);
    const listener = () => setMatches(media.matches);
    media.addEventListener("change", listener);
    setMatches(media.matches);
    return () => media.removeEventListener("change", listener);
  }, [query]);

  return matches;
};

const SlidingFavorites: React.FC<SlidingFavoritesProps> = ({ isOpen, onClose }) => {
  const isMobile = useMediaQuery("(max-width: 768px)");

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="sliding-favorites"
          className="fixed inset-0 z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={onClose}
        >
          {isMobile ? (
            <motion.div
              className="absolute w-full bg-white shadow-lg overflow-y-auto"
              style={{ top: "4rem", maxHeight: "90vh" }}
              initial={{ y: "-100%" }}
              animate={{ y: 0 }}
              exit={{ y: "-100%" }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              onClick={(e) => e.stopPropagation()}
            >
              <FavoritesLike isOpen={isOpen} onClose={onClose} />
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
              initial={{ x: "100%", height: 0 }}
              animate={{ x: 0, height: "auto" }}
              exit={{ x: "100%", height: 0 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              onClick={(e) => e.stopPropagation()}
            >
              <FavoritesLike isOpen={isOpen} onClose={onClose} />
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SlidingFavorites;