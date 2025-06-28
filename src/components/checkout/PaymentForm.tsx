
'use client';

import { useState, useEffect } from 'react';
import { useForm, type UseFormReturn } from 'react-hook-form';
import CreditCardDisplay from './CreditCardDisplay';
import { Form, FormField, FormItem, FormMessage } from '@/components/ui/form';

interface PaymentFormData {
    cardName: string;
    cardNumber: string;
    expiryDate: string;
    cvv: string;
}

interface PaymentFormProps {
  form: UseFormReturn<PaymentFormData>;
  isProcessing: boolean;
}

export default function PaymentForm({ form }: PaymentFormProps) {
  const [cardType, setCardType] = useState<'visa' | 'mastercard' | 'unknown'>('unknown');
  
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
      </Form>
    </div>
  );
}
