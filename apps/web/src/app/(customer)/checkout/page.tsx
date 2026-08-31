'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Truck, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCart } from '@/hooks/use-cart';
import { addressApi } from '@/lib/address-api';
import { ordersApi } from '@/lib/orders-api';
import { useToast } from '@/components/ui/toast';
import { couponsApi } from '@/lib/coupons-api';
import { userApi } from '@/lib/user-api';

export default function CheckoutPage() {
  const router = useRouter();
  const { show } = useToast();
  const queryClient = useQueryClient();
  const { data: cart } = useCart();

  const { data: addresses, refetch } = useQuery({
    queryKey: ['addresses'],
    queryFn: addressApi.list,
  });

  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [showNewAddress, setShowNewAddress] = useState(false);
  const [newAddress, setNewAddress] = useState({ label: '', line1: '', city: '', country: '' });
  const [savingAddress, setSavingAddress] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState('');
    const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number } | null>(null);
  const [couponError, setCouponError] = useState('');
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [useTrustCoins, setUseTrustCoins] = useState(false);
  const activeAddresses = addresses ?? [];
  const currentAddressId = selectedAddressId || activeAddresses.find((a) => a.isDefault)?.id || activeAddresses[0]?.id;
    const { data: profile } = useQuery({ queryKey: ['profile'], queryFn: userApi.getProfile });

      const handleApplyCoupon = async () => {
    if (!couponCode.trim() || !cart) return;
    setCouponError('');
    setApplyingCoupon(true);
    try {
      const { discount } = await couponsApi.validate(couponCode.trim(), cart.subtotal);
      setAppliedCoupon({ code: couponCode.trim().toUpperCase(), discount });
    } catch (err: any) {
      setCouponError(err?.response?.data?.message ?? 'Invalid coupon');
      setAppliedCoupon(null);
    } finally {
      setApplyingCoupon(false);
    }
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSavingAddress(true);
    try {
      const created = await addressApi.create({ ...newAddress, isDefault: activeAddresses.length === 0 });
      await refetch();
      setSelectedAddressId(created.id);
      setShowNewAddress(false);
      setNewAddress({ label: '', line1: '', city: '', country: '' });
      show('Address saved');
    } catch (err: any) {
      const message = err?.response?.data?.message ?? 'Could not save address';
      setError(Array.isArray(message) ? message.join(', ') : message);
    } finally {
      setSavingAddress(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!currentAddressId) {
      setError('Please add a delivery address first.');
      return;
    }
    setError('');
    setPlacing(true);
    try {
            const order = await ordersApi.checkout(
        currentAddressId,
        appliedCoupon?.code,
        useTrustCoins ? profile?.trustCoins : undefined,
      );
      queryClient.setQueryData(['cart'], { items: [], subtotal: 0, shipping: 0, tax: 0, total: 0 });
      show('Order placed! Pay with Cash on Delivery.');
      router.push(`/orders/${order.id}/track`);
    } catch (err: any) {
      const message = err?.response?.data?.message ?? 'Could not place order';
      setError(Array.isArray(message) ? message.join(', ') : message);
    } finally {
      setPlacing(false);
    }
  };

  if (!cart || cart.items.length === 0) {
    return <p className="text-text-muted">Your cart is empty — nothing to checkout.</p>;
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
      <div className="space-y-6">
        {/* Delivery Address */}
        <div className="rounded-card border border-border bg-surface p-4">
          <h2 className="mb-3 font-bold text-text-primary">Delivery Address</h2>

          {activeAddresses.length > 0 && !showNewAddress && (
            <div className="space-y-2">
              {activeAddresses.map((addr) => (
                <label
                  key={addr.id}
                  className={`flex cursor-pointer items-start gap-3 rounded-btn border p-3 text-sm ${
                    currentAddressId === addr.id ? 'border-primary bg-primary/5' : 'border-border'
                  }`}
                >
                  <input
                    type="radio"
                    checked={currentAddressId === addr.id}
                    onChange={() => setSelectedAddressId(addr.id)}
                    className="mt-1"
                  />
                  <div>
                    <p className="font-medium text-text-primary">{addr.label}</p>
                    <p className="text-text-muted">
                      {addr.line1}, {addr.city}, {addr.country}
                    </p>
                  </div>
                </label>
              ))}
              <button
                onClick={() => setShowNewAddress(true)}
                className="text-sm font-medium text-primary"
              >
                + Add new address
              </button>
            </div>
          )}

          {(activeAddresses.length === 0 || showNewAddress) && (
            <form onSubmit={handleAddAddress} className="space-y-3">
              <Input
                label="Label"
                placeholder="Home, Office..."
                value={newAddress.label}
                onChange={(e) => setNewAddress({ ...newAddress, label: e.target.value })}
                required
              />
              <Input
                label="Address"
                placeholder="Street address"
                value={newAddress.line1}
                onChange={(e) => setNewAddress({ ...newAddress, line1: e.target.value })}
                required
              />
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="City"
                  value={newAddress.city}
                  onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                  required
                />
                <Input
                  label="Country"
                  value={newAddress.country}
                  onChange={(e) => setNewAddress({ ...newAddress, country: e.target.value })}
                  required
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" size="sm" loading={savingAddress}>Save Address</Button>
                {activeAddresses.length > 0 && (
                  <Button type="button" variant="outline" size="sm" onClick={() => setShowNewAddress(false)}>
                    Cancel
                  </Button>
                )}
              </div>
            </form>
          )}
        </div>

        {/* Payment Method */}
        <div className="rounded-card border border-border bg-surface p-4">
          <h2 className="mb-3 font-bold text-text-primary">Payment Method</h2>
          <div className="flex items-center gap-3 rounded-btn border border-primary bg-primary/5 p-3 text-sm">
            <input type="radio" checked readOnly />
            <div>
              <p className="font-medium text-text-primary">Cash on Delivery</p>
              <p className="text-text-muted">Pay with cash when your order arrives.</p>
            </div>
          </div>

                  {/* Coupon + TrustCoins */}
        <div className="rounded-card border border-border bg-surface p-4">
          <h2 className="mb-3 font-bold text-text-primary">Discounts</h2>
          <div className="flex gap-2">
            <input
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              placeholder="Coupon code"
              className="h-10 flex-1 rounded-btn border border-border bg-bg px-3 text-sm uppercase focus:border-primary focus:outline-none"
            />
            <Button type="button" size="sm" loading={applyingCoupon} onClick={handleApplyCoupon}>Apply</Button>
          </div>
          {couponError && <p className="mt-2 text-sm text-danger">{couponError}</p>}
          {appliedCoupon && (
            <p className="mt-2 text-sm text-success">
              &quot;{appliedCoupon.code}&quot; applied — ${appliedCoupon.discount.toFixed(0)} off
            </p>
          )}

          {profile && profile.trustCoins > 0 && (
            <label className="mt-3 flex items-center gap-2 text-sm text-text-primary">
              <input type="checkbox" checked={useTrustCoins} onChange={(e) => setUseTrustCoins(e.target.checked)} className="rounded border-border" />
              Use {profile.trustCoins} TrustCoins (${(profile.trustCoins / 100).toFixed(2)} value)
            </label>
          )}
        </div>
          <div className="mt-3 flex items-center gap-2 text-xs text-text-muted">
            <ShieldCheck size={14} className="text-primary" />
            Your order is buyer-protected end to end.
          </div>
        </div>
      </div>

      {/* Order Summary */}
      <div className="h-fit rounded-card border border-border bg-surface p-4">
        <h2 className="mb-3 font-bold text-text-primary">Order Summary</h2>
        <div className="max-h-40 space-y-1 overflow-y-auto text-sm text-text-muted">
          {cart.items.map((i) => (
            <div key={i.id} className="flex justify-between">
              <span className="truncate">{i.productTitle} × {i.qty}</span>
              <span>${(i.price * i.qty).toFixed(0)}</span>
            </div>
          ))}
        </div>
        <div className="mt-3 space-y-2 border-t border-border pt-3 text-sm text-text-muted">
          <div className="flex justify-between">
            <span>Items ({cart.items.length})</span>
            <span>${cart.subtotal.toFixed(0)}</span>
          </div>
          <div className="flex justify-between">
            <span>Shipping</span>
            <span className="text-success">FREE</span>
          </div>
        </div>
        <div className="mt-3 flex justify-between border-t border-border pt-3 font-bold text-text-primary">
          <span>Total</span>
          <span>${cart.total.toFixed(0)}</span>
        </div>

        {error && <p className="mt-3 text-sm text-danger">{error}</p>}

        <Button className="mt-4 w-full" loading={placing} onClick={handlePlaceOrder}>
          Place Order
        </Button>
        <p className="mt-2 flex items-center gap-1 text-center text-xs text-text-muted">
          <Truck size={12} /> Your order is secure and trackable.
        </p>
      </div>
    </div>
  );
}