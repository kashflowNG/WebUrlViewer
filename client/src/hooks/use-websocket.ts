import { useEffect, useRef, useState } from 'react';

interface WebSocketMessage {
  type: string;
  [key: string]: any;
}

export function useWebSocket(url: string) {
  const ws = useRef<WebSocket | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('disconnected');

  const sendMessage = (message: WebSocketMessage) => {
    // WebSocket functionality disabled - no external communication needed
    console.log('Message would be sent:', message);
  };

  useEffect(() => {
    // WebSocket connection disabled
    setConnectionStatus('disconnected');

    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [url]);

  return { connectionStatus, sendMessage };
}