import { api } from './api-client';

export interface RiskOverview {
  highRiskCount: number;
  mediumRiskCount: number;
  riskByCountry: { country: string; count: number }[];
  recentAlerts: { id: string; level: string; reason: string; country: string | null; createdAt: string }[];
}

export const riskApi = {
  overview: () => api.get<RiskOverview>('/admin/risk/overview').then((r) => r.data),
};