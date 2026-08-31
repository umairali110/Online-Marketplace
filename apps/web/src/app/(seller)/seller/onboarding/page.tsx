'use client';

import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { userApi } from '@/lib/user-api';
import { ProfileForm } from '@/components/shared/profile-form';

export default function SellerOnboardingPage() {
  const router = useRouter();
  const { data: profile, isLoading } = useQuery({ queryKey: ['profile'], queryFn: userApi.getProfile });

  if (isLoading || !profile) return <p className="p-8 text-text-muted">Loading...</p>;

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-4 py-10">
      <div className="w-full max-w-md rounded-card border border-border bg-surface p-6">
        <h1 className="text-xl font-bold text-text-primary">Complete Your Seller Profile</h1>
        <p className="mt-1 text-sm text-text-muted">
          We need a few details before you can set up your store.
        </p>
        <div className="mt-6">
          <ProfileForm
            profile={profile}
            submitLabel="Continue to Store Setup"
            onSaved={() => router.push('/seller/store-builder')}
          />
        </div>
      </div>
    </div>
  );
}