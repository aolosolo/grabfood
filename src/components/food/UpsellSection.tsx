'use client';

import { useEffect, useState } from 'react';
import { useOrder } from '@/context/OrderContext';
import { getUpsellRecommendations } from '@/app/actions';
import { foodItemsData } from '@/lib/data'; // Assuming mock data has all items
import type { FoodItem } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import Image from 'next/image';
import { Sparkles, ShoppingCart } from 'lucide-react';

export default function UpsellSection() {
  const { cart, addToCart } = useOrder();
  const [recommendations, setRecommendations] = useState<FoodItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (cart.length > 0) {
      const fetchRecommendations = async () => {
        setIsLoading(true);
        const selectedItems = cart.map(item => item.name);
        const availableItems = foodItemsData.map(item => item.name);
        try {
          const result = await getUpsellRecommendations({ selectedItems, availableItems });
          // Map recommendation names back to full FoodItem objects from mock data
          const recommendedItems = result.recommendations
            .map(name => foodItemsData.find(item => item.name === name && !cart.some(cartItem => cartItem.id === item.id)))
            .filter((item): item is FoodItem => !!item) // Type guard and remove undefined
            .slice(0, 3); // Limit to 3 recommendations
          setRecommendations(recommendedItems);
        } catch (error) {
          console.error('Failed to fetch upsell recommendations:', error);
          setRecommendations([]);
        } finally {
          setIsLoading(false);
        }
      };
      fetchRecommendations();
    } else {
      setRecommendations([]);
    }
  }, [cart]);

  const handleAddRecommendationToCart = (item: FoodItem) => {
    addToCart(item);
  };

  if (isLoading) {
    return (
      <div className="mt-8 pt-6 border-t">
        <h3 className="font-headline text-xl text-primary flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-accent animate-pulse" />
          <span>Finding some extras for you...</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="p-4 border rounded-lg animate-pulse bg-muted/50">
              <div className="w-full h-32 bg-muted rounded-md mb-2"></div>
              <div className="h-4 bg-muted rounded w-3/4 mb-1"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  if (recommendations.length === 0) {
     return null; // Don't show if no recommendations or still loading
  }

  return (
    <div className="mt-8 pt-6 border-t">
      <h3 className="font-headline text-xl text-primary flex items-center gap-2">
         <Sparkles className="h-5 w-5 text-accent" />
        <span>You might also like...</span>
      </h3>
      <p className="font-body text-sm text-muted-foreground mb-4">Enhance your meal with these popular additions!</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {recommendations.map(item => (
          <Card key={item.id} className="overflow-hidden flex flex-col">
            <div className="relative w-full h-32">
                <Image src={item.imageUrl} alt={item.name} fill className="object-cover" data-ai-hint={item.dataAiHint} sizes="150px"/>
            </div>
            <CardHeader className="pb-2 pt-3">
              <CardTitle className="text-md font-headline">{item.name}</CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground pb-2 pt-0 flex-grow">
              <p>{item.description.substring(0,50)}...</p>
            </CardContent>
            <CardFooter className="flex justify-between items-center pt-2 pb-3 px-4">
              <span className="font-bold text-primary font-headline text-sm">${item.price.toFixed(2)}</span>
              <Button size="xs" variant="outline" onClick={() => handleAddRecommendationToCart(item)} className="text-accent border-accent hover:bg-accent/10">
                <ShoppingCart className="mr-1 h-3 w-3" /> Add
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
