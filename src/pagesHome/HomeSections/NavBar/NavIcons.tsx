import React from "react";
import { motion, AnimationControls } from "framer-motion";
import {
  RiSearchLine,
  RiHeartFill,
  RiUserFill,
  RiUserLine,
  RiCheckFill,
  RiShoppingCartFill,
} from "react-icons/ri";

export interface NavIconsProps {
  variant: "mobile" | "desktop";
  isScrolled?: boolean;
  favoritesCount: number;
  cartCount: number;
  favoritesControl: AnimationControls;
  cartControl: AnimationControls;
  onSearchClick: () => void;
  onFavoritesClick: () => void;
  onCartClick: () => void;
  onProfileClick: () => void; // теперь обязательно передавать этот коллбэк
  isAuthenticated: boolean;
  
  
  
}

const NavIcons: React.FC<NavIconsProps> = ({
  variant,
  isScrolled,
  favoritesCount,
  cartCount,
  favoritesControl,
  cartControl,
  onSearchClick,
  onFavoritesClick,
  onCartClick,
  onProfileClick,
  isAuthenticated,
  
}) => {
  const renderMobileIcons = () => (
    <motion.div
      animate={{ x: isScrolled ? -20 : 0 }}
      className="flex items-center gap-2 mr-4"
    >
      {/* Иконка поиска */}
      <button
        onClick={onSearchClick}
        aria-label="Поиск"
        className="p-2 bg-transparent rounded-lg transition-transform duration-150 active:scale-150 hover:bg-blue-800"
      >
        <RiSearchLine className="w-6 h-6 text-white" />
      </button>
      {/* Иконка профиля с анимацией перехода */}
      <motion.button
        onClick={onProfileClick}
        aria-label="Профиль"
        className="p-2 bg-transparent rounded-lg transition-transform duration-150 hover:bg-blue-800"
        whileTap={{ scale: 0.9 }}
      >
        {isAuthenticated ? (
          <div className="relative">
            <RiUserFill className="w-6 h-6 text-white" />
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-2.5 -right-2.5 flex items-center justify-center"
            >
              <div className="bg-green-500/90 rounded-full w-4 h-4 flex items-center justify-center shadow-sm">
                <RiCheckFill className="w-2.5 h-2.5 text-white" />
              </div>
            </motion.span>
          </div>
        ) : (
          <RiUserLine className="w-6 h-6 text-white" />
        )}
      </motion.button>
      {/* Иконка избранного */}
      <motion.div animate={favoritesControl} className="relative">
        <motion.button
          aria-label="Избранное"
          onClick={onFavoritesClick}
          className="p-2 bg-transparent rounded-lg transition-transform duration-150 hover:bg-blue-800 active:scale-150"
        >
          <RiHeartFill
            className={`w-6 h-6 ${
              favoritesCount > 0 ? "text-red-500" : "text-white"
            }`}
          />
        </motion.button>
        {favoritesCount > 0 && (
          <motion.span
            key={favoritesCount}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 text-black text-xs rounded-full flex items-center justify-center"
          >
            {favoritesCount}
          </motion.span>
        )}
      </motion.div>
      {/* Иконка корзины */}
      <motion.div animate={cartControl} className="relative">
        <button
          aria-label="Корзина"
          onClick={onCartClick}
          className="p-2 bg-transparent rounded-lg transition-transform duration-150 active:scale-150 hover:bg-blue-800"
        >
          <RiShoppingCartFill
            className={`w-6 h-6 ${
              cartCount > 0 ? "text-yellow-500" : "text-white"
            }`}
          />
        </button>
        {cartCount > 0 && (
          <motion.span
            key={cartCount}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 text-black text-xs rounded-full flex items-center justify-center"
          >
            {cartCount}
          </motion.span>
        )}
      </motion.div>
    </motion.div>
  );

  const renderDesktopIcons = () => (
    <motion.div
      animate={{ x: isScrolled ? -20 : 0 }}
      transition={{ type: "spring", stiffness: 300 }}
      className="flex items-center gap-4"
    >
      {/* Иконка профиля с анимацией перехода */}
      <motion.button
        aria-label="Профиль"
        onClick={onProfileClick}
        className="flex items-center relative p-2 bg-transparent rounded-lg transition-transform duration-150 hover:bg-blue-800"
        whileTap={{ scale: 0.9 }}
      >
        {isAuthenticated ? (
          <div className="relative">
            <RiUserFill className="w-6 h-6 text-white" />
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-3 left-4 -right-3 flex items-center justify-center"
              style={{ transform: "rotate(15deg)", transformOrigin: "center" }}
            >
              <div className="bg-green-500/90 rounded-full w-4 h-4 flex items-center justify-center shadow-sm">
                <RiCheckFill className="w-2.5 h-2.5 text-white" />
              </div>
            </motion.span>
          </div>
        ) : (
          <RiUserLine className="w-6 h-6 text-white" />
        )}
      </motion.button>
      {/* Иконка избранного */}
      <motion.div animate={favoritesControl} className="relative">
        <motion.button
          aria-label="Избранное"
          onClick={onFavoritesClick}
          className="p-2 bg-transparent rounded-lg transition-transform duration-150 hover:bg-blue-800 active:scale-150"
        >
          <RiHeartFill
            className={`w-6 h-6 ${
              favoritesCount > 0 ? "text-red-500" : "text-white"
            }`}
          />
        </motion.button>
        {favoritesCount > 0 && (
          <motion.span
            key={favoritesCount}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 text-black text-xs rounded-full flex items-center justify-center"
          >
            {favoritesCount}
          </motion.span>
        )}
      </motion.div>
      {/* Иконка корзины */}
      <motion.div animate={cartControl} className="relative">
        <button
          aria-label="Корзина"
          onClick={onCartClick}
          className="p-2 bg-transparent rounded-lg transition-transform duration-150 active:scale-150 hover:bg-blue-800"
        >
          <RiShoppingCartFill
            className={`w-6 h-6 ${
              cartCount > 0 ? "text-yellow-500" : "text-white"
            }`}
          />
        </button>
        {cartCount > 0 && (
          <motion.span
            key={cartCount}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 text-black text-xs rounded-full flex items-center justify-center"
          >
            {cartCount}
          </motion.span>
        )}
      </motion.div>
    </motion.div>
  );

  return variant === "mobile" ? renderMobileIcons() : renderDesktopIcons();
};

export default NavIcons;
