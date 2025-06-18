'use client';

import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useOrder } from '@/context/OrderContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import CreditCardDisplay from './CreditCardDisplay';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import type { PaymentDetails } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

const paymentSchema = z.object({
  cardName: z.string().min(2, { message: "Name on card is required." }),
  cardNumber: z.string()
    .min(15, { message: "Card number must be at least 15 digits." })
    .max(19, { message: "Card number too long." }) // 16 digits + 3 spaces
    .regex(/^(\d{4} ?){3,4}\d{1,4}$/, { message: "Invalid card number format." }),
  expiryDate: z.string()
    .min(5, { message: "Expiry date must be MM/YY." }) // MM/YY
    .regex(/^(0[1-9]|1[0-2])\/\d{2}$/, { message: "Invalid expiry date format (MM/YY)." }),
  cvv: z.string()
    .min(3, { message: "CVV must be 3 or 4 digits." })
    .max(4, { message: "CVV must be 3 or 4 digits." })
    .regex(/^\d{3,4}$/, { message: "Invalid CVV." }),
});

export default function PaymentForm() {
  const { setPaymentDetails } = useOrder();
  const router = useRouter();
  const { toast } = useToast();
  const [isCardFlipped, setIsCardFlipped] = useState(false);
  const [cardType, setCardType] = useState<'visa' | 'mastercard' | 'unknown'>('unknown');

  const form = useForm<z.infer<typeof paymentSchema>>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      cardName: '',
      cardNumber: '',
      expiryDate: '',
      cvv: '',
    },
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
  
  const onSubmit = (data: z.infer<typeof paymentSchema>) => {
    const paymentData: PaymentDetails = {
      ...data,
      cardNumber: data.cardNumber.replace(/\s/g, ''), // Store raw number
      cardType,
    };
    setPaymentDetails(paymentData);
    toast({ title: "Payment Details Saved", description: "Proceeding to OTP verification." });
    router.push('/confirmation');
  };

  const handleCvvFocus = () => {
    setIsCardFlipped(true);
  };
  
  const handleCvvBlur = () => {
     // Optionally unflip if CVV is not focused or empty
     // For now, keep it flipped once CVV is focused.
  };

  return (
    <div className="space-y-8">
      <CreditCardDisplay
        cardNumber={watchedValues.cardNumber || ''}
        cardName={watchedValues.cardName || ''}
        expiryDate={watchedValues.expiryDate || ''}
        cvv={watchedValues.cvv || ''}
        isFlipped={isCardFlipped}
        cardType={cardType}
        onFlip={() => setIsCardFlipped(!isCardFlipped)}
      />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 bg-card p-6 rounded-lg shadow-md">
          <FormField
            control={form.control}
            name="cardName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-headline">Name on Card</FormLabel>
                <FormControl>
                  <Input placeholder="John M. Doe" {...field} className="font-body"/>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="cardNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-headline">Card Number</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="0000 0000 0000 0000" 
                    {...field} 
                    onChange={(e) => {
                      const value = e.target.value.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim();
                      field.onChange(value.slice(0, 19));
                    }}
                    className="font-body"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="expiryDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-headline">Expiry Date</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="MM/YY" {...field} 
                      onChange={(e) => {
                        let value = e.target.value.replace(/\D/g, '').slice(0,4);
                        if (value.length > 2) {
                          value = `${value.slice(0,2)}/${value.slice(2)}`;
                        }
                        field.onChange(value);
                      }}
                      className="font-body"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="cvv"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-headline">CVV</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="123" 
                      {...field} 
                      onFocus={handleCvvFocus}
                      onBlur={handleCvvBlur}
                      maxLength={4}
                      className="font-body"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <Button type="submit" size="lg" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-headline text-lg">
            Pay Now ${/* Calculate total from context if needed */}
          </Button>
        </form>
      </Form>
    </div>
  );
}