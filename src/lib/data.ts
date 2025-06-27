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
  { id: 'pizza-1', name: 'Margherita Classic', description: 'Timeless delight with fresh mozzarella, basil, and tomato sauce.', price: 10.99, category: 'pizza', imageUrl: 'https://placehold.co/600x400.png', dataAiHint: 'margherita pizza', flavors: ['Classic Tomato', 'Pesto Swirl', 'Spicy Arrabiata'] },
  { id: 'pizza-2', name: 'Pepperoni Power', description: 'A meat lover\'s dream with generous layers of spicy pepperoni.', price: 12.99, category: 'pizza', imageUrl: 'https://placehold.co/600x400.png', dataAiHint: 'pepperoni pizza', flavors: ['Classic Tomato', 'Smoky BBQ'] },
  { id: 'pizza-3', name: 'Veggie Garden', description: 'A bounty of fresh garden vegetables on a crispy crust.', price: 11.99, category: 'pizza', imageUrl: 'https://placehold.co/600x400.png', dataAiHint: 'veggie pizza', flavors: ['Classic Tomato', 'Garlic Herb Olive Oil'] },
  { id: 'pizza-4', name: 'Hawaiian Breeze', description: 'Sweet pineapple chunks and savory ham for a tropical taste.', price: 13.49, category: 'pizza', imageUrl: 'https://placehold.co/600x400.png', dataAiHint: 'hawaiian pizza', flavors: ['Classic Tomato'] },


  // Drinks
  { id: 'drink-1', name: 'Sparkling Cola', description: 'Crisp and refreshing cola, perfectly chilled.', price: 1.99, category: 'drinks', imageUrl: 'https://placehold.co/300x200.png', dataAiHint: 'cola drink' },
  { id: 'drink-2', name: 'Zesty Lemonade', description: 'Homemade lemonade with a tangy citrus kick.', price: 2.49, category: 'drinks', imageUrl: 'https://placehold.co/300x200.png', dataAiHint: 'lemonade drink' },
  { id: 'drink-3', name: 'Artisan Iced Coffee', description: 'Smooth, cold-brewed coffee for a revitalizing boost.', price: 3.99, category: 'drinks', imageUrl: 'https://placehold.co/300x200.png', dataAiHint: 'iced coffee' },
  { id: 'drink-4', name: 'Orange Burst', description: 'Freshly squeezed orange juice.', price: 2.99, category: 'drinks', imageUrl: 'https://placehold.co/300x200.png', dataAiHint: 'orange juice' },

  // Sides
  { id: 'side-1', name: 'Golden Fries', description: 'Perfectly crispy, golden-brown french fries, lightly salted.', price: 3.49, category: 'sides', imageUrl: 'https://placehold.co/400x300.png', dataAiHint: 'french fries' },
  { id: 'side-2', name: 'Cheesy Garlic Breadsticks', description: 'Warm, fluffy breadsticks brushed with garlic butter and topped with melted mozzarella.', price: 4.99, category: 'sides', imageUrl: 'https://placehold.co/400x300.png', dataAiHint: 'garlic bread' },
  { id: 'side-3', name: 'Crispy Onion Rings', description: 'Thick-cut onion rings, battered and fried to golden perfection.', price: 4.29, category: 'sides', imageUrl: 'https://placehold.co/400x300.png', dataAiHint: 'onion rings' },
  { id: 'side-4', name: 'Chicken Wings (6pcs)', description: 'Spicy and tangy chicken wings.', price: 7.99, category: 'sides', imageUrl: 'https://placehold.co/400x300.png', dataAiHint: 'chicken wings' },
  
  // Soups
  { id: 'soup-1', name: 'Tomato Basil Soup', description: 'Creamy tomato soup with fresh basil.', price: 5.50, category: 'soups', imageUrl: 'https://placehold.co/400x300.png', dataAiHint: 'tomato soup' },
  { id: 'soup-2', name: 'Chicken Noodle Soup', description: 'Classic comforting chicken noodle soup.', price: 6.00, category: 'soups', imageUrl: 'https://placehold.co/400x300.png', dataAiHint: 'chicken soup' },
];
