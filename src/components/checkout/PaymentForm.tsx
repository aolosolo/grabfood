'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useOrder } from '@/context/OrderContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input'; // For hidden inputs if needed
import { Label } from '@/components/ui/label';
import CreditCardDisplay from './CreditCardDisplay';
import OtpDialog from './OtpDialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import type { PaymentDetails, OrderDetailsForEmail } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { generateOtpAction, sendOrderEmailAction } from '@/app/actions';

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

export default function PaymentForm() {
  const { userDetails, cart, setPaymentDetails, getCartTotal, resetOrder } = useOrder();
  const router = useRouter();
  const { toast } = useToast();
  const [cardType, setCardType] = useState<'visa' | 'mastercard' | 'unknown'>('unknown');
  
  const [isOtpDialogOpen, setIsOtpDialogOpen] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState<string | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

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
    setIsProcessingPayment(true);
    const paymentData: PaymentDetails = {
      ...data,
      cardNumber: data.cardNumber.replace(/\s/g, ''), // Store raw card number
      cardType,
    };
    setPaymentDetails(paymentData);
    toast({ title: "Payment Details Confirmed", description: "Proceeding to OTP verification." });

    if (!userDetails?.phone) {
      toast({ variant: "destructive", title: "Error", description: "User phone number is missing for OTP." });
      setIsProcessingPayment(false);
      return;
    }

    try {
      const otpResult = await generateOtpAction({ phoneNumber: userDetails.phone });
      setGeneratedOtp(otpResult.otp);
      setIsOtpDialogOpen(true);
      // For simulation, show OTP in a toast
      toast({
        title: "OTP Generated (Simulation)",
        description: `Your OTP is: ${otpResult.otp}. Enter this in the dialog. (Normally sent via SMS)`,
        duration: 10000, // Keep it visible longer
      });
    } catch (error) {
      toast({ variant: "destructive", title: "OTP Error", description: "Could not generate OTP. Please try again." });
      console.error("OTP generation error:", error);
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handleOtpSubmit = async (enteredOtp: string) => {
    setIsOtpDialogOpen(false);
    setIsProcessingPayment(true);

    if (enteredOtp === generatedOtp) {
      toast({ title: "OTP Verified!", description: "Processing your order..." });
      
      if (!userDetails || cart.length === 0) {
        toast({ variant: "destructive", title: "Order Error", description: "Missing user details or empty cart."});
        setIsProcessingPayment(false);
        return;
      }

      const orderId = `FG-${Date.now()}`; 
      const orderDetailsForEmail: OrderDetailsForEmail = {
        orderId,
        items: cart.map(item => ({ name: item.name, quantity: item.quantity, price: item.price, subtotal: item.price * item.quantity })),
        customerName: userDetails.name,
        customerEmail: userDetails.email,
        customerAddress: userDetails.address,
        customerPhone: userDetails.phone,
        totalAmount: getCartTotal(),
      };

      try {
        const emailResult = await sendOrderEmailAction(orderDetailsForEmail);
        if (emailResult.success) {
          toast({ title: "Order Placed!", description: "Admin has been notified (simulated)." });
        } else {
           toast({ title: "Order Placed", description: "Failed to notify admin (simulated), but order is processed." });
        }
        resetOrder();
        router.push('/order-confirmation');

      } catch (error) {
        toast({ variant: "destructive", title: "Order Processing Error", description: "Could not finalize order." });
      }

    } else {
      toast({ variant: "destructive", title: "OTP Incorrect", description: "Please try again." });
    }
    setGeneratedOtp(null); // Clear OTP after attempt
    setIsProcessingPayment(false);
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
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmitPaymentDetails)} className="space-y-6 bg-card p-6 rounded-lg shadow-md mt-6">
           {/* Hidden inputs linked to react-hook-form fields, labels provide accessibility and error messages */}
          <FormField
            control={form.control}
            name="cardName"
            render={({ field }) => ( 
              <FormItem className="sr-only">
                <FormLabel htmlFor="cc-name-oncard-form" className="font-headline">Name on Card</FormLabel>
                <FormControl><Input type="hidden" {...field} id="cc-name-oncard-form" /></FormControl>
                <FormMessage /> 
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="cardNumber"
            render={({ field }) => (
              <FormItem className="sr-only">
                <FormLabel htmlFor="cc-num-oncard-form" className="font-headline">Card Number</FormLabel>
                <FormControl><Input type="hidden" {...field} id="cc-num-oncard-form" /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid grid-cols-2 gap-x-4 gap-y-6 sr-only">
            <FormField
              control={form.control}
              name="expiryDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="cc-expiry-oncard-form" className="font-headline">Expiry Date (MM/YY)</FormLabel>
                  <FormControl><Input type="hidden" {...field} id="cc-expiry-oncard-form"/></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="cvv"
              render={({ field }) => ( 
                <FormItem>
                  <FormLabel htmlFor="cc-cvv-oncard-form" className="font-headline">CVV</FormLabel>
                  <FormControl><Input type="hidden" {...field} id="cc-cvv-oncard-form" /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <Button type="submit" size="lg" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-headline text-lg" disabled={isProcessingPayment}>
            {isProcessingPayment ? 'Processing...' : `Pay $${getCartTotal().toFixed(2)}`}
          </Button>
        </form>
      </Form>
      <OtpDialog
        isOpen={isOtpDialogOpen}
        onClose={() => {
            setIsOtpDialogOpen(false);
            setGeneratedOtp(null); // Clear OTP if dialog is closed manually
        }}
        onSubmitOtp={handleOtpSubmit}
        phoneNumber={userDetails?.phone}
      />
    </div>
  );
}
