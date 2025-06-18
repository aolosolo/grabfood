'use client';

import type { ReactNode } from 'react';
import React, { createContext, useContext, useState, useEffect } from 'react';
import type { OrderContextType, CartItem, FoodItem, UserDetails, PaymentDetails } from '@/lib/types';

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const OrderProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>(() => {
    if (typeof window !== 'undefined') {
      const savedCart = localStorage.getItem('fastGrabCart');
      return savedCart ? JSON.parse(savedCart) : [];
    }
    return [];
  });
  const [userDetails, setUserDetailsState] = useState<UserDetails | null>(() => {
     if (typeof window !== 'undefined') {
      const savedUserDetails = localStorage.getItem('fastGrabUserDetails');
      return savedUserDetails ? JSON.parse(savedUserDetails) : null;
    }
    return null;
  });
  const [paymentDetails, setPaymentDetailsState] = useState<PaymentDetails | null>(null); // Payment details are not typically persisted in local storage for security

  useEffect(() => {
    localStorage.setItem('fastGrabCart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    if (userDetails) {
      localStorage.setItem('fastGrabUserDetails', JSON.stringify(userDetails));
    } else {
      localStorage.removeItem('fastGrabUserDetails');
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