import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { toast } from 'sonner';
import { useNotificationStore } from '@/store/notificationStore';

const SOCKET_URL = 'http://localhost:5000';


export const useSocket = () => {
  const socketRef = useRef<Socket | null>(null);
  const addNotification = useNotificationStore((state) => state.addNotification);

  useEffect(() => {
    // Initialize socket connection
    socketRef.current = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
    });

    const socket = socketRef.current;

    socket.on('connect', () => {
      console.log('Connected to server');
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from server');
    });

    // Listen for user added event
    socket.on('user:added', (data) => {
      const message = `${data.firstName} ${data.lastName} (ID: ${data.id})`;
      addNotification({
        type: 'added',
        title: 'New User Added',
        message,
      });
      toast.success(`New user added: ${data.firstName} ${data.lastName}`, {
        description: `ID: ${data.id} | Email: ${data.email}`,
      });
    });

    // Listen for user updated event
    socket.on('user:updated', (data) => {
      const message = `${data.firstName} ${data.lastName} (ID: ${data.id})`;
      addNotification({
        type: 'updated',
        title: 'User Updated',
        message,
      });
      toast.info(`User updated: ${data.firstName} ${data.lastName}`, {
        description: `ID: ${data.id} | Email: ${data.email}`,
      });
    });

    // Listen for user deleted event
    socket.on('user:deleted', (data) => {
      const message = `${data.firstName} ${data.lastName} (ID: ${data.id})`;
      addNotification({
        type: 'deleted',
        title: 'User Deleted',
        message,
      });
      toast.error(`User deleted: ${data.firstName} ${data.lastName}`, {
        description: `ID: ${data.id}`,
      });
    });

    // Cleanup on unmount
    return () => {
      socket.disconnect();
    };
  }, [addNotification]);

  return socketRef.current;
};
