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
  isSocketConnected: boolean;
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

/**
 * Keep the agent socket alive while logged in.
 * Backend only auto-assigns chats to agents present in its in-memory `onlineAgents`
 * list — that list is filled on socket connect. Tearing down the client on every
 * `disconnect` event previously prevented Socket.IO reconnection, so agents looked
 * "logged in" in the UI but were offline for assignment (chats → Pending).
 */
export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isSocketConnected, setIsSocketConnected] = useState(false);
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
      setIsSocketConnected(false);
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
      // Stay registered with the backend so agents remain assignable.
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1_000,
      reconnectionDelayMax: 10_000,
      timeout: 20_000,
    });
    socketRef.current = newSocket;
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('[socket] connected', newSocket.id);
      setIsSocketConnected(true);
      setSocket(newSocket);
    });

    newSocket.on('reconnect', (attempt) => {
      console.log('[socket] reconnected after', attempt, 'attempt(s)', newSocket.id);
      setIsSocketConnected(true);
      // Server treats reconnect as a fresh connection and re-adds this agent
      // to onlineAgents when role is agent.
    });

    newSocket.on('connect_error', (error) => {
      console.error('[socket] connect_error', error.message);
      setIsSocketConnected(false);
    });

    // Do NOT call disconnectFromSocket here — that kills auto-reconnect and
    // removes the agent from backend onlineAgents permanently until re-login.
    newSocket.on('disconnect', (reason) => {
      console.warn('[socket] disconnected', reason);
      setIsSocketConnected(false);
    });

    newSocket.on('newAgentJoined', (agent: Agent) => {
      setOnlineAgents((prev) => {
        if (prev.some((a) => String(a.userId) === String(agent.userId))) {
          return prev.map((a) =>
            String(a.userId) === String(agent.userId) ? agent : a
          );
        }
        return [...prev, agent];
      });
    });

    newSocket.on(
      'onlineUsers',
      ({
        customers,
        agents,
        admin,
      }: {
        customers?: NonAgentUser[];
        agents?: Agent[];
        admin?: NonAgentUser | null;
      }) => {
        // Replace from server snapshot (append was duplicating / going stale).
        if (Array.isArray(agents)) {
          setOnlineAgents(agents);
        }
        if (userData?.role !== UserRoles.admin && admin) {
          setIsAdminOnline(admin);
        }
        if (Array.isArray(customers)) {
          setOnlineCustomers(customers);
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
      setOnlineCustomers((prev) => {
        if (prev.some((c) => String(c.userId) === String(customer.userId))) return prev;
        return [...prev, customer];
      });
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
          setOnlineCustomers((prev) =>
            prev.filter((customer) => +customer.userId !== id)
          );
        }
      }
    );

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
        isSocketConnected,
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
