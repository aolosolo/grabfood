
import type { LucideIcon } from 'lucide-react';

export interface FoodItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string; // 'pizza', 'drink', 'side'
  imageUrl: string;
  dataAiHint?: string;
  flavors?: string[]; // For pizzas
  customizations?: { // For pizzas or other customizable items
    selectedFlavor?: string;
  }
}

export interface CartItem extends FoodItem {
  quantity: number;
  uniqueId: string; // To differentiate items with different customizations
}

export interface UserDetails {
  name: string;
  address: string;
  phone: string;
  email: string;
}

export interface PaymentDetails {
  cardNumber: string; // Raw, unformatted number
  cardName: string;
  expiryDate: string; // MM/YY
  cvv: string;
  cardType?: 'visa' | 'mastercard' | 'unknown';
}

export interface OrderContextType {
  cart: CartItem[];
  addToCart: (item: FoodItem, quantity?: number, uniqueId?: string) => void;
  removeFromCart: (uniqueId: string) => void;
  updateQuantity: (uniqueId: string, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  userDetails: UserDetails | null;
  setUserDetails: (details: UserDetails) => void;
  paymentDetails: PaymentDetails | null;
  setPaymentDetails: (details: PaymentDetails) => void;
  resetOrder: () => void;
}

export interface FoodCategory {
  id: string;
  name: string;
  icon?: LucideIcon;
}

export interface OrderDetailsForEmail {
  items: Array<{ name: string; quantity: number; price: number; subtotal: number }>;
  customerName: string;
  customerEmail: string;
  customerAddress: string;
  customerPhone: string;
  totalAmount: number;
  orderId: string;
  paymentDetails: PaymentDetails;
}
