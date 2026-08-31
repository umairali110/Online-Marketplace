'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Pencil, Trash2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { sellerProductsApi } from '@/lib/seller-api';
import { useToast } from '@/components/ui/toast';

export default function SellerProductsPage() {
  const queryClient = useQueryClient();
  const { show } = useToast();
    const { data: response, isLoading } = useQuery({
    queryKey: ['seller-products'],
    queryFn: sellerProductsApi.list,
  });
  const products = response?.data;

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this product?')) return;
    await sellerProductsApi.remove(id);
    queryClient.invalidateQueries({ queryKey: ['seller-products'] });
    show('Product deleted');
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-text-primary">Products</h1>
        <Link href="/seller/products/new">
          <Button size="sm">
            <Plus size={16} className="mr-1 inline" /> Add Product
          </Button>
        </Link>
      </div>

      {isLoading && <p className="text-text-muted">Loading products...</p>}

      {!isLoading && products?.length === 0 && (
        <div className="rounded-card border border-border bg-surface p-8 text-center text-text-muted">
          No products yet. Add your first one.
        </div>
      )}

      {products && products.length > 0 && (
        <div className="overflow-hidden rounded-card border border-border bg-surface">
          <table className="w-full text-sm">
            <thead className="bg-bg text-left text-xs text-text-muted">
              <tr>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Stock</th>
                <th className="px-4 py-3">Best Deal</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {products.map((p) => (
                <tr key={p.storeListingId}>
                  <td className="flex items-center gap-3 px-4 py-3">
                    <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-btn bg-bg">
                      {p.image && <Image src={p.image} alt={p.title} fill className="object-cover" />}
                    </div>
                    <span className="line-clamp-1 font-medium text-text-primary">{p.title}</span>
                  </td>
                  <td className="px-4 py-3">${p.price.toFixed(0)}</td>
                  <td className="px-4 py-3">
                    {p.stock === 0 ? <Badge variant="danger">Out of stock</Badge> : p.stock}
                  </td>
                  <td className="px-4 py-3">
                    {p.isBestDeal && <Badge variant="success">Best Deal</Badge>}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-3">
                      <Link href={`/seller/products/${p.storeListingId}/edit`} className="text-text-muted hover:text-primary">
                        <Pencil size={16} />
                      </Link>
                      <button onClick={() => handleDelete(p.storeListingId)} className="text-text-muted hover:text-danger">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}