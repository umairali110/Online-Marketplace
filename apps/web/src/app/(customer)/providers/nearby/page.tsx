'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import { MapPin, Star, MessageCircle } from 'lucide-react';
import { nearbyProvidersApi, NearbyProvider } from '@/lib/nearby-providers-api';
import { serviceCategoriesApi } from '@/lib/provider-api';
import { directHireApi } from '@/lib/direct-hire-api';
import { chatApi } from '@/lib/chat-api';
import { Button } from '@/components/ui/button';
import { avatarUrl } from '@/lib/user-api';
import { useToast } from '@/components/ui/toast';

const radiusOptions = [1, 5, 10, 25];

export default function NearbyProvidersPage() {
  const router = useRouter();
  const { show } = useToast();
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [locationError, setLocationError] = useState('');
  const [radiusKm, setRadiusKm] = useState(5);
  const [categorySlug, setCategorySlug] = useState('');
  const [skill, setSkill] = useState('');

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationError('Location services are not supported in this browser.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => setLocationError('Please allow location access to find providers near you.'),
    );
  }, []);

  const { data: categories } = useQuery({ queryKey: ['service-categories'], queryFn: serviceCategoriesApi.list });

  const { data: providers, isLoading } = useQuery({
    queryKey: ['nearby-providers', coords, radiusKm, categorySlug, skill],
    queryFn: () =>
      nearbyProvidersApi.list({
        lat: coords!.lat,
        lng: coords!.lng,
        radiusKm,
        categorySlug: categorySlug || undefined,
        skill: skill || undefined,
      }),
    enabled: !!coords,
  });

  const handleMessage = async (userId: string) => {
    const thread = await chatApi.createThread(userId);
    router.push(`/messages/${thread.id}`);
  };

  return (
    <div>
      <h1 className="mb-1 text-xl font-bold text-text-primary">Find Providers Near You</h1>
      <p className="mb-4 text-sm text-text-muted">
        Skilled providers within {radiusKm}km — ranked by skill match and distance.
      </p>

      {locationError && (
        <div className="mb-4 rounded-btn border border-warning/30 bg-warning/10 px-4 py-2.5 text-sm text-warning">
          {locationError}
        </div>
      )}

      <div className="mb-4 flex flex-wrap gap-2">
        <select
          value={categorySlug}
          onChange={(e) => setCategorySlug(e.target.value)}
          className="h-10 rounded-btn border border-border bg-surface px-3 text-sm"
        >
          <option value="">All Skills</option>
          {categories?.map((c) => (
            <option key={c.id} value={c.slug}>{c.icon} {c.name}</option>
          ))}
        </select>
        <input
          value={skill}
          onChange={(e) => setSkill(e.target.value)}
          placeholder="Search skill keyword (e.g. pipe fitting)"
          className="h-10 flex-1 min-w-[200px] rounded-btn border border-border bg-surface px-3 text-sm focus:border-primary focus:outline-none"
        />
        <select
          value={radiusKm}
          onChange={(e) => setRadiusKm(Number(e.target.value))}
          className="h-10 rounded-btn border border-border bg-surface px-3 text-sm"
        >
          {radiusOptions.map((r) => (
            <option key={r} value={r}>Within {r}km</option>
          ))}
        </select>
      </div>

      {isLoading && <p className="text-text-muted">Searching nearby providers...</p>}
      {!isLoading && coords && providers?.length === 0 && (
        <div className="rounded-card border border-border bg-surface p-8 text-center text-text-muted">
          No providers found within {radiusKm}km. Try a wider radius.
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {providers?.map((p) => (
          <ProviderCard key={p.providerId} provider={p} onMessage={() => handleMessage(p.userId)} show={show} />
        ))}
      </div>
    </div>
  );
}

function ProviderCard({
  provider,
  onMessage,
  show,
}: {
  provider: NearbyProvider;
  onMessage: () => void;
  show: (msg: string, type?: 'success' | 'error') => void;
}) {
  const router = useRouter();
  const [hiring, setHiring] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [budget, setBudget] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const avatar = avatarUrl(provider.avatar);

  const handleHire = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const job: any = await directHireApi.hire({
        providerId: provider.providerId,
        title,
        description,
        budget: budget ? Number(budget) : undefined,
      });
      show(`${provider.name} hired!`);
      router.push(`/jobs/${job.id}`);
    } catch (err: any) {
      show(err?.response?.data?.message ?? 'Could not hire provider', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="rounded-card border border-border bg-surface p-4">
      <div className="flex items-start gap-3">
        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-bg">
          {avatar ? (
            <Image src={avatar} alt={provider.name} fill className="object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-primary/10 text-sm font-bold text-primary">
              {provider.name.slice(0, 2).toUpperCase()}
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium text-text-primary">{provider.name}</p>
          <div className="flex items-center gap-1 text-xs text-text-muted">
            <Star size={12} className="fill-warning text-warning" />
            {provider.ratingCount > 0 ? provider.ratingAvg.toFixed(1) : 'New'}
            <span className="mx-1">·</span>
            <MapPin size={12} /> {provider.distanceKm}km away
          </div>
        </div>
      </div>

      {provider.bio && <p className="mt-2 line-clamp-2 text-sm text-text-muted">{provider.bio}</p>}

      <div className="mt-2 flex flex-wrap gap-1.5">
        {provider.skills.slice(0, 4).map((s) => (
          <span key={s} className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">{s}</span>
        ))}
      </div>

      {!hiring ? (
        <div className="mt-3 flex gap-2">
          <Button size="sm" onClick={() => setHiring(true)}>Hire Directly</Button>
          <Button size="sm" variant="outline" onClick={onMessage}>
            <MessageCircle size={14} className="mr-1 inline" /> Message
          </Button>
        </div>
      ) : (
        <form onSubmit={handleHire} className="mt-3 space-y-2 border-t border-border pt-3">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Job title"
            required
            minLength={5}
            className="h-9 w-full rounded-btn border border-border bg-bg px-2.5 text-sm focus:border-primary focus:outline-none"
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What do you need done? (min 10 characters)"
            required
            minLength={10}
            rows={2}
            className="w-full rounded-btn border border-border bg-bg p-2.5 text-sm focus:border-primary focus:outline-none"
          />
          <input
            type="number"
            min={0}
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            placeholder="Budget ($, optional)"
            className="h-9 w-full rounded-btn border border-border bg-bg px-2.5 text-sm focus:border-primary focus:outline-none"
          />
          <div className="flex gap-2">
            <Button type="submit" size="sm" loading={submitting}>Confirm Hire</Button>
            <Button type="button" size="sm" variant="outline" onClick={() => setHiring(false)}>Cancel</Button>
          </div>
        </form>
      )}
    </div>
  );
}