import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, X } from 'lucide-react';
import { createPortal } from 'react-dom';
import { useIsMobile } from '../../../hooks/useIsMobile';
import SnowflakeIcon from '../../../components/icons/SnowflakeIcon';
import SunIcon from '../../../components/icons/SunIcon';
import SnowSunIcon from '../../../components/icons/SnowSunIcon';

const TireCatalogDropdown: React.FC = () => {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  // Для десктопа: обработка событий мыши для кнопки и выпадающего окна.
  const handleMouseEnter = () => {
    if (!isMobile) {
      setOpen(true);
    }
  };

  const handleMouseLeave = (e: React.MouseEvent) => {
    if (!isMobile) {
      const related = e.relatedTarget as Node;
      if (
        buttonRef.current &&
        dropdownRef.current &&
        !buttonRef.current.contains(related) &&
        !dropdownRef.current.contains(related)
      ) {
        setOpen(false);
      }
    }
  };

  const modalVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeInOut' } },
    exit: { opacity: 0, y: -10, transition: { duration: 0.3, ease: 'easeInOut' } },
  };

  // Опции для меню
  const seasonOptions = [
    { label: 'Літні', to: '/tires?season=summer', icon: <SunIcon className="w-4 h-4" /> },
    { label: 'Зимові', to: '/tires?season=winter', icon: <SnowflakeIcon className="w-4 h-4" /> },
    { label: 'Всесезонні', to: '/tires?season=all-season', icon: <SnowSunIcon className="w-4 h-4" /> },
  ];

  const sizeOptions = [
    '225/65 R17',
    '225/60 R17',
    '205/60 R16',
    '205/55 R16',
    '195/65 R15',
    '215/60 R16',
    '185/65 R15',
    '215/65 R16',
    '235/60 R18',
    '215/55 R17'
  ];

  const diameterOptions = [
    'R13', 'R14', 'R14C', 'R15', 'R15C',
    'R16', 'R16C', 'R17', 'R17.5', 'R18',
    'R19', 'R19.5', 'R20', 'R21', 'R22', 'R23', 'R24'
  ];

  const autoTypeOptions = [
    { label: 'Легкові', to: '/tires?autoType=passenger' },
    { label: 'Вантажні', to: '/tires?autoType=heavy' },
    { label: 'Легковантажні', to: '/tires?autoType=light-truck' },
    { label: 'Позашляхові', to: '/tires?autoType=offroad' },
  ];

  const tireBrandOptions = [
    'Michelin', 'Continental', 'Goodyear', 'Debica', 'Kapsen',
    'Gislaved', 'Triangle', 'Premiorri', 'Funtoma', 'Arivo',
    'Kelly', 'Rosava', 'Dunlop', 'Nexen', 'Bridgestone',
    'Nokian', 'Uniroyal', 'Tigar', 'Matador', 'Hankook'
  ];

  const renderSeasonOptions = () => (
    <div>
      <h3 className="font-medium mb-4 text-sm text-left">За сезоном</h3>
      <div className="inline-grid p-2 gap-2">
        {seasonOptions.map((option) => (
          <Link
            key={option.to}
            to={option.to}
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 text-sm transition-colors rounded hover:bg-blue-500 hover:text-white px-2"
          >
            {option.icon}
            <span>{option.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );

  const renderAutoTypes = () => (
    <div>
      <h3 className="font-medium mb-4 text-sm text-left">За типом авто</h3>
      <div className="inline-grid p-2 gap-2">
        {autoTypeOptions.map((option) => (
          <Link
            key={option.to}
            to={option.to}
            onClick={() => setOpen(false)}
            className="text-sm transition-colors rounded hover:bg-blue-500 hover:text-white px-2"
          >
            {option.label}
          </Link>
        ))}
      </div>
    </div>
  );

  const renderSizes = () => (
    <div>
      <h3 className="font-medium mb-4 text-sm text-left">Типорозміри</h3>
      <div className="inline-grid grid-cols-3 gap-x-2 gap-y-2 justify-items-center">
        {sizeOptions.map((size) => (
          <Link
            key={size}
            to={`/tires?tireSize=${size}`}
            onClick={() => setOpen(false)}
            className="whitespace-nowrap px-1 py-1 border border-gray-300 rounded text-center text-xs transition-colors hover:bg-blue-500 hover:text-white hover:font-medium"
          >
            {size}
          </Link>
        ))}
      </div>
    </div>
  );

  const renderDiameters = () => (
    <div>
      <h3 className="font-medium mb-4 text-sm text-left">Діаметри</h3>
      <div className="inline-grid grid-cols-5 gap-x-2 gap-y-2 justify-items-center">
        {diameterOptions.map((diameter) => (
          <Link
            key={diameter}
            to={`/tires?diameter=${diameter.replace('R', '')}`}
            onClick={() => setOpen(false)}
            className="w-full h-full flex justify-center items-center px-1 py-1 border border-gray-300 rounded text-center text-xs transition-colors hover:bg-blue-500 hover:text-white hover:font-medium"
          >
            {diameter}
          </Link>
        ))}
      </div>
    </div>
  );

  const renderBrands = () => (
    <div>
      <h3 className="font-medium mb-4 text-sm text-left">За брендом</h3>
      <div className="inline-grid grid-cols-2 gap-2">
        {tireBrandOptions.map((brand) => (
          <Link
            key={brand}
            to={`/tires?brand=${brand}`}
            onClick={() => setOpen(false)}
            className="text-sm transition-colors rounded hover:bg-blue-500 hover:text-white md:px-3"
          >
            {brand}
          </Link>
        ))}
      </div>
    </div>
  );

  // В десктопе окно фиксированное вплотную к нижней границе NavBar (64px)
  const dropdownClassNames = isMobile
    ? "absolute top-full left-0 right-0 mt-2 z-50"
    : "fixed left-0 right-0 top-16 z-50";

  const modalContent = (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={dropdownRef}
          variants={modalVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className={dropdownClassNames}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <div className="bg-white text-black mx-auto w-full max-w-6xl rounded-lg shadow-xl">
            <div className="flex justify-end p-2 border-b">
              <button
                onClick={() => setOpen(false)}
                className="text-black transition-colors hover:text-blue-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-2">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex flex-col space-y-6">
                  {renderSeasonOptions()}
                  {renderAutoTypes()}
                </div>
                <div className="flex flex-col space-y-4">
                  {renderSizes()}
                  {renderDiameters()}
                </div>
                <div className="flex flex-col">
                  {renderBrands()}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <div onMouseLeave={handleMouseLeave} className="relative">
      <button
  ref={buttonRef}
  type="button"
  onClick={() => setOpen((prev) => !prev)}
  onMouseEnter={handleMouseEnter}
  className={`
    w-full md:w-auto flex items-center justify-center gap-2 text-md md:text-sm transition-colors px-4 py-1.5 md:rounded-md rounded-xl shadow
    bg-blue-500/60 md:bg-white/10 md:border-white/20  ${open ? "text-yellow-400" : "text-white md:text-white/60 hover:text-yellow-400"}
  `}
>
        Каталог шин
        <ChevronDown className={`w-5 h-5 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {isMobile ? modalContent : createPortal(modalContent, document.body)}
    </div>
  );
};

export default TireCatalogDropdown;
