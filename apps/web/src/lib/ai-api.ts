import { api } from './api-client';

export const aiApi = {
  generateStoreDescription: (name: string, category?: string) =>
    api.post<{ description: string }>('/seller/ai/store-description', { name, category }).then((r) => r.data),
  employeeReply: (message: string) =>
    api.post<{ reply: string }>('/seller/ai/employee-reply', { message }).then((r) => r.data),
};