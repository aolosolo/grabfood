
'use client';

import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

export default function MainLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isCheckout = pathname.startsWith('/checkout');

  return (
    <main
      className={cn(
        'flex-grow py-8',
        isCheckout ? 'px-0' : 'container mx-auto px-4'
      )}
    >
      {children}
    </main>
  );
}
