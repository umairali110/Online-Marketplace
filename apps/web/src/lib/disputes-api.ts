import { api } from './api-client';

export const disputesApi = {
  create: (data: { orderId: string; reason: string }) => api.post('/disputes', data).then((r) => r.data),
};