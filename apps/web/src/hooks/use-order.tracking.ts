'use client';

import { useEffect, useState } from 'react';
import { getSocket } from '@/lib/socket';
import { Order } from '@/lib/orders-api';

export function useOrderTracking(initialOrder: Order) {
  const [order, setOrder] = useState<Order>(initialOrder);

  useEffect(() => {
    setOrder(initialOrder);
  }, [initialOrder]);

  useEffect(() => {
    const socket = getSocket();
    socket.emit('join', { orderId: initialOrder.id });

    const handleUpdate = (payload: { subOrderId: string; trackingStatus: string }) => {
      setOrder((prev) => ({
        ...prev,
        subOrders: prev.subOrders.map((so) =>
          so.id === payload.subOrderId ? { ...so, trackingStatus: payload.trackingStatus } : so,
        ),
      }));
    };

    socket.on('tracking:update', handleUpdate);
    return () => {
      socket.off('tracking:update', handleUpdate);
    };
  }, [initialOrder.id]);

  return order;
}