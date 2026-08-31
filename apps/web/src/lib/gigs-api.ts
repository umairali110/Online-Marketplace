import { api } from './api-client';

export interface Gig {
  id: string;
  title: string;
  description: string;
  price: number;
  deliveryDays: number;
  images: string[];
  status: 'ACTIVE' | 'PAUSED';
  category: { id: string; name: string; slug: string };
  createdAt: string;
}

export interface PublicGig extends Gig {
  provider: {
    id: string;
    name: string;
    avatar: string | null;
    ratingAvg: number;
    ratingCount: number;
    verified: boolean;
    city: string | null;
  };
}

export const gigsApi = {
  listMine: () => api.get<Gig[]>('/provider/gigs/mine').then((r) => r.data),
  create: (data: { categorySlug: string; title: string; description: string; price: number; deliveryDays: number; images?: string[] }) =>
    api.post<Gig>('/provider/gigs', data).then((r) => r.data),
  update: (id: string, data: Partial<{ title: string; description: string; price: number; deliveryDays: number; status: 'ACTIVE' | 'PAUSED'; images: string[] }>) =>
    api.patch<Gig>(`/provider/gigs/${id}`, data).then((r) => r.data),
  remove: (id: string) => api.delete(`/provider/gigs/${id}`).then((r) => r.data),
  listByCategory: (slug: string) => api.get<PublicGig[]>(`/gigs/by-category/${slug}`).then((r) => r.data),
  getOne: (id: string) => api.get<PublicGig>(`/gigs/${id}`).then((r) => r.data),
  hire: (id: string) => api.post(`/gigs/${id}/hire`).then((r) => r.data),
};