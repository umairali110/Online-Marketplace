import { api } from './api-client';

export interface MyApplication {
  id: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  message: string | null;
  createdAt: string;
  job: { id: string; title: string; status: string; city: string; budget: number | null; category: string };
}

export const jobApplicationsApi = {
  apply: (jobPostId: string, message?: string) =>
    api.post(`/job-applications/${jobPostId}`, { message }).then((r) => r.data),
  listMine: () => api.get<MyApplication[]>('/job-applications/mine').then((r) => r.data),
  updateStatus: (id: string, status: 'ACCEPTED' | 'REJECTED') =>
    api.patch(`/job-applications/${id}/status`, { status }).then((r) => r.data),
};