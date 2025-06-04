import React, { FC, memo, useLayoutEffect, useRef, useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  RiCloseLine,
  RiUserLine,
  RiUserFill,
  RiCheckFill,
  RiHeartFill,
  RiSearchLine,
  RiPhoneFill,
  RiShoppingCartFill,
} from "react-icons/ri";
import LogoNavBar from "./LogoNavBar";
import SearchDropdown from "./SearchDropdown";
import TireCatalogDropdown from "./TireCatalogDropdown";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onProfileClick: () => void;
  onFavoritesClick: () => void;
  onCartClick: () => void;
  favoritesCount: number;
  cartCount: number;
  isAuthenticated: boolean;
}

interface IconButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick?: (e?: React.MouseEvent<HTMLButtonElement>) => void;
  href?: string;
}

const IconButton: FC<IconButtonProps> = memo(({ icon, label, onClick, href }) => {
  const buttonContent = (
    <button
      onClick={onClick}
      aria-label={label}
      className="p-2 bg-transparent text-white rounded-lg transition-transform duration-150 active:scale-150 hover:bg-blue-800 focus:outline-none focus:ring-0"
      style={{ WebkitTapHighlightColor: "transparent", touchAction: "manipulation" }}
    >
      {icon}
    </button>
  );
  return href ? <a href={href} aria-label={label}>{buttonContent}</a> : buttonContent;
});

