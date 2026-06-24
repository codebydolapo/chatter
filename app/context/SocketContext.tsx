'use client';

import React, { createContext, useContext, useEffect, useState, useRef } from 'react';

const SocketContext = createContext(null);

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef(null);

  useEffect(() => {
    // 1. Establish connection to backend port
    const ws = new WebSocket('ws://localhost:4000');
    socketRef.current = ws;

    ws.onopen = () => {
      setIsConnected(true);
      console.log('Connected to WebSocket server');
    };

    ws.onmessage = async ({ data }) => {
      // Safely handle text strings or blobs sent by our server
      const text = data instanceof Blob ? await data.text() : data;
      setMessages((prev) => [...prev, text]);
    };

    ws.onclose = () => {
      setIsConnected(false);
      console.log('Disconnected from WebSocket server');
    };

    // 2. Strict Mode & Unmount Cleanup Loop
    // This function runs when the component unmounts, cleaning up the socket connection completely.
    return () => {
      if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
        ws.close();
      }
    };
  }, []);

  const sendMessage = (message) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(message);
    }
  };

  return (
    <SocketContext.Provider value={{ messages, isConnected, sendMessage }}>
      {children}
    </SocketContext.Provider>
  );
};