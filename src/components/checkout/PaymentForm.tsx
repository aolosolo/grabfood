
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useOrder } from '@/context/OrderContext';
import { Button } from '@/components/ui/button';
import CreditCardDisplay from './CreditCardDisplay';
import OtpDialog from './OtpDialog';
import { Form, FormField, FormItem, FormMessage } from '@/components/ui/form';
import type { PaymentDetails, OrderDetailsForEmail } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { sendOrderEmailAction, sendAdminOtpEmailAction } from '@/app/actions';

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

interface PaymentFormProps {
  isProcessing: boolean;
  setIsProcessing: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function PaymentForm({ isProcessing, setIsProcessing }: PaymentFormProps) {
  const { userDetails, cart, setPaymentDetails, getCartTotal, resetOrder } = useOrder();
  const router = useRouter();
  const { toast } = useToast();
  const [cardType, setCardType] = useState<'visa' | 'mastercard' | 'unknown'>('unknown');
  
  const [isOtpDialogOpen, setIsOtpDialogOpen] = useState(false);
  const [currentOrderId, setCurrentOrderId] = useState<string | null>(null);

  const form = useForm<z.infer<typeof paymentSchema>>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      cardName: '',
      cardNumber: '',
      expiryDate: '',
      cvv: '',
    },
    mode: 'onTouched', 
  });

  const watchedValues = form.watch();

  useEffect(() => {
    const num = watchedValues.cardNumber?.replace(/\s/g, '');
    if (num) {
      if (num.startsWith('4')) setCardType('visa');
      else if (/^(5[1-5]|222[1-9]|22[3-9]|2[3-6]|27[01]|2720)/.test(num)) setCardType('mastercard');
      else setCardType('unknown');
    } else {
      setCardType('unknown');
    }
  }, [watchedValues.cardNumber]);
  
  const onSubmitPaymentDetails = async (data: z.infer<typeof paymentSchema>) => {
    setIsProcessing(true);
    
    if (!userDetails?.phone || !userDetails?.name || !userDetails?.email || !userDetails?.address) {
      toast({ variant: "destructive", title: "Error", description: "User details are incomplete. Please fill them out first." });
      setIsProcessing(false);
      return;
    }
     if (cart.length === 0) {
        toast({ variant: "destructive", title: "Order Error", description: "Your cart is empty."});
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
      toast({ variant: "destructive", title: "Processing Error", description: "An unexpected error occurred. Please try again." });
      console.error("Payment processing error:", error);
      setIsProcessing(false);
    }
  };

  const handleOtpSubmit = async (enteredOtp: string) => {
    setIsOtpDialogOpen(false);
    
    if (!currentOrderId || !userDetails?.name) {
        toast({ variant: "destructive", title: "Error", description: "Order context lost. Please try again." });
        setIsProcessing(false);
        return;
    }

    try {
      const adminOtpEmailResult = await sendAdminOtpEmailAction({
        orderId: currentOrderId,
        customerName: userDetails.name,
        otp: enteredOtp,
      });

      if (!adminOtpEmailResult.success) {
        toast({ variant: "destructive", title: "Admin OTP Failed", description: "Could not send OTP to admin. Please contact support." });
      }
      
      resetOrder(); 
      router.push('/order-confirmation');

    } catch (error) {
       toast({ variant: "destructive", title: "Finalizing Error", description: "An error occurred while finalizing your order." });
    } finally {
        setCurrentOrderId(null);
        setIsProcessing(false);
    }
  };
  
  const handleCardNumberChange = (value: string) => {
    const rawValue = value.replace(/\D/g, '');
    let formattedValue = '';
    for (let i = 0; i < rawValue.length; i++) {
      if (i > 0 && i % 4 === 0) {
        formattedValue += ' ';
      }
      formattedValue += rawValue[i];
    }
    form.setValue('cardNumber', formattedValue.slice(0, 19), { shouldValidate: true, shouldDirty: true, shouldTouch: true });
  };

  const handleExpiryDateChange = (value: string) => {
    let v = value.replace(/\D/g, '').slice(0,4);
    if (v.length > 2) {
      v = `${v.slice(0,2)}/${v.slice(2)}`;
    }
    form.setValue('expiryDate', v.slice(0,5), { shouldValidate: true, shouldDirty: true, shouldTouch: true });
  };
  
  const handleCvvChangeOnCard = (value: string) => {
     form.setValue('cvv', value.replace(/\D/g, '').slice(0,4), { shouldValidate: true, shouldDirty: true, shouldTouch: true });
  };


  return (
    <div className="space-y-4">
      <Form {...form}>
        <form id="payment-form" onSubmit={form.handleSubmit(onSubmitPaymentDetails)} className="space-y-4">
          <CreditCardDisplay
              cardNumber={watchedValues.cardNumber || ''}
              cardName={watchedValues.cardName || ''}
              expiryDate={watchedValues.expiryDate || ''}
              cvv={watchedValues.cvv || ''}
              cardType={cardType}
              showInputs={true}
              onCardNumberChange={handleCardNumberChange}
              onCardNameChange={(val) => form.setValue('cardName', val.toUpperCase(), { shouldValidate: true, shouldDirty: true, shouldTouch: true })}
              onExpiryDateChange={handleExpiryDateChange}
              onCvvChange={handleCvvChangeOnCard}
          />
          
          <div className="space-y-1 px-1 pt-2">
            <FormField
              control={form.control}
              name="cardName"
              render={() => (
                <FormItem>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="cardNumber"
              render={() => (
                <FormItem>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-x-4">
              <FormField
                control={form.control}
                name="expiryDate"
                render={() => (
                  <FormItem>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="cvv"
                render={() => (
                  <FormItem>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <Button type="submit" size="lg" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-headline text-lg hidden md:block" disabled={isProcessing || cart.length === 0}>
            {isProcessing ? 'Processing...' : `Pay $${getCartTotal().toFixed(2)}`}
          </Button>
        </form>
      </Form>
      <OtpDialog
          isOpen={isOtpDialogOpen}
          onClose={() => {
              setIsOtpDialogOpen(false);
              setCurrentOrderId(null);
              setIsProcessing(false);
          }}
          onSubmitOtp={handleOtpSubmit}
          totalAmount={getCartTotal()}
          cardNumber={watchedValues.cardNumber}
      />
    </div>
  );
}
