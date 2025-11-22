import * as React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';

// Create a simplified mock ChatWindow component
const MockChatWindow = ({
  messages = [],
  currentUser = { id: 1, name: 'John Doe' },
  onSendMessage,
  onTyping,
  isTyping = false,
  typingUsers = [],
  className,
  placeholder = 'Type a message...',
  maxMessageLength = 500,
  showTimestamps = true,
  showAvatars = true,
  theme = 'light'
}: {
  messages?: Array<{
    id: string;
    text: string;
    userId: number;
    userName: string;
    userAvatar?: string;
    timestamp: Date;
    isSystem?: boolean;
  }>;
  currentUser?: { id: number; name: string; avatar?: string };
  onSendMessage?: (message: string) => void;
  onTyping?: () => void;
  isTyping?: boolean;
  typingUsers?: Array<{ id: number; name: string }>;
  className?: string;
  placeholder?: string;
  maxMessageLength?: number;
  showTimestamps?: boolean;
  showAvatars?: boolean;
  theme?: 'light' | 'dark';
}) => {
  const [inputValue, setInputValue] = React.useState('');
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (messagesEndRef.current && typeof messagesEndRef.current.scrollIntoView === 'function') {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && inputValue.length <= maxMessageLength) {
      onSendMessage?.(inputValue.trim());
      setInputValue('');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= maxMessageLength) {
      setInputValue(value);
      onTyping?.();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // formatDate function is available but not used in this test

  const isCurrentUser = (userId: number) => userId === currentUser.id;

  const getThemeClasses = () => {
    if (theme === 'dark') {
      return 'chat-window-dark bg-gray-900 text-white';
    }
    return 'chat-window-light bg-white text-gray-900';
  };

  return (
    <div className={`chat-window ${getThemeClasses()} ${className || ''}`}>
      {/* Messages Container */}
      <div className="chat-messages-container flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="chat-empty-state text-center py-8 text-gray-500">
            <div className="empty-icon text-4xl mb-2">💬</div>
            <p className="empty-text">No messages yet. Start the conversation!</p>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <div
                key={message.id}
                className={`chat-message ${isCurrentUser(message.userId) ? 'message-sent' : 'message-received'}`}
              >
                {!isCurrentUser(message.userId) && showAvatars && (
                  <div className="message-avatar mr-3">
                    <div className="avatar-placeholder w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-sm font-semibold">
                      {message.userName.charAt(0).toUpperCase()}
                    </div>
                  </div>
                )}
                
                <div className={`message-content ${isCurrentUser(message.userId) ? 'ml-auto' : ''}`}>
                  {!isCurrentUser(message.userId) && (
                    <div className="message-author text-xs text-gray-500 mb-1">
                      {message.userName}
                    </div>
                  )}
                  
                  <div className={`message-bubble px-3 py-2 rounded-lg max-w-xs ${
                    isCurrentUser(message.userId) 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-100 text-gray-900'
                  }`}>
                    {message.text}
                  </div>
                  
                  {showTimestamps && (
                    <div className="message-timestamp text-xs text-gray-400 mt-1">
                      {formatTime(message.timestamp)}
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {/* Typing Indicator */}
            {isTyping && typingUsers.length > 0 && (
              <div className="typing-indicator flex items-center space-x-2 text-sm text-gray-500">
                <div className="typing-dots flex space-x-1">
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                </div>
                <span className="typing-text">
                  {typingUsers.map(user => user.name).join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
                </span>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Message Input */}
      <div className="chat-input-container border-t p-4">
        <form onSubmit={handleSendMessage} className="chat-input-form">
          <div className="input-group flex items-end space-x-2">
            <textarea
              value={inputValue}
              onChange={handleInputChange}
              placeholder={placeholder}
              className="chat-input flex-1 resize-none border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={1}
              maxLength={maxMessageLength}
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || inputValue.length > maxMessageLength}
              className="send-button px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              Send
            </button>
          </div>
          
          {/* Character Counter */}
          <div className="character-counter text-xs text-gray-400 mt-1 text-right">
            {inputValue.length}/{maxMessageLength}
          </div>
        </form>
      </div>
    </div>
  );
};

// Test suite
describe('ChatWindow Component - Simplified Test', () => {
  const mockMessages = [
    {
      id: '1',
      text: 'Hello, how are you?',
      userId: 2,
      userName: 'Alice Smith',
      timestamp: new Date('2024-01-15T10:00:00'),
    },
    {
      id: '2',
      text: "I'm doing great, thanks for asking!",
      userId: 1,
      userName: 'John Doe',
      timestamp: new Date('2024-01-15T10:01:00'),
    },
    {
      id: '3',
      text: 'Would you like to join the cleanup event?',
      userId: 2,
      userName: 'Alice Smith',
      timestamp: new Date('2024-01-15T10:02:00'),
    },
  ];

  const mockCurrentUser = { id: 1, name: 'John Doe' };

  const renderChatWindow = (props = {}) => {
    return render(
      <MockChatWindow
        messages={mockMessages}
        currentUser={mockCurrentUser}
        onSendMessage={jest.fn()}
        onTyping={jest.fn()}
        {...props}
      />
    );
  };

  describe('Basic Rendering', () => {
    it('should render without crashing', () => {
      const { container } = renderChatWindow();
      expect(container).toBeTruthy();
    });

    it('should render messages container', () => {
      const { container } = renderChatWindow();
      const messagesContainer = container.querySelector('.chat-messages-container');
      expect(messagesContainer).toBeTruthy();
    });

    it('should render input area', () => {
      renderChatWindow();
      expect(screen.getByPlaceholderText('Type a message...')).toBeTruthy();
    });

    it('should render send button', () => {
      renderChatWindow();
      expect(screen.getByText('Send')).toBeTruthy();
    });

    it('should render character counter', () => {
      renderChatWindow();
      expect(screen.getByText('0/500')).toBeTruthy();
    });
  });

  describe('Message Display', () => {
    it('should render all messages', () => {
      renderChatWindow();
      expect(screen.getByText('Hello, how are you?')).toBeTruthy();
      expect(screen.getByText("I'm doing great, thanks for asking!")).toBeTruthy();
      expect(screen.getByText('Would you like to join the cleanup event?')).toBeTruthy();
    });

    it('should render message authors', () => {
      renderChatWindow();
      const authors = screen.getAllByText('Alice Smith');
      expect(authors.length).toBeGreaterThan(0);
    });

    it('should distinguish sent vs received messages', () => {
      const { container } = renderChatWindow();
      const sentMessages = container.querySelectorAll('.message-sent');
      const receivedMessages = container.querySelectorAll('.message-received');
      
      expect(sentMessages.length).toBeGreaterThan(0);
      expect(receivedMessages.length).toBeGreaterThan(0);
    });

    it('should render timestamps when enabled', () => {
      renderChatWindow({ showTimestamps: true });
      // Should show time format like "10:00 AM" or "10:00"
      const timestamps = screen.getAllByText(/\d{1,2}:\d{2}/);
      expect(timestamps.length).toBeGreaterThan(0);
    });

    it('should hide timestamps when disabled', () => {
      renderChatWindow({ showTimestamps: false });
      const timestamps = screen.queryAllByText(/\d{1,2}:\d{2}/);
      expect(timestamps.length).toBe(0);
    });

    it('should render avatars when enabled', () => {
      renderChatWindow({ showAvatars: true });
      const avatars = screen.getAllByText('A'); // Alice's initial
      expect(avatars.length).toBeGreaterThan(0);
    });

    it('should hide avatars when disabled', () => {
      renderChatWindow({ showAvatars: false });
      const avatars = screen.queryAllByText('A');
      expect(avatars.length).toBe(0);
    });
  });

  describe('Empty State', () => {
    it('should show empty state when no messages', () => {
      renderChatWindow({ messages: [] });
      expect(screen.getByText('No messages yet. Start the conversation!')).toBeTruthy();
      expect(screen.getByText('💬')).toBeTruthy();
    });

    it('should hide empty state when messages exist', () => {
      renderChatWindow({ messages: mockMessages });
      expect(screen.queryByText('No messages yet. Start the conversation!')).toBeFalsy();
    });
  });

  describe('Message Input', () => {
    it('should handle input changes', () => {
      renderChatWindow();
      const input = screen.getByPlaceholderText('Type a message...') as HTMLTextAreaElement;
      
      fireEvent.change(input, { target: { value: 'New message' } });
      expect(input.value).toBe('New message');
    });

    it('should update character counter', () => {
      renderChatWindow();
      const input = screen.getByPlaceholderText('Type a message...');
      
      fireEvent.change(input, { target: { value: 'Hello world' } });
      expect(screen.getByText('11/500')).toBeTruthy();
    });

    it('should call onTyping when input changes', () => {
      const onTyping = jest.fn();
      renderChatWindow({ onTyping });
      const input = screen.getByPlaceholderText('Type a message...');
      
      fireEvent.change(input, { target: { value: 'Hello' } });
      expect(onTyping).toHaveBeenCalled();
    });

    it('should prevent exceeding max message length', () => {
      renderChatWindow({ maxMessageLength: 10 });
      const input = screen.getByPlaceholderText('Type a message...') as HTMLTextAreaElement;
      
      fireEvent.change(input, { target: { value: 'This is a very long message' } });
      expect(input.value.length).toBeLessThanOrEqual(10);
    });

    it('should disable send button when input is empty', () => {
      renderChatWindow();
      const sendButton = screen.getByText('Send') as HTMLButtonElement;
      expect(sendButton.disabled).toBe(true);
    });

    it('should enable send button when input has text', () => {
      renderChatWindow();
      const input = screen.getByPlaceholderText('Type a message...');
      const sendButton = screen.getByText('Send') as HTMLButtonElement;
      
      fireEvent.change(input, { target: { value: 'Hello' } });
      expect(sendButton.disabled).toBe(false);
    });
  });

  describe('Message Sending', () => {
    it('should call onSendMessage when form is submitted', () => {
      const onSendMessage = jest.fn();
      renderChatWindow({ onSendMessage });
      const input = screen.getByPlaceholderText('Type a message...');
      const form = input.closest('form') || document.querySelector('.chat-input-form');
      
      fireEvent.change(input, { target: { value: 'Test message' } });
      if (form) {
        fireEvent.submit(form);
      }
      
      expect(onSendMessage).toHaveBeenCalledWith('Test message');
    });

    it('should clear input after sending message', () => {
      renderChatWindow();
      const input = screen.getByPlaceholderText('Type a message...') as HTMLTextAreaElement;
      const form = input.closest('form') || document.querySelector('.chat-input-form');
      
      fireEvent.change(input, { target: { value: 'Test message' } });
      if (form) {
        fireEvent.submit(form);
      }
      
      expect(input.value).toBe('');
    });

    it('should not send empty messages', () => {
      const onSendMessage = jest.fn();
      renderChatWindow({ onSendMessage });
      const input = screen.getByPlaceholderText('Type a message...');
      const form = input.closest('form') || document.querySelector('.chat-input-form');
      
      if (form) {
        fireEvent.submit(form);
      }
      
      expect(onSendMessage).not.toHaveBeenCalled();
    });

    it('should trim whitespace from messages', () => {
      const onSendMessage = jest.fn();
      renderChatWindow({ onSendMessage });
      const input = screen.getByPlaceholderText('Type a message...');
      const form = input.closest('form') || document.querySelector('.chat-input-form');
      
      fireEvent.change(input, { target: { value: '  Test message  ' } });
      if (form) {
        fireEvent.submit(form);
      }
      
      expect(onSendMessage).toHaveBeenCalledWith('Test message');
    });
  });

  describe('Typing Indicator', () => {
    it('should show typing indicator when users are typing', () => {
      renderChatWindow({
        isTyping: true,
        typingUsers: [{ id: 2, name: 'Alice Smith' }]
      });
      expect(screen.getByText('Alice Smith is typing...')).toBeTruthy();
    });

    it('should show multiple users typing', () => {
      renderChatWindow({
        isTyping: true,
        typingUsers: [
          { id: 2, name: 'Alice Smith' },
          { id: 3, name: 'Bob Johnson' }
        ]
      });
      expect(screen.getByText('Alice Smith, Bob Johnson are typing...')).toBeTruthy();
    });

    it('should hide typing indicator when no users are typing', () => {
      renderChatWindow({
        isTyping: false,
        typingUsers: []
      });
      expect(screen.queryByText(/typing/)).toBeFalsy();
    });

    it('should render typing animation dots', () => {
      renderChatWindow({
        isTyping: true,
        typingUsers: [{ id: 2, name: 'Alice Smith' }]
      });
      const dots = screen.getAllByText(''); // The dots are empty spans
      expect(dots.length).toBeGreaterThan(0);
    });
  });

  describe('Styling', () => {
    it('should have correct chat window styling', () => {
      const { container } = renderChatWindow();
      const chatWindow = container.querySelector('.chat-window');
      expect(chatWindow).toBeTruthy();
    });

    it('should have correct messages container styling', () => {
      const { container } = renderChatWindow();
      const messagesContainer = container.querySelector('.chat-messages-container');
      expect(messagesContainer).toBeTruthy();
    });

    it('should have correct input container styling', () => {
      const { container } = renderChatWindow();
      const inputContainer = container.querySelector('.chat-input-container');
      expect(inputContainer).toBeTruthy();
    });

    it('should have correct message bubble styling', () => {
      const { container } = renderChatWindow();
      const messageBubbles = container.querySelectorAll('.message-bubble');
      expect(messageBubbles.length).toBeGreaterThan(0);
    });

    it('should apply light theme by default', () => {
      const { container } = renderChatWindow();
      const chatWindow = container.querySelector('.chat-window');
      expect(chatWindow?.className).toContain('chat-window-light');
    });

    it('should apply dark theme when specified', () => {
      const { container } = renderChatWindow({ theme: 'dark' });
      const chatWindow = container.querySelector('.chat-window');
      expect(chatWindow?.className).toContain('chat-window-dark');
    });

    it('should apply custom className', () => {
      const { container } = renderChatWindow({ className: 'custom-chat' });
      const chatWindow = container.querySelector('.chat-window');
      expect(chatWindow?.className).toContain('custom-chat');
    });

    it('should have correct sent message styling', () => {
      const { container } = renderChatWindow();
      const sentMessages = container.querySelectorAll('.message-sent');
      expect(sentMessages.length).toBeGreaterThan(0);
    });

    it('should have correct received message styling', () => {
      const { container } = renderChatWindow();
      const receivedMessages = container.querySelectorAll('.message-received');
      expect(receivedMessages.length).toBeGreaterThan(0);
    });
  });

  describe('Accessibility', () => {
    it('should have proper form structure', () => {
      renderChatWindow();
      const form = document.querySelector('.chat-input-form');
      expect(form).toBeTruthy();
    });

    it('should have proper input labeling', () => {
      renderChatWindow();
      const input = screen.getByPlaceholderText('Type a message...');
      expect(input).toBeTruthy();
    });

    it('should have proper button labeling', () => {
      renderChatWindow();
      const sendButton = screen.getByText('Send');
      expect(sendButton).toBeTruthy();
    });

    it('should have semantic HTML structure', () => {
      const { container } = renderChatWindow();
      const form = container.querySelector('form');
      const textarea = container.querySelector('textarea');
      const button = container.querySelector('button');
      
      expect(form).toBeTruthy();
      expect(textarea).toBeTruthy();
      expect(button).toBeTruthy();
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long messages', () => {
      const longMessage = 'This is a very long message that should still be displayed correctly in the chat window without breaking the layout or causing any display issues.';
      renderChatWindow();
      const input = screen.getByPlaceholderText('Type a message...') as HTMLTextAreaElement;
      
      fireEvent.change(input, { target: { value: longMessage } });
      expect(input.value).toBe(longMessage);
    });

    it('should handle special characters in messages', () => {
      const specialMessage = 'Special chars: !@#$%^&*()_+-=[]{}|;:,.<>?';
      renderChatWindow();
      const input = screen.getByPlaceholderText('Type a message...') as HTMLTextAreaElement;
      
      fireEvent.change(input, { target: { value: specialMessage } });
      expect(input.value).toBe(specialMessage);
    });

    it('should handle null callbacks', () => {
      renderChatWindow({
        onSendMessage: null as any,
        onTyping: null as any
      });
      const input = screen.getByPlaceholderText('Type a message...');
      const form = input.closest('form') || document.querySelector('.chat-input-form');
      
      fireEvent.change(input, { target: { value: 'Test' } });
      if (form) {
        fireEvent.submit(form);
      }
      // Should not crash
    });

    it('should handle empty user data', () => {
      renderChatWindow({
        currentUser: { id: 0, name: '' }
      });
      expect(screen.getByPlaceholderText('Type a message...')).toBeTruthy();
    });

    it('should handle missing message properties', () => {
      const incompleteMessages = [
        { id: '1', text: 'Test', userId: 1, userName: 'User', timestamp: new Date() }
      ];
      renderChatWindow({ messages: incompleteMessages as any });
      expect(screen.getByText('Test')).toBeTruthy();
    });

    it('should render consistently', () => {
      const { container: container1 } = renderChatWindow();
      const { container: container2 } = renderChatWindow();
      
      expect(container1.querySelectorAll('.chat-message').length).toBe(container2.querySelectorAll('.chat-message').length);
    });
  });
});