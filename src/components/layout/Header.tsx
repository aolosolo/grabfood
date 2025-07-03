
'use client';
import Link from 'next/link';
import { ShoppingCart, UtensilsCrossed, Shield } from 'lucide-react';
import { useOrder } from '@/context/OrderContext';
import { Badge } from '@/components/ui/badge';
import { useState, useEffect } from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export default function Header() {
  const { cart } = useOrder();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <header className="bg-card shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2">
          <UtensilsCrossed className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-headline text-primary">FastGrab</h1>
        </Link>
        <nav className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link href="/admin/login" className="relative p-2 hover:text-primary transition-colors">
                  <Shield className="h-7 w-7" />
                  <span className="sr-only">Admin Panel</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent>
                <p>Admin Panel</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
             <Tooltip>
                <TooltipTrigger asChild>
                  <Link href="/checkout" className="relative p-2 hover:text-primary transition-colors">
                    <ShoppingCart className="h-7 w-7" />
                    {isClient && totalItems > 0 && (
                      <Badge variant="destructive" className="absolute -top-1 -right-1 px-2 py-0.5 text-xs">
                        {totalItems}
                      </Badge>
                    )}
                    <span className="sr-only">View Cart</span>
                  </Link>
               </TooltipTrigger>
                <TooltipContent>
                  <p>View Cart</p>
                </TooltipContent>
              </Tooltip>
          </TooltipProvider>
        </nav>
      </div>
    </header>
  );
}
