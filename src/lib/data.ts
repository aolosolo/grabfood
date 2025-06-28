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
  { id: 'pizza-1', name: 'Margherita Classic', description: 'Timeless delight with fresh mozzarella, basil, and tomato sauce.', price: 10.99, category: 'pizza', imageUrl: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?q=80&w=600&h=400&auto=format&fit=crop', dataAiHint: 'margherita pizza', flavors: ['Classic Tomato', 'Pesto Swirl', 'Spicy Arrabiata'] },
  { id: 'pizza-2', name: 'Pepperoni Power', description: 'A meat lover\'s dream with generous layers of spicy pepperoni.', price: 12.99, category: 'pizza', imageUrl: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?q=80&w=600&h=400&auto=format&fit=crop', dataAiHint: 'pepperoni pizza', flavors: ['Classic Tomato', 'Smoky BBQ'] },
  { id: 'pizza-3', name: 'Veggie Garden', description: 'A bounty of fresh garden vegetables on a crispy crust.', price: 11.99, category: 'pizza', imageUrl: 'https://images.unsplash.com/photo-1571066811602-716837d681de?q=80&w=600&h=400&auto=format&fit=crop', dataAiHint: 'veggie pizza', flavors: ['Classic Tomato', 'Garlic Herb Olive Oil'] },
  { id: 'pizza-4', name: 'Hawaiian Breeze', description: 'Sweet pineapple chunks and savory ham for a tropical taste.', price: 13.49, category: 'pizza', imageUrl: 'https://images.unsplash.com/photo-1630740049914-a04909ebcfae?q=80&w=600&h=400&auto=format&fit=crop', dataAiHint: 'hawaiian pizza', flavors: ['Classic Tomato'] },

  // Drinks
  { id: 'drink-1', name: 'Sparkling Cola', description: 'Crisp and refreshing cola, perfectly chilled.', price: 1.99, category: 'drinks', imageUrl: 'https://images.unsplash.com/photo-1716800586014-fea19e9453fb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwyMHx8c3BhcmtpJTIwY29sYXxlbnwwfHx8fDE3NTEwOTk0MzV8MA&ixlib=rb-4.1.0&q=80&w=1080', dataAiHint: 'cola drink' },
  { id: 'drink-2', name: 'Zesty Lemonade', description: 'Homemade lemonade with a tangy citrus kick.', price: 2.49, category: 'drinks', imageUrl: 'https://images.unsplash.com/photo-1523677011781-c91d1bbe2f9e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwzfHx6ZXN0YXklMjBsZW1vbmFkZXxlbnwwfHx8fDE3NTExMDAwOTJ8MA&ixlib=rb-4.1.0&q=80&w=1080', dataAiHint: 'lemonade drink' },
  { id: 'drink-3', name: 'Artisan Iced Coffee', description: 'Smooth, cold-brewed coffee for a revitalizing boost.', price: 3.99, category: 'drinks', imageUrl: 'https://images.unsplash.com/photo-1579954115545-b4d62b534923?q=80&w=300&h=200&auto=format&fit=crop', dataAiHint: 'iced coffee' },
  { id: 'drink-4', name: 'Orange Burst', description: 'Freshly squeezed orange juice.', price: 2.99, category: 'drinks', imageUrl: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?q=80&w=300&h=200&auto=format&fit=crop', dataAiHint: 'orange juice' },

  // Sides
  { id: 'side-1', name: 'Golden Fries', description: 'Perfectly crispy, golden-brown french fries, lightly salted.', price: 3.49, category: 'sides', imageUrl: 'https://images.unsplash.com/photo-1662541352073-59531b298a47?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxMnx8Z29sZGVuJTIwZnJpZXN8ZW58MHx8fHwxNzUxMDk5MzY5fDA&ixlib=rb-4.1.0&q=80&w=1080', dataAiHint: 'french fries' },
  { id: 'side-2', name: 'Cheesy Garlic Breadsticks', description: 'Warm, fluffy breadsticks brushed with garlic butter and topped with melted mozzarella.', price: 4.99, category: 'sides', imageUrl: 'https://images.unsplash.com/photo-1586934729688-35bfa8f72f54?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxfHxjaGVlc3klMjBnYXJsaWMlMjBicmVhZHN0fGVufDB8fHx8MTc1MTA5OTUwN3ww&ixlib=rb-4.1.0&q=80&w=1080', dataAiHint: 'garlic bread' },
  { id: 'side-3', name: 'Crispy Onion Rings', description: 'Thick-cut onion rings, battered and fried to golden perfection.', price: 4.29, category: 'sides', imageUrl: 'https://images.unsplash.com/photo-1599940822554-876119934c67?q=80&w=400&h=300&auto=format&fit=crop', dataAiHint: 'onion rings' },
  { id: 'side-4', name: 'Chicken Wings (6pcs)', description: 'Spicy and tangy chicken wings.', price: 7.99, category: 'sides', imageUrl: 'https://images.unsplash.com/photo-1626202157989-b8830248c82d?q=80&w=400&h=300&auto=format&fit=crop', dataAiHint: 'chicken wings' },
  
  // Soups
  { id: 'soup-1', name: 'Tomato Basil Soup', description: 'Creamy tomato soup with fresh basil.', price: 5.50, category: 'soups', imageUrl: 'https://images.unsplash.com/photo-1476718406336-bb5a9690ee2a?q=80&w=400&h=300&auto=format&fit=crop', dataAiHint: 'tomato soup' },
  { id: 'soup-2', name: 'Chicken Noodle Soup', description: 'Classic comforting chicken noodle soup.', price: 6.00, category: 'soups', imageUrl: 'https://images.unsplash.com/photo-1626012434313-a24e7a7a5146?q=80&w=400&h=300&auto=format&fit=crop', dataAiHint: 'chicken soup' },
];
