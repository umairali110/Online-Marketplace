'use client';

import Link from 'next/link';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { gigsApi } from '@/lib/gigs-api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/toast';

export default function ProviderGigsPage() {
  const queryClient = useQueryClient();
  const { show } = useToast();
  const { data: gigs, isLoading } = useQuery({ queryKey: ['my-gigs'], queryFn: gigsApi.listMine });

  const handleToggleStatus = async (id: string, status: 'ACTIVE' | 'PAUSED') => {
    await gigsApi.update(id, { status: status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE' });
    queryClient.invalidateQueries({ queryKey: ['my-gigs'] });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this gig?')) return;
    await gigsApi.remove(id);
    queryClient.invalidateQueries({ queryKey: ['my-gigs'] });
    show('Gig deleted');
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-text-primary">My Gigs</h1>
        <Link href="/provider/gigs/new">
          <Button size="sm"><Plus size={16} className="mr-1 inline" /> Create Gig</Button>
        </Link>
      </div>

      {isLoading && <p className="text-text-muted">Loading gigs...</p>}
      {!isLoading && gigs?.length === 0 && (
        <div className="rounded-card border border-border bg-surface p-8 text-center text-text-muted">
          You haven&apos;t created any gigs yet. A gig is a service listing customers can browse and hire directly.
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {gigs?.map((gig) => (
          <div key={gig.id} className="rounded-card border border-border bg-surface p-4">
            <div className="flex items-start justify-between">
              <Badge variant={gig.status === 'ACTIVE' ? 'success' : 'warning'}>{gig.status}</Badge>
              <div className="flex gap-2">
                <Link href={`/provider/gigs/${gig.id}/edit`} className="text-text-muted hover:text-primary">
                  <Pencil size={14} />
                </Link>
                <button onClick={() => handleDelete(gig.id)} className="text-text-muted hover:text-danger">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
            <p className="mt-2 font-medium text-text-primary">{gig.title}</p>
            <p className="text-xs text-text-muted">{gig.category.name} · {gig.deliveryDays} day delivery</p>
            <p className="mt-2 line-clamp-2 text-sm text-text-muted">{gig.description}</p>
            <div className="mt-3 flex items-center justify-between">
              <span className="font-bold text-text-primary">${gig.price.toFixed(0)}</span>
              <button onClick={() => handleToggleStatus(gig.id, gig.status)} className="text-xs font-medium text-primary">
                {gig.status === 'ACTIVE' ? 'Pause' : 'Activate'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}