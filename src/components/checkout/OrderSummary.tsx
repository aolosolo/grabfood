'use client';

import { useOrder } from '@/context/OrderContext';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import Image from 'next/image';
import { MinusCircle, PlusCircle, Trash2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

export default function OrderSummary() {
  const { cart, removeFromCart, updateQuantity, getCartTotal } = useOrder();
  const total = getCartTotal();

  if (cart.length === 0) {
    return (
        <div className="text-center py-8">
            <p className="font-body text-muted-foreground">Your cart is empty. Please add items from the menu.</p>
        </div>
    );
  }

  return (
    <div>
        <ScrollArea className="h-auto max-h-[40vh] pr-4 -mr-4">
          <ul className="space-y-4">
            {cart.map(item => (
              <li key={item.uniqueId} className="flex items-center gap-4 p-2 border-b last:border-b-0">
                <Image src={item.imageUrl} alt={item.name} width={60} height={60} className="rounded-md object-cover" data-ai-hint={item.dataAiHint} />
                <div className="flex-grow">
                  <h4 className="font-headline text-md">{item.name}</h4>
                  {item.customizations?.selectedFlavor && (
                    <p className="text-xs text-muted-foreground font-body">Flavor: {item.customizations.selectedFlavor}</p>
                  )}
                  <p className="text-sm font-body text-primary font-semibold">${item.price.toFixed(2)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" onClick={() => updateQuantity(item.uniqueId, item.quantity - 1)} className="h-7 w-7">
                    <MinusCircle className="h-4 w-4" />
                  </Button>
                  <span className="font-body w-6 text-center">{item.quantity}</span>
                  <Button variant="ghost" size="icon" onClick={() => updateQuantity(item.uniqueId, item.quantity + 1)} className="h-7 w-7">
                    <PlusCircle className="h-4 w-4" />
                  </Button>
                </div>
                <div className="w-20 text-right font-semibold">
                    ${(item.price * item.quantity).toFixed(2)}
                </div>
                <Button variant="ghost" size="icon" onClick={() => removeFromCart(item.uniqueId)} className="text-destructive h-7 w-7">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </li>
            ))}
          </ul>
        </ScrollArea>
        <div className="flex flex-col gap-2 pt-4 mt-4 border-t">
            <div className="w-full flex justify-between font-body">
                <span>Subtotal</span>
                <span>${total.toFixed(2)}</span>
            </div>
            <div className="w-full flex justify-between font-body text-muted-foreground text-sm">
                <span>Taxes & Fees</span>
                <span>$0.00</span>
            </div>
            <Separator className="my-2"/>
            <div className="w-full flex justify-between text-lg font-bold font-headline text-primary">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
            </div>
        </div>
    </div>
  );
}
