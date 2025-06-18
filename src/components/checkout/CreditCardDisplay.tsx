
'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import VisaLogo from './VisaLogo';
import MasterCardLogo from './MasterCardLogo';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface CreditCardDisplayProps {
  cardNumber: string;
  cardName: string;
  expiryDate: string;
  cvv: string;
  isFlipped: boolean;
  cardType?: 'visa' | 'mastercard' | 'unknown';
  onFlip: () => void;
  showInputs?: boolean;
  onCardNumberChange?: (value: string) => void;
  onCardNameChange?: (value: string) => void;
  onExpiryDateChange?: (value: string) => void;
  onCvvChange?: (value: string) => void;
  onCvvFocus?: () => void; // To let parent know CVV input (on card) is focused
}

export default function CreditCardDisplay({
  cardNumber,
  cardName,
  expiryDate,
  cvv,
  isFlipped,
  cardType,
  onFlip,
  showInputs = false,
  onCardNumberChange,
  onCardNameChange,
  onExpiryDateChange,
  onCvvChange,
  onCvvFocus,
}: CreditCardDisplayProps) {
  const [displayCardNumber, setDisplayCardNumber] = useState('');
  const [displayExpiry, setDisplayExpiry] = useState('');

  useEffect(() => {
    const formatted = cardNumber.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim();
    setDisplayCardNumber(formatted.slice(0, 19));
  }, [cardNumber]);

  useEffect(() => {
    const formatted = expiryDate.replace(/\D/g, '').slice(0,4);
    if (formatted.length > 2) {
      setDisplayExpiry(`${formatted.slice(0,2)}/${formatted.slice(2)}`);
    } else {
      setDisplayExpiry(formatted);
    }
  }, [expiryDate]);

  const commonInputClassName = "bg-transparent border-0 p-0 text-white placeholder-gray-300 focus-visible:ring-1 focus-visible:ring-white focus-visible:ring-offset-0 focus-visible:ring-offset-transparent h-auto";

  return (
    <div className="w-full max-w-md mx-auto perspective">
      <div
        className={cn(
          "relative w-full aspect-[1.586] rounded-xl shadow-2xl transition-transform duration-700 preserve-3d",
          isFlipped ? "rotate-y-180" : ""
        )}
        onClick={showInputs ? undefined : onFlip}
      >
        {/* Card Front */}
        <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-gray-700 to-gray-900 rounded-xl p-6 flex flex-col justify-between backface-hidden">
          <div>
            <div className="flex justify-between items-start">
              <div className="w-1/4 h-8 bg-yellow-400 rounded-sm" data-ai-hint="credit card chip"></div> {/* Chip */}
              {cardType === 'visa' && <VisaLogo className="h-8 w-auto" />}
              {cardType === 'mastercard' && <MasterCardLogo className="h-8 w-auto" />}
            </div>
          </div>
          <div className="text-white space-y-1">
            <Label htmlFor="cc-num-oncard" className="sr-only">Card Number</Label>
            {showInputs && onCardNumberChange ? (
              <Input
                id="cc-num-oncard"
                type="text"
                value={cardNumber}
                onChange={(e) => onCardNumberChange(e.target.value)}
                placeholder="XXXX XXXX XXXX XXXX"
                className={cn(commonInputClassName, "text-2xl tracking-wider font-mono font-headline")}
                maxLength={19}
                aria-label="Card Number"
              />
            ) : (
              <p className="text-2xl tracking-wider font-mono font-headline">
                {displayCardNumber || 'XXXX XXXX XXXX XXXX'}
              </p>
            )}
          </div>
          <div className="flex justify-between items-end text-white">
            <div className="w-3/4">
              <Label htmlFor="cc-name-oncard" className="text-xs uppercase font-body text-gray-300">Card Holder</Label>
              {showInputs && onCardNameChange ? (
                <Input
                  id="cc-name-oncard"
                  type="text"
                  value={cardName}
                  onChange={(e) => onCardNameChange(e.target.value)}
                  placeholder="YOUR NAME"
                  className={cn(commonInputClassName, "text-lg uppercase font-mono font-headline truncate")}
                  aria-label="Card Holder Name"
                />
              ) : (
                <p className="text-lg uppercase font-mono font-headline truncate">{cardName || 'YOUR NAME'}</p>
              )}
            </div>
            <div className="w-1/4 text-right">
              <Label htmlFor="cc-expiry-oncard" className="text-xs uppercase font-body text-gray-300">Expires</Label>
              {showInputs && onExpiryDateChange ? (
                <Input
                  id="cc-expiry-oncard"
                  type="text"
                  value={expiryDate}
                  onChange={(e) => onExpiryDateChange(e.target.value)}
                  placeholder="MM/YY"
                  className={cn(commonInputClassName, "text-lg font-mono font-headline w-16 text-right")}
                  maxLength={5}
                  aria-label="Expiry Date"
                />
              ) : (
                <p className="text-lg font-mono font-headline">{displayExpiry || 'MM/YY'}</p>
              )}
            </div>
          </div>
        </div>

        {/* Card Back */}
        <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-gray-600 to-gray-800 rounded-xl p-2 flex flex-col justify-start rotate-y-180 backface-hidden">
          <div className="w-full h-12 bg-black mt-6" data-ai-hint="magnetic stripe"></div> {/* Magnetic Stripe */}
          <div className="bg-gray-300 text-black text-right p-2 mt-4 mr-4 rounded-sm w-3/4 self-end h-10 relative flex items-center justify-end">
             <Label htmlFor="cc-cvv-oncard" className="sr-only">CVV</Label>
            {showInputs && onCvvChange ? (
                <Input
                  id="cc-cvv-oncard"
                  type="text"
                  value={cvv}
                  onChange={(e) => onCvvChange(e.target.value)}
                  placeholder="CVV"
                  className={cn(commonInputClassName, "text-lg font-mono w-16 text-right text-black placeholder-gray-600")}
                  maxLength={4}
                  onFocus={onCvvFocus} 
                  aria-label="CVV"
                />
              ) : (
                <p className="text-lg font-mono italic text-black">{cvv ? cvv.replace(/./g, '*') : '***'}</p>
              )}
          </div>
          <p className="text-xs text-gray-300 mt-4 px-4 font-body">
            For demonstration purposes. Do not enter real card information.
          </p>
        </div>
      </div>
    </div>
  );
}
