import { WebSocketServer, WebSocket } from 'ws';
import type { Server as HttpServer } from 'http';
import type { Server as HttpsServer } from 'https';
import { logger } from '../../shared/utils/logger';
import { errorLogger } from '../utils/errorLogger';

const log = logger.withContext('WebSocketServer');

interface WebSocketClient extends WebSocket {
  clientId: string;
  userId?: number;
  eventIds?: number[];
}

interface ChatMessage {
  id: number;
  event_id: number;
  user_id: number;
  user_name: string;
  message: string;
  created_at: string;
  is_system?: boolean;
}

interface WebSocketMessage {
  type: 'chat_message' | 'user_joined' | 'user_left' | 'system_message' | 'join_event' | 'leave_event';
  data: unknown;
  timestamp: string;
  eventId?: number;
}

export class WebSocketManager {
  private wss: WebSocketServer;
  private clients: Map<string, WebSocketClient> = new Map();

  constructor(server?: HttpServer | HttpsServer) {
    if (server) {
      this.wss = new WebSocketServer({ server });
    } else {
      this.wss = new WebSocketServer({ port: 3001 });
    }

    this.setupEventListeners();
    log.info('websocket_server_started', { port: server ? 'attached' : 3001 });
  }

  private setupEventListeners(): void {
    this.wss.on('connection', (ws: WebSocketClient) => {
      ws.clientId = this.generateClientId();
      ws.eventIds = [];
      
      this.clients.set(ws.clientId, ws);
      log.info('client_connected', { clientId: ws.clientId, totalClients: this.clients.size });

      ws.on('message', (data: Buffer) => {
        try {
          const message: WebSocketMessage = JSON.parse(data.toString());
          this.handleMessage(ws, message);
        } catch (error) {
          log.error('message_parse_error', { error, clientId: ws.clientId });
          this.sendError(ws, 'Invalid message format');
        }
      });

      ws.on('close', () => {
        this.handleClientDisconnect(ws);
      });

      ws.on('error', (error) => {
        log.error('client_error', { error, clientId: ws.clientId });
        void errorLogger.logError('WebSocket Client Error', error, { clientId: ws.clientId });
      });

      // Send welcome message
      this.sendToClient(ws, {
        type: 'system_message',
        data: { message: 'Connected to EarthForUs chat server' },
        timestamp: new Date().toISOString()
      });
    });

    this.wss.on('error', (error) => {
      log.error('websocket_server_error', { error });
      void errorLogger.logError('WebSocket Server Error', error, null);
    });
  }

  private handleMessage(client: WebSocketClient, message: WebSocketMessage): void {
    log.debug('message_received', { clientId: client.clientId, type: message.type });

    switch (message.type) {
      case 'chat_message':
        this.handleChatMessage(client, message);
        break;
      case 'join_event':
        this.handleJoinEvent(client, message);
        break;
      case 'leave_event':
        this.handleLeaveEvent(client, message);
        break;
      case 'system_message':
        const action = (message.data as { action?: string })?.action;
        if (action === 'ping') {
          this.sendToClient(client, {
            type: 'system_message',
            data: { action: 'pong' },
            timestamp: new Date().toISOString()
          });
        }
        break;
      default:
        log.warn('unknown_message_type', { type: message.type, clientId: client.clientId });
    }
  }

  private handleChatMessage(client: WebSocketClient, message: WebSocketMessage): void {
    const chatMessage = message.data as unknown as ChatMessage;
    const eventId = chatMessage.event_id;

    if (!eventId) {
      this.sendError(client, 'Event ID is required');
      return;
    }

    // Broadcast message to all clients in the same event
    this.broadcastToEvent(eventId, {
      type: 'chat_message',
      data: chatMessage,
      timestamp: message.timestamp,
      eventId
    });

    log.info('chat_message_broadcasted', { 
      clientId: client.clientId, 
      eventId, 
      messageId: chatMessage.id 
    });
  }

  private handleJoinEvent(client: WebSocketClient, message: WebSocketMessage): void {
    const { eventId } = (message.data as { eventId?: number }) || {};
    if (!eventId) return;

    if (!client.eventIds) {
      client.eventIds = [];
    }

    if (!client.eventIds.includes(eventId)) {
      client.eventIds.push(eventId);
      
      // Notify other users in the event
      this.broadcastToEvent(eventId, {
        type: 'user_joined',
        data: { userId: client.userId, eventId },
        timestamp: new Date().toISOString(),
        eventId
      }, client.clientId);

      log.info('client_joined_event', { clientId: client.clientId, eventId });
    }
  }

  private handleLeaveEvent(client: WebSocketClient, message: WebSocketMessage): void {
    const { eventId } = (message.data as { eventId?: number }) || {};
    if (!eventId || !client.eventIds) return;

    const index = client.eventIds.indexOf(eventId);
    if (index > -1) {
      client.eventIds.splice(index, 1);

      // Notify other users in the event
      this.broadcastToEvent(eventId, {
        type: 'user_left',
        data: { userId: client.userId, eventId },
        timestamp: new Date().toISOString(),
        eventId
      }, client.clientId);

      log.info('client_left_event', { clientId: client.clientId, eventId });
    }
  }

  private handleClientDisconnect(client: WebSocketClient): void {
    this.clients.delete(client.clientId);
    
    // Notify events that the user left
    if (client.eventIds) {
      client.eventIds.forEach(eventId => {
        this.broadcastToEvent(eventId, {
          type: 'user_left',
          data: { userId: client.userId, eventId },
          timestamp: new Date().toISOString(),
          eventId
        }, client.clientId);
      });
    }

    log.info('client_disconnected', { clientId: client.clientId, totalClients: this.clients.size });
    // Persist WebSocket disconnects
    void errorLogger.chatDisconnected({ clientId: client.clientId, totalClients: this.clients.size });
  }

  private broadcastToEvent(eventId: number, message: WebSocketMessage, excludeClientId?: string): void {
    this.clients.forEach((client, clientId) => {
      if (clientId !== excludeClientId && 
          client.eventIds?.includes(eventId) && 
          client.readyState === WebSocket.OPEN) {
        this.sendToClient(client, message);
      }
    });
  }

  private sendToClient(client: WebSocketClient, message: WebSocketMessage): void {
    if (client.readyState === WebSocket.OPEN) {
      try {
        client.send(JSON.stringify(message));
      } catch (error) {
        log.error('send_to_client_failed', { error, clientId: client.clientId });
      }
    }
  }

  private sendError(client: WebSocketClient, error: string): void {
    this.sendToClient(client, {
      type: 'system_message',
      data: { error },
      timestamp: new Date().toISOString()
    });
  }

  private generateClientId(): string {
    return `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  public getConnectedClients(): number {
    return this.clients.size;
  }

  public broadcastToAll(message: WebSocketMessage): void {
    this.clients.forEach((client) => {
      this.sendToClient(client, message);
    });
  }
}

// Create and export the WebSocket server instance
export const createWebSocketServer = (httpServer?: HttpServer | HttpsServer): WebSocketManager => {
  return new WebSocketManager(httpServer);
};