import React, { useState, useEffect, useRef } from 'react';
import { api } from '../../../shared/utils/api';
import { logger } from '../../../shared/utils/logger';
import { useToast } from '../../../shared/components/Toast';
import Button from '../../../shared/ui/Button';
import { useWebSocket, WebSocketMessage } from '../../../shared/utils/websocket';

type ChatMessage = {
  id: number;
  event_id: number;
  user_id: number;
  user_name: string;
  message: string;
  created_at: string;
  is_system?: boolean;
};

type ChatComponentProps = {
  eventId: number;
  currentUserId?: number;
  currentUserName?: string;
};

const ChatComponent: React.FC<ChatComponentProps> = ({ eventId, currentUserId, currentUserName }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { error: showError, success: showSuccess } = useToast();
  const log = logger.withContext('ChatComponent');

  // WebSocket connection for real-time messages
  const { isConnected, sendMessage: sendWebSocketMessage } = useWebSocket(
    `ws://localhost:3001`, // WebSocket server URL - adjust based on your setup
    {
      onMessage: (wsMessage: WebSocketMessage) => {
        if (wsMessage.type === 'chat_message' && wsMessage.data.event_id === eventId) {
          // Add new message to the list
          setMessages(prev => [...prev, wsMessage.data]);
          scrollToBottom();
          log.info('real_time_message_received', { messageId: wsMessage.data.id, eventId });
        }
      },
      onOpen: () => {
        log.info('websocket_connected', { eventId });
        showSuccess('Connected to real-time chat', 'Connection');
        
        // Join the event room when connected
        const joinMessage: WebSocketMessage = {
          type: 'join_event',
          data: { eventId },
          timestamp: new Date().toISOString(),
          eventId
        };
        sendWebSocketMessage(joinMessage);
      },
      onClose: () => {
        log.warn('websocket_disconnected', { eventId });
        showError('Disconnected from real-time chat', 'Connection');
      },
      onError: (error) => {
        log.error('websocket_error', { error, eventId });
        showError('Chat connection error', 'Connection');
      }
    }
  );

  // Fetch messages on component mount
  useEffect(() => {
    fetchMessages();
    // Set up polling as fallback if WebSocket disconnects
    const interval = setInterval(() => {
      if (!isConnected) {
        fetchMessages();
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [eventId, isConnected]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const data = await api.get<ChatMessage[]>(`/api/events/${eventId}/messages`);
      setMessages(data || []);
      log.info('messages_fetched', { count: data?.length || 0, eventId });
    } catch (error) {
      log.error('fetch_messages_error', { error, eventId });
      // Don't show error toast for background polling
      if (!isLoading) return;
      showError('Failed to load chat messages', 'Chat Error');
    } finally {
      setIsLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || isSending) return;

    setIsSending(true);
    const tempMessage = newMessage.trim();
    setNewMessage('');

    try {
      const messageData = {
        message: tempMessage,
        event_id: eventId,
        user_id: currentUserId || 1, // Fallback to anonymous user
        user_name: currentUserName || 'Anonymous User'
      };

      const sentMessage = await api.post<ChatMessage>(`/api/events/${eventId}/messages`, messageData);
      
      // Add the new message to the list
      setMessages(prev => [...prev, sentMessage]);
      
      // Send via WebSocket for real-time delivery to other users
      if (isConnected) {
        const wsMessage: WebSocketMessage = {
          type: 'chat_message',
          data: sentMessage,
          timestamp: new Date().toISOString(),
          eventId
        };
        sendWebSocketMessage(wsMessage);
      }
      
      showSuccess('Message sent successfully');
      log.info('message_sent', { eventId, messageId: sentMessage.id, viaWebSocket: isConnected });
      
      // Scroll to bottom after adding new message
      setTimeout(scrollToBottom, 100);
    } catch (error) {
      log.error('send_message_error', { error, eventId });
      showError('Failed to send message', 'Chat Error');
      // Restore the message so user can retry
      setNewMessage(tempMessage);
    } finally {
      setIsSending(false);
    }
  };

  const formatMessageTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (isLoading) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 animate-pulse rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 animate-pulse rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 animate-pulse rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white flex flex-col h-96">
      {/* Messages Header */}
      <div className="px-4 py-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Event Chat</h3>
            <p className="text-sm text-gray-600">Connect with other volunteers</p>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${
              isConnected ? 'bg-green-500' : 'bg-red-500'
            }`}></div>
            <span className="text-xs text-gray-500">
              {isConnected ? 'Connected' : 'Reconnecting...'}
            </span>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.user_id === currentUserId ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.user_id === currentUserId
                    ? 'bg-brand-600 text-white'
                    : message.is_system
                    ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                {message.user_id !== currentUserId && !message.is_system && (
                  <div className="text-xs font-medium mb-1">{message.user_name}</div>
                )}
                <div className="text-sm">{message.message}</div>
                <div className={`text-xs mt-1 ${
                  message.user_id === currentUserId ? 'text-brand-100' : 'text-gray-500'
                }`}>
                  {formatMessageTime(message.created_at)}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <form onSubmit={handleSendMessage} className="px-4 py-3 border-t border-gray-200">
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            disabled={isSending}
            maxLength={500}
          />
          <Button
            type="submit"
            variant="earth"
            disabled={isSending || !newMessage.trim()}
            className="px-4 py-2"
          >
            {isSending ? (
              <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ChatComponent;