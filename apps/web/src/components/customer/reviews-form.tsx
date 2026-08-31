'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ImageUploadField } from '@/components/shared/image-upload-field';
import { reviewsApi } from '@/lib/reviews-api';
import { useToast } from '@/components/ui/toast';
import { useAuth } from '@/providers/auth-provider';
import { useRouter } from 'next/navigation';

export function ReviewForm({ storeListingId, onSubmitted }: { storeListingId: string; onSubmitted?: () => void }) {
  const { user } = useAuth();
  const router = useRouter();
  const { show } = useToast();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      router.push('/login');
      return;
    }
    if (rating === 0) {
      show('Please select a rating', 'error');
      return;
    }
    setSubmitting(true);
    try {
      await reviewsApi.submit({ storeListingId, rating, comment: comment || undefined, images: image ? [image] : undefined });
      show('Thanks for your review!');
      setRating(0);
      setComment('');
      setImage(null);
      onSubmitted?.();
    } catch (err: any) {
      show(err?.response?.data?.message ?? 'Could not submit review', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-card border border-border bg-surface p-4">
      <h3 className="mb-3 text-sm font-bold text-text-primary">Write a Review</h3>
      <div className="mb-3 flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button key={star} type="button" onMouseEnter={() => setHoverRating(star)} onMouseLeave={() => setHoverRating(0)} onClick={() => setRating(star)}>
            <Star size={24} className={star <= (hoverRating || rating) ? 'fill-warning text-warning' : 'text-border'} />
          </button>
        ))}
      </div>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Share your experience with this product..."
        rows={3}
        className="w-full rounded-btn border border-border bg-bg p-3 text-sm focus:border-primary focus:outline-none"
      />
      <div className="mt-3">
        <ImageUploadField label="Add a photo (optional)" folder="products" value={image} onChange={setImage} aspect="square" />
      </div>
      <Button type="submit" size="sm" className="mt-3" loading={submitting}>
        Submit Review
      </Button>
    </form>
  );
}