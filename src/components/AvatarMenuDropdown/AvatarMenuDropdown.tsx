import React, { useState, useRef, useEffect } from 'react';
import type { DropdownItem } from '../../types';

interface AvatarMenuDropdownProps {
  user?: {
    firstName: string;
    lastName: string;
    avatar?: string;
    email: string;
  };
}

const AvatarMenuDropdown: React.FC<AvatarMenuDropdownProps> = ({ user }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Mock user data - this will come from auth context
  const mockUser = user || {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    avatar: undefined
  };

  const menuItems: DropdownItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: '🏠',
      action: () => console.log('Navigate to dashboard')
    },
    {
      id: 'profile',
      label: 'My Profile',
      icon: '👤',
      action: () => console.log('Navigate to profile')
    },
    {
      id: 'events',
      label: 'My Events',
      icon: '📅',
      action: () => console.log('Navigate to events')
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: '⚙️',
      action: () => console.log('Navigate to settings')
    },
    {
      id: 'logout',
      label: 'Sign Out',
      icon: '🚪',
      action: () => console.log('Logout')
    }
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const toggleDropdown = () => setIsOpen(!isOpen);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Avatar Button */}
      <button
        onClick={toggleDropdown}
        className="flex items-center space-x-2 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors duration-200"
        aria-label="User menu"
        aria-expanded={isOpen}
      >
        <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white font-medium text-sm">
          {mockUser.avatar ? (
            <img
              src={mockUser.avatar}
              alt={`${mockUser.firstName} ${mockUser.lastName}`}
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            getInitials(mockUser.firstName, mockUser.lastName)
          )}
        </div>
        <svg
          className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50 animate-fade-in">
          {/* User Info */}
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {mockUser.firstName} {mockUser.lastName}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
              {mockUser.email}
            </p>
          </div>

          {/* Menu Items */}
          <div className="py-1">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  item.action();
                  setIsOpen(false);
                }}
                disabled={item.disabled}
                className="w-full flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                <span className="mr-3 text-base">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AvatarMenuDropdown;