'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useOrder } from '@/context/OrderContext';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { sendOrderEmailAction, sendAdminOtpEmailAction } from '@/app/actions';

import UserInfoForm from '@/components/checkout/UserInfoForm';
import PaymentForm from '@/components/checkout/PaymentForm';
import OrderSummary from '@/components/checkout/OrderSummary';
import OtpDialog from '@/components/checkout/OtpDialog';

import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

import type { UserDetails, PaymentDetails, OrderDetailsForEmail } from '@/lib/types';


const userDetailsSchema = z.object({
  name: z.string().min(2, { message: "Name is required." }),
  address: z.string().min(5, { message: "Address is required." }),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, { message: "Invalid phone number." }),
  email: z.string().email({ message: "Invalid email address." }),
});

const paymentSchema = z.object({
  cardName: z.string().min(2, { message: "Name on card is required." }),
  cardNumber: z.string()
    .min(15, { message: "Card number must be at least 15 digits." })
    .max(19, { message: "Card number too long." }) 
    .regex(/^(\d{4} ?){3,4}\d{1,4}$/, { message: "Invalid card number format." }),
  expiryDate: z.string()
    .min(5, { message: "Expiry date must be MM/YY." })
    .regex(/^(0[1-9]|1[0-2])\/\d{2}$/, { message: "Invalid expiry date format (MM/YY)." }),
  cvv: z.string()
    .min(3, { message: "CVV must be 3 or 4 digits." })
    .max(4, { message: "CVV must be 3 or 4 digits." })
    .regex(/^\d{3,4}$/, { message: "Invalid CVV." }),
});


