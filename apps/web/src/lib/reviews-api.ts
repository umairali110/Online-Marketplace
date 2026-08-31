import { api } from './api-client';

export const reviewsApi = {
  submit: (data: { storeListingId: string; rating: number; comment?: string; images?: string[] }) =>
    api.post('/reviews', data).then((r) => r.data),
};