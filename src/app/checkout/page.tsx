'use client';
import UserInfoForm from '@/components/checkout/UserInfoForm';
import PaymentForm from '@/components/checkout/PaymentForm';
import CartDisplay from '@/components/cart/CartDisplay';
import { useOrder } from '@/context/OrderContext';
import { useEffect } from 'react';
import { useRouter }