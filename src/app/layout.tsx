import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import { WishlistProvider } from '@/context/WishlistContext';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import CartDrawer from '@/components/layout/CartDrawer';

const canonicalUrl = process.env.NEXT_PUBLIC_WEB_BASE_URL || 'https://www.leleindia.store';

export const metadata: Metadata = {
  metadataBase: new URL(canonicalUrl),
  title: 'LELE Store — Authentic Food & Local Kitchen Delivery in Nirmali',
  description:
    'Order fresh, delicious Hyderabadi biryani, North Indian curries, pizzas, sweets and snacks delivered fast to your doorstep in Nirmali, Bihar.',
  keywords: [
    'LELE Store',
    'Nirmali food delivery',
    'online food order Nirmali',
    'biryani delivery Nirmali',
    'pizza Nirmali',
    'Supaul food delivery',
  ],
  authors: [{ name: 'LELE Store' }],
  icons: {
    icon: '/lele_logo.jpeg',
    apple: '/lele_logo.jpeg',
  },
  openGraph: {
    title: 'LELE Store — Food & Grocery Delivery in Nirmali',
    description: 'Hot, fresh food from top certified kitchens in Nirmali, Bihar delivered in 25-35 mins.',
    url: canonicalUrl,
    siteName: 'LELE Store',
    locale: 'en_IN',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased scroll-smooth">
      <body className="min-h-full flex flex-col bg-slate-50 text-gray-900 selection:bg-red-500 selection:text-white">
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <Navbar />
              <main className="flex-1">{children}</main>
              <CartDrawer />
              <Footer />
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
