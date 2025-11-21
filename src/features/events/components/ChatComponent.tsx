import * as React from 'react';
import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { api } from '../../../shared/utils/api';
import { logger } from '../../../shared/utils/logger';
import { useToast } from '../../../shared/components/Toast';
import Button from '../../../shared/ui/Button';
import { useWebSocket } from '../../../shared/utils/websocket';
import type { WebSocketMessage } from '../../../shared/utils/websocket';

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
  const [isAtBottom, setIsAtBottom] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const cacheKey = useMemo(() => `earthforus:event:${eventId}:messagesCache`, [eventId]);
  const { error: showError, success: showSuccess } = useToast();
  const log = logger.withContext('ChatComponent');

  // WebSocket connection for real-time messages
  const handlers = useMemo(() => ({
      onMessage: (wsMessage: WebSocketMessage) => {
        if (wsMessage.type === 'chat_message' && wsMessage.data.event_id === eventId) {
          setMessages(prev => [...prev, wsMessage.data]);
          scrollToBottom();
          log.info('real_time_message_received', { messageId: wsMessage.data.id, eventId });
        }
      },
      onOpen: () => {
        log.info('websocket_connected', { eventId });
        showSuccess('Connected to real-time chat', 'Connection');
      },
      onClose: () => {
        log.warn('websocket_disconnected', { eventId });
        showError('Disconnected from real-time chat', 'Connection');
      },
      onError: (error: Event) => {
        log.error('websocket_error', { error, eventId });
        showError('Chat connection error', 'Connection');
      }
  }), [eventId, log, showSuccess, showError]);

  const apiBase = (typeof process !== 'undefined' && process.env?.VITE_API_BASE) || 'http://localhost:3001';
  const wsUrl = apiBase.replace(/^http(s?):\/\//, 'ws$1://');
  const { isConnected, sendMessage: wsSend, manager } = useWebSocket(
    wsUrl,
    handlers
  );

  useEffect(() => {
    if (!isConnected) return;
    const joinMessage: WebSocketMessage = {
      type: 'join_event',
      data: { eventId },
      timestamp: new Date().toISOString(),
      eventId
    };
    wsSend(joinMessage);
  }, [isConnected, eventId, wsSend]);

  // Fetch messages on component mount

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = useCallback(async () => {
    try {
      const data = await api.get<unknown>(`/api/events/${eventId}/messages`);
      let next: ChatMessage[] = [];
      if (Array.isArray(data)) {
        next = data as ChatMessage[];
      } else if (data && typeof data === 'object' && 'messages' in (data as Record<string, unknown>)) {
        const raw = (data as { messages: Array<{ id: number; message: string; createdAt: string; user: { id: number; firstName?: string; lastName?: string } }> }).messages || [];
        next = raw.map((row) => ({
          id: row.id,
          message: row.message,
          created_at: row.createdAt,
          user_id: row.user.id,
          user_name: [row.user.firstName, row.user.lastName].filter(Boolean).join(' ') || 'User',
          event_id: eventId
        }));
      }
      setMessages(next);
      try { localStorage.setItem(cacheKey, JSON.stringify(next)); } catch (err) { log.warn('cache_write_error', { err }); }
      log.info('messages_fetched', { count: next.length, eventId });
    } catch (error) {
      log.error('fetch_messages_error', { error, eventId });
      if (!isLoading) return;
      showError('Failed to load chat messages', 'Chat Error');
    } finally {
      setIsLoading(false);
    }
  }, [eventId, cacheKey, isLoading, showError, log]);

  useEffect(() => {
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached) as ChatMessage[];
        if (Array.isArray(parsed)) {
          setMessages(parsed);
          setIsLoading(false);
        }
      }
    } catch (err) {
      log.warn('cache_read_error', { err });
    }
    fetchMessages();
    const interval = setInterval(() => {
      if (!isConnected) {
        fetchMessages();
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [eventId, isConnected, cacheKey, fetchMessages, log]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const onScroll = useCallback(() => {
    const el = messagesContainerRef.current;
    if (!el) return;
    const threshold = 24;
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < threshold;
    setIsAtBottom(atBottom);
  }, []);

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

      const sent = await api.post<unknown>(`/api/events/${eventId}/messages`, messageData);
      let sentMessage: ChatMessage;
      if (sent && typeof sent === 'object' && 'message' in (sent as Record<string, unknown>)) {
        const m = (sent as { message: { id: number; message: string; createdAt: string } }).message;
        sentMessage = {
          id: m.id,
          message: m.message,
          created_at: m.createdAt,
          user_id: currentUserId || 1,
          user_name: currentUserName || 'Anonymous User',
          event_id: eventId
        };
      } else {
        sentMessage = sent as ChatMessage;
      }
      
      // Add the new message to the list
      setMessages(prev => {
        const next = [...prev, sentMessage];
        try { localStorage.setItem(cacheKey, JSON.stringify(next)); } catch (err) { log.warn('cache_write_error', { err }); }
        return next;
      });
      
      // Send via WebSocket for real-time delivery to other users
      if (isConnected) {
        const wsMessage: WebSocketMessage = {
          type: 'chat_message',
          data: sentMessage,
          timestamp: new Date().toISOString(),
          eventId
        };
        wsSend(wsMessage);
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

  const formatMessageDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString();
  };

  type ChatRow = ChatMessage | { __sep: string; key: string };
  const withDateSeparators = useMemo(() => {
    const rows: ChatRow[] = [];
    let lastDate = '';
    for (const m of messages) {
      const d = formatMessageDate(m.created_at);
      if (d !== lastDate) {
        rows.push({ __sep: d, key: `sep-${d}` });
        lastDate = d;
      }
      rows.push(m);
    }
    return rows;
  }, [messages]);

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
            {!isConnected && (
              <Button variant="outline" size="sm" onClick={() => manager?.connect(handlers)}>
                Reconnect
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div ref={messagesContainerRef} onScroll={onScroll} className="flex-1 overflow-y-auto p-4 space-y-3" aria-live="polite">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          withDateSeparators.map((row) => (
            '__sep' in row ? (
              <div
                key={(row as { __sep: string; key: string }).key}
                className="flex justify-center"
              >
                <span className="text-xs px-2 py-1 bg-gray-50 text-gray-500 rounded-full border border-gray-200">
                  {(row as { __sep: string; key: string }).__sep}
                </span>
              </div>
            ) : (
              <div
                key={(row as ChatMessage).id}
                className={`flex ${((row as ChatMessage).user_id === currentUserId) ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    ((row as ChatMessage).user_id === currentUserId)
                      ? 'bg-brand-600 text-white'
                      : (row as ChatMessage).is_system
                      ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  {((row as ChatMessage).user_id !== currentUserId) && !(row as ChatMessage).is_system && (
                    <div className="text-xs font-medium mb-1">{(row as ChatMessage).user_name}</div>
                  )}
                  <div className="text-sm">{(row as ChatMessage).message}</div>
                  <div className={`text-xs mt-1 ${
                    ((row as ChatMessage).user_id === currentUserId) ? 'text-brand-100' : 'text-gray-500'
                  }`}>
                    {formatMessageTime((row as ChatMessage).created_at)}
                  </div>
                </div>
              </div>
            )
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {!isAtBottom && messages.length > 0 && (
        <div className="px-4 py-2">
          <Button variant="outline" size="sm" onClick={scrollToBottom} className="w-full">Jump to latest</Button>
        </div>
      )}

      {/* Message Input */}
      <form onSubmit={handleSendMessage} className="px-4 py-3 border-t border-gray-200">
        <div className="flex gap-2 items-end">
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                void handleSendMessage(new Event('submit') as unknown as React.FormEvent);
              }
            }}
            placeholder="Type your message..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-none"
            disabled={isSending}
            maxLength={1000}
            rows={2}
          />
          <div className="text-xs text-gray-500 mb-1">{newMessage.length}/1000</div>
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
