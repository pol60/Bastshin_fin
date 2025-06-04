import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Heart, Phone, User } from 'lucide-react';
import { useCartStore } from '../stores/cartStore';

export const Header: React.FC = () => {
  const cartCount = useCartStore(state => state.items.length);

  return (
    <header className="bg-blue-800 text-white">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-4">
          <Link to="/" className="text-2xl font-bold">
            ShinaGo
          </Link>
          
          <nav className="hidden md:flex space-x-6">
            <Link to="/tires" className="hover:text-yellow-400">Шини</Link>
            <Link to="/wheels" className="hover:text-yellow-400">Диски</Link>
            <Link to="/oil" className="hover:text-yellow-400">Масла</Link>
          </nav>

          <div className="flex items-center space-x-4">
            <a href="tel:+380930759403" className="flex items-center hover:text-yellow-400">
              <Phone className="w-5 h-5 mr-2" />
              <span className="hidden md:inline">093 075 94 03</span>
            </a>
            
            <Link to="/favorites" className="hover:text-yellow-400">
              <Heart className="w-6 h-6" />
            </Link>
            
            <Link to="/cart" className="hover:text-yellow-400 relative">
              <ShoppingCart className="w-6 h-6" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
            
            <Link to="/account" className="hover:text-yellow-400">
              <User className="w-6 h-6" />
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};