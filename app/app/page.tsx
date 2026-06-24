'use client';

import { useState, useRef, useEffect } from 'react';
import { useSocket } from '@/context/SocketContext';

export default function ChatPage() {
  const [inputVal, setInputVal] = useState('');
  const { messages, isConnected, sendMessage } = useSocket();
  const listEndRef = useRef(null);

  // Auto-scroll context helper down to the latest message entry
  useEffect(() => {
    listEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputVal.trim()) return;

    sendMessage(inputVal);
    setInputVal('');
  };

  return (
    <div className="max-w-md mx-auto flex flex-col h-[85vh]">
      {/* Network Connectivity Indicator Badge */}
      <header className="flex justify-between items-center py-2 border-b border-gray-600 mb-4">
        <h1 className="text-xl font-bold tracking-tight">Chatter Box</h1>
        <span className={`inline-block w-3 h-3 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
      </header>

      {/* Message Stream */}
      <ul className="flex-1 overflow-y-auto space-y-2 pr-2 mb-4 scrollbar-thin">
        {messages.map((msg, index) => (
          <li key={index} className="bg-gray-700/60 p-3 rounded-xl border border-gray-600/40 break-words max-w-[90%]">
            {msg}
          </li>
        ))}
        <div ref={listEndRef} />
      </ul>

      {/* Input Tray */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          placeholder={isConnected ? "Type a message..." : "Connecting to server..."}
          disabled={!isConnected}
          className="flex-1 bg-gray-800 text-white p-3 rounded-xl border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        />
        <button 
          type="submit" 
          disabled={!isConnected}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-5 rounded-xl font-medium transition"
        >
          Send
        </button>
      </form>
    </div>
  );
}