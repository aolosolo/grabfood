'use client';
import FoodItemCard from '@/components/food/FoodItemCard';
import CartDisplay from '@/components/cart/CartDisplay';
import UpsellSection from '@/components/food/UpsellSection';
import { foodItemsData, foodCategoriesData } from '@/lib/data';
import type { FoodCategory } from '@/lib/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { useState, useMemo } from 'react';

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<string>(foodCategoriesData[0]?.id || 'all');

  const filteredItems = useMemo(() => {
    if (activeTab === 'all') return foodItemsData;
    return foodItemsData.filter(item => item.category === activeTab);
  }, [activeTab]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
      <div className="lg:col-span-2">
        <h2 className="text-4xl font-headline text-primary mb-6">Explore Our Menu</h2>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mb-6">
          <ScrollArea className="w-full whitespace-nowrap rounded-md border-0">
            <TabsList className="bg-transparent p-0 gap-2">
              <TabsTrigger 
                value="all" 
                className="font-headline data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md px-4 py-2 rounded-lg"
              >
                All Items
              </TabsTrigger>
              {foodCategoriesData.map((category: FoodCategory) => (
                <TabsTrigger 
                  key={category.id} 
                  value={category.id}
                  className="font-headline data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md px-4 py-2 rounded-lg"
                >
                  {category.icon && <category.icon className="mr-2 h-5 w-5 inline-block" />}
                  {category.name}
                </TabsTrigger>
              ))}
            </TabsList>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </Tabs>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredItems.map(item => (
            <FoodItemCard key={`${item.id}-${item.category}`} item={item} />
          ))}
        </div>
        <UpsellSection />
      </div>

      <div className="lg:col-span-1 lg:sticky lg:top-24">
        <CartDisplay />
      </div>
    </div>
  );
}