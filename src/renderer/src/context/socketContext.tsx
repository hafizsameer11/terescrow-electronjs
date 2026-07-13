import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './authContext';
import { useQueryClient } from '@tanstack/react-query';
import { API_BASE_URL } from '@renderer/api/config';

export enum UserRoles {
  admin = 'admin',
  agent = 'agent',
  customer = 'customer',
}

export interface Agent {
  userId: string;
  socketId: string;
  assignedDepartments: {
    id: string;
  };
}

export interface NonAgentUser {
  userId: string;
  socketId: string;
}

interface SocketContextType {
  socket: Socket | null;
  onlineAgents: Agent[];
  isAdminOnline: NonAgentUser | false;
  disconnectFromSocket: () => void;
  onlineCustomers: NonAgentUser[];
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

function invalidateChatListQueries(queryClient: ReturnType<typeof useQueryClient>) {
  void queryClient.invalidateQueries({ queryKey: ['chats'] });
  void queryClient.invalidateQueries({ queryKey: ['chatStats'] });
  void queryClient.invalidateQueries({ queryKey: ['pendingChats'] });
  void queryClient.invalidateQueries({ queryKey: ['all-chats-with-customer'] });
  void queryClient.invalidateQueries({ queryKey: ['all-default-chats-with-customer'] });
  void queryClient.invalidateQueries({ queryKey: ['notificationCount'] });
}

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [onlineAgents, setOnlineAgents] = useState<Agent[]>([]);
  const [isAdminOnline, setIsAdminOnline] = useState<NonAgentUser | false>(false);
  const [onlineCustomers, setOnlineCustomers] = useState<NonAgentUser[]>([]);

  const { token, userData } = useAuth();
  const queryClient = useQueryClient();
  const socketRef = useRef<Socket | null>(null);

  const disconnectFromSocket = useCallback(() => {
    const activeSocket = socketRef.current;
    if (activeSocket) {
      activeSocket.removeAllListeners();
      activeSocket.disconnect();
      socketRef.current = null;
      setSocket(null);
    }
  }, []);

  useEffect(() => {
    if (!token) {
      disconnectFromSocket();
      setOnlineAgents([]);
      setOnlineCustomers([]);
      setIsAdminOnline(false);
      return;
    }

    disconnectFromSocket();

    const newSocket = io(API_BASE_URL, {
      query: { token },
    });
    socketRef.current = newSocket;

    newSocket.on('connect', () => {
      setSocket(newSocket);
    });

    newSocket.on('newAgentJoined', (agent: Agent) => {
      setOnlineAgents((prev) => [...prev, agent]);
    });

    newSocket.on(
      'onlineUsers',
      ({
        customers,
        agents,
        admin,
      }: {
        customers: NonAgentUser[];
        agents: Agent[];
        admin: NonAgentUser | null;
      }) => {
        if (agents?.length > 0) {
          setOnlineAgents((previous) => [...previous, ...agents]);
        }
        if (userData?.role !== UserRoles.admin && admin) {
          setIsAdminOnline(admin);
        }
        if (customers?.length > 0) {
          setOnlineCustomers((prev) => [...prev, ...customers]);
        }
      }
    );

    if (userData?.role === UserRoles.agent) {
      newSocket.on('adminJoined', (admin: { userId: string; socketId: string }) => {
        setIsAdminOnline(admin);
      });
    }

    newSocket.on('customerJoined', (customer: NonAgentUser) => {
      if (userData?.role === UserRoles.agent) return;
      setOnlineCustomers((prev) => [...prev, customer]);
    });

    newSocket.on('customerAssigned', () => {
      invalidateChatListQueries(queryClient);
    });

    newSocket.on('message', () => {
      invalidateChatListQueries(queryClient);
      void queryClient.invalidateQueries({ queryKey: ['chatDetails'] });
    });

    newSocket.on(
      'user-disconnected',
      ({ id, role }: { id: number; role: UserRoles }) => {
        if (role === UserRoles.admin) {
          setIsAdminOnline(false);
        }
        if (role === UserRoles.agent) {
          setOnlineAgents((prev) => prev.filter((agent) => +agent.userId !== id));
        }
        if (role === UserRoles.customer) {
          setOnlineCustomers((prev) => prev.filter((customer) => +customer.userId !== id));
        }
      }
    );

    newSocket.on('disconnect', () => {
      disconnectFromSocket();
    });

    return () => {
      disconnectFromSocket();
    };
  }, [token, userData?.role, queryClient, disconnectFromSocket]);

  return (
    <SocketContext.Provider
      value={{
        socket,
        onlineAgents,
        disconnectFromSocket,
        isAdminOnline,
        onlineCustomers,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = (): SocketContextType => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
