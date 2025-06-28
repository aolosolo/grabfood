
import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { OrderProvider } from '@/context/OrderContext';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import BottomBar from '@/components/cart/BottomBar';

export const metadata: Metadata = {
  title: 'FastGrab',
  description: 'Order your favorite fast food quickly!',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Belleza&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Alegreya:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased flex flex-col min-h-screen pb-24 md:pb-0" suppressHydrationWarning={true}>
        <OrderProvider>
          <Header />
          <main className="flex-grow container mx-auto px-4 py-8">
            {children}
          </main>
          <Footer />
          <BottomBar />
          <Toaster />
        </OrderProvider>
      </body>
    </html>
  );
}
