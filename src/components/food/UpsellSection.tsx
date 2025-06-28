'use client';

import { useEffect, useState } from 'react';
import { useOrder } from '@/context/OrderContext';
import { getUpsellRecommendations } from '@/app/actions';
import { foodItemsData } from '@/lib/data';
import type { FoodItem } from '@/lib/types';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { Sparkles, Plus } from 'lucide-react';

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
             <div key={index} className="flex items-center gap-4 p-3 border rounded-lg bg-muted/50 animate-pulse">
                <div className="w-12 h-12 bg-muted rounded-md shrink-0"></div>
                <div className="flex-grow space-y-2">
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                </div>
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
          <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg bg-card shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4 overflow-hidden">
                <Image src={item.imageUrl} alt={item.name} width={48} height={48} className="rounded-md object-cover shrink-0" data-ai-hint={item.dataAiHint} />
                <div className="overflow-hidden">
                  <h5 className="font-headline text-base truncate" title={item.name}>{item.name}</h5>
                  <p className="font-body text-sm font-bold text-primary">${item.price.toFixed(2)}</p>
                </div>
              </div>
              <Button size="sm" variant="outline" onClick={() => handleAddRecommendationToCart(item)} className="shrink-0 text-accent border-accent hover:bg-accent/10 ml-2">
                <Plus className="mr-1 h-4 w-4" /> Add
              </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
