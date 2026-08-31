'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { useCart } from '@/hooks/use-cart';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/providers/auth-provider';

export default function CartPage() {
  const { user, loading: authLoading } = useAuth();
  const { data: cart, isLoading, updateQty, removeItem } = useCart();

  if (authLoading || isLoading) return <p className="text-text-muted">Loading cart...</p>;

  if (!user) {
    return (
      <div className="rounded-card border border-border bg-surface p-8 text-center">
        <p className="text-text-muted">Please log in to view your cart.</p>
        <Link href="/login">
          <Button className="mt-4">Login</Button>
        </Link>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="rounded-card border border-border bg-surface p-8 text-center">
        <p className="text-text-muted">Your cart is empty.</p>
        <Link href="/">
          <Button className="mt-4">Start Shopping</Button>
        </Link>
      </div>
    );
  }

  const trustCoinsEstimate = Math.floor(cart.total * 0.05);

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
      <div>
        <h1 className="mb-4 text-xl font-bold text-text-primary">My Cart ({cart.items.length})</h1>
        <div className="divide-y divide-border rounded-card border border-border bg-surface">
          {cart.items.map((item) => (
            <div key={item.id} className="flex items-center gap-4 p-4">
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-btn bg-bg">
                {item.productImage && (
                  <Image src={item.productImage} alt={item.productTitle} fill className="object-cover" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="truncate text-sm font-medium text-text-primary">{item.productTitle}</h3>
                <p className="text-xs text-text-muted">{item.storeName}</p>
              </div>

              <div className="flex items-center gap-2 rounded-btn border border-border">
                <button
                  className="p-2 text-text-muted"
                  onClick={() => updateQty.mutate({ itemId: item.id, qty: item.qty - 1 })}
                  disabled={item.qty <= 1}
                >
                  <Minus size={14} />
                </button>
                <span className="w-6 text-center text-sm">{item.qty}</span>
                <button
                  className="p-2 text-text-muted"
                  onClick={() => updateQty.mutate({ itemId: item.id, qty: item.qty + 1 })}
                  disabled={item.qty >= item.stock}
                >
                  <Plus size={14} />
                </button>
              </div>

              <span className="w-16 text-right font-medium text-text-primary">
                ${(item.price * item.qty).toFixed(0)}
              </span>

              <button
                onClick={() => removeItem.mutate(item.id)}
                className="text-text-muted hover:text-danger"
                aria-label="Remove item"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="h-fit rounded-card border border-border bg-surface p-4">
        <h2 className="mb-3 font-bold text-text-primary">Order Summary</h2>
        <div className="space-y-2 text-sm text-text-muted">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>${cart.subtotal.toFixed(0)}</span>
          </div>
          <div className="flex justify-between">
            <span>Shipping</span>
            <span className="text-success">FREE</span>
          </div>
          <div className="flex justify-between">
            <span>Tax</span>
            <span>${cart.tax.toFixed(0)}</span>
          </div>
        </div>
        <div className="mt-3 flex justify-between border-t border-border pt-3 font-bold text-text-primary">
          <span>Total</span>
          <span>${cart.total.toFixed(0)}</span>
        </div>
        <p className="mt-2 text-xs text-text-muted">You will earn {trustCoinsEstimate} TrustCoins</p>

        <Link href="/checkout">
          <Button className="mt-4 w-full">Proceed to Checkout</Button>
        </Link>
      </div>
    </div>
  );
}