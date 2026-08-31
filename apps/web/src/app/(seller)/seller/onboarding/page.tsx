'use client';

import { useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ShieldCheck, MapPin, Phone, User as UserIcon } from 'lucide-react';
import { userApi, FullProfile } from '@/lib/user-api';
import { ProfileForm } from '@/components/shared/profile-form';

export default function SellerOnboardingPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: profile, isLoading } = useQuery({ queryKey: ['profile'], queryFn: userApi.getProfile });

  const handleSaved = (updated: FullProfile) => {
    // Write the updated profile into the SAME 'profile' query cache that
    // SellerLayout reads — without this, the layout still sees the old
    // (incomplete) cached profile on the next page and immediately bounces
    // back here, which looked like the button did nothing.
    queryClient.setQueryData(['profile'], updated);
    router.push('/seller/store-builder');
  };

  if (isLoading || !profile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg">
        <p className="text-sm text-text-muted">Loading...</p>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-bg px-4 py-10">
      {/* Soft decorative glow, consistent with the hero/onboarding styling used elsewhere */}
      <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-success/10 blur-3xl" />

      <div className="relative w-full max-w-md">
        <div className="mb-6 text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-2xl font-bold text-white shadow-lg shadow-primary/20">
            OM
          </span>
        </div>

        <div className="rounded-card border border-border bg-surface p-6 shadow-sm sm:p-8">
          <h1 className="text-xl font-bold text-text-primary">Complete Your Seller Profile</h1>
          <p className="mt-1.5 text-sm text-text-muted">
            We need a few details before you can set up your store.
          </p>

          <div className="mt-5 flex flex-wrap gap-2">
            <span className="flex items-center gap-1.5 rounded-full bg-bg px-3 py-1.5 text-xs font-medium text-text-muted">
              <UserIcon size={12} /> Profile photo
            </span>
            <span className="flex items-center gap-1.5 rounded-full bg-bg px-3 py-1.5 text-xs font-medium text-text-muted">
              <Phone size={12} /> Phone number
            </span>
            <span className="flex items-center gap-1.5 rounded-full bg-bg px-3 py-1.5 text-xs font-medium text-text-muted">
              <MapPin size={12} /> City & country
            </span>
          </div>

          <div className="mt-6">
            <ProfileForm profile={profile} submitLabel="Continue to Store Setup" onSaved={handleSaved} />
          </div>

          <p className="mt-5 flex items-center gap-1.5 text-xs text-text-muted">
            <ShieldCheck size={13} className="text-primary" />
            Your information is only shared with customers who order from your store.
          </p>
        </div>
      </div>
    </div>
  );
}