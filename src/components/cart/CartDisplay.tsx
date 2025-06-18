'use client';

import { useOrder } from '@/context/OrderContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import Image from 'next/image';
import { MinusCircle, PlusCircle, Trash2, XCircle } from 'lucide-react';
import Link from 'next/link';

export default function CartDisplay() {
  const { cart, removeFromCart, updateQuantity, getCartTotal, clearCart } = useOrder();

  if (cart.length === 0) {
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-2xl text-primary">Your Cart is Empty</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="font-body text-muted-foreground">Looks like you haven't added anything yet. Start exploring our menu!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline text-2xl text-primary flex justify-between items-center">
          <span>Your Order</span>
          <Button variant="outline" size="sm" onClick={clearCart} className="text-destructive border-destructive hover:bg-destructive/10">
            <XCircle className="mr-2 h-4 w-4" /> Clear Cart
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px] pr-4">
          <ul className="space-y-4">
            {cart.map(item => (
              <li key={item.uniqueId} className="flex items-center gap-4 p-3 border-b last:border-b-0">
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
                <Button variant="ghost" size="icon" onClick={() => removeFromCart(item.uniqueId)} className="text-destructive h-7 w-7">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </li>
            ))}
          </ul>
        </ScrollArea>
      </CardContent>
      <CardFooter className="flex flex-col gap-4 pt-6 border-t">
        <div className="w-full flex justify-between items-center text-xl font-headline">
          <span>Total:</span>
          <span className="text-primary font-bold">${getCartTotal().toFixed(2)}</span>
        </div>
        <Link href="/checkout" className="w-full">
          <Button size="lg" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-headline text-lg">
            Proceed to Checkout
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}