'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { disputesApi } from '@/lib/disputes-api';
import { useToast } from '@/components/ui/toast';

export function ReportIssueButton({ orderId }: { orderId: string }) {
  const { show } = useToast();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await disputesApi.create({ orderId, reason });
      show('Issue reported — our team will review it.');
      setOpen(false);
      setReason('');
    } catch (err: any) {
      show(err?.response?.data?.message ?? 'Could not submit report', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="text-xs font-medium text-danger">
        Report an Issue
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-2 space-y-2">
      <textarea
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="Describe the issue with this order (min 10 characters)..."
        rows={3}
        minLength={10}
        required
        className="w-full rounded-btn border border-border bg-bg p-2.5 text-sm focus:border-primary focus:outline-none"
      />
      <div className="flex gap-2">
        <Button type="submit" size="sm" loading={submitting}>Submit</Button>
        <Button type="button" size="sm" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
      </div>
    </form>
  );
}