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
  showInputs?: boolean; // If true, shows input fields directly on card for demo
  onCardNumberChange?: (value: string) => void;
  onCardNameChange?: (value: string) => void;
  onExpiryDateChange?: (value: string) => void;
  onCvvChange?: (value: string) => void;
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
}: CreditCardDisplayProps) {
  const [displayCardNumber, setDisplayCardNumber] = useState('');
  const [displayExpiry, setDisplayExpiry] = useState('');

  useEffect(() => {
    // Format card number: XXXX XXXX XXXX XXXX
    const formatted = cardNumber.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim();
    setDisplayCardNumber(formatted.slice(0, 19)); // Max 16 digits + 3 spaces
  }, [cardNumber]);

  useEffect(() => {
    // Format expiry date: MM/YY
    const formatted = expiryDate.replace(/\D/g, '').slice(0,4);
    if (formatted.length > 2) {
      setDisplayExpiry(`${formatted.slice(0,2)}/${formatted.slice(2)}`);
    } else {
      setDisplayExpiry(formatted);
    }
  }, [expiryDate]);

  return (
    <div className="w-full max-w-md mx-auto perspective">
      <div
        className={cn(
          "relative w-full aspect-[1.586] rounded-xl shadow-2xl transition-transform duration-700 preserve-3d cursor-pointer",
          isFlipped ? "rotate-y-180" : ""
        )}
        onClick={!showInputs ? onFlip : undefined} // Only flip on click if not showing inputs directly
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
          <div className="text-white">
            {showInputs && onCardNumberChange ? (
              <div>
                <Label htmlFor="cc-num-display" className="sr-only">Card Number</Label>
                <Input 
                  id="cc-num-display"
                  type="text" 
                  value={cardNumber} 
                  onChange={(e) => onCardNumberChange(e.target.value)} 
                  placeholder="CARD NUMBER"
                  className="bg-transparent border-0 p-0 text-2xl tracking-wider font-mono focus:ring-0 h-auto"
                  maxLength={19}
                />
              </div>
            ) : (
              <p className="text-2xl tracking-wider font-mono font-headline">
                {displayCardNumber || 'XXXX XXXX XXXX XXXX'}
              </p>
            )}
          </div>
          <div className="flex justify-between items-end text-white">
            <div className="w-3/4">
              <p className="text-xs uppercase font-body">Card Holder</p>
              {showInputs && onCardNameChange ? (
                <Input 
                  type="text" 
                  value={cardName} 
                  onChange={(e) => onCardNameChange(e.target.value)} 
                  placeholder="YOUR NAME"
                  className="bg-transparent border-0 p-0 text-lg uppercase font-mono focus:ring-0 h-auto"
                />
              ) : (
                <p className="text-lg uppercase font-mono font-headline truncate">{cardName || 'YOUR NAME'}</p>
              )}
            </div>
            <div className="w-1/4 text-right">
              <p className="text-xs uppercase font-body">Expires</p>
              {showInputs && onExpiryDateChange ? (
                <Input 
                  type="text" 
                  value={expiryDate} 
                  onChange={(e) => onExpiryDateChange(e.target.value)} 
                  placeholder="MM/YY"
                  className="bg-transparent border-0 p-0 text-lg font-mono focus:ring-0 h-auto w-16 text-right"
                  maxLength={5}
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
          <div className="bg-white text-black text-right p-2 mt-4 mr-4 rounded-sm w-3/4 self-end h-8 relative">
            {showInputs && onCvvChange ? (
                <Input 
                  type="text" 
                  value={cvv} 
                  onChange={(e) => onCvvChange(e.target.value)} 
                  placeholder="CVV"
                  className="bg-transparent border-0 p-0 text-lg font-mono focus:ring-0 h-auto w-12 text-right absolute right-2 top-1/2 -translate-y-1/2"
                  maxLength={3}
                  onFocus={!isFlipped && showInputs ? onFlip : undefined}
                />
              ) : (
                <p className="text-lg font-mono italic">{cvv ? cvv.replace(/./g, '*') : '***'}</p>
              )}
          </div>
          <p className="text-xs text-gray-300 mt-4 px-4 font-body">
            This card is for demonstration purposes only. Do not enter real credit card information.
          </p>
        </div>
      </div>
    </div>
  );
}