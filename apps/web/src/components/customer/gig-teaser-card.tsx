import Image from 'next/image';
import Link from 'next/link';
import { Star, BadgeCheck } from 'lucide-react';
import { avatarUrl } from '@/lib/user-api';

interface GigTeaserProps {
  providerId: string;
  providerName: string;
  providerAvatar: string | null;
  verified: boolean;
  ratingAvg: number;
  title: string;
  price: number;
  image: string | null;
}

export function GigTeaserCard({
  providerId,
  providerName,
  providerAvatar,
  verified,
  ratingAvg,
  title,
  price,
  image,
}: GigTeaserProps) {
  const avatar = avatarUrl(providerAvatar);

  return (
    <Link
      href={`/services/providers/${providerId}`}
      className="group overflow-hidden rounded-card border border-border bg-surface transition-all hover:-translate-y-1 hover:shadow-md"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-bg">
        {image && (
          <Image
            src={image}
            alt={title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        )}
        {/* subtle gradient so the price badge stays readable over any photo */}
        <div className="absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-black/50 to-transparent" />
        <span className="absolute bottom-2 right-2 rounded-full bg-surface px-2.5 py-1 text-xs font-bold text-text-primary shadow-sm">
          From ${price.toFixed(0)}
        </span>
      </div>

      <div className="p-3.5">
        <div className="flex items-center gap-2">
          <div className="relative h-6 w-6 shrink-0 overflow-hidden rounded-full bg-bg ring-1 ring-border">
            {avatar && <Image src={avatar} alt={providerName} fill className="object-cover" />}
          </div>
          <span className="truncate text-xs font-medium text-text-muted">{providerName}</span>
          {verified && (
            <span className="ml-auto flex shrink-0 items-center gap-0.5 rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
              <BadgeCheck size={11} /> Verified
            </span>
          )}
        </div>

        <p className="mt-2 line-clamp-2 text-sm font-semibold leading-snug text-text-primary transition-colors group-hover:text-primary">
          {title}
        </p>

        <div className="mt-2 flex items-center gap-1 text-xs">
          <Star size={12} className="fill-warning text-warning" />
          <span className="font-medium text-text-primary">{ratingAvg.toFixed(1)}</span>
          <span className="text-text-muted">rating</span>
        </div>
      </div>
    </Link>
  );
}