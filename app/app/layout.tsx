import { SocketProvider } from '@/context/SocketContext';
import './globals.css'; 

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-[#333] text-white p-4 font-sans">
        <SocketProvider>
          {children}
        </SocketProvider>
      </body>
    </html>
  );
}