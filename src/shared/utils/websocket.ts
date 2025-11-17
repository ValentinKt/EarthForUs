import { logger } from './logger';

export type WebSocketMessage = {
  type: 'chat_message' | 'user_joined' | 'user_left' | 'system_message';
  data: any;
  timestamp: string;
  eventId?: number;
};

export type WebSocketEventHandlers = {
  onMessage?: (message: WebSocketMessage) => void;
  onOpen?: () => void;
  onClose?: () => void;
  onError?: (error: Event) => void;
};

class WebSocketManager {
  private ws: WebSocket | null = null;
  private url: string;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private eventHandlers: WebSocketEventHandlers = {};
  private log = logger.withContext('WebSocketManager');

  constructor(url: string) {
    this.url = url;
  }

  connect(handlers: WebSocketEventHandlers = {}): void {
    this.eventHandlers = handlers;
    
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.log.info('websocket_already_connected');
      return;
    }

    try {
      this.ws = new WebSocket(this.url);
      this.setupEventListeners();
      this.log.info('websocket_connecting', { url: this.url });
    } catch (error) {
      this.log.error('websocket_connection_failed', { error });
      this.scheduleReconnect();
    }
  }

  disconnect(): void {
    this.log.info('websocket_disconnecting');
    
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    this.reconnectAttempts = 0;
  }

  send(message: WebSocketMessage): boolean {
    if (this.ws?.readyState !== WebSocket.OPEN) {
      this.log.warn('websocket_not_connected', { readyState: this.ws?.readyState });
      return false;
    }

    try {
      this.ws.send(JSON.stringify(message));
      this.log.debug('websocket_message_sent', { message });
      return true;
    } catch (error) {
      this.log.error('websocket_send_failed', { error, message });
      return false;
    }
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  private setupEventListeners(): void {
    if (!this.ws) return;

    this.ws.onopen = () => {
      this.log.info('websocket_connected');
      this.reconnectAttempts = 0;
      this.startHeartbeat();
      this.eventHandlers.onOpen?.();
    };

    this.ws.onmessage = (event) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data);
        this.log.debug('websocket_message_received', { message });
        this.eventHandlers.onMessage?.(message);
      } catch (error) {
        this.log.error('websocket_message_parse_error', { error, data: event.data });
      }
    };

    this.ws.onclose = (event) => {
      this.log.info('websocket_closed', { code: event.code, reason: event.reason });
      this.stopHeartbeat();
      this.eventHandlers.onClose?.();
      
      // Don't reconnect if it was a normal closure
      if (event.code !== 1000) {
        this.scheduleReconnect();
      }
    };

    this.ws.onerror = (error) => {
      this.log.error('websocket_error', { error });
      this.eventHandlers.onError?.(error);
    };
  }

  private startHeartbeat(): void {
    this.stopHeartbeat();
    this.heartbeatInterval = setInterval(() => {
      if (this.isConnected()) {
        this.send({
          type: 'system_message',
          data: { action: 'ping' },
          timestamp: new Date().toISOString()
        });
      }
    }, 30000); // Ping every 30 seconds
  }

  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      this.log.warn('websocket_max_reconnect_attempts_reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1); // Exponential backoff
    
    this.log.info('websocket_reconnect_scheduled', { 
      attempt: this.reconnectAttempts, 
      delay: `${delay}ms` 
    });

    setTimeout(() => {
      this.connect(this.eventHandlers);
    }, delay);
  }
}

// Create a singleton instance
let wsManager: WebSocketManager | null = null;

export const getWebSocketManager = (url?: string): WebSocketManager => {
  if (!wsManager && url) {
    wsManager = new WebSocketManager(url);
  }
  return wsManager!;
};

// Hook for React components
export const useWebSocket = (url: string, handlers: WebSocketEventHandlers = {}) => {
  const [isConnected, setIsConnected] = useState(false);
  const wsManagerRef = useRef<WebSocketManager | null>(null);

  useEffect(() => {
    wsManagerRef.current = getWebSocketManager(url);
    
    const enhancedHandlers: WebSocketEventHandlers = {
      ...handlers,
      onOpen: () => {
        setIsConnected(true);
        handlers.onOpen?.();
      },
      onClose: () => {
        setIsConnected(false);
        handlers.onClose?.();
      }
    };

    wsManagerRef.current.connect(enhancedHandlers);

    return () => {
      wsManagerRef.current?.disconnect();
    };
  }, [url]);

  const sendMessage = useCallback((message: WebSocketMessage): boolean => {
    return wsManagerRef.current?.send(message) || false;
  }, []);

  return {
    isConnected,
    sendMessage,
    manager: wsManagerRef.current
  };
};

// Named import for React
import { useState, useEffect, useRef, useCallback } from 'react';