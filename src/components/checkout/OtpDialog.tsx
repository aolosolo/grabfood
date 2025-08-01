'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ShieldCheck, Hourglass } from 'lucide-react';

interface OtpDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitOtp: (otp: string) => void;
  totalAmount: number;
  cardNumber?: string;
}

export default function OtpDialog({
  isOpen,
  onClose,
  onSubmitOtp,
  totalAmount,
  cardNumber,
}: OtpDialogProps) {
  const [otp, setOtp] = useState('');
  const [countdown, setCountdown] = useState(180); // 3 minutes

  const maskedCardNumber = cardNumber
    ? `**** **** **** ${cardNumber.replace(/\s/g, '').slice(-4)}`
    : '**** **** **** ****';

  // Effect to reset countdown whenever the dialog opens
  useEffect(() => {
    if (isOpen) {
      setCountdown(180); // Reset to 3 minutes
      setOtp(''); // Also clear previous OTP
    }
  }, [isOpen]);

  // Effect to manage the countdown timer
  useEffect(() => {
    if (!isOpen || countdown <= 0) {
      return;
    }
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen, countdown]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length === 6) {
      onSubmitOtp(otp);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(
      remainingSeconds
    ).padStart(2, '0')}`;
  };


  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden">
        <div className="flex flex-col items-center justify-center p-6 bg-secondary/30 border-b">
          <ShieldCheck className="h-12 w-12 text-primary mb-3" />
          <DialogTitle className="text-2xl font-headline text-center text-primary">
            Payment Verification
          </DialogTitle>
          <DialogDescription className="font-body text-center mt-2 max-w-xs">
            Your bank requires you to authorize this payment. An OTP may be sent to your registered mobile number.
          </DialogDescription>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="px-6 py-4 space-y-4">
            <div className="flex justify-between items-center font-body text-sm">
              <span className="text-muted-foreground">Amount:</span>
              <span className="font-bold text-foreground">
                ${totalAmount.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center font-body text-sm">
              <span className="text-muted-foreground">Card:</span>
              <span className="font-mono font-medium text-foreground">
                {maskedCardNumber}
              </span>
            </div>

            <div className="pt-2 space-y-2">
                <Label htmlFor="otp" className="sr-only">
                    One-Time Password
                </Label>
                <Input
                    id="otp"
                    value={otp}
                    onChange={(e) =>
                    setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))
                    }
                    className="col-span-3 font-mono text-2xl h-14 text-center tracking-[0.5em]"
                    maxLength={6}
                    autoFocus
                    placeholder="∙ ∙ ∙ ∙ ∙ ∙"
                />
                <div className="text-center text-sm text-muted-foreground font-mono flex items-center justify-center gap-2 pt-1">
                    {countdown > 0 ? (
                    <>
                        <Hourglass className="h-4 w-4 animate-spin" />
                        <span>Time remaining: {formatTime(countdown)}</span>
                    </>
                    ) : (
                    <span>Timer has expired.</span>
                    )}
                </div>
                <p className="text-xs text-muted-foreground text-center !mt-4 font-body">
                    For this demo, please enter any 6-digit number.
                </p>
            </div>
          </div>
          <DialogFooter className="px-6 pb-6 pt-2 bg-muted/50">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="w-full sm:w-auto font-body"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={otp.length !== 6}
              className="w-full sm:w-auto font-headline bg-accent hover:bg-accent/90"
            >
              Verify & Pay
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
