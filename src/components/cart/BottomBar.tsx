'use client';

import { useOrder } from '@/context/OrderContext';
import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';

export default function BottomBar() {
  const { cart, getCartTotal } = useOrder();
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  if (totalItems === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 w-full bg-card border-t border-border shadow-t-lg p-4 z-40 md:hidden">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="relative">
            <ShoppingCart className="h-7 w-7 text-primary" />
            <Badge variant="destructive" className="absolute -top-2 -right-2 px-2 py-0.5 text-xs">
              {totalItems}
            </Badge>
          </div>
          <div>
            <p className="font-body text-sm text-muted-foreground">Total</p>
            <p className="font-headline text-lg font-bold text-primary">${getCartTotal().toFixed(2)}</p>
          </div>
        </div>
        <Link href="/checkout">
          <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground font-headline">
            Checkout
          </Button>
        </Link>
      </div>
    </div>
  );
}
