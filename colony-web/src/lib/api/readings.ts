import { apiRequest, toQueryString } from './client';

export type ElectricReading = {
  id?: number;
  flatNo: string;
  reading: number;
  readingDate: string;
  rateId?: number;
  amount?: number;
  status?: string;
};

export async function listReadings(params?: Record<string, any>) {
  return apiRequest<ElectricReading[]>(`/api/v1/readings${toQueryString(params ?? {})}`);
}

export async function getReading(id: number) {
  return apiRequest<ElectricReading>(`/api/v1/readings/${id}`);
}

export async function createReading(data: ElectricReading) {
  return apiRequest<ElectricReading>(
    '/api/v1/readings',
    { body: JSON.stringify(data), method: 'POST' },
    { withCsrf: true }
  );
}

export async function updateReading(id: number, data: ElectricReading) {
  return apiRequest<ElectricReading>(
    `/api/v1/readings/${id}`,
    { body: JSON.stringify(data), method: 'PATCH' },
    { withCsrf: true }
  );
}

export async function getElectricRates() {
  return apiRequest<any[]>('/api/v1/readings/rates');
}
