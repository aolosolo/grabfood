
'use client';
import Link from 'next/link';
import { ShoppingCart, UtensilsCrossed } from 'lucide-react';
import { useOrder } from '@/context/OrderContext';
import { Badge } from '@/components/ui/badge';
import { useState, useEffect } from 'react';

export default function Header() {
  const { cart } = useOrder();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <header className="bg-card shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2">
          <UtensilsCrossed className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-headline text-primary">FastGrab</h1>
        </Link>
        <nav>
          <Link href="/checkout" className="relative p-2 hover:text-primary transition-colors">
            <ShoppingCart className="h-7 w-7" />
            {isClient && totalItems > 0 && (
              <Badge variant="destructive" className="absolute -top-1 -right-1 px-2 py-0.5 text-xs">
                {totalItems}
              </Badge>
            )}
            <span className="sr-only">View Cart</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
