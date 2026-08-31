import { Star } from 'lucide-react';

export function RatingStars({ rating, count }: { rating: number; count?: number }) {
  return (
    <div className="flex items-center gap-1.5 text-sm">
      <div className="flex gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            size={14}
            className={i < Math.round(rating) ? 'fill-warning text-warning' : 'text-border'}
          />
        ))}
      </div>
      {count !== undefined && <span className="text-xs text-text-muted">({count})</span>}
    </div>
  );
}