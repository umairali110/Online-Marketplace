'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { storeApi } from '@/lib/store-api';
import { useAuth } from '@/providers/auth-provider';

export function FollowButton({ storeId }: { storeId: string }) {
  const { user } = useAuth();
  const router = useRouter();
  const [following, setFollowing] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    storeApi.followStatus(storeId).then((res) => setFollowing(res.following));
  }, [user, storeId]);

  const handleClick = async () => {
    if (!user) {
      router.push('/login');
      return;
    }
    setLoading(true);
    try {
      const { following: now } = await storeApi.toggleFollow(storeId);
      setFollowing(now);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button variant={following ? 'outline' : 'primary'} size="sm" loading={loading} onClick={handleClick}>
      {following ? 'Following' : 'Follow'}
    </Button>
  );
}