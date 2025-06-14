
import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Assets } from '@/assets/assets';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
}

const AuthLayout = ({ children, title, subtitle, showBackButton = true }: AuthLayoutProps) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="flex flex-col min-h-screen">
        {/* Header */}
        <div className="flex items-center justify-between p-4 pb-2">
          {showBackButton && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/')}
              className="text-purple-600 hover:text-purple-700 hover:bg-purple-50 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          <div className="flex-1" />
        </div>

        {/* Content */}
        <div className="flex-1 flex items-center justify-center px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="w-full max-w-md"
          >
            {/* Logo and Title */}
            <div className="text-center mb-8">
              <div className="mx-auto w-20 h-20 mb-4 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                <img 
                  src={Assets.Logo} 
                  alt="THE SONS" 
                  className="w-12 h-12 rounded-full object-cover"
                />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {title}
              </h1>
              {subtitle && (
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  {subtitle}
                </p>
              )}
            </div>

            {/* Form Content */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
              {children}
            </div>
          </motion.div>
        </div>

        {/* Footer */}
        <div className="p-4 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            © 2024 THE SONS. Building faithful men for God's kingdom.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
