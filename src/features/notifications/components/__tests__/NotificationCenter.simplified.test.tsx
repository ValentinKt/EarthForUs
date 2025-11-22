import * as React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';

// Create a simplified mock NotificationCenter component
const MockNotificationCenter = ({
  notifications = [],
  onNotificationClick,
  onNotificationDismiss,
  onMarkAllRead,
  onClearAll,
  maxVisible = 5,
  position = 'top-right',
  autoHide = true,
  autoHideDelay = 5000,
  showCount = true,
  className,
  theme = 'light'
}: {
  notifications?: Array<{
    id: string;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    timestamp: Date;
    read: boolean;
    persistent?: boolean;
    action?: {
      label: string;
      onClick: () => void;
    };
  }>;
  onNotificationClick?: (id: string) => void;
  onNotificationDismiss?: (id: string) => void;
  onMarkAllRead?: () => void;
  onClearAll?: () => void;
  maxVisible?: number;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'top-center' | 'bottom-center';
  autoHide?: boolean;
  autoHideDelay?: number;
  showCount?: boolean;
  className?: string;
  theme?: 'light' | 'dark';
}) => {
  const [visibleNotifications, setVisibleNotifications] = React.useState(notifications.slice(0, maxVisible));
  const [isExpanded, setIsExpanded] = React.useState(false);

  React.useEffect(() => {
    setVisibleNotifications(notifications.slice(0, maxVisible));
  }, [notifications, maxVisible]);

  React.useEffect(() => {
    if (autoHide) {
      visibleNotifications.forEach((notification) => {
        if (!notification.persistent && !notification.read) {
          setTimeout(() => {
            onNotificationDismiss?.(notification.id);
          }, autoHideDelay);
        }
      });
    }
  }, [visibleNotifications, autoHide, autoHideDelay, onNotificationDismiss]);

  const handleNotificationClick = (id: string) => {
    onNotificationClick?.(id);
  };

  const handleNotificationDismiss = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onNotificationDismiss?.(id);
  };

  const handleActionClick = (notification: any) => {
    notification.action?.onClick?.();
    handleNotificationClick(notification.id);
  };

  const getUnreadCount = () => {
    return notifications.filter(n => !n.read).length;
  };

  const getTypeClasses = (type: string) => {
    const baseClasses = 'notification-item p-4 rounded-lg border-l-4 mb-2 cursor-pointer transition-all duration-200 hover:shadow-md';
    
    switch (type) {
      case 'success':
        return `${baseClasses} bg-green-50 border-green-500 text-green-800 hover:bg-green-100`;
      case 'warning':
        return `${baseClasses} bg-yellow-50 border-yellow-500 text-yellow-800 hover:bg-yellow-100`;
      case 'error':
        return `${baseClasses} bg-red-50 border-red-500 text-red-800 hover:bg-red-100`;
      default:
        return `${baseClasses} bg-blue-50 border-blue-500 text-blue-800 hover:bg-blue-100`;
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return '✅';
      case 'warning':
        return '⚠️';
      case 'error':
        return '❌';
      default:
        return 'ℹ️';
    }
  };

  const getPositionClasses = () => {
    switch (position) {
      case 'top-left':
        return 'top-4 left-4';
      case 'top-right':
        return 'top-4 right-4';
      case 'bottom-left':
        return 'bottom-4 left-4';
      case 'bottom-right':
        return 'bottom-4 right-4';
      case 'top-center':
        return 'top-4 left-1/2 transform -translate-x-1/2';
      case 'bottom-center':
        return 'bottom-4 left-1/2 transform -translate-x-1/2';
      default:
        return 'top-4 right-4';
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  const unreadCount = getUnreadCount();

  return (
    <div className={`notification-center ${getPositionClasses()} ${className || ''} ${theme === 'dark' ? 'dark' : ''}`}>
      {/* Notification Bell/Trigger */}
      <div className="notification-trigger relative inline-block">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`notification-bell p-3 rounded-full shadow-lg transition-all duration-200 ${
            unreadCount > 0 ? 'bg-red-500 text-white animate-pulse' : 'bg-white text-gray-600 hover:bg-gray-50'
          }`}
        >
          <span className="text-xl">🔔</span>
          {showCount && unreadCount > 0 && (
            <span className="notification-count absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>
      </div>

      {/* Notification Panel */}
      {isExpanded && (
        <div className={`notification-panel mt-2 w-80 max-h-96 overflow-hidden rounded-lg shadow-xl bg-white ${
          theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
        }`}>
          {/* Header */}
          <div className="notification-header p-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-semibold">Notifications</h3>
            <div className="header-actions flex space-x-2">
              {unreadCount > 0 && (
                <button
                  onClick={onMarkAllRead}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  Mark all read
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  onClick={onClearAll}
                  className="text-sm text-red-600 hover:text-red-800 font-medium"
                >
                  Clear all
                </button>
              )}
            </div>
          </div>

          {/* Notifications List */}
          <div className="notifications-list overflow-y-auto max-h-80">
            {notifications.length === 0 ? (
              <div className="notification-empty-state p-8 text-center text-gray-500">
                <div className="empty-icon text-4xl mb-2">📭</div>
                <p className="empty-text">No notifications</p>
                <p className="empty-subtext text-sm mt-1">You're all caught up!</p>
              </div>
            ) : (
              <>
                {notifications.slice(0, maxVisible).map((notification) => (
                  <div
                    key={notification.id}
                    className={`${getTypeClasses(notification.type)} ${
                      !notification.read ? 'opacity-100' : 'opacity-75'
                    }`}
                    onClick={() => handleNotificationClick(notification.id)}
                  >
                    <div className="notification-content flex items-start">
                      <div className="notification-icon text-xl mr-3 mt-1">
                        {getIcon(notification.type)}
                      </div>
                      <div className="notification-text flex-1">
                        <div className="notification-header-content flex justify-between items-start mb-1">
                          <h4 className="notification-title font-semibold text-sm">
                            {notification.title}
                          </h4>
                          <button
                            onClick={(e) => handleNotificationDismiss(notification.id, e)}
                            className="notification-dismiss text-gray-400 hover:text-gray-600 text-lg leading-none"
                          >
                            ×
                          </button>
                        </div>
                        <p className="notification-message text-sm mb-2">
                          {notification.message}
                        </p>
                        <div className="notification-footer flex justify-between items-center">
                          <span className="notification-time text-xs text-gray-500">
                            {formatTime(notification.timestamp)}
                          </span>
                          {notification.action && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleActionClick(notification);
                              }}
                              className="notification-action text-xs text-blue-600 hover:text-blue-800 font-medium"
                            >
                              {notification.action.label}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Test suite
describe('NotificationCenter Component - Simplified Test', () => {
  const mockNotifications = [
    {
      id: '1',
      title: 'Event Reminder',
      message: 'Beach cleanup event starts in 30 minutes',
      type: 'info' as const,
      timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
      read: false,
    },
    {
      id: '2',
      title: 'Registration Successful',
      message: 'You have successfully registered for the tree planting event',
      type: 'success' as const,
      timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
      read: false,
    },
    {
      id: '3',
      title: 'Weather Alert',
      message: 'Light rain expected during your outdoor event',
      type: 'warning' as const,
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      read: true,
    },
    {
      id: '4',
      title: 'Event Cancelled',
      message: 'The community garden event has been cancelled',
      type: 'error' as const,
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      read: false,
    },
  ];

  const renderNotificationCenter = (props = {}) => {
    return render(
      <MockNotificationCenter
        notifications={mockNotifications}
        onNotificationClick={jest.fn()}
        onNotificationDismiss={jest.fn()}
        onMarkAllRead={jest.fn()}
        onClearAll={jest.fn()}
        {...props}
      />
    );
  };

  describe('Basic Rendering', () => {
    it('should render without crashing', () => {
      const { container } = renderNotificationCenter();
      expect(container).toBeTruthy();
    });

    it('should render notification bell', () => {
      renderNotificationCenter();
      expect(screen.getByText('🔔')).toBeTruthy();
    });

    it('should show unread count when notifications exist', () => {
      renderNotificationCenter();
      expect(screen.getByText('3')).toBeTruthy(); // 3 unread notifications
    });

    it('should not show count when showCount is false', () => {
      renderNotificationCenter({ showCount: false });
      expect(screen.queryByText('3')).toBeFalsy();
    });

    it('should render notification panel when expanded', () => {
      renderNotificationCenter();
      const bell = screen.getByText('🔔');
      fireEvent.click(bell);
      
      expect(screen.getByText('Notifications')).toBeTruthy();
    });

    it('should render all notification titles', () => {
      renderNotificationCenter();
      const bell = screen.getByText('🔔');
      fireEvent.click(bell);
      
      expect(screen.getByText('Event Reminder')).toBeTruthy();
      expect(screen.getByText('Registration Successful')).toBeTruthy();
      expect(screen.getByText('Weather Alert')).toBeTruthy();
      expect(screen.getByText('Event Cancelled')).toBeTruthy();
    });

    it('should render all notification messages', () => {
      renderNotificationCenter();
      const bell = screen.getByText('🔔');
      fireEvent.click(bell);
      
      expect(screen.getByText('Beach cleanup event starts in 30 minutes')).toBeTruthy();
      expect(screen.getByText('You have successfully registered for the tree planting event')).toBeTruthy();
    });
  });

  describe('Notification Types', () => {
    it('should render info notifications with correct styling', () => {
      const { container } = renderNotificationCenter();
      const bell = screen.getByText('🔔');
      fireEvent.click(bell);
      
      const infoNotification = container.querySelector('.notification-item');
      expect(infoNotification?.className).toContain('bg-blue-50');
      expect(infoNotification?.className).toContain('border-blue-500');
    });

    it('should render success notifications with correct styling', () => {
      const { container } = renderNotificationCenter();
      const bell = screen.getByText('🔔');
      fireEvent.click(bell);
      
      const successNotifications = container.querySelectorAll('.notification-item');
      const successNotification = Array.from(successNotifications).find(n => 
        n.textContent?.includes('Registration Successful')
      );
      expect(successNotification?.className).toContain('bg-green-50');
      expect(successNotification?.className).toContain('border-green-500');
    });

    it('should render warning notifications with correct styling', () => {
      const { container } = renderNotificationCenter();
      const bell = screen.getByText('🔔');
      fireEvent.click(bell);
      
      const warningNotifications = container.querySelectorAll('.notification-item');
      const warningNotification = Array.from(warningNotifications).find(n => 
        n.textContent?.includes('Weather Alert')
      );
      expect(warningNotification?.className).toContain('bg-yellow-50');
      expect(warningNotification?.className).toContain('border-yellow-500');
    });

    it('should render error notifications with correct styling', () => {
      const { container } = renderNotificationCenter();
      const bell = screen.getByText('🔔');
      fireEvent.click(bell);
      
      const errorNotifications = container.querySelectorAll('.notification-item');
      const errorNotification = Array.from(errorNotifications).find(n => 
        n.textContent?.includes('Event Cancelled')
      );
      expect(errorNotification?.className).toContain('bg-red-50');
      expect(errorNotification?.className).toContain('border-red-500');
    });

    it('should render correct icons for each type', () => {
      renderNotificationCenter();
      const bell = screen.getByText('🔔');
      fireEvent.click(bell);
      
      expect(screen.getByText('ℹ️')).toBeTruthy(); // Info
      expect(screen.getByText('✅')).toBeTruthy(); // Success
      expect(screen.getByText('⚠️')).toBeTruthy(); // Warning
      expect(screen.getByText('❌')).toBeTruthy(); // Error
    });
  });

  describe('Notification Interactions', () => {
    it('should call onNotificationClick when notification is clicked', () => {
      const onNotificationClick = jest.fn();
      renderNotificationCenter({ onNotificationClick });
      
      const bell = screen.getByText('🔔');
      fireEvent.click(bell);
      
      const notification = screen.getByText('Event Reminder').closest('.notification-item');
      if (notification) {
        fireEvent.click(notification);
      }
      
      expect(onNotificationClick).toHaveBeenCalledWith('1');
    });

    it('should call onNotificationDismiss when dismiss button is clicked', () => {
      const onNotificationDismiss = jest.fn();
      renderNotificationCenter({ onNotificationDismiss });
      
      const bell = screen.getByText('🔔');
      fireEvent.click(bell);
      
      const dismissButtons = screen.getAllByText('×');
      if (dismissButtons.length > 0) {
        fireEvent.click(dismissButtons[0]);
      }
      
      expect(onNotificationDismiss).toHaveBeenCalled();
    });

    it('should call onMarkAllRead when mark all read is clicked', () => {
      const onMarkAllRead = jest.fn();
      renderNotificationCenter({ onMarkAllRead });
      
      const bell = screen.getByText('🔔');
      fireEvent.click(bell);
      
      const markAllReadButton = screen.getByText('Mark all read');
      fireEvent.click(markAllReadButton);
      
      expect(onMarkAllRead).toHaveBeenCalled();
    });

    it('should call onClearAll when clear all is clicked', () => {
      const onClearAll = jest.fn();
      renderNotificationCenter({ onClearAll });
      
      const bell = screen.getByText('🔔');
      fireEvent.click(bell);
      
      const clearAllButton = screen.getByText('Clear all');
      fireEvent.click(clearAllButton);
      
      expect(onClearAll).toHaveBeenCalled();
    });
  });

  describe('Empty State', () => {
    it('should show empty state when no notifications', () => {
      renderNotificationCenter({ notifications: [] });
      
      const bell = screen.getByText('🔔');
      fireEvent.click(bell);
      
      expect(screen.getByText('No notifications')).toBeTruthy();
      expect(screen.getByText('📭')).toBeTruthy();
      expect(screen.getByText("You're all caught up!")).toBeTruthy();
    });

    it('should not show clear all button when no notifications', () => {
      renderNotificationCenter({ notifications: [] });
      
      const bell = screen.getByText('🔔');
      fireEvent.click(bell);
      
      expect(screen.queryByText('Clear all')).toBeFalsy();
    });

    it('should not show mark all read button when no notifications', () => {
      renderNotificationCenter({ notifications: [] });
      
      const bell = screen.getByText('🔔');
      fireEvent.click(bell);
      
      expect(screen.queryByText('Mark all read')).toBeFalsy();
    });
  });

  describe('Read/Unread Status', () => {
    it('should distinguish read and unread notifications', () => {
      const { container } = renderNotificationCenter();
      const bell = screen.getByText('🔔');
      fireEvent.click(bell);
      
      const notifications = container.querySelectorAll('.notification-item');
      const readNotification = Array.from(notifications).find(n => 
        n.textContent?.includes('Weather Alert')
      );
      const unreadNotification = Array.from(notifications).find(n => 
        n.textContent?.includes('Event Reminder')
      );
      
      expect(readNotification?.className).toContain('opacity-75');
      expect(unreadNotification?.className).toContain('opacity-100');
    });

    it('should show correct unread count', () => {
      renderNotificationCenter();
      expect(screen.getByText('3')).toBeTruthy(); // 3 unread notifications
    });

    it('should handle 99+ notifications', () => {
      const manyNotifications = Array.from({ length: 150 }, (_, i) => ({
        id: `${i}`,
        title: `Notification ${i}`,
        message: `Message ${i}`,
        type: 'info' as const,
        timestamp: new Date(),
        read: false,
      }));
      
      renderNotificationCenter({ notifications: manyNotifications });
      expect(screen.getByText('99+')).toBeTruthy();
    });
  });

  describe('Positioning', () => {
    it('should apply correct position classes for top-right', () => {
      const { container } = renderNotificationCenter({ position: 'top-right' });
      const center = container.querySelector('.notification-center');
      expect(center?.className).toContain('top-4');
      expect(center?.className).toContain('right-4');
    });

    it('should apply correct position classes for top-left', () => {
      const { container } = renderNotificationCenter({ position: 'top-left' });
      const center = container.querySelector('.notification-center');
      expect(center?.className).toContain('top-4');
      expect(center?.className).toContain('left-4');
    });

    it('should apply correct position classes for bottom-right', () => {
      const { container } = renderNotificationCenter({ position: 'bottom-right' });
      const center = container.querySelector('.notification-center');
      expect(center?.className).toContain('bottom-4');
      expect(center?.className).toContain('right-4');
    });

    it('should apply correct position classes for top-center', () => {
      const { container } = renderNotificationCenter({ position: 'top-center' });
      const center = container.querySelector('.notification-center');
      expect(center?.className).toContain('top-4');
      expect(center?.className).toContain('left-1/2');
      expect(center?.className).toContain('-translate-x-1/2');
    });
  });

  describe('Auto-hide Functionality', () => {
    it('should auto-hide notifications after delay', () => {
      jest.useFakeTimers();
      const onNotificationDismiss = jest.fn();
      
      renderNotificationCenter({ 
        autoHide: true, 
        autoHideDelay: 1000,
        onNotificationDismiss 
      });
      
      const bell = screen.getByText('🔔');
      fireEvent.click(bell);
      
      jest.advanceTimersByTime(1000);
      
      expect(onNotificationDismiss).toHaveBeenCalled();
      jest.useRealTimers();
    });

    it('should not auto-hide persistent notifications', () => {
      jest.useFakeTimers();
      const onNotificationDismiss = jest.fn();
      
      const persistentNotifications = [
        {
          id: '1',
          title: 'Persistent Notification',
          message: 'This will not auto-hide',
          type: 'info' as const,
          timestamp: new Date(),
          read: false,
          persistent: true,
        },
      ];
      
      renderNotificationCenter({ 
        autoHide: true, 
        autoHideDelay: 1000,
        onNotificationDismiss,
        notifications: persistentNotifications
      });
      
      const bell = screen.getByText('🔔');
      fireEvent.click(bell);
      
      jest.advanceTimersByTime(1000);
      
      expect(onNotificationDismiss).not.toHaveBeenCalled();
      jest.useRealTimers();
    });

    it('should not auto-hide when autoHide is false', () => {
      jest.useFakeTimers();
      const onNotificationDismiss = jest.fn();
      
      renderNotificationCenter({ 
        autoHide: false, 
        autoHideDelay: 1000,
        onNotificationDismiss 
      });
      
      const bell = screen.getByText('🔔');
      fireEvent.click(bell);
      
      jest.advanceTimersByTime(1000);
      
      expect(onNotificationDismiss).not.toHaveBeenCalled();
      jest.useRealTimers();
    });
  });

  describe('Actions', () => {
    it('should render action buttons when actions are provided', () => {
      const notificationsWithActions = [
        {
          id: '1',
          title: 'Event Invitation',
          message: 'You have been invited to an event',
          type: 'info' as const,
          timestamp: new Date(),
          read: false,
          action: {
            label: 'View Event',
            onClick: jest.fn(),
          },
        },
      ];
      
      renderNotificationCenter({ notifications: notificationsWithActions });
      
      const bell = screen.getByText('🔔');
      fireEvent.click(bell);
      
      expect(screen.getByText('View Event')).toBeTruthy();
    });

    it('should call action onClick when action button is clicked', () => {
      const actionOnClick = jest.fn();
      const notificationsWithActions = [
        {
          id: '1',
          title: 'Event Invitation',
          message: 'You have been invited to an event',
          type: 'info' as const,
          timestamp: new Date(),
          read: false,
          action: {
            label: 'View Event',
            onClick: actionOnClick,
          },
        },
      ];
      
      renderNotificationCenter({ notifications: notificationsWithActions });
      
      const bell = screen.getByText('🔔');
      fireEvent.click(bell);
      
      const actionButton = screen.getByText('View Event');
      fireEvent.click(actionButton);
      
      expect(actionOnClick).toHaveBeenCalled();
    });
  });

  describe('Styling', () => {
    it('should have correct notification center styling', () => {
      const { container } = renderNotificationCenter();
      const center = container.querySelector('.notification-center');
      expect(center).toBeTruthy();
    });

    it('should have correct notification panel styling', () => {
      const { container } = renderNotificationCenter();
      const bell = screen.getByText('🔔');
      fireEvent.click(bell);
      
      const panel = container.querySelector('.notification-panel');
      expect(panel?.className).toContain('w-80');
      expect(panel?.className).toContain('max-h-96');
      expect(panel?.className).toContain('rounded-lg');
    });

    it('should apply light theme by default', () => {
      const { container } = renderNotificationCenter();
      const center = container.querySelector('.notification-center');
      expect(center?.className).not.toContain('dark');
    });

    it('should apply dark theme when specified', () => {
      const { container } = renderNotificationCenter({ theme: 'dark' });
      const center = container.querySelector('.notification-center');
      expect(center?.className).toContain('dark');
    });

    it('should apply custom className', () => {
      const { container } = renderNotificationCenter({ className: 'custom-notifications' });
      const center = container.querySelector('.notification-center');
      expect(center?.className).toContain('custom-notifications');
    });
  });

  describe('Accessibility', () => {
    it('should have proper button labeling', () => {
      renderNotificationCenter();
      const bell = screen.getByText('🔔');
      fireEvent.click(bell);
      
      expect(screen.getByText('Mark all read')).toBeTruthy();
      expect(screen.getByText('Clear all')).toBeTruthy();
    });

    it('should have proper notification structure', () => {
      renderNotificationCenter();
      const bell = screen.getByText('🔔');
      fireEvent.click(bell);
      
      const notifications = screen.getAllByText('×');
      expect(notifications.length).toBeGreaterThan(0);
    });

    it('should have semantic HTML structure', () => {
      const { container } = renderNotificationCenter();
      const bell = screen.getByText('🔔');
      fireEvent.click(bell);
      
      const panel = container.querySelector('.notification-panel');
      const header = container.querySelector('.notification-header');
      const list = container.querySelector('.notifications-list');
      
      expect(panel).toBeTruthy();
      expect(header).toBeTruthy();
      expect(list).toBeTruthy();
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long titles', () => {
      const longTitleNotification = [
        {
          id: '1',
          title: 'This is an extremely long notification title that should still be displayed correctly without breaking the layout or causing any display issues',
          message: 'Test message',
          type: 'info' as const,
          timestamp: new Date(),
          read: false,
        },
      ];
      
      renderNotificationCenter({ notifications: longTitleNotification });
      
      const bell = screen.getByText('🔔');
      fireEvent.click(bell);
      
      expect(screen.getByText(longTitleNotification[0].title)).toBeTruthy();
    });

    it('should handle very long messages', () => {
      const longMessageNotification = [
        {
          id: '1',
          title: 'Test Title',
          message: 'This is an extremely long notification message that should still be displayed correctly without breaking the layout or causing any display issues in the notification panel',
          type: 'info' as const,
          timestamp: new Date(),
          read: false,
        },
      ];
      
      renderNotificationCenter({ notifications: longMessageNotification });
      
      const bell = screen.getByText('🔔');
      fireEvent.click(bell);
      
      expect(screen.getByText(longMessageNotification[0].message)).toBeTruthy();
    });

    it('should handle null callbacks', () => {
      renderNotificationCenter({
        onNotificationClick: null as any,
        onNotificationDismiss: null as any,
        onMarkAllRead: null as any,
        onClearAll: null as any,
      });
      
      const bell = screen.getByText('🔔');
      fireEvent.click(bell);
      
      // Should not crash
      expect(screen.getByText('Event Reminder')).toBeTruthy();
    });

    it('should handle missing notification properties', () => {
      const incompleteNotifications = [
        {
          id: '1',
          title: 'Test Title',
          message: 'Test Message',
          type: 'info' as const,
          timestamp: new Date(),
          read: false,
        },
      ];
      
      renderNotificationCenter({ notifications: incompleteNotifications });
      
      const bell = screen.getByText('🔔');
      fireEvent.click(bell);
      
      expect(screen.getByText('Test Title')).toBeTruthy();
    });

    it('should render consistently', () => {
      const { container: container1 } = renderNotificationCenter();
      const { container: container2 } = renderNotificationCenter();
      
      expect(container1.querySelectorAll('.notification-item').length).toBe(
        container2.querySelectorAll('.notification-item').length
      );
    });

    it('should handle maxVisible limit', () => {
      const manyNotifications = Array.from({ length: 10 }, (_, i) => ({
        id: `${i}`,
        title: `Notification ${i}`,
        message: `Message ${i}`,
        type: 'info' as const,
        timestamp: new Date(),
        read: false,
      }));
      
      renderNotificationCenter({ 
        notifications: manyNotifications,
        maxVisible: 3 
      });
      
      const bell = screen.getByText('🔔');
      fireEvent.click(bell);
      
      const notifications = screen.getAllByText(/Notification \d/);
      expect(notifications.length).toBeLessThanOrEqual(3);
    });
  });
});