import type { FoodItem, FoodCategory } from '@/lib/types';
import { Pizza, CupSoda, Sandwich, Soup } from 'lucide-react'; // Sandwich instead of FrenchFries for variety, Soup for another example

export const foodCategoriesData: FoodCategory[] = [
  { id: 'pizza', name: 'Pizzas', icon: Pizza },
  { id: 'drinks', name: 'Drinks', icon: CupSoda },
  { id: 'sides', name: 'Sides', icon: Sandwich }, // Changed to Sandwich for demo
  { id: 'soups', name: 'Soups', icon: Soup }, // Added Soups for demo
];

export const foodItemsData: FoodItem[] = [
  // Pizzas
  { id: 'pizza-1', name: 'Margherita Classic', description: 'Timeless delight with fresh mozzarella, basil, and tomato sauce.', price: 10.99, category: 'pizza', imageUrl: 'https://images.unsplash.com/photo-1598021680133-eb3a73319420?q=80&w=600&h=400&auto=format&fit=crop', dataAiHint: 'margherita pizza', flavors: ['Classic Tomato', 'Pesto Swirl', 'Spicy Arrabiata'] },
  { id: 'pizza-2', name: 'Pepperoni Power', description: 'A meat lover\'s dream with generous layers of spicy pepperoni.', price: 12.99, category: 'pizza', imageUrl: 'https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?q=80&w=600&h=400&auto=format&fit=crop', dataAiHint: 'pepperoni pizza', flavors: ['Classic Tomato', 'Smoky BBQ'] },
  { id: 'pizza-3', name: 'Veggie Garden', description: 'A bounty of fresh garden vegetables on a crispy crust.', price: 11.99, category: 'pizza', imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=600&h=400&auto=format&fit=crop', dataAiHint: 'veggie pizza', flavors: ['Classic Tomato', 'Garlic Herb Olive Oil'] },
  { id: 'pizza-4', name: 'Hawaiian Breeze', description: 'Sweet pineapple chunks and savory ham for a tropical taste.', price: 13.49, category: 'pizza', imageUrl: 'https://images.unsplash.com/photo-1594007654729-407eedc4be65?q=80&w=600&h=400&auto=format&fit=crop', dataAiHint: 'hawaiian pizza', flavors: ['Classic Tomato'] },


  // Drinks
  { id: 'drink-1', name: 'Sparkling Cola', description: 'Crisp and refreshing cola, perfectly chilled.', price: 1.99, category: 'drinks', imageUrl: 'https://images.unsplash.com/photo-1554866585-CD94860890b7?q=80&w=300&h=200&auto=format&fit=crop', dataAiHint: 'cola drink' },
  { id: 'drink-2', name: 'Zesty Lemonade', description: 'Homemade lemonade with a tangy citrus kick.', price: 2.49, category: 'drinks', imageUrl: 'https://images.unsplash.com/photo-1623592873328-91c063548984?q=80&w=300&h=200&auto=format&fit=crop', dataAiHint: 'lemonade drink' },
  { id: 'drink-3', name: 'Artisan Iced Coffee', description: 'Smooth, cold-brewed coffee for a revitalizing boost.', price: 3.99, category: 'drinks', imageUrl: 'https://images.unsplash.com/photo-1517701550927-20c5ba1dc450?q=80&w=300&h=200&auto=format&fit=crop', dataAiHint: 'iced coffee' },
  { id: 'drink-4', name: 'Orange Burst', description: 'Freshly squeezed orange juice.', price: 2.99, category: 'drinks', imageUrl: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?q=80&w=300&h=200&auto=format&fit=crop', dataAiHint: 'orange juice' },

  // Sides
  { id: 'side-1', name: 'Golden Fries', description: 'Perfectly crispy, golden-brown french fries, lightly salted.', price: 3.49, category: 'sides', imageUrl: 'https://images.unsplash.com/photo-1576107232684-827a33c87285?q=80&w=400&h=300&auto=format&fit=crop', dataAiHint: 'french fries' },
  { id: 'side-2', name: 'Cheesy Garlic Breadsticks', description: 'Warm, fluffy breadsticks brushed with garlic butter and topped with melted mozzarella.', price: 4.99, category: 'sides', imageUrl: 'https://images.unsplash.com/photo-1628599426359-93336464f16a?q=80&w=400&h=300&auto=format&fit=crop', dataAiHint: 'garlic bread' },
  { id: 'side-3', name: 'Crispy Onion Rings', description: 'Thick-cut onion rings, battered and fried to golden perfection.', price: 4.29, category: 'sides', imageUrl: 'https://images.unsplash.com/photo-1639049282946-77864070a759?q=80&w=400&h=300&auto=format&fit=crop', dataAiHint: 'onion rings' },
  { id: 'side-4', name: 'Chicken Wings (6pcs)', description: 'Spicy and tangy chicken wings.', price: 7.99, category: 'sides', imageUrl: 'https://images.unsplash.com/photo-1589301773957-bb03b96c054d?q=80&w=400&h=300&auto=format&fit=crop', dataAiHint: 'chicken wings' },
  
  // Soups
  { id: 'soup-1', name: 'Tomato Basil Soup', description: 'Creamy tomato soup with fresh basil.', price: 5.50, category: 'soups', imageUrl: 'https://images.unsplash.com/photo-1598515213692-5f284528df54?q=80&w=400&h=300&auto=format&fit=crop', dataAiHint: 'tomato soup' },
  { id: 'soup-2', name: 'Chicken Noodle Soup', description: 'Classic comforting chicken noodle soup.', price: 6.00, category: 'soups', imageUrl: 'https://images.unsplash.com/photo-1605373677494-a8c4b125a4d6?q=80&w=400&h=300&auto=format&fit=crop', dataAiHint: 'chicken soup' },
];
