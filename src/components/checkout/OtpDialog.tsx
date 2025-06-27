
'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

interface OtpDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitOtp: (otp: string) => void;
  phoneNumber?: string; 
}

export default function OtpDialog({ isOpen, onClose, onSubmitOtp, phoneNumber }: OtpDialogProps) {
  const [otp, setOtp] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length === 6) {
      onSubmitOtp(otp);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="font-headline text-primary">Verify Payment</DialogTitle>
            <DialogDescription className="font-body">
              Please enter the 6-digit code below to complete your transaction.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="otp" className="text-right font-body">
                OTP
              </Label>
              <Input
                id="otp"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="col-span-3 font-mono"
                maxLength={6}
                autoFocus
                placeholder="XXXXXX"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} className="font-body">
              Cancel
            </Button>
            <Button type="submit" disabled={otp.length !== 6} className="font-headline bg-accent hover:bg-accent/90">
              Submit OTP
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
