'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { gigsApi } from '@/lib/gigs-api';

export default function EditGigPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: gigs } = useQuery({ queryKey: ['my-gigs'], queryFn: gigsApi.listMine });
  const gig = gigs?.find((g) => g.id === id);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [deliveryDays, setDeliveryDays] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (gig) {
      setTitle(gig.title);
      setDescription(gig.description);
      setPrice(String(gig.price));
      setDeliveryDays(String(gig.deliveryDays));
    }
  }, [gig]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      await gigsApi.update(id, { title, description, price: Number(price), deliveryDays: Number(deliveryDays) });
      router.push('/provider/gigs');
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Could not update gig');
    } finally {
      setSaving(false);
    }
  };

  if (!gig) return <p className="text-text-muted">Loading...</p>;

  return (
    <div className="max-w-lg">
      <h1 className="text-xl font-bold text-text-primary">Edit Gig</h1>
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <Input label="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
        <div>
          <label className="mb-1.5 block text-sm font-medium text-text-primary">Description</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} className="w-full rounded-btn border border-border bg-bg p-3 text-sm focus:border-primary focus:outline-none" required minLength={20} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Input label="Price ($)" type="number" min={1} value={price} onChange={(e) => setPrice(e.target.value)} required />
          <Input label="Delivery (days)" type="number" min={1} max={90} value={deliveryDays} onChange={(e) => setDeliveryDays(e.target.value)} required />
        </div>
        {error && <p className="text-sm text-danger">{error}</p>}
        <div className="flex gap-2">
          <Button type="submit" loading={saving}>Save Changes</Button>
          <Button type="button" variant="outline" onClick={() => router.push('/provider/gigs')}>Cancel</Button>
        </div>
      </form>
    </div>
  );
}