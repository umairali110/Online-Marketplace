import { api } from './api-client';

export interface SearchResults {
  products: { id: string; title: string; image: string | null; canonicalSlug: string; lowestPrice: number | null }[];
  stores: { id: string; name: string; slug: string; logo: string | null }[];
  gigs: { id: string; title: string; price: number; providerId: string; providerName: string; category: string }[];
}

export const searchApi = {
  search: (q: string) => api.get<SearchResults>('/search', { params: { q } }).then((r) => r.data),
};