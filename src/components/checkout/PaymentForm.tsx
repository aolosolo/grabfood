
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useOrder } from '@/context/OrderContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input'; // Still needed for the main CVV input
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
  const { setPaymentDetails, getCartTotal } = useOrder();
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
    mode: 'onTouched', // Show errors as user interacts
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
      cardNumber: data.cardNumber.replace(/\s/g, ''),
      cardType,
    };
    setPaymentDetails(paymentData);
    toast({ title: "Payment Details Updated", description: "Your payment information is ready." });
    // router.push('/confirmation'); // Or next step
  };

  const handleCvvFocus = () => {
    setIsCardFlipped(true);
  };
  
  const handleCvvBlur = () => {
     // setIsCardFlipped(false); // Optionally unflip, or keep it flipped once CVV is interacted with
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
    } else if (v.length === 2 && watchedValues.expiryDate.length === 1 && !v.includes('/')) {
        // if user types 2 digits and no slash yet, add it if appropriate month
        const month = parseInt(v.substring(0,2));
        if(month > 0 && month <=12 ) {
          // No auto-slash for now, user can type it. Or, handle if last char was not /
        }
    }
    form.setValue('expiryDate', v.slice(0,5), { shouldValidate: true, shouldDirty: true, shouldTouch: true });
  };
  
  const handleCvvChangeOnCard = (value: string) => {
     form.setValue('cvv', value.replace(/\D/g, '').slice(0,4), { shouldValidate: true, shouldDirty: true, shouldTouch: true });
  };


  return (
    <div className="space-y-8">
      <CreditCardDisplay
        cardNumber={watchedValues.cardNumber || ''}
        cardName={watchedValues.cardName || ''}
        expiryDate={watchedValues.expiryDate || ''}
        cvv={watchedValues.cvv || ''} // This CVV is for the input on the card's back
        isFlipped={isCardFlipped}
        cardType={cardType}
        onFlip={() => setIsCardFlipped(!isCardFlipped)}
        showInputs={true}
        onCardNumberChange={handleCardNumberChange}
        onCardNameChange={(val) => form.setValue('cardName', val.toUpperCase(), { shouldValidate: true, shouldDirty: true, shouldTouch: true })}
        onExpiryDateChange={handleExpiryDateChange}
        onCvvChange={handleCvvChangeOnCard} // Connects the card's back CVV input to RHF
        onCvvFocus={handleCvvFocus} // If card's CVV input is focused, ensure it's flipped
      />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 bg-card p-6 rounded-lg shadow-md mt-6">
          {/* FormFields are now primarily for labels and error messages. Inputs are on CreditCardDisplay. */}
          {/* For accessibility, ensure labels point to the on-card inputs if possible, or keep sr-only inputs if needed. */}
          
          <FormField
            control={form.control}
            name="cardName"
            render={({ field }) => ( // field is not directly used for <Input> here
              <FormItem>
                <FormLabel htmlFor="cc-name-oncard" className="font-headline">Name on Card</FormLabel>
                {/* Visual input is on CreditCardDisplay. This RHF field is for logic/validation. */}
                <FormMessage /> 
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="cardNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="cc-num-oncard" className="font-headline">Card Number</FormLabel>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid grid-cols-2 gap-x-4 gap-y-6">
            <FormField
              control={form.control}
              name="expiryDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="cc-expiry-oncard" className="font-headline">Expiry Date</FormLabel>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* The main CVV input field that the user interacts with to trigger the flip and enter CVV */}
            <FormField
              control={form.control}
              name="cvv"
              render={({ field }) => ( // This field directly uses RHF's field for its input
                <FormItem>
                  <FormLabel htmlFor="cvv-main-input" className="font-headline">CVV</FormLabel>
                  <FormControl>
                    <Input
                      id="cvv-main-input" // This input will be visually distinct or could be sr-only if card's CVV is primary
                      placeholder="123"
                      {...field} // RHF controls this input
                      onFocus={() => {
                        handleCvvFocus();
                        // Potentially focus the input on the card back if it's separate
                        // document.getElementById('cc-cvv-oncard')?.focus();
                      }}
                      onBlur={handleCvvBlur}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '').slice(0,4);
                        field.onChange(val); // Update RHF state
                        // The onCvvChange on CreditCardDisplay is also called by its own input
                      }}
      
                      maxLength={4}
                      className="font-body"
                      aria-describedby="cvv-form-message"
                    />
                  </FormControl>
                  <FormMessage id="cvv-form-message" />
                </FormItem>
              )}
            />
          </div>
          <Button type="submit" size="lg" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-headline text-lg">
            Pay ${getCartTotal().toFixed(2)}
          </Button>
        </form>
      </Form>
    </div>
  );
}
