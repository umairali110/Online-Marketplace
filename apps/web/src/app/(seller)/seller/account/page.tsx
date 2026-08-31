'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { userApi } from '@/lib/user-api';
import { ProfileForm } from '@/components/shared/profile-form';
import { LogoutButton } from '@/components/shared/logout-button';
import { LogoutAllButton } from '@/components/shared/logout-all-button';
import { NotificationSettings } from '@/components/shared/notification-settings';

export default function SellerAccountPage() {
  const queryClient = useQueryClient();
  const { data: profile, isLoading } = useQuery({ queryKey: ['profile'], queryFn: userApi.getProfile });

  if (isLoading || !profile) return <p className="text-text-muted">Loading...</p>;

  return (
    <div className="max-w-lg">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-text-primary">My Account</h1>
        <div className="flex items-center gap-3">
          <LogoutAllButton />
          <LogoutButton />
        </div>
      </div>
      <div className="rounded-card border border-border bg-surface p-4">
        <ProfileForm profile={profile} onSaved={(updated) => queryClient.setQueryData(['profile'], updated)} />
                <NotificationSettings />
      </div>
    </div>
  );
}