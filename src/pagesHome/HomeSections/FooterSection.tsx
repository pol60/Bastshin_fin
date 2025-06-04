import React from 'react';

export const FooterSection: React.FC = () => (
  <footer className="bg-[#1e3fac] text-white py-10 mt-8 ">
    <div className="container mx-auto px-3 sm:px-6 lg:px-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12">
        {/* Про нас */}
        <div className="space-y-4">
          <h3 className="font-bold text-lg">Про нас</h3>
          <ul className="space-y-2">
            <li>
              <a href="#" className="hover:text-blue-200 transition-colors">
                Компанія
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-blue-200 transition-colors">
                Контакти
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-blue-200 transition-colors">
                Блог
              </a>
            </li>
          </ul>
        </div>

        {/* Клієнтам */}
        <div className="space-y-4">
          <h3 className="font-bold text-lg">Клієнтам</h3>
          <ul className="space-y-2">
            <li>
              <a href="#" className="hover:text-blue-200 transition-colors">
                Доставка
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-blue-200 transition-colors">
                Оплата
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-blue-200 transition-colors">
                Гарантія
              </a>
            </li>
          </ul>
        </div>

        {/* Каталог */}
        <div className="space-y-4">
          <h3 className="font-bold text-lg">Каталог</h3>
          <ul className="space-y-2">
            <li>
              <a href="#" className="hover:text-blue-200 transition-colors">
                Легкові
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-blue-200 transition-colors">
                Позашляхові
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-blue-200 transition-colors">
                Легковантажні
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-blue-200 transition-colors">
                Вантажні
              </a>
            </li>
          </ul>
        </div>

        {/* Зв'язок */}
        <div className="space-y-4">
          <h3 className="font-bold text-lg">Зв'язок</h3>
          <p>+380 93 075 9403</p>
          <p>support@shinaGo.com</p>
          <div className="flex flex-col space-y-4">
            <div className="flex space-x-4">
              <a href="#" className="hover:text-blue-200 transition-colors">
                Facebook
              </a>
              <a href="#" className="hover:text-blue-200 transition-colors">
                Instagram
              </a>
            </div>
            <a
              href="#"
              className="bg-blue-600 hover:bg-blue-500 transition-colors text-white px-4 py-2 rounded text-center"
            >
              Задати питання онлайн
            </a>
          </div>
        </div>
      </div>
      <div className="mt-8 pt-8 border-t border-white/10 text-center text-sm">
        <p>© 2025 ShinaGo. Всі права захищені</p>
      </div>
    </div>
  </footer>
);

export default FooterSection;