const MobileMenu: FC<MobileMenuProps> = ({
  isOpen,
  onClose,
  onProfileClick,
  onFavoritesClick,
  onCartClick,
  favoritesCount,
  cartCount,
  isAuthenticated,
}) => {
  const scrollPositionRef = useRef(0);
  const [isSearchDropdownOpen, setIsSearchDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showPersonalOffersStub, setShowPersonalOffersStub] = useState(false);
  const location = useLocation();
  const prevLocation = useRef(location);

  // Закрываем меню только если произошла реальная смена маршрута
  useEffect(() => {
    if (isOpen && prevLocation.current.pathname !== location.pathname) {
      onClose();
    }
    prevLocation.current = location;
  }, [location, isOpen, onClose]);

  // Фиксирование скролла при открытии меню
  useLayoutEffect(() => {
    if (isOpen) {
      scrollPositionRef.current = window.pageYOffset;
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollPositionRef.current}px`;
      document.body.style.left = "0";
      document.body.style.right = "0";
    } else {
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.right = "";
      requestAnimationFrame(() => {
        window.scrollTo(0, scrollPositionRef.current);
      });
    }
    return () => {
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.right = "";
    };
  }, [isOpen]);

  // Варианты анимации для оверлея
  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.3, ease: "easeInOut" } },
    exit: { opacity: 0, transition: { duration: 0.3, ease: "easeInOut" } },
  };

  // Варианты анимации для выезжающего меню
  const menuVariants = {
    hidden: { x: "-100%" },
    visible: { x: 0, transition: { duration: 0.3, ease: "easeInOut" } },
    exit: { x: "-100%", transition: { duration: 0.3, ease: "easeInOut" } },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Оверлей для закрытия мобильного меню */}
          <motion.div
            key="overlay"
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => {
              if (!isSearchDropdownOpen) {
                onClose();
              }
            }}
            role="presentation"
          />
          {/* Меню с анимацией заезда/выезда */}
          <motion.nav
            key="menu"
            variants={menuVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.3}
            onDragEnd={(_event, info) => {
              if (info.offset.x < -10) {
                onClose();
              }
            }}
            className="fixed inset-y-0 left-0 w-72 bg-[#1e3fac] z-50 overflow-y-auto"
            aria-label="Основне меню"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 text-white">
              {/* Шапка: кнопка закрытия и логотип */}
              <header className="flex justify-between items-center mb-4">
                <IconButton
                  icon={<RiCloseLine className="w-6 h-6" />}
                  label="Закрити меню"
                  onClick={onClose}
                />
                <Link to="/" onClick={onClose}>
                  <LogoNavBar className="w-28" align="left" />
                </Link>
              </header>

              {/* Блок с иконками */}
              <div className="mb-4">
                <hr className="border-white/20" />
                <div className="mt-2 flex justify-around">
                  <IconButton
                    href="tel:09307594003"
                    icon={<RiPhoneFill className="w-6 h-6 text-white" />}
                    label="Зателефонувати"
                  />
                  <div className="relative">
                    <IconButton
                      label="Профіль"
                      onClick={onProfileClick}
                      icon={
                        isAuthenticated ? (
                          <div className="relative">
                            <RiUserFill className="w-6 h-6" fill="white" stroke="white" strokeWidth={1} />
                            <motion.span
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="absolute -top-3 left-4 -right-3 flex items-center justify-center"
                              style={{ transform: "rotate(15deg)", transformOrigin: "center" }}
                            >
                              <div className="bg-green-500/90 rounded-full w-4 h-4 flex items-center justify-center shadow-sm">
                                <RiCheckFill className="w-2.5 h-2.5 text-white" strokeWidth={1.8} />
                              </div>
                            </motion.span>
                          </div>
                        ) : (
                          <RiUserLine className="w-6 h-6 text-white" />
                        )
                      }
                    />
                  </div>
                  <div className="relative">
                    <IconButton
                      icon={<RiHeartFill className={`w-6 h-6 ${favoritesCount > 0 ? "text-red-500" : "text-white"}`} />}
                      label="Вибране"
                      onClick={onFavoritesClick}
                    />
                    {favoritesCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 text-black text-xs rounded-full flex items-center justify-center">
                        {favoritesCount}
                      </span>
                    )}
                  </div>
                  <IconButton
                    icon={<RiSearchLine className="w-6 h-6 text-white" />}
                    label="Пошук"
                    onClick={() => setIsSearchDropdownOpen(true)}
                  />
                  <div className="relative">
                    <IconButton
                      icon={<RiShoppingCartFill className={`w-6 h-6 ${cartCount > 0 ? "text-yellow-500" : "text-white"}`} />}
                      label="Кошик"
                      onClick={onCartClick}
                    />
                    {cartCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 text-black text-xs rounded-full flex items-center justify-center">
                        {cartCount}
                      </span>
                    )}
                  </div>
                </div>
                <hr className="mt-2 border-white/20" />
              </div>

              {/* Основна навігація з розділювальною лінією */}
              <section className="space-y-5 mb-4">
                <div className="mb-4 flex flex-col gap-3">
                  <TireCatalogDropdown />
                  <Link
  to="/detailed-search"
  onClick={onClose}
  className="w-full md:self-start inline-block py-1.5 text-md bg-blue-500/60 rounded-xl px-4 shadow font-medium hover:text-yellow-300 transition-colors text-center"
>
                    Детальний пошук
                    </Link>
{/* Кнопка с заглушкой для "Особисті пропозиції" */}
<button
  onClick={() => setShowPersonalOffersStub(true)}
  className="w-full md:self-start inline-block py-1.5 text-md bg-blue-500/60 rounded-xl px-4 shadow font-medium hover:text-yellow-300 transition-colors text-center"
>
                    Особисті пропозиції
                  </button>
                </div>
                <hr className="border-white/20" />
                <nav aria-label="Основна навігація" className="text-sm">
                  <Link
                    to="/akcii"
                    onClick={onClose}
                    className="block py-2 font-medium hover:text-yellow-300 transition-colors"
                  >
                    Акції
                  </Link>
                  <Link
                    to="/statti"
                    onClick={onClose}
                    className="block py-2 font-medium hover:text-yellow-300 transition-colors"
                  >
                    Статті
                  </Link>
                  <Link
                    to="/pro-nas"
                    onClick={onClose}
                    className="block py-2 font-medium hover:text-yellow-300 transition-colors"
                  >
                    Про нас
                  </Link>
                  <Link
                    to="/delivery"
                    onClick={onClose}
                    className="block py-2 font-medium hover:text-yellow-300 transition-colors"
                  >
                    Доставка і оплата
                  </Link>
                  <Link
                    to="/contacts"
                    onClick={onClose}
                    className="block py-2 font-medium hover:text-yellow-300 transition-colors"
                  >
                    Контакти
                  </Link>
                  <Link
                    to="/warranty"
                    onClick={onClose}
                    className="block py-2 font-medium hover:text-yellow-300 transition-colors"
                  >
                    Гарантія
                  </Link>
                </nav>
              </section>

              {/* Додаткова інформація */}
              <section className="mt-6 space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold">Гарантія якості</h3>
                    <p className="text-sm opacity-80">Тільки оригінальна продукція</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold">Швидка доставка</h3>
                    <p className="text-sm opacity-80">По всій Україні</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold">Зручна оплата</h3>
                    <p className="text-sm opacity-80">Готівка, карта, безготівковий</p>
                  </div>
                </div>
              </section>

              <footer className="mt-6 text-sm">
                <p>Графік роботи кол-центра:</p>
                <p>Пн-Пт: 9:00-21:00</p>
                <p>Сб: 9:00-19:00, Нд: 9:00-18:00</p>
              </footer>
            </div>
          </motion.nav>
          {/* Оверлей для закриття пошуку */}
          <AnimatePresence>
            {isSearchDropdownOpen && (
              <motion.div
                key="search-overlay"
                className="fixed inset-0 z-50"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={() => setIsSearchDropdownOpen(false)}
              >
                <SearchDropdown
                  onClose={() => setIsSearchDropdownOpen(false)}
                  externalFilter={searchQuery}
                  onSearchChange={setSearchQuery}
                />
              </motion.div>
            )}
          </AnimatePresence>
          {/* Оверлей для заглушки "Особисті пропозиції" */}
          <AnimatePresence>
            {showPersonalOffersStub && (
              <motion.div
                key="personal-offers-stub"
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={() => setShowPersonalOffersStub(false)}
              >
                <motion.div
                  className="bg-white p-4 rounded shadow-md text-center"
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0.8 }}
                  transition={{ duration: 0.2 }}
                >
                  <p>Поки що немає особистих пропозицій</p>
                  <button
                    onClick={() => setShowPersonalOffersStub(false)}
                    className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
                  >
                    Закрити
                  </button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </AnimatePresence>
  );
};

export default memo(MobileMenu);
