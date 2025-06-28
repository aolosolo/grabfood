'use client';

import Image from 'next/image';
import type { FoodItem } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardTitle } from '@/components/ui/card';
import { useOrder } from '@/context/OrderContext';
import { useState } from 'react';
import { PlusCircle } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface FoodItemCardProps {
  item: FoodItem;
}

export default function FoodItemCard({ item }: FoodItemCardProps) {
  const { addToCart } = useOrder();
  const [selectedFlavor, setSelectedFlavor] = useState<string | undefined>(item.flavors ? item.flavors[0] : undefined);

  const handleAddToCart = () => {
    const itemToAdd: FoodItem = {
      ...item,
      customizations: item.category === 'pizza' && selectedFlavor ? { selectedFlavor } : undefined,
    };
    const uniqueIdSuffix = item.category === 'pizza' && selectedFlavor ? selectedFlavor.replace(/\s+/g, '-') : undefined;
    addToCart(itemToAdd, 1, uniqueIdSuffix);
  };

  return (
    <Card className="flex flex-row sm:flex-col overflow-hidden h-full shadow-lg hover:shadow-xl transition-shadow duration-300">
      {/* Image container */}
      <div className="relative w-28 sm:w-full h-auto sm:aspect-[3/2] flex-shrink-0">
        <Image
          src={item.imageUrl}
          alt={item.name}
          fill
          sizes="(max-width: 639px) 30vw, (max-width: 1023px) 50vw, 25vw"
          className="object-cover"
          data-ai-hint={item.dataAiHint}
        />
      </div>
      
      {/* Content wrapper */}
      <div className="flex flex-col flex-grow p-3 sm:p-4 justify-between">
        <div>
          <CardTitle className="text-base sm:text-xl font-headline leading-tight">{item.name}</CardTitle>
          <CardDescription className="text-xs text-muted-foreground mt-1 font-body hidden sm:block">
            {item.description}
          </CardDescription>

          {item.category === 'pizza' && item.flavors && item.flavors.length > 0 && (
            <div className="mt-2 sm:my-3">
              <Label htmlFor={`flavor-${item.id}`} className="sr-only sm:not-sr-only text-xs sm:text-sm font-medium font-body">Flavor:</Label>
              <Select value={selectedFlavor} onValueChange={setSelectedFlavor}>
                <SelectTrigger id={`flavor-${item.id}`} className="w-full mt-1 h-8 text-xs sm:h-9 sm:text-sm">
                  <SelectValue placeholder="Select a flavor" />
                </SelectTrigger>
                <SelectContent>
                  {item.flavors.map(flavor => (
                    <SelectItem key={flavor} value={flavor} className="text-xs sm:text-sm">{flavor}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between mt-2">
          <p className="text-base sm:text-lg font-bold text-primary font-headline">${item.price.toFixed(2)}</p>
          <Button onClick={handleAddToCart} size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground whitespace-nowrap text-xs h-8 px-2 sm:text-sm sm:h-9 sm:px-3">
            <PlusCircle className="mr-1 h-4 w-4" /> Add
          </Button>
        </div>
      </div>
    </Card>
  );
}
