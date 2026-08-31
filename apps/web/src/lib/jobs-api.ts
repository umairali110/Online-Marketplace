import { api } from './api-client';

export interface JobPost {
  id: string;
  title: string;
  description: string;
  city: string;
  country: string;
  budget: number | null;
  status: 'OPEN' | 'ASSIGNED' | 'COMPLETED' | 'CANCELLED';
  category?: { id: string; name: string; slug: string };
  applicationCount: number;
  createdAt: string;
}

export interface JobApplicant {
  id: string;
  message: string | null;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  createdAt: string;
  provider: {
    id: string;
    name: string;
    avatar: string | null;
    bio: string | null;
    skills: string[];
    ratingAvg: number;
    ratingCount: number;
    city: string | null;
  };
}

export interface JobPostDetail extends JobPost {
  applications: JobApplicant[];
}

export const jobsApi = {
  create: (data: { title: string; description: string; categorySlug: string; city: string; country: string; budget?: number }) =>
    api.post<JobPost>('/jobs', data).then((r) => r.data),
  listMine: () => api.get<JobPost[]>('/jobs/mine').then((r) => r.data),
  getOne: (id: string) => api.get<JobPostDetail>(`/jobs/${id}`).then((r) => r.data),
  updateStatus: (id: string, status: 'COMPLETED' | 'CANCELLED') =>
    api.patch(`/jobs/${id}/status`, { status }).then((r) => r.data),
};