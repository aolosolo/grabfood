'use client';

import { useOrder } from '@/context/OrderContext';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import Image from 'next/image';
import { Separator } from '@/components/ui/separator';

export default function OrderSummary() {
  const { cart, getCartTotal } = useOrder();
  const total = getCartTotal();

  if (cart.length === 0) {
    return null;
  }

  return (
    <Card className="shadow-lg rounded-none sm:rounded-lg">
      <CardHeader>
        <CardTitle className="font-headline text-2xl text-primary">Order Summary</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <ScrollArea className="h-[250px] pr-4 -mr-4">
          <ul className="space-y-4">
            {cart.map(item => (
              <li key={item.uniqueId} className="flex items-start gap-4">
                <Image src={item.imageUrl} alt={item.name} width={50} height={50} className="rounded-md object-cover" data-ai-hint={item.dataAiHint} />
                <div className="flex-grow">
                  <p className="font-headline text-md leading-tight">{item.name}</p>
                  <p className="text-sm font-body text-muted-foreground">Qty: {item.quantity}</p>
                </div>
                <p className="font-body font-semibold text-right">${(item.price * item.quantity).toFixed(2)}</p>
              </li>
            ))}
          </ul>
        </ScrollArea>
      </CardContent>
      <CardFooter className="flex flex-col gap-2 pt-4 border-t">
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
      </CardFooter>
    </Card>
  );
}
