
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { CheckCircle2, Moped, Pizza, Package } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useOrder } from "@/context/OrderContext";
import { Separator } from "@/components/ui/separator";

export default function OrderConfirmationPage() {
  const { lastOrder } = useOrder();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center">
        <Card className="w-full max-w-lg shadow-2xl p-8">
            <div className="animate-pulse flex flex-col items-center gap-4">
                <CheckCircle2 className="h-16 w-16 text-muted" />
                <div className="h-8 w-48 bg-muted rounded"></div>
                <div className="h-6 w-64 bg-muted rounded"></div>
            </div>
        </Card>
      </div>
    );
  }
  
  if (!lastOrder) {
    return (
      <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center">
        <Card className="w-full max-w-md shadow-2xl">
          <CardHeader>
            <CardTitle>No Order Found</CardTitle>
            <CardDescription>It looks like you've landed here directly.</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Please start a new order from our menu.</p>
          </CardContent>
          <CardFooter>
            <Link href="/" passHref className="w-full">
              <Button size="lg" className="w-full">
                Back to Menu
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }

  const { orderId, customerName, totalAmount, items } = lastOrder;

  return (
    <div className="container mx-auto px-4 py-12 flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
      <Card className="w-full max-w-lg shadow-2xl overflow-hidden">
        <CardHeader className="items-center text-center bg-secondary/30 p-6">
          <CheckCircle2 className="h-20 w-20 text-green-500 mb-4" />
          <CardTitle className="text-4xl font-headline text-primary">Order Confirmed!</CardTitle>
          <CardDescription className="text-muted-foreground font-body text-lg pt-2">
            Thank you, {customerName.split(' ')[0]}! Your order is on its way.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 p-6">
          <div className="text-center">
            <p className="font-headline text-lg">Estimated Delivery</p>
            <p className="font-bold text-2xl text-primary">25-30 minutes</p>
          </div>

          <div className="relative w-full h-24 overflow-x-hidden border-b-2 border-dashed border-muted-foreground/50">
            {/* Delivery Animation */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-48 h-24 animate-delivery-ride">
                <div className="relative w-full h-full">
                    <Moped className="absolute bottom-2 left-1/2 -translate-x-1/2 w-20 h-20 text-foreground" />
                    <Pizza className="absolute bottom-10 left-[calc(50%-2px)] -translate-x-1/2 w-8 h-8 text-yellow-500 -rotate-12" />
                </div>
            </div>
          </div>
          
          <Separator />
          
          <div className="space-y-4">
             <h4 className="font-headline text-lg text-center flex items-center justify-center gap-2"><Package size={20}/> Order Summary</h4>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Order ID:</span>
                <span className="font-mono">{orderId}</span>
              </div>
              <ul className="space-y-2 text-sm">
                {items.map((item) => (
                    <li key={item.name} className="flex justify-between">
                        <span>{item.name} <span className="text-muted-foreground">x{item.quantity}</span></span>
                        <span>${item.subtotal.toFixed(2)}</span>
                    </li>
                ))}
              </ul>
              <Separator />
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>${totalAmount.toFixed(2)}</span>
              </div>
          </div>

        </CardContent>
        <CardFooter>
            <Link href="/" passHref className="w-full">
                <Button size="lg" className="w-full font-headline">
                Continue Shopping
                </Button>
            </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
