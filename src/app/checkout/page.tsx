
'use client';

import { useState, useEffect } from 'react';
import UserInfoForm from '@/components/checkout/UserInfoForm';
import PaymentForm from '@/components/checkout/PaymentForm';
import CartDisplay from '@/components/cart/CartDisplay';
import { useOrder } from '@/context/OrderContext';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import CheckoutBottomBar from '@/components/checkout/CheckoutBottomBar';


export default function CheckoutPage() {
  const { cart } = useOrder();
  const router = useRouter();
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  useEffect(() => {
    // Redirect to home page if cart is empty after a brief moment (to allow context to load)
    const timer = setTimeout(() => {
        if (cart.length === 0) {
            router.push('/');
        }
    }, 100); // Small delay to ensure cart state is settled
    return () => clearTimeout(timer);
  }, [cart, router]);

  if (cart.length === 0) {
    // Show a loading or redirecting message while waiting for useEffect to redirect
    return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
            <h2 className="text-2xl font-headline text-primary mb-4">Your cart is empty.</h2>
            <p className="font-body text-muted-foreground">Redirecting you to the menu...</p>
        </div>
    );
  }

  return (
    <div className="w-full">
      <h1 className="text-4xl font-headline text-primary mb-8 text-center">Checkout</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 space-y-8">
          <Card className="shadow-lg rounded-none sm:rounded-lg">
            <CardHeader>
              <CardTitle className="font-headline text-2xl text-primary">Shipping & Contact Information</CardTitle>
            </CardHeader>
            <CardContent>
              <UserInfoForm />
            </CardContent>
          </Card>
          
          <Card className="shadow-lg rounded-none sm:rounded-lg">
            <CardHeader>
              <CardTitle className="font-headline text-2xl text-primary">Payment Details</CardTitle>
            </CardHeader>
            <CardContent>
              <PaymentForm isProcessing={isProcessingPayment} setIsProcessing={setIsProcessingPayment} />
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1 lg:sticky lg:top-24">
           <CartDisplay />
        </div>
      </div>
      <CheckoutBottomBar isProcessing={isProcessingPayment} />
    </div>
  );
}
