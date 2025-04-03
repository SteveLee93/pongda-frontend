import { Metadata } from 'next';
import { QueryClientProvider } from './providers';
import './globals.css';

export const metadata: Metadata = {
  title: 'Pongda',
  description: '탁구 리그 플랫폼',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="bg-gray-50">
        <QueryClientProvider>{children}</QueryClientProvider>
      </body>
    </html>
  );
}