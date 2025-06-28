'use client';

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import type { UseFormReturn } from 'react-hook-form';

interface UserInfoFormData {
    name: string;
    address: string;
    phone: string;
    email: string;
}

interface UserInfoFormProps {
  form: UseFormReturn<UserInfoFormData>;
}

export default function UserInfoForm({ form }: UserInfoFormProps) {
  return (
    <Form {...form}>
      <div className="space-y-6">
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
      </div>
    </Form>
  );
}
