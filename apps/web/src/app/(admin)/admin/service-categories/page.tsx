'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Trash2 } from 'lucide-react';
import { serviceCategoriesApi } from '@/lib/provider-api';
import { adminApi } from '@/lib/admin-api';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';

export default function AdminServiceCategoriesPage() {
  const queryClient = useQueryClient();
  const { show } = useToast();
  const { data: categories, isLoading } = useQuery({ queryKey: ['service-categories'], queryFn: serviceCategoriesApi.list });

  const [name, setName] = useState('');
  const [icon, setIcon] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      await adminApi.createServiceCategory({ name, icon: icon || undefined });
      setName('');
      setIcon('');
      queryClient.invalidateQueries({ queryKey: ['service-categories'] });
      show('Category created');
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Could not create category');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this category?')) return;
    try {
      await adminApi.deleteServiceCategory(id);
      queryClient.invalidateQueries({ queryKey: ['service-categories'] });
      show('Category deleted');
    } catch (err: any) {
      show(err?.response?.data?.message ?? 'Could not delete category', 'error');
    }
  };

  return (
    <div className="max-w-lg">
      <h1 className="mb-4 text-xl font-bold text-text-primary">Service Categories</h1>

      <form onSubmit={handleCreate} className="mb-6 flex items-end gap-2 rounded-card border border-border bg-surface p-4">
        <div className="w-16">
          <Input label="Icon" placeholder="🔧" value={icon} onChange={(e) => setIcon(e.target.value)} />
        </div>
        <div className="flex-1">
          <Input label="Category Name" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <Button type="submit" loading={saving}>Add</Button>
      </form>
      {error && <p className="mb-3 text-sm text-danger">{error}</p>}

      {isLoading && <p className="text-text-muted">Loading...</p>}
      <div className="divide-y divide-border rounded-card border border-border bg-surface">
        {categories?.map((c) => (
          <div key={c.id} className="flex items-center justify-between p-3">
            <span className="text-sm text-text-primary">{c.icon} {c.name}</span>
            <button onClick={() => handleDelete(c.id)} className="text-text-muted hover:text-danger">
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}