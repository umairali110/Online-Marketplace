'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ImageUploadField } from '@/components/shared/image-upload-field';
import { gigsApi } from '@/lib/gigs-api';
import { serviceCategoriesApi } from '@/lib/provider-api';

export default function NewGigPage() {
  const router = useRouter();
  const { data: categories } = useQuery({ queryKey: ['service-categories'], queryFn: serviceCategoriesApi.list });

  const [form, setForm] = useState({ categorySlug: '', title: '', description: '', price: '', deliveryDays: '3' });
  const [image, setImage] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      await gigsApi.create({
        categorySlug: form.categorySlug,
        title: form.title,
        description: form.description,
        price: Number(form.price),
        deliveryDays: Number(form.deliveryDays),
        images: image ? [image] : undefined,
      });
      router.push('/provider/gigs');
    } catch (err: any) {
      const message = err?.response?.data?.message ?? 'Could not create gig';
      setError(Array.isArray(message) ? message.join(', ') : message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-lg">
      <h1 className="text-xl font-bold text-text-primary">Create a Gig</h1>
      <p className="mt-1 text-sm text-text-muted">A gig is a service listing customers can browse and hire directly.</p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <ImageUploadField label="Gig Cover Image (optional)" folder="products" value={image} onChange={setImage} aspect="wide" />

        <div>
          <label className="mb-1.5 block text-sm font-medium text-text-primary">Category</label>
          <select
            value={form.categorySlug}
            onChange={(e) => setForm({ ...form, categorySlug: e.target.value })}
            className="h-11 w-full rounded-btn border border-border bg-surface px-3.5 text-sm focus:border-primary focus:outline-none"
            required
          >
            <option value="">Select a category</option>
            {categories?.map((c) => (
              <option key={c.id} value={c.slug}>{c.icon} {c.name}</option>
            ))}
          </select>
        </div>

        <Input label="Title" placeholder="e.g. I will fix your leaking pipes" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />

        <div>
          <label className="mb-1.5 block text-sm font-medium text-text-primary">Description</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={4}
            className="w-full rounded-btn border border-border bg-bg p-3 text-sm focus:border-primary focus:outline-none"
            required
            minLength={20}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input label="Price ($)" type="number" min={1} value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
          <Input label="Delivery (days)" type="number" min={1} max={90} value={form.deliveryDays} onChange={(e) => setForm({ ...form, deliveryDays: e.target.value })} required />
        </div>

        {error && <p className="text-sm text-danger">{error}</p>}

        <div className="flex gap-2">
          <Button type="submit" loading={saving}>Create Gig</Button>
          <Button type="button" variant="outline" onClick={() => router.push('/provider/gigs')}>Cancel</Button>
        </div>
      </form>
    </div>
  );
}