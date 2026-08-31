'use client';

import Link from 'next/link';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Package, Heart, MapPin, Coins, Briefcase,MessageCircle } from 'lucide-react';
import { userApi } from '@/lib/user-api';
import { addressApi } from '@/lib/address-api';
import { ProfileForm } from '@/components/shared/profile-form';
import { LogoutButton } from '@/components/shared/logout-button';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { LogoutAllButton } from '@/components/shared/logout-all-button';
import { NotificationSettings } from '@/components/shared/notification-settings';

export default function AccountPage() {
  const queryClient = useQueryClient();
  const { data: profile, isLoading } = useQuery({ queryKey: ['profile'], queryFn: userApi.getProfile });
  const { data: addresses, refetch: refetchAddresses } = useQuery({
    queryKey: ['addresses'],
    queryFn: addressApi.list,
  });

  const [showAddAddress, setShowAddAddress] = useState(false);
  const [newAddress, setNewAddress] = useState({ label: '', line1: '', city: '', country: '' });

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    await addressApi.create({ ...newAddress, isDefault: (addresses?.length ?? 0) === 0 });
    await refetchAddresses();
    setShowAddAddress(false);
    setNewAddress({ label: '', line1: '', city: '', country: '' });
  };

  if (isLoading || !profile) return <p className="text-text-muted">Loading account...</p>;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-text-primary">My Account</h1>
        <div className="flex items-center gap-3">
          <LogoutAllButton />
          <LogoutButton />
        </div>
      </div>

                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        <Link href="/orders" className="flex items-center gap-2 rounded-card border border-border bg-surface p-3 text-sm hover:border-primary">
          <Package size={16} className="text-primary" /> Orders
        </Link>
        <Link href="/jobs" className="flex items-center gap-2 rounded-card border border-border bg-surface p-3 text-sm hover:border-primary">
          <Briefcase size={16} className="text-primary" /> My Jobs
        </Link>
        <Link href="/providers/nearby" className="flex items-center gap-2 rounded-card border border-border bg-surface p-3 text-sm hover:border-primary">
          <MapPin size={16} className="text-primary" /> Find Providers
        </Link>
        <Link href="/messages" className="flex items-center gap-2 rounded-card border border-border bg-surface p-3 text-sm hover:border-primary">
          <MessageCircle size={16} className="text-primary" /> Messages
        </Link>
        <Link href="/wishlist" className="flex items-center gap-2 rounded-card border border-border bg-surface p-3 text-sm hover:border-primary">
          <Heart size={16} className="text-primary" /> Wishlist
        </Link>
      </div>

      <div className="rounded-card border border-border bg-surface p-4">
        <h2 className="mb-4 font-bold text-text-primary">Profile</h2>
        <ProfileForm
          profile={profile}
          onSaved={(updated) => queryClient.setQueryData(['profile'], updated)}
        />
      </div>
            <NotificationSettings />

      <div className="rounded-card border border-border bg-surface p-4">
        <h2 className="mb-3 flex items-center gap-2 font-bold text-text-primary">
          <MapPin size={16} /> Addresses
        </h2>
        <div className="space-y-2">
          {addresses?.map((addr) => (
            <div key={addr.id} className="rounded-btn border border-border p-3 text-sm">
              <p className="font-medium text-text-primary">{addr.label}</p>
              <p className="text-text-muted">{addr.line1}, {addr.city}, {addr.country}</p>
            </div>
          ))}
        </div>

        {!showAddAddress ? (
          <button onClick={() => setShowAddAddress(true)} className="mt-3 text-sm font-medium text-primary">
            + Add new address
          </button>
        ) : (
          <form onSubmit={handleAddAddress} className="mt-3 space-y-3">
            <Input label="Label" placeholder="Home, Office..." value={newAddress.label} onChange={(e) => setNewAddress({ ...newAddress, label: e.target.value })} required />
            <Input label="Address" value={newAddress.line1} onChange={(e) => setNewAddress({ ...newAddress, line1: e.target.value })} required />
            <div className="grid grid-cols-2 gap-3">
              <Input label="City" value={newAddress.city} onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })} required />
              <Input label="Country" value={newAddress.country} onChange={(e) => setNewAddress({ ...newAddress, country: e.target.value })} required />
            </div>
            <div className="flex gap-2">
              <Button type="submit" size="sm">Save Address</Button>
              <Button type="button" variant="outline" size="sm" onClick={() => setShowAddAddress(false)}>Cancel</Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}