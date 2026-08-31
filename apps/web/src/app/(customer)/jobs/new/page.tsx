'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { jobsApi } from '@/lib/jobs-api';
import { serviceCategoriesApi } from '@/lib/provider-api';

export default function NewJobPostPage() {
  const router = useRouter();
  const { data: categories } = useQuery({ queryKey: ['service-categories'], queryFn: serviceCategoriesApi.list });

  const [form, setForm] = useState({ title: '', description: '', categorySlug: '', city: '', country: '', budget: '' });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const job = await jobsApi.create({
        title: form.title,
        description: form.description,
        categorySlug: form.categorySlug,
        city: form.city,
        country: form.country,
        budget: form.budget ? Number(form.budget) : undefined,
      });
      router.push(`/jobs/${job.id}`);
    } catch (err: any) {
      const message = err?.response?.data?.message ?? 'Could not post job';
      setError(Array.isArray(message) ? message.join(', ') : message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="text-xl font-bold text-text-primary">Post a Job</h1>
      <p className="mt-1 text-sm text-text-muted">Describe what you need and local providers will apply.</p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <Input label="Title" placeholder="e.g. Fix leaking kitchen pipe" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />

        <div>
          <label className="mb-1.5 block text-sm font-medium text-text-primary">Description</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={4}
            placeholder="Give as much detail as possible — what needs to be done, when, and any specifics."
            className="w-full rounded-btn border border-border bg-bg p-3 text-sm focus:border-primary focus:outline-none"
            required
            minLength={20}
          />
        </div>

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

        <div className="grid grid-cols-2 gap-3">
          <Input label="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} required />
          <Input label="Country" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} required />
        </div>

        <Input label="Budget ($, optional)" type="number" min={0} value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} />

        {error && <p className="text-sm text-danger">{error}</p>}

        <div className="flex gap-2">
          <Button type="submit" loading={saving}>Post Job</Button>
          <Button type="button" variant="outline" onClick={() => router.push('/jobs')}>Cancel</Button>
        </div>
      </form>
    </div>
  );
}