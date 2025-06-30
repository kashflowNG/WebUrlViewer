
import { useState, useEffect } from 'react';

export function useWebSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('connecting');

  useEffect(() => {
    // Simulate connection status for dashboard display
    // In a real app, this would connect to an actual WebSocket
    setConnectionStatus('connected');
    setIsConnected(true);
    
    // Simulate periodic connection checks
    const interval = setInterval(() => {
      setIsConnected(true);
      setConnectionStatus('connected');
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return {
    isConnected,
    connectionStatus
  };
}
