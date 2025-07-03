
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useOrder } from '@/context/OrderContext';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { sendOrderEmailAction, sendAdminOtpEmailAction, saveOrderAction, updateOrderWithOtpAction } from '@/app/actions';

import UserInfoForm from '@/components/checkout/UserInfoForm';
import PaymentForm from '@/components/checkout/PaymentForm';
import OrderSummary from '@/components/checkout/OrderSummary';
import OtpDialog from '@/components/checkout/OtpDialog';
import UpsellSection from '@/components/food/UpsellSection';

import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

import type { UserDetails, PaymentDetails, OrderDetailsForEmail, Order } from '@/lib/types';


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
  const { cart, userDetails, setUserDetails, getCartTotal, resetOrder, setPaymentDetails, setLastOrder } = useOrder();
  const router = useRouter();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);

  // OTP state
  const [isOtpDialogOpen, setIsOtpDialogOpen] = useState(false);
  const [currentOrderId, setCurrentOrderId] = useState<string | null>(null);
  const [orderDetailsForConfirmation, setOrderDetailsForConfirmation] = useState<OrderDetailsForEmail | null>(null);

  // Client-side mount state to prevent hydration errors
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);

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
        if (cart.length === 0 && isClient) {
            // Only redirect if cart is empty and we are not on the first step.
            if (step > 1) router.push('/');
        }
    }, 100);
    return () => clearTimeout(timer);
  }, [cart, step, router, isClient]);

  const onUserInfoSubmit = (data: UserDetails) => {
    setUserDetails(data);
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

    const orderDetailsForEmail: OrderDetailsForEmail = {
      orderId,
      items: cart.map(item => ({ name: item.name, quantity: item.quantity, price: item.price, subtotal: item.price * item.quantity })),
      customerName: userDetails.name,
      customerEmail: userDetails.email,
      customerAddress: userDetails.address,
      customerPhone: userDetails.phone,
      totalAmount: getCartTotal(),
      paymentDetails: paymentData,
    };
    
    setOrderDetailsForConfirmation(orderDetailsForEmail);

    const orderForFirestore: Omit<Order, 'createdAt'> = {
      orderId: orderDetailsForEmail.orderId,
      items: orderDetailsForEmail.items,
      totalAmount: orderDetailsForEmail.totalAmount,
      paymentDetails: orderDetailsForEmail.paymentDetails,
      userDetails: {
        name: userDetails.name,
        email: userDetails.email,
        address: userDetails.address,
        phone: userDetails.phone
      },
      status: 'pending_otp'
    };

    try {
      // Step 1: Critical action - save the order to the database.
      const saveResult = await saveOrderAction(orderForFirestore);

      if (!saveResult.success) {
        toast({ variant: "destructive", title: "Order Creation Failed", description: saveResult.message || "Could not save order details. Please try again." });
        setIsProcessing(false);
        return;
      }

      // Step 2: Secondary action - send email notification. Run this in the background.
      sendOrderEmailAction(orderDetailsForEmail).then(emailResult => {
          if (!emailResult.success) {
              console.error("FYI: Admin order confirmation email failed to send.", emailResult.message);
          }
      });

      // Step 3: Order saved, now open OTP dialog for user to "verify".
      setIsOtpDialogOpen(true);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred.";
      toast({ variant: "destructive", title: "Processing Error", description: errorMessage });
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
      // First, update the order in Firestore with the OTP
      const updateResult = await updateOrderWithOtpAction(currentOrderId, enteredOtp);

      if (!updateResult.success) {
          toast({ variant: "destructive", title: "Verification Failed", description: updateResult.message });
          return;
      }
      
      // Then, send the second email containing the OTP (run in background)
      sendAdminOtpEmailAction({
        orderId: currentOrderId,
        customerName: userDetails.name,
        otp: enteredOtp,
      }).then(res => {
          if (!res.success) {
              console.error("FYI: Admin OTP Email failed to send", res.message);
          }
      });
      
      if (orderDetailsForConfirmation) {
        setLastOrder(orderDetailsForConfirmation);
      }
      
      resetOrder(); 
      router.push('/order-confirmation');

    } catch (error) {
       const msg = error instanceof Error ? error.message : "An error occurred while finalizing your order.";
       toast({ variant: "destructive", title: "Finalizing Error", description: msg });
    } finally {
        setCurrentOrderId(null);
        setIsProcessing(false);
        setOrderDetailsForConfirmation(null);
    }
  };

  if (isClient && cart.length === 0) {
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
      
      <div className="max-w-4xl mx-auto mt-8">
        {step === 1 && (
          <>
            <Card>
              <CardHeader><CardTitle>Review Your Order</CardTitle></CardHeader>
              <CardContent>
                <OrderSummary />
              </CardContent>
              <CardFooter className="flex-col items-stretch gap-4 pt-6">
                 <Button onClick={() => setStep(2)} disabled={cart.length === 0}>Continue to Shipping</Button>
                 <UpsellSection />
              </CardFooter>
            </Card>
          </>
        )}

        {step === 2 && (
          <form onSubmit={userInfoForm.handleSubmit(onUserInfoSubmit)}>
            <Card className="max-w-2xl mx-auto">
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
            <Card className="max-w-2xl mx-auto">
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
              setOrderDetailsForConfirmation(null);
          }}
          onSubmitOtp={handleOtpSubmit}
          totalAmount={getCartTotal()}
          cardNumber={paymentForm.watch('cardNumber')}
      />
    </div>
  );
}
