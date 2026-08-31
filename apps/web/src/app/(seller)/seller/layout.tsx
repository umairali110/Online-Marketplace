'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/providers/auth-provider';
import { sellerStoreApi } from '@/lib/seller-api';
import { userApi, isProfileComplete } from '@/lib/user-api';
import { SellerSidebar } from '@/components/seller/sidebar';

export default function SellerLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: userApi.getProfile,
    enabled: !!user && user.role === 'SELLER',
  });

  const { data: store, isLoading: storeLoading } = useQuery({
    queryKey: ['seller-store'],
    queryFn: sellerStoreApi.getMyStore,
    enabled: !!user && user.role === 'SELLER' && isProfileComplete(profile),
  });

  useEffect(() => {
    if (loading || profileLoading) return;
    if (!user || user.role !== 'SELLER') {
      router.push('/login');
      return;
    }
    if (!isProfileComplete(profile) && pathname !== '/seller/onboarding') {
      router.push('/seller/onboarding');
      return;
    }
    if (
      isProfileComplete(profile) &&
      !storeLoading &&
      !store &&
      pathname !== '/seller/store-builder' &&
      pathname !== '/seller/onboarding'
    ) {
      router.push('/seller/store-builder');
    }
  }, [loading, user, profile, profileLoading, store, storeLoading, pathname, router]);

  if (loading || profileLoading) return <p className="p-8 text-text-muted">Loading...</p>;
  if (!user || user.role !== 'SELLER') return null;

  // Onboarding page renders full-screen, without the dashboard sidebar shell.
  if (pathname === '/seller/onboarding') return <>{children}</>;

  if (!isProfileComplete(profile)) return null;

  return (
    <div className="flex min-h-screen">
      <SellerSidebar />
      <main className="flex-1 p-6">
        {store && store.status === 'PENDING' && (
          <div className="mb-4 rounded-btn border border-warning/30 bg-warning/10 px-4 py-2.5 text-sm text-warning">
            Your store is pending admin approval — it won&apos;t be visible to customers yet.
          </div>
        )}
        {children}
      </main>
    </div>
  );
}