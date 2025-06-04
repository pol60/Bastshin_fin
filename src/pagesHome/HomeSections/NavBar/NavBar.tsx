import React, {
  useState,
  useEffect,
  useCallback,
  memo,
  useRef,
} from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  motion,
  AnimatePresence,
  useAnimation,
  useMotionValue,
} from "framer-motion";
import { RiMenu3Line } from "react-icons/ri";
import { FiPhone } from "react-icons/fi";
import { Input } from "../../../components/ui/input";
import { useCartStore } from "../../../stores/cartStore";
import { useFavoritesStore } from "../../../stores/favoritesStore";
import MobileMenu from "./MobileMenu";
import LogoNavBar from "./LogoNavBar";
import { supabase } from "../../../lib/supabaseClient";
import { useIsMobile } from "../../../hooks/useIsMobile";
import { User } from "@supabase/supabase-js";
import NavIcons from "./NavIcons";
import SlidingCart from "./SlidingCart";
import SlidingFavorites from "./SlidingFavorites";
import SearchDropdown from "./SearchDropdown";
import TireCatalogDropdown from "./TireCatalogDropdown";

const MemoizedLogo = memo(LogoNavBar);

const NavBar: React.FC<{ className?: string }> = ({ className = "" }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isScrolled, setIsScrolled] = useState(() => {
    const saved = sessionStorage.getItem("navbar_isScrolled");
    return saved ? JSON.parse(saved) : false;
  });
  const [showHeader, setShowHeader] = useState(() => {
    const saved = sessionStorage.getItem("navbar_showHeader");
    return saved ? JSON.parse(saved) : true;
  });
  // Для переменной, значение которой не используется напрямую, добавляем префикс "_"
  const [_lastScrollY, setLastScrollY] = useState(() => {
    const saved = sessionStorage.getItem("navbar_lastScrollY");
    return saved ? Number(saved) : 0;
  });
  const [isSearchDropdownOpen, setIsSearchDropdownOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isSlidingFavoritesOpen, setIsSlidingFavoritesOpen] = useState(false);
  const [isSlidingCartOpen, setIsSlidingCartOpen] = useState(false);

  const cartCount: number = useCartStore(
    (state) => state.items.length,
    (prev, next) => prev === next
  );
  const favoritesCount: number = useFavoritesStore(
    (state) => state.favorites.length
  );

  const navigate = useNavigate();
  const location = useLocation();
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const isMobile: boolean = useIsMobile();

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    })();
  }, []);

  const favoritesControl = useAnimation();
  const cartControl = useAnimation();

  const prevFavoritesRef = useRef<number>(favoritesCount);
  const prevCartRef = useRef<number>(cartCount);

  useEffect(() => {
    if (favoritesCount > prevFavoritesRef.current) {
      favoritesControl
        .start({ x: -10, transition: { duration: 0.3 } })
        .then(() =>
          favoritesControl.start({ x: 0, transition: { duration: 0.3 } })
        );
    }
    prevFavoritesRef.current = favoritesCount;
  }, [favoritesCount, favoritesControl]);

  useEffect(() => {
    if (cartCount > prevCartRef.current) {
      cartControl
        .start({ x: -10, transition: { duration: 0.3 } })
        .then(() =>
          cartControl.start({ x: 0, transition: { duration: 0.3 } })
        );
    }
    prevCartRef.current = cartCount;
  }, [cartCount, cartControl]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setIsSearchDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Обновление тени навбара – сохраняем состояние в sessionStorage
  useEffect(() => {
    const handleScrollShadow = () => {
      const scrolled = window.scrollY > 50;
      setIsScrolled(scrolled);
      sessionStorage.setItem("navbar_isScrolled", JSON.stringify(scrolled));
    };
    window.addEventListener("scroll", handleScrollShadow, { passive: true });
    return () => window.removeEventListener("scroll", handleScrollShadow);
  }, []);

  // Эффект скрытия/показа навбара (срабатывает при прокрутке свыше 380px)
  useEffect(() => {
    const handleScroll = () => {
      setLastScrollY((prevScrollY) => {
        const currentScrollY = window.scrollY;
        if (currentScrollY > prevScrollY && currentScrollY > 380) {
          setShowHeader(false);
          sessionStorage.setItem("navbar_showHeader", JSON.stringify(false));
        } else {
          setShowHeader(true);
          sessionStorage.setItem("navbar_showHeader", JSON.stringify(true));
        }
        sessionStorage.setItem("navbar_lastScrollY", currentScrollY.toString());
        return currentScrollY;
      });
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Инициализируем motionValue исходя из сохранённого состояния showHeader,
  // чтобы при монтировании компонент отражал актуальное положение (0 для показанного, -100 для скрытого)
  const yMotion = useMotionValue(showHeader ? 0 : -100);

  // Динамическая анимация смены theme-color в зависимости от состояния навбара
  useEffect(() => {
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (!metaThemeColor) return;

    const hexToRgb = (hex: string) => {
      hex = hex.replace(/^#/, "");
      if (hex.length === 3) {
        hex = hex.split("").map(c => c + c).join("");
      }
      const intVal = parseInt(hex, 16);
      return {
        r: (intVal >> 16) & 255,
        g: (intVal >> 8) & 255,
        b: intVal & 255,
      };
    };

    const currentColorHex =
      metaThemeColor.getAttribute("content") || (showHeader ? "#1e3fac" : "#ffffff");
    const currentColor = hexToRgb(currentColorHex);
    const targetColor = showHeader ? { r: 30, g: 63, b: 172 } : { r: 255, g: 255, b: 255 };

    const duration = 300;
    const startTime = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const ratio = Math.min(elapsed / duration, 1);
      const r = Math.round(currentColor.r + (targetColor.r - currentColor.r) * ratio);
      const g = Math.round(currentColor.g + (targetColor.g - currentColor.g) * ratio);
      const b = Math.round(currentColor.b + (targetColor.b - currentColor.b) * ratio);
      const newColor = `#${((1 << 24) + (r << 16) + (g << 8) + b)
        .toString(16)
        .slice(1)}`;
      metaThemeColor.setAttribute("content", newColor);
      if (ratio < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [showHeader]);

  const handleCartClick = useCallback(() => {
    setIsSlidingCartOpen(true);
  }, []);

  const handleProfileClick = useCallback(() => {
    if (!user) {
      navigate("/auth", { state: { from: location.pathname } });
    } else {
      navigate("/profile", { state: { from: location.pathname } });
    }
  }, [navigate, location.pathname, user]);

  const handleFavoritesClick = useCallback(() => setIsSlidingFavoritesOpen(true), []);
  
  const handleSearch = useCallback(
    (e: React.FormEvent | React.KeyboardEvent) => {
      e.preventDefault();
      if (searchQuery.trim()) {
        navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
        setIsSearchDropdownOpen(false);
      }
    },
    [searchQuery, navigate]
  );

  const renderMobileHeaderContent = () => (
    <div className="flex items-center justify-between p-1 h-16 transition-all duration-300">
      <div className="flex items-center gap-4">
        <button
          onClick={() => setIsMenuOpen(true)}
          aria-label="Открыть меню"
          className="p-2 bg-transparent rounded-lg transition-transform duration-150 active:scale-150 hover:bg-blue-800 mt-1.5"
          style={{ WebkitTapHighlightColor: "transparent" }}
        >
          <RiMenu3Line className="w-6 h-6 text-white" />
        </button>
        <div className="-ml-0 pl-2 self-start">
          <Link to="/" onClick={() => setIsMenuOpen(false)}>
            <MemoizedLogo className="w-24" />
          </Link>
        </div>
      </div>
      <NavIcons
        variant="mobile"
        favoritesCount={favoritesCount}
        cartCount={cartCount}
        favoritesControl={favoritesControl}
        cartControl={cartControl}
        onSearchClick={() => setIsSearchDropdownOpen(true)}
        onFavoritesClick={handleFavoritesClick}
        onCartClick={handleCartClick}
        onProfileClick={handleProfileClick}
        isAuthenticated={Boolean(user)}
      />
    </div>
  );

  return (
    <>
      {/* Десктопная версия */}
      <div className="hidden lg:block bg-[#1e3fac] text-white">
        <div className="mx-auto px-2 w-[960px]">
          <div className="flex items-center justify-between py-2 text-xs border-b border-white/10">
            <nav className="flex items-center gap-4">
              <Link
                to="/delivery"
                className="text-white hover:text-yellow-300 transition-colors"
              >
                Доставка і оплата
              </Link>
              <Link
                to="/warranty"
                className="text-white hover:text-yellow-300 transition-colors"
              >
                Гарантія
              </Link>
              <Link
                to="/contacts"
                className="text-white hover:text-yellow-300 transition-colors"
              >
                Контакти
              </Link>
              <Link
                to="/promotions"
                className="text-white hover:text-yellow-300 transition-colors"
              >
                Акції
              </Link>
              <Link
                to="/articles"
                className="text-white hover:text-yellow-300 transition-colors"
              >
                Статті
              </Link>
              <Link
                to="/about"
                className="text-white hover:text-yellow-300 transition-colors"
              >
                Про нас
              </Link>
            </nav>
            <div className="flex items-center gap-4">
              <a
                href="tel:09307594003"
                className="text-yellow-300 hover:text-yellow-400 flex items-center gap-1"
              >
                <FiPhone className="w-3 h-3" />
                0930759403
              </a>
              <button className="px-2 py-1 text-yellow-300 hover:text-yellow-400 transition-colors">
                Замовити дзвінок
              </button>
            </div>
          </div>
        </div>
      </div>

      <motion.header
        style={{ y: yMotion }}
        animate={{ y: showHeader ? 0 : -100 }}
        transition={{ duration: 0.3 }}
        className={`bg-[#1e3fac] text-white z-50 sticky top-0 transition-shadow duration-300 ${className} ${isScrolled ? "shadow-md" : ""}`}
      >
        <div className="hidden lg:block">
          <div className="mx-auto px-2 w-[960px]">
            <div className="flex items-center justify-between h-16 py-2">
              <div className="flex items-center gap-4">
                <Link to="/" className="flex items-center">
                  <MemoizedLogo className="w-28" align="left" />
                </Link>
                <TireCatalogDropdown />
              </div>
              <div className="relative w-96" ref={searchContainerRef}>
                <Input
                  type="search"
                  placeholder="Пошук"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchDropdownOpen(true)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch(e)}
                  className="pl-3 bg-white/10 border-white/20 placeholder:text-white/60"
                />
                <AnimatePresence>
                  {isSearchDropdownOpen && !isMobile && (
                    <SearchDropdown
                      onClose={() => setIsSearchDropdownOpen(false)}
                      externalFilter={searchQuery}
                      onSearchChange={setSearchQuery}
                    />
                  )}
                </AnimatePresence>
              </div>
              <NavIcons
                variant="desktop"
                favoritesCount={favoritesCount}
                cartCount={cartCount}
                favoritesControl={favoritesControl}
                cartControl={cartControl}
                onSearchClick={() => {}}
                onFavoritesClick={handleFavoritesClick}
                onCartClick={handleCartClick}
                onProfileClick={handleProfileClick}
                isAuthenticated={Boolean(user)}
              />
            </div>
          </div>
        </div>

        {/* Мобильная версия */}
        <div className="lg:hidden relative" ref={searchContainerRef}>
          <motion.div
            animate={{ opacity: isMenuOpen ? 0 : 1 }}
            transition={{ duration: 0.3 }}
          >
            {renderMobileHeaderContent()}
          </motion.div>
          <AnimatePresence>
            {isMobile && isSearchDropdownOpen && (
              <SearchDropdown
                onClose={() => setIsSearchDropdownOpen(false)}
                externalFilter={searchQuery}
                onSearchChange={setSearchQuery}
              />
            )}
          </AnimatePresence>
        </div>
      </motion.header>

      {isSearchDropdownOpen && !isMobile && (
        <div
          className="fixed inset-0 z-40"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsSearchDropdownOpen(false);
          }}
        />
      )}

      {isMobile && (
        <MobileMenu
          isOpen={isMenuOpen}
          onClose={() => setIsMenuOpen(false)}
          onProfileClick={handleProfileClick}
          onFavoritesClick={handleFavoritesClick}
          onCartClick={handleCartClick}
          favoritesCount={favoritesCount}
          cartCount={cartCount}
          isAuthenticated={Boolean(user)}
        />
      )}

      <SlidingCart
        isOpen={isSlidingCartOpen}
        onClose={() => setIsSlidingCartOpen(false)}
      />
      <SlidingFavorites
        isOpen={isSlidingFavoritesOpen}
        onClose={() => setIsSlidingFavoritesOpen(false)}
      />
    </>
  );
};

export default memo(NavBar);
