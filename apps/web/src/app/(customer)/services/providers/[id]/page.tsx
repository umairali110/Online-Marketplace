'use client';

import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import { Star, MapPin, BadgeCheck, MessageCircle } from 'lucide-react';
import { providerDirectoryApi } from '@/lib/provider-directory-api';
import { gigsApi } from '@/lib/gigs-api';
import { chatApi } from '@/lib/chat-api';
import { Button } from '@/components/ui/button';
import { avatarUrl } from '@/lib/user-api';
import { useToast } from '@/components/ui/toast';
import { useState } from 'react';

export default function ProviderPublicProfilePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { show } = useToast();
  const { data: provider, isLoading } = useQuery({
    queryKey: ['provider-public', id],
    queryFn: () => providerDirectoryApi.getPublicProfile(id),
  });

  const [hiringGigId, setHiringGigId] = useState<string | null>(null);

  const handleMessage = async () => {
    if (!provider) return;
    const thread = await chatApi.createThread(provider.userId);
    router.push(`/messages/${thread.id}`);
  };

  const handleHireGig = async (gigId: string) => {
    setHiringGigId(gigId);
    try {
      const job: any = await gigsApi.hire(gigId);
      show('Provider hired!');
      router.push(`/jobs/${job.id}`);
    } catch (err: any) {
      show(err?.response?.data?.message ?? 'Could not hire provider', 'error');
    } finally {
      setHiringGigId(null);
    }
  };

  if (isLoading) return <p className="text-text-muted">Loading...</p>;
  if (!provider) return null;

  const avatar = avatarUrl(provider.avatar);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="rounded-card border border-border bg-surface p-4">
        <div className="flex items-center gap-4">
          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full bg-bg">
            {avatar ? (
              <Image src={avatar} alt={provider.name} fill className="object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-primary/10 text-lg font-bold text-primary">
                {provider.name.slice(0, 2).toUpperCase()}
              </div>
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-1.5">
              <h1 className="text-lg font-bold text-text-primary">{provider.name}</h1>
              {provider.verified && <BadgeCheck size={16} className="text-primary" />}
            </div>
            <div className="flex items-center gap-1 text-sm text-text-muted">
              <Star size={14} className="fill-warning text-warning" />
              {provider.ratingCount > 0 ? `${provider.ratingAvg.toFixed(1)} (${provider.ratingCount})` : 'New provider'}
              <span className="mx-1">·</span>
              <MapPin size={14} /> {provider.city}, {provider.country}
            </div>
          </div>
          <Button size="sm" variant="outline" onClick={handleMessage}>
            <MessageCircle size={14} className="mr-1 inline" /> Message
          </Button>
        </div>
        {provider.bio && <p className="mt-3 text-sm text-text-muted">{provider.bio}</p>}
        <div className="mt-2 flex flex-wrap gap-1.5">
          {provider.skills.map((s) => (
            <span key={s} className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">{s}</span>
          ))}
        </div>
      </div>

      <div>
        <h2 className="mb-3 font-bold text-text-primary">Gigs ({provider.gigs.length})</h2>
        {provider.gigs.length === 0 && <p className="text-sm text-text-muted">No active gigs yet.</p>}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {provider.gigs.map((gig) => (
            <div key={gig.id} className="overflow-hidden rounded-card border border-border bg-surface">
              {gig.images[0] && (
                <div className="relative aspect-[3/1] w-full">
                  <Image src={gig.images[0]} alt={gig.title} fill className="object-cover" />
                </div>
              )}
              <div className="p-4">
                <p className="font-medium text-text-primary">{gig.title}</p>
                <p className="text-xs text-text-muted">{gig.category.name} · {gig.deliveryDays} day delivery</p>
                <p className="mt-2 line-clamp-2 text-sm text-text-muted">{gig.description}</p>
                <div className="mt-3 flex items-center justify-between">
                  <span className="font-bold text-text-primary">${gig.price.toFixed(0)}</span>
                  <Button size="sm" loading={hiringGigId === gig.id} onClick={() => handleHireGig(gig.id)}>
                    Hire Now
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}