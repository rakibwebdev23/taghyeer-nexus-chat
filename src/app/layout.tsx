import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ReduxProvider } from '@/components/providers/ReduxProvider';
import { AuthProvider } from '@/context/AuthContext';
import { ChatProvider } from '@/context/ChatContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Nexus Chat — Real-Time Chat Engine',
  description: 'Full-stack real-time chat platform with Socket.io WebSockets, Redux Toolkit, and Redis caching.',
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    shortcut: '/icon.svg',
    apple: '/icon.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${inter.className} bg-[#0F172A] text-slate-100 antialiased`}
        suppressHydrationWarning
      >
        <ReduxProvider>
          <AuthProvider>
            <ChatProvider>{children}</ChatProvider>
          </AuthProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}
