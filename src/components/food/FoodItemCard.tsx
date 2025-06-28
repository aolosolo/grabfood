'use client';

import Image from 'next/image';
import type { FoodItem } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
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
    <Card className="flex flex-col overflow-hidden h-full shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="p-0">
        <div className="aspect-[3/2] relative w-full">
          <Image
            src={item.imageUrl}
            alt={item.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover"
            data-ai-hint={item.dataAiHint}
          />
        </div>
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <CardTitle className="text-xl mb-1 font-headline">{item.name}</CardTitle>
        <CardDescription className="text-sm text-muted-foreground mb-2 font-body">{item.description}</CardDescription>
        
        {item.category === 'pizza' && item.flavors && item.flavors.length > 0 && (
          <div className="my-3">
            <Label htmlFor={`flavor-${item.id}`} className="text-sm font-medium font-body">Choose Flavor:</Label>
            <Select value={selectedFlavor} onValueChange={setSelectedFlavor}>
              <SelectTrigger id={`flavor-${item.id}`} className="w-full mt-1">
                <SelectValue placeholder="Select a flavor" />
              </SelectTrigger>
              <SelectContent>
                {item.flavors.map(flavor => (
                  <SelectItem key={flavor} value={flavor}>{flavor}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </CardContent>
      <CardFooter className="p-4 flex-col items-start w-full border-t mt-auto">
        <p className="text-lg font-bold text-primary font-headline mb-2">${item.price.toFixed(2)}</p>
        <Button onClick={handleAddToCart} variant="default" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
          <PlusCircle className="mr-2 h-4 w-4" /> Add to Cart
        </Button>
      </CardFooter>
    </Card>
  );
}
