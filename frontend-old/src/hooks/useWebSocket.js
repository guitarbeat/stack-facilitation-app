import { useEffect, useRef, useState, useCallback } from 'react';
import { io } from 'socket.io-client';

/**
 * Custom hook for WebSocket connection management
 * Handles real-time updates with reconnection logic and backoff
 */
function useWebSocket(url = 'ws://localhost:3001') {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState(null);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  
  const reconnectTimeoutRef = useRef(null);
  const maxReconnectAttempts = 10;
  const baseReconnectDelay = 1000; // 1 second

  const connect = useCallback(() => {
    try {
      const newSocket = io(url, {
        transports: ['websocket', 'polling'],
        upgrade: true,
        rememberUpgrade: true,
        timeout: 20000,
        forceNew: true
      });

      newSocket.on('connect', () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        setConnectionError(null);
        setReconnectAttempts(0);
      });

      newSocket.on('disconnect', (reason) => {
        console.log('WebSocket disconnected:', reason);
        setIsConnected(false);
        
        // Attempt reconnection for certain disconnect reasons
        if (reason === 'io server disconnect') {
          // Server initiated disconnect, don't reconnect automatically
          setConnectionError('Server disconnected');
        } else {
          // Client-side disconnect or network issue, attempt reconnection
          attemptReconnection();
        }
      });

      newSocket.on('connect_error', (error) => {
        console.error('WebSocket connection error:', error);
        setConnectionError(error.message);
        setIsConnected(false);
        attemptReconnection();
      });

      newSocket.on('error', (error) => {
        console.error('WebSocket error:', error);
        setConnectionError(error.message);
      });

      setSocket(newSocket);
      return newSocket;
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      setConnectionError(error.message);
      return null;
    }
  }, [url]);

  const attemptReconnection = useCallback(() => {
    if (reconnectAttempts >= maxReconnectAttempts) {
      console.log('Max reconnection attempts reached');
      setConnectionError('Unable to reconnect after multiple attempts');
      return;
    }

    // Clear any existing timeout
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    // Calculate backoff delay (exponential backoff with jitter)
    const delay = Math.min(
      baseReconnectDelay * Math.pow(2, reconnectAttempts) + Math.random() * 1000,
      30000 // Max 30 seconds
    );

    console.log(`Attempting reconnection in ${delay}ms (attempt ${reconnectAttempts + 1})`);

    reconnectTimeoutRef.current = setTimeout(() => {
      setReconnectAttempts(prev => prev + 1);
      connect();
    }, delay);
  }, [reconnectAttempts, connect]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    if (socket) {
      socket.disconnect();
      setSocket(null);
    }
    
    setIsConnected(false);
    setReconnectAttempts(0);
  }, [socket]);

  const emit = useCallback((event, data) => {
    if (socket && isConnected) {
      socket.emit(event, data);
      return true;
    } else {
      console.warn('Cannot emit event: WebSocket not connected');
      return false;
    }
  }, [socket, isConnected]);

  const on = useCallback((event, handler) => {
    if (socket) {
      socket.on(event, handler);
      
      // Return cleanup function
      return () => {
        socket.off(event, handler);
      };
    }
    return () => {};
  }, [socket]);

  const off = useCallback((event, handler) => {
    if (socket) {
      socket.off(event, handler);
    }
  }, [socket]);

  // Initialize connection on mount
  useEffect(() => {
    connect();

    // Cleanup on unmount
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  // Handle page visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && !isConnected) {
        console.log('Page became visible, attempting to reconnect');
        connect();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isConnected, connect]);

  // Handle online/offline events
  useEffect(() => {
    const handleOnline = () => {
      console.log('Network came online, attempting to reconnect');
      if (!isConnected) {
        connect();
      }
    };

    const handleOffline = () => {
      console.log('Network went offline');
      setConnectionError('Network offline');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [isConnected, connect]);

  return {
    socket,
    isConnected,
    connectionError,
    reconnectAttempts,
    connect,
    disconnect,
    emit,
    on,
    off
  };
}

export default useWebSocket;

