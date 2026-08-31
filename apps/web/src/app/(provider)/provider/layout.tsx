'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/providers/auth-provider';
import { providerProfileApi } from '@/lib/provider-api';
import { ProviderSidebar } from '@/components/provider/sidebar';

export default function ProviderLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['provider-profile'],
    queryFn: providerProfileApi.getMine,
    enabled: !!user && user.role === 'PROVIDER',
  });

  useEffect(() => {
    if (loading || profileLoading) return;
    if (!user || user.role !== 'PROVIDER') {
      router.push('/login');
      return;
    }
    if (!profile && pathname !== '/provider/onboarding') {
      router.push('/provider/onboarding');
    }
  }, [loading, user, profile, profileLoading, pathname, router]);

  if (loading || profileLoading) return <p className="p-8 text-text-muted">Loading...</p>;
  if (!user || user.role !== 'PROVIDER') return null;
  if (pathname === '/provider/onboarding') return <>{children}</>;
  if (!profile) return null;

  return (
    <div className="flex min-h-screen">
      <ProviderSidebar />
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}