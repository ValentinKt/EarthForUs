import React from 'react';
import type { ReactNode } from 'react';
import ErrorBoundary from '../../shared/components/ErrorBoundary';
import { useAuth } from '../../features/auth/context/AuthContext';
import AvatarMenuDropdown from '../../components/AvatarMenuDropdown/AvatarMenuDropdown';

interface LayoutProps {
  children: ReactNode;
  showHeader?: boolean;
  showFooter?: boolean;
  className?: string;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  showHeader = true, 
  showFooter = true,
  className = '' 
}) => {
  const { isAuthenticated } = useAuth();
  return (
    <ErrorBoundary>
      <div className={`min-h-screen flex flex-col bg-brand-50 dark:bg-gray-950 transition-colors duration-200 ${className}`}>
        {showHeader && (
          <header className="sticky top-0 z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur shadow-sm border-b border-gray-200 dark:border-gray-800 transition-colors duration-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                {/* Logo */}
                <div className="flex items-center">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-brand-600 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-xl font-bold text-gray-900 dark:text-white">EarthForUs</span>
                  </div>
                </div>

                {/* Navigation */}
                <nav className="hidden md:flex items-center space-x-8">
                  <a href="/events" className="text-gray-700 dark:text-gray-300 hover:text-brand-600 dark:hover:text-brand-400 font-medium transition-colors">Events</a>
                  <a href="/about" className="text-gray-700 dark:text-gray-300 hover:text-brand-600 dark:hover:text-brand-400 font-medium transition-colors">About</a>
                  <a href="/contact" className="text-gray-700 dark:text-gray-300 hover:text-brand-600 dark:hover:text-brand-400 font-medium transition-colors">Contact</a>
                </nav>

                {/* User Actions */}
                <div className="flex items-center space-x-3">
                  {isAuthenticated ? (
                    <AvatarMenuDropdown />
                  ) : (
                    <>
                      <a href="/login" className="inline-flex items-center justify-center px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">Sign In</a>
                      <a href="/signup" className="inline-flex items-center justify-center px-3 py-1.5 text-sm font-medium bg-brand-600 hover:bg-brand-700 text-white rounded-lg transition-colors">Get Started</a>
                    </>
                  )}
                </div>
              </div>
            </div>
          </header>
        )}
        <main className="flex-1">
          {children}
        </main>
        {showFooter && (
          <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 transition-colors duration-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
              <div className="text-center">
                <div className="flex items-center justify-center space-x-2 mb-4">
                  <div className="w-8 h-8 bg-brand-600 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-xl font-bold text-gray-900 dark:text-white">EarthForUs</span>
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Connecting passionate volunteers with meaningful environmental initiatives.
                </p>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  © {new Date().getFullYear()} EarthForUs. All rights reserved.
                </p>
              </div>
            </div>
          </footer>
        )}
      </div>
    </ErrorBoundary>
  );
};

export default Layout;