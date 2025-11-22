import * as React from 'react';
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
      <div className={`min-h-screen flex flex-col bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-950 dark:to-slate-900 transition-colors duration-200 theme-bg theme-text ${className}`}>
        {showHeader && (
          <header className="sticky top-0 z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur shadow-sm border-b border-green-200 dark:border-green-800 transition-colors duration-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                {/* Logo */}
                <div className="flex items-center">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center animate-earth-pulse">
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-xl font-bold text-green-800 dark:text-green-300 animate-leaf-float">EarthForUs</span>
                  </div>
                </div>

                {/* Navigation */}
                <nav className="hidden md:flex items-center space-x-8">
                  <a href="/events" className="text-green-700 dark:text-green-300 hover:text-green-600 dark:hover:text-green-400 font-medium transition-colors animate-wave-flow">Events</a>
                  <a href="/about" className="text-blue-700 dark:text-blue-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors animate-wave-flow">About</a>
                  <a href="/contact" className="text-amber-700 dark:text-amber-300 hover:text-amber-600 dark:hover:text-amber-400 font-medium transition-colors animate-wave-flow">Contact</a>
                </nav>

                {/* User Actions */}
                <div className="flex items-center space-x-3">
                  {isAuthenticated ? (
                    <AvatarMenuDropdown />
                  ) : (
                    <>
                      <a href="/login" className="inline-flex items-center justify-center px-3 py-1.5 text-sm font-medium text-green-700 dark:text-green-200 hover:bg-green-100 dark:hover:bg-green-800 rounded-lg transition-colors">Sign In</a>
                      <a href="/signup" className="inline-flex items-center justify-center px-3 py-1.5 text-sm font-medium bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-lg transition-colors shadow-lg">Get Started</a>
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
          <footer className="bg-gradient-to-r from-green-100 to-blue-100 dark:from-gray-900 dark:to-slate-800 border-t border-green-200 dark:border-green-700 transition-colors duration-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
              <div className="text-center">
                <div className="flex items-center justify-center space-x-2 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center animate-earth-pulse">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-xl font-bold text-green-800 dark:text-green-300 animate-leaf-float">EarthForUs</span>
                </div>
                <p className="text-green-700 dark:text-green-400 mb-8 animate-wave-flow">Connecting passionate volunteers with meaningful environmental initiatives.</p>
                <p className="text-sm text-green-600 dark:text-green-500">© 2024 EarthForUs. All rights reserved.</p>
              </div>
            </div>
          </footer>
        )}
      </div>
    </ErrorBoundary>
  );
};

export default Layout;
