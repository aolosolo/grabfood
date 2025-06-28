
'use client';

import { Button } from '@/components/ui/button';
import { useOrder } from '@/context/OrderContext';

interface CheckoutBottomBarProps {
  isProcessing: boolean;
}

export default function CheckoutBottomBar({ isProcessing }: CheckoutBottomBarProps) {
  const { getCartTotal, cart } = useOrder();
  const total = getCartTotal();

  if (cart.length === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 w-full bg-card border-t border-border shadow-t-lg p-4 z-40 md:hidden">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <div>
          <p className="font-body text-sm text-muted-foreground">Total</p>
          <p className="font-headline text-lg font-bold text-primary">${total.toFixed(2)}</p>
        </div>
        <Button
          form="payment-form"
          type="submit"
          size="lg"
          className="bg-accent hover:bg-accent/90 text-accent-foreground font-headline"
          disabled={isProcessing}
        >
          {isProcessing ? 'Processing...' : 'Pay Now'}
        </Button>
      </div>
    </div>
  );
}
