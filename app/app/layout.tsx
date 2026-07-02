import { SocketProvider } from '@/context/SocketContext';
import { AuthContextProvider } from '@/context/AuthContext';
import { Roboto, Geist } from 'next/font/google';
import './globals.css';
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const roboto = Roboto({
  weight: ['400', '700'], 
  subsets: ['latin'], 
  display: 'swap',
});

export const metadata = {
  title: 'Chatter',
  description: 'Connect with buds, chat with friends',
  icons: {
    icon: '/logo.png',
    // apple: '/apple-touch-icon.png', 
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={cn("font-sans", geist.variable)}>
      <body className={`${roboto.className} w-auto h-auto text-white`}>
        <AuthContextProvider>
          <SocketProvider>
            {children}
          </SocketProvider>
        </AuthContextProvider>
      </body>
    </html>
  );
}