'use client';

import React, { createContext, useContext, useEffect, useState, useRef } from 'react';

interface MessagePacket {
  type: 'MESSAGE' | 'PRIVATE_MESSAGE' | 'SYSTEM_ERROR';
  from: string;
  to?: string;
  payload: string;
}

interface SocketContextProps {
  messages: MessagePacket[];
  myId: string | null;
  isConnected: boolean;
  sendBroadcast: (text: string) => void;
  sendPrivateMessage: (targetId: string, text: string) => void;
}

const SocketContext = createContext<SocketContextProps | null>(null);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) throw new Error("useSocket must be used within a SocketProvider");
  return context;
};

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [messages, setMessages] = useState<MessagePacket[]>([]);
  const [myId, setMyId] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:8080');
    socketRef.current = ws;

    ws.onopen = () => setIsConnected(true);
    
    ws.onmessage = async ({ data }) => {
      const text = data instanceof Blob ? await data.text() : data;
      const packet = JSON.parse(text);

      if (packet.type === "SYSTEM_WELCOME") {
        setMyId(packet.payload.userId);
      } else {
        setMessages((prev) => [...prev, packet]);
      }
    };

    ws.onclose = () => {
      setIsConnected(false);
      setMyId(null);
    };

    return () => {
      if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
        ws.close();
      }
    };
  }, []);

  const sendBroadcast = (text: string) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ type: 'BROADCAST', payload: text }));
    }
  };

  const sendPrivateMessage = (targetId: string, text: string) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ type: 'PRIVATE_MESSAGE', targetId, payload: text }));
    }
  };

  return (
    <SocketContext.Provider value={{ messages, myId, isConnected, sendBroadcast, sendPrivateMessage }}>
      {children}
    </SocketContext.Provider>
  );
};