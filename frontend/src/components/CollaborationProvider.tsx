import { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

const CollaborationContext = createContext(null);

export const CollaborationProvider = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const newSocket = io("http://localhost:3001"); // Connect to NestJS WebSocket
    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  return (
    <CollaborationContext.Provider value={{ socket }}>
      {children}
    </CollaborationContext.Provider>
  );
};

export const useCollaboration = () => useContext(CollaborationContext);
