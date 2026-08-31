'use client';

import { useState } from 'react';
import Image from 'next/image';

export function ImageGallery({ images, alt }: { images: string[]; alt: string }) {
  const [active, setActive] = useState(0);
  const shown = images.length > 0 ? images : ['https://placehold.co/600x600?text=No+Image'];

  return (
    <div className="flex gap-3">
      <div className="flex flex-col gap-2">
        {shown.map((img, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            className={`relative h-16 w-16 overflow-hidden rounded-btn border ${
              i === active ? 'border-primary' : 'border-border'
            }`}
          >
            <Image src={img} alt={`${alt} thumbnail ${i + 1}`} fill className="object-cover" />
          </button>
        ))}
      </div>
      <div className="relative aspect-square flex-1 overflow-hidden rounded-card bg-bg">
        <Image src={shown[active]} alt={alt} fill className="object-contain" priority />
      </div>
    </div>
  );
}