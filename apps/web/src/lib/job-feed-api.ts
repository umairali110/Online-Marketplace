import { api } from './api-client';
import { JobPost } from './jobs-api';

export const jobFeedApi = {
  list: (params: { categorySlug?: string; city?: string }) =>
    api.get<JobPost[]>('/job-feed', { params }).then((r) => r.data),
  getOne: (id: string) => api.get<JobPost>(`/job-feed/${id}`).then((r) => r.data),
};