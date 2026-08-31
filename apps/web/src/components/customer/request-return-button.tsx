'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ImageUploadField } from '@/components/shared/image-upload-field';
import { returnsApi } from '@/lib/returns-api';
import { useToast } from '@/components/ui/toast';

export function RequestReturnButton({ subOrderId }: { subOrderId: string }) {
  const { show } = useToast();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await returnsApi.create({ subOrderId, reason, images: image ? [image] : undefined });
      show('Return requested — the seller will review it.');
      setOpen(false);
    } catch (err: any) {
      show(err?.response?.data?.message ?? 'Could not request return', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="text-xs font-medium text-primary">
        Request Return
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-2 space-y-2">
      <textarea
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="Why are you returning this? (min 10 characters)"
        rows={3}
        minLength={10}
        required
        className="w-full rounded-btn border border-border bg-bg p-2.5 text-sm focus:border-primary focus:outline-none"
      />
      <ImageUploadField label="Photo evidence (optional)" folder="products" value={image} onChange={setImage} aspect="square" />
      <div className="flex gap-2">
        <Button type="submit" size="sm" loading={submitting}>Submit Request</Button>
        <Button type="button" size="sm" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
      </div>
    </form>
  );
}