import { useEffect, useRef, useState } from 'react';

interface WebSocketMessage {
  type: string;
  [key: string]: any;
}

interface WebSocketState {
  isConnected: boolean;
  lastMessage: WebSocketMessage | null;
  connectionStatus: string;
}

export function useWebSocket() {
  const [state, setState] = useState<WebSocketState>({
    isConnected: false,
    lastMessage: null,
    connectionStatus: 'Disconnected'
  });
  
  const ws = useRef<WebSocket | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  const connect = () => {
    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      
      ws.current = new WebSocket(wsUrl);
      
      ws.current.onopen = () => {
        console.log('🔗 Connected to Telegram bot WebSocket');
        setState(prev => ({
          ...prev,
          isConnected: true,
          connectionStatus: 'Connected to Telegram Bot'
        }));
        reconnectAttempts.current = 0;
      };
      
      ws.current.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          console.log('📨 Received from Telegram bot:', message);
          setState(prev => ({
            ...prev,
            lastMessage: message
          }));
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };
      
      ws.current.onclose = () => {
        console.log('🔌 Disconnected from Telegram bot');
        setState(prev => ({
          ...prev,
          isConnected: false,
          connectionStatus: 'Disconnected from Telegram Bot'
        }));
        
        // Auto-reconnect
        if (reconnectAttempts.current < maxReconnectAttempts) {
          reconnectAttempts.current++;
          setTimeout(connect, 2000 * reconnectAttempts.current);
        }
      };
      
      ws.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        setState(prev => ({
          ...prev,
          connectionStatus: 'Connection Error'
        }));
      };
      
    } catch (error) {
      console.error('Failed to connect to WebSocket:', error);
    }
  };

  const sendMessage = (message: WebSocketMessage) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(message));
      console.log('📤 Sent to Telegram bot:', message);
    }
  };

  useEffect(() => {
    connect();
    
    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, []);

  return {
    ...state,
    sendMessage
  };
}