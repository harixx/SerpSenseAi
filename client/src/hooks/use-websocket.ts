import { useEffect, useRef, useState, useCallback } from 'react';

export interface WebSocketMessage {
  type: 'initial_count' | 'waitlist_update' | 'pong' | 'error';
  count?: number;
  newEntry?: {
    id: number;
    source: string;
    timestamp: Date | string;
  };
  message?: string;
}

export interface UseWebSocketReturn {
  isConnected: boolean;
  isConnecting: boolean;
  lastMessage: WebSocketMessage | null;
  connectionError: string | null;
  sendMessage: (message: any) => void;
  reconnect: () => void;
}

export function useWebSocket(url?: string): UseWebSocketReturn {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;
  
  // Construct WebSocket URL
  const wsUrl = url || (() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    return `${protocol}//${window.location.host}/ws`;
  })();

  const cleanup = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
    }
  }, []);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    setIsConnecting(true);
    setConnectionError(null);

    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('WebSocket connected successfully');
        setIsConnected(true);
        setIsConnecting(false);
        setConnectionError(null);
        reconnectAttemptsRef.current = 0;
        
        // Start heartbeat to maintain connection
        heartbeatIntervalRef.current = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'ping' }));
          }
        }, 30000); // Send ping every 30 seconds
      };

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          setLastMessage(message);
          
          if (message.type === 'error') {
            console.error('WebSocket server error:', message.message);
            setConnectionError(message.message || 'Server error');
          }
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      ws.onclose = (event) => {
        console.log('WebSocket connection closed:', event.code, event.reason);
        setIsConnected(false);
        setIsConnecting(false);
        cleanup();

        // Attempt reconnection with exponential backoff
        if (reconnectAttemptsRef.current < maxReconnectAttempts) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000);
          console.log(`Attempting to reconnect in ${delay}ms (attempt ${reconnectAttemptsRef.current + 1}/${maxReconnectAttempts})`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttemptsRef.current++;
            connect();
          }, delay);
        } else {
          setConnectionError('Failed to connect after multiple attempts. Please refresh the page.');
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setConnectionError('Connection error occurred');
        setIsConnecting(false);
      };

    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      setConnectionError('Failed to establish connection');
      setIsConnecting(false);
    }
  }, [wsUrl, cleanup]);

  const sendMessage = useCallback((message: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket is not connected. Message not sent:', message);
    }
  }, []);

  const reconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
    }
    reconnectAttemptsRef.current = 0;
    cleanup();
    connect();
  }, [connect, cleanup]);

  useEffect(() => {
    connect();

    return () => {
      cleanup();
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connect, cleanup]);

  return {
    isConnected,
    isConnecting,
    lastMessage,
    connectionError,
    sendMessage,
    reconnect
  };
}