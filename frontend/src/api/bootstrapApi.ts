import { api } from './axios';

export const bootstrapApi = {
  healthCheck() {
    return api.get<{ status: string }>('/health');
  },
};
