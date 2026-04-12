import React, { createContext, useContext } from 'react';

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
  socket: null;
  onlineAgents: Agent[];
  isAdminOnline: NonAgentUser | false;
  disconnectFromSocket: () => void;
  onlineCustomers: NonAgentUser[];
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <SocketContext.Provider
      value={{
        socket: null,
        onlineAgents: [],
        disconnectFromSocket: () => {},
        isAdminOnline: false,
        onlineCustomers: [],
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
