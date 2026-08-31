import { api } from './api-client';

export const directHireApi = {
  hire: (data: { providerId: string; title: string; description: string; categorySlug?: string; budget?: number }) =>
    api.post('/jobs/direct-hire', data).then((r) => r.data),
};