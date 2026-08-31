import { api } from './api-client';

export interface Address {
  id: string;
  label: string;
  line1: string;
  city: string;
  country: string;
  isDefault: boolean;
}

export const addressApi = {
  list: () => api.get<Address[]>('/addresses').then((r) => r.data),
  create: (data: Omit<Address, 'id'>) => api.post<Address>('/addresses', data).then((r) => r.data),
};