'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useOrder } from '@/context/OrderContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import type { UserDetails } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

const userDetailsSchema = z.object({
  name: z.string().min(2, { message: "Name is required." }),
  address: z.string().min(5, { message: "Address is required." }),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, { message: "Invalid phone number." }),
  email: z.string().email({ message: "Invalid email address." }),
});

interface UserInfoFormProps {
  onFormSubmit?: () => void; // Optional: callback when form is submitted successfully
}

export default function UserInfoForm({ onFormSubmit }: UserInfoFormProps) {
  const { userDetails, setUserDetails } = useOrder();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof userDetailsSchema>>({
    resolver: zodResolver(userDetailsSchema),
    defaultValues: userDetails || {
      name: '',
      address: '',
      phone: '',
      email: '',
    },
  });

  const onSubmit = (data: z.infer<typeof userDetailsSchema>) => {
    setUserDetails(data as UserDetails);
    toast({ title: "User Details Saved", description: "Your information has been updated." });
    if (onFormSubmit) onFormSubmit();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 bg-card p-6 rounded-lg shadow-md">
        <h3 className="text-2xl font-headline text-primary mb-4">Your Details</h3>
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-headline">Full Name</FormLabel>
              <FormControl>
                <Input placeholder="John Doe" {...field} className="font-body"/>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-headline">Delivery Address</FormLabel>
              <FormControl>
                <Input placeholder="123 Main St, Anytown, USA" {...field} className="font-body"/>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-headline">Phone Number</FormLabel>
              <FormControl>
                <Input type="tel" placeholder="+1234567890" {...field} className="font-body"/>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-headline">Email Address</FormLabel>
              <FormControl>
                <Input type="email" placeholder="you@example.com" {...field} className="font-body"/>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-headline">
          Save Details
        </Button>
      </form>
    </Form>
  );
}