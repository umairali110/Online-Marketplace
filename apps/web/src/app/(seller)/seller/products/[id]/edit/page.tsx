'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ImageUploadField } from '@/components/shared/image-upload-field';
import { sellerProductsApi } from '@/lib/seller-api';

export default function EditProductPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const { data: products } = useQuery({ queryKey: ['seller-products'], queryFn: sellerProductsApi.list });
  const product = products?.find((p) => p.storeListingId === id);

  const [price, setPrice] = useState('');
  const [compareAtPrice, setCompareAtPrice] = useState('');
  const [stock, setStock] = useState('');
  const [isBestDeal, setIsBestDeal] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (product) {
      setPrice(String(product.price));
      setCompareAtPrice(product.compareAtPrice ? String(product.compareAtPrice) : '');
      setStock(String(product.stock));
      setIsBestDeal(product.isBestDeal);
      setImageUrl(product.image);
    }
  }, [product]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      await sellerProductsApi.update(id, {
        price: Number(price),
        compareAtPrice: compareAtPrice ? Number(compareAtPrice) : undefined,
        stock: Number(stock),
        isBestDeal,
        images: imageUrl ? [imageUrl] : undefined,
      });
      router.push('/seller/products');
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Could not update product');
    } finally {
      setSaving(false);
    }
  };

  if (!product) return <p className="text-text-muted">Loading...</p>;

  return (
    <div className="max-w-lg">
      <h1 className="text-xl font-bold text-text-primary">Edit: {product.title}</h1>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <ImageUploadField label="Product Image" folder="products" value={imageUrl} onChange={setImageUrl} />

        <div className="grid grid-cols-2 gap-3">
          <Input label="Price ($)" type="number" min={0} step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} required />
          <Input label="Compare-at Price" type="number" min={0} step="0.01" value={compareAtPrice} onChange={(e) => setCompareAtPrice(e.target.value)} />
        </div>
        <Input label="Stock" type="number" min={0} value={stock} onChange={(e) => setStock(e.target.value)} required />

        <label className="flex items-center gap-2 text-sm text-text-primary">
          <input type="checkbox" checked={isBestDeal} onChange={(e) => setIsBestDeal(e.target.checked)} className="rounded border-border" />
          Mark as Best Deal
        </label>

        {error && <p className="text-sm text-danger">{error}</p>}

        <div className="flex gap-2">
          <Button type="submit" loading={saving}>Save Changes</Button>
          <Button type="button" variant="outline" onClick={() => router.push('/seller/products')}>Cancel</Button>
        </div>
      </form>
    </div>
  );
}