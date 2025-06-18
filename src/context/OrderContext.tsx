
'use client';

import type { ReactNode } from 'react';
import React, { createContext, useContext, useState, useEffect } from 'react';
import type { OrderContextType, CartItem, FoodItem, UserDetails, PaymentDetails } from '@/lib/types';

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const OrderProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]); // Initialize with empty array
  const [userDetails, setUserDetailsState] = useState<UserDetails | null>(null); // Initialize with null
  const [paymentDetails, setPaymentDetailsState] = useState<PaymentDetails | null>(null);

  useEffect(() => {
    // This effect runs only on the client after the component mounts
    const savedCart = localStorage.getItem('fastGrabCart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }

    const savedUserDetails = localStorage.getItem('fastGrabUserDetails');
    if (savedUserDetails) {
      setUserDetailsState(JSON.parse(savedUserDetails));
    }
  }, []); // Empty dependency array ensures this runs once on mount

  useEffect(() => {
    // Persist cart to localStorage whenever it changes, but only after initial client-side load
    // The check for `typeof window` is less critical here if the first load is handled,
    // but doesn't hurt.
    if (typeof window !== 'undefined') {
        localStorage.setItem('fastGrabCart', JSON.stringify(cart));
    }
  }, [cart]);

  useEffect(() => {
    // Persist userDetails to localStorage whenever it changes
    if (typeof window !== 'undefined') {
        if (userDetails) {
        localStorage.setItem('fastGrabUserDetails', JSON.stringify(userDetails));
        } else {
        localStorage.removeItem('fastGrabUserDetails');
        }
    }
  }, [userDetails]);

  const addToCart = (item: FoodItem, quantity: number = 1, uniqueIdSuffix?: string) => {
    setCart(prevCart => {
      const baseUniqueId = item.customizations?.selectedFlavor ? `${item.id}-${item.customizations.selectedFlavor}` : item.id;
      const uniqueId = uniqueIdSuffix ? `${baseUniqueId}-${uniqueIdSuffix}` : baseUniqueId;
      
      const existingItem = prevCart.find(cartItem => cartItem.uniqueId === uniqueId);
      if (existingItem) {
        return prevCart.map(cartItem =>
          cartItem.uniqueId === uniqueId
            ? { ...cartItem, quantity: cartItem.quantity + quantity }
            : cartItem
        );
      }
      return [...prevCart, { ...item, quantity, uniqueId }];
    });
  };

  const removeFromCart = (uniqueId: string) => {
    setCart(prevCart => prevCart.filter(item => item.uniqueId !== uniqueId));
  };

  const updateQuantity = (uniqueId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(uniqueId);
    } else {
      setCart(prevCart =>
        prevCart.map(item =>
          item.uniqueId === uniqueId ? { ...item, quantity } : item
        )
      );
    }
  };

  const clearCart = () => {
    setCart([]);
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };
  
  const setUserDetails = (details: UserDetails) => {
    setUserDetailsState(details);
  };

  const setPaymentDetails = (details: PaymentDetails) => {
    setPaymentDetailsState(details);
  };

  const resetOrder = () => {
    clearCart();
    setUserDetailsState(null);
    setPaymentDetailsState(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('fastGrabUserDetails');
      // Note: cart will be cleared via clearCart() which updates localStorage through its own effect.
    }
  };

  return (
    <OrderContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
        userDetails,
        setUserDetails,
        paymentDetails,
        setPaymentDetails,
        resetOrder,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
};

export const useOrder = (): OrderContextType => {
  const context = useContext(OrderContext);
  if (context === undefined) {
    throw new Error('useOrder must be used within an OrderProvider');
  }
  return context;
};
