'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ImageUploadField } from '@/components/shared/image-upload-field';
import { sellerProductsApi } from '@/lib/seller-api';
import { catalogApi } from '@/lib/catalog-api';
import { useToast } from '@/components/ui/toast';

export default function NewProductPage() {
  const router = useRouter();
  const { show } = useToast();
  const { data: categories } = useQuery({ queryKey: ['categories'], queryFn: catalogApi.getCategories });

  const [form, setForm] = useState({
    title: '',
    brand: '',
    categorySlug: '',
    price: '',
    compareAtPrice: '',
    stock: '',
  });
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!imageUrl) {
      setError('Please upload a product image.');
      return;
    }
    setSaving(true);
    try {
      await sellerProductsApi.create({
        title: form.title,
        brand: form.brand || undefined,
        categorySlug: form.categorySlug,
        price: Number(form.price),
        compareAtPrice: form.compareAtPrice ? Number(form.compareAtPrice) : undefined,
        stock: Number(form.stock),
        images: [imageUrl],
      });
      show('Product added');
      router.push('/seller/products');
    } catch (err: any) {
      const message = err?.response?.data?.message ?? 'Could not add product';
      setError(Array.isArray(message) ? message.join(', ') : message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-lg">
      <h1 className="text-xl font-bold text-text-primary">Add Product</h1>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <ImageUploadField label="Product Image" folder="products" value={imageUrl} onChange={setImageUrl} />

        <Input label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
        <Input label="Brand (optional)" value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} />

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
              <option key={c.id} value={c.slug}>{c.name}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input label="Price ($)" type="number" min={0} step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
          <Input label="Compare-at Price (optional)" type="number" min={0} step="0.01" value={form.compareAtPrice} onChange={(e) => setForm({ ...form, compareAtPrice: e.target.value })} />
        </div>

        <Input label="Stock" type="number" min={0} value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} required />

        {error && <p className="text-sm text-danger">{error}</p>}

        <div className="flex gap-2">
          <Button type="submit" loading={saving}>Add Product</Button>
          <Button type="button" variant="outline" onClick={() => router.push('/seller/products')}>Cancel</Button>
        </div>
      </form>
    </div>
  );
}