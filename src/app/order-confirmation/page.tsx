'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
import { useOrder } from "@/context/OrderContext";

export default function OrderConfirmationPage() {
  const { userDetails } = useOrder(); // Get userDetails to personalize the message

  useEffect(() => {
    // Optional: could add confetti or other celebratory effects here
  }, []);

  return (
    <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="items-center">
          <CheckCircle2 className="h-16 w-16 text-green-500 mb-4" />
          <CardTitle className="text-3xl font-headline text-primary">Order Confirmed!</CardTitle>
          <CardDescription className="text-muted-foreground font-body text-lg pt-2">
            Thank you for your purchase{userDetails?.name ? `, ${userDetails.name.split(' ')[0]}` : ''}!
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="font-body text-foreground">
            Your order has been successfully placed. A simulated confirmation email has been noted for the admin.
          </p>
          <p className="font-body text-sm text-muted-foreground">
            You will be redirected to the homepage shortly, or you can click the button below.
          </p>
          <Link href="/" passHref>
            <Button size="lg" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-headline">
              Continue Shopping
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
