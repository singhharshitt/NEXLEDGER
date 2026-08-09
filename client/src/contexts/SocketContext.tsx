import { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '../stores/auth.store';
import { authService } from '../services/auth.service';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '../hooks/useToast';

interface SocketContextValue {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextValue>({ socket: null, isConnected: false });

export function useSocket() {
  return useContext(SocketContext);
}

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  useEffect(() => {
    const token = authService.getToken();
    if (!isAuthenticated || !token) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }

    const socketUrl = import.meta.env.SERVER_URL || 'http://localhost:5000';
    
    const newSocket = io(socketUrl, {
      auth: { token },
      withCredentials: true,
      transports: ['websocket', 'polling'], // Try websocket first, fallback to polling
    });

    newSocket.on('connect', () => {
      setIsConnected(true);
      // Optional: refetch notifications on reconnect to not miss anything
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
    });

    newSocket.on('notification', (notification) => {
      // Invalidate queries to refresh the list and unread count
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      
      // Show toast
      toast({
        title: notification.title,
        description: notification.message,
      });
    });

    setSocket(newSocket);

    return () => {
      newSocket.off('connect');
      newSocket.off('disconnect');
      newSocket.off('notification');
      newSocket.disconnect();
    };
  }, [isAuthenticated, queryClient, toast]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
}
