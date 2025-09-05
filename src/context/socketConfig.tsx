"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

interface ISocketContext {
  socket: Socket | null;
}

const SocketContext = createContext<ISocketContext>({ socket: null });

// Custom hook to easily access the socket from any component
export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL as string;

  useEffect(() => {
    // Connect to your server. Use an environment variable for the URL.
    const newSocket = io(SOCKET_URL, { // Your server URL
        withCredentials: true,
    });
    setSocket(newSocket);

    // Disconnect when the app is closed
    return () => {
      newSocket.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};