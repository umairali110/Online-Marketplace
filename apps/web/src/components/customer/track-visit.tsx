'use client';

import { useEffect } from 'react';
import { storeApi } from '@/lib/store-api';

function detectSource(): string {
  if (typeof document === 'undefined') return 'direct';
  const params = new URLSearchParams(window.location.search);
  const utm = params.get('utm_source');
  if (utm) return utm;
  if (!document.referrer) return 'direct';
  try {
    const host = new URL(document.referrer).hostname.replace('www.', '');
    return host;
  } catch {
    return 'direct';
  }
}

export function TrackVisit({ storeId }: { storeId: string }) {
  useEffect(() => {
    storeApi.logVisit(storeId, detectSource()).catch(() => {});
  }, [storeId]);

  return null;
}