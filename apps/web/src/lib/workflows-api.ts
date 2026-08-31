import { api } from './api-client';

export interface Workflow {
  id: string;
  key: 'NEW_ORDER_EMAIL' | 'NEW_ORDER_INVENTORY' | 'LOW_STOCK_NOTIFY';
  isActive: boolean;
}

export const workflowsApi = {
  list: () => api.get<Workflow[]>('/seller/workflows').then((r) => r.data),
  toggle: (key: string) => api.patch<Workflow>(`/seller/workflows/${key}/toggle`).then((r) => r.data),
};