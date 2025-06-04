// AdminRoute.tsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAdmin } from '../hooks/useAdmin';
import { motion } from 'framer-motion';

interface AdminRouteProps {
  children: React.ReactNode;
}

export const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { isAdmin, loading } = useAdmin();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        {/* Анимация загрузки */}
        <div className="text-center space-y-4">
          <motion.div
            className="relative w-32 h-32 mx-auto"
            initial={{ rotate: 0 }}
            animate={{ rotate: 360 }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'linear'
            }}
          >
            <motion.div
              className="absolute inset-0 border-4 border-blue-200 rounded-full"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.6, 1, 0.6]
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
            />
            <motion.div
              className="absolute inset-2 border-4 border-blue-400 rounded-full"
              animate={{
                scale: [1, 0.8, 1],
                rotate: [0, -180, -360]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
            />
            <motion.div
              className="absolute inset-4 bg-blue-600 rounded-full"
              animate={{
                scale: [1, 1.1, 1],
                borderRadius: ['50%', '40%', '50%']
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
            />
          </motion.div>
          <motion.p
            className="text-blue-800 font-medium text-lg"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            Проверка прав доступа...
          </motion.p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/admin/login" state={{ from: location }} />;
  }

  return <>{children}</>;
};