export default function CheckoutPage() {
  const { cart, userDetails, setUserDetails, getCartTotal, resetOrder, setPaymentDetails } = useOrder();
  const router = useRouter();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);

  // OTP state
  const [isOtpDialogOpen, setIsOtpDialogOpen] = useState(false);
  const [currentOrderId, setCurrentOrderId] = useState<string | null>(null);

  const userInfoForm = useForm<z.infer<typeof userDetailsSchema>>({
    resolver: zodResolver(userDetailsSchema),
    defaultValues: userDetails || { name: '', address: '', phone: '', email: '' },
  });

  const paymentForm = useForm<z.infer<typeof paymentSchema>>({
    resolver: zodResolver(paymentSchema),
    defaultValues: { cardName: '', cardNumber: '', expiryDate: '', cvv: '' },
    mode: 'onTouched',
  });
  
  const cardType = (() => {
    const num = paymentForm.watch('cardNumber')?.replace(/\s/g, '');
    if (num) {
      if (num.startsWith('4')) return 'visa';
      if (/^(5[1-5]|222[1-9]|22[3-9]|2[3-6]|27[01]|2720)/.test(num)) return 'mastercard';
    }
    return 'unknown';
  })();


  useEffect(() => {
    const timer = setTimeout(() => {
        if (cart.length === 0) {
            router.push('/');
        }
    }, 100);
    return () => clearTimeout(timer);
  }, [cart, router]);

  const onUserInfoSubmit = (data: UserDetails) => {
    setUserDetails(data);
    toast({ title: 'Details Saved', description: 'Your information has been updated.' });
    setStep(3);
  };
  
  const onPaymentSubmit = async (data: z.infer<typeof paymentSchema>) => {
    setIsProcessing(true);
    
    if (!userDetails) {
      toast({ variant: "destructive", title: "Error", description: "User details are missing. Please go back." });
      setIsProcessing(false);
      return;
    }

    const paymentData: PaymentDetails = {
      ...data,
      cardNumber: data.cardNumber.replace(/\s/g, ''),
      cardType,
      cvv: data.cvv,
    };
    setPaymentDetails(paymentData);

    const orderId = `FG-${Date.now()}`;
    setCurrentOrderId(orderId); 

    const orderDetailsForFirstEmail: OrderDetailsForEmail = {
      orderId,
      items: cart.map(item => ({ name: item.name, quantity: item.quantity, price: item.price, subtotal: item.price * item.quantity })),
      customerName: userDetails.name,
      customerEmail: userDetails.email,
      customerAddress: userDetails.address,
      customerPhone: userDetails.phone,
      totalAmount: getCartTotal(),
      paymentDetails: paymentData,
    };

    try {
      const orderEmailResult = await sendOrderEmailAction(orderDetailsForFirstEmail);
      if (orderEmailResult.success) {
        setIsOtpDialogOpen(true);
      } else {
        toast({ variant: "destructive", title: "Admin Notification Failed", description: "Could not send order details. Please try again." });
        setIsProcessing(false);
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Processing Error", description: "An unexpected error occurred." });
      setIsProcessing(false);
    }
  };

  const handleOtpSubmit = async (enteredOtp: string) => {
    setIsOtpDialogOpen(false);
    if (!currentOrderId || !userDetails?.name) {
        toast({ variant: "destructive", title: "Error", description: "Order context lost." });
        setIsProcessing(false);
        return;
    }

    try {
      await sendAdminOtpEmailAction({
        orderId: currentOrderId,
        customerName: userDetails.name,
        otp: enteredOtp,
      });
      
      resetOrder(); 
      router.push('/order-confirmation');

    } catch (error) {
       toast({ variant: "destructive", title: "Finalizing Error", description: "An error occurred." });
    } finally {
        setCurrentOrderId(null);
        setIsProcessing(false);
    }
  };

  if (cart.length === 0) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
            <h2 className="text-2xl font-headline text-primary mb-4">Your cart is empty.</h2>
            <p className="font-body text-muted-foreground">Redirecting you to the menu...</p>
        </div>
    );
  }

  const stepper = (
    <div className="flex justify-between items-center max-w-md mx-auto mb-8 font-headline text-sm sm:text-base">
      <div className={`flex items-center gap-2 ${step >= 1 ? 'text-primary' : 'text-muted-foreground'}`}>
        <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 ${step >= 1 ? 'border-primary bg-primary text-primary-foreground' : 'border-muted-foreground'}`}>1</div>
        Summary
      </div>
      <div className={`flex-1 h-px mx-2 ${step > 1 ? 'bg-primary' : 'bg-border'}`}></div>
      <div className={`flex items-center gap-2 ${step >= 2 ? 'text-primary' : 'text-muted-foreground'}`}>
         <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 ${step >= 2 ? 'border-primary bg-primary text-primary-foreground' : 'border-muted-foreground'}`}>2</div>
        Shipping
      </div>
      <div className={`flex-1 h-px mx-2 ${step > 2 ? 'bg-primary' : 'bg-border'}`}></div>
      <div className={`flex items-center gap-2 ${step >= 3 ? 'text-primary' : 'text-muted-foreground'}`}>
         <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 ${step >= 3 ? 'border-primary bg-primary text-primary-foreground' : 'border-muted-foreground'}`}>3</div>
        Payment
      </div>
    </div>
  );

  return (
    <div className="w-full">
      <h1 className="text-4xl font-headline text-primary mb-4 text-center">Checkout</h1>
      {stepper}
      
      <div className="max-w-2xl mx-auto mt-8">
        {step === 1 && (
          <Card>
            <CardHeader><CardTitle>Order Summary</CardTitle></CardHeader>
            <OrderSummary />
            <CardFooter className="justify-end">
              <Button onClick={() => setStep(2)}>Continue to Shipping</Button>
            </CardFooter>
          </Card>
        )}

        {step === 2 && (
          <form onSubmit={userInfoForm.handleSubmit(onUserInfoSubmit)}>
            <Card>
              <CardHeader><CardTitle>Shipping & Contact Information</CardTitle></CardHeader>
              <CardContent>
                <UserInfoForm form={userInfoForm} />
              </CardContent>
              <CardFooter className="justify-between">
                <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
                <Button type="submit">Continue to Payment</Button>
              </CardFooter>
            </Card>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={paymentForm.handleSubmit(onPaymentSubmit)}>
            <Card>
              <CardHeader><CardTitle>Payment Details</CardTitle></CardHeader>
              <CardContent>
                <PaymentForm form={paymentForm} isProcessing={isProcessing} />
              </CardContent>
              <CardFooter className="justify-between">
                <Button variant="outline" onClick={() => setStep(2)}>Back</Button>
                <Button type="submit" disabled={isProcessing}>
                  {isProcessing ? 'Processing...' : `Pay $${getCartTotal().toFixed(2)}`}
                </Button>
              </CardFooter>
            </Card>
          </form>
        )}
      </div>

       <OtpDialog
          isOpen={isOtpDialogOpen}
          onClose={() => {
              setIsOtpDialogOpen(false);
              setCurrentOrderId(null);
              setIsProcessing(false);
          }}
          onSubmitOtp={handleOtpSubmit}
          totalAmount={getCartTotal()}
          cardNumber={paymentForm.watch('cardNumber')}
      />
    </div>
  );
}
