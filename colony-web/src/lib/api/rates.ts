import { apiRequest } from './client';

export type ElectricRateDetail = {
  id?: number;
  tariffCategory: string;
  fixedCharges: number;
  energyCharges: number;
  wheelingCharges: number;
  raCharges: number;
  facRate: number;
  effectiveDate?: string;
  status?: number;
  createdBy?: string;
  createdOn?: string;
  updatedBy?: string;
  updatedOn?: string;
};

export async function listElectricRatesDetail() {
  return apiRequest<ElectricRateDetail[]>('/api/v1/rates/details');
}

export async function getRateDetail(id: number) {
  return apiRequest<ElectricRateDetail>(`/api/v1/rates/details/${id}`);
}

export async function createRateDetail(data: ElectricRateDetail) {
  return apiRequest<ElectricRateDetail>(
    '/api/v1/rates/details',
    { body: JSON.stringify(data), method: 'POST' },
    { withCsrf: true }
  );
}

export async function updateRateDetail(id: number, data: ElectricRateDetail) {
  return apiRequest<ElectricRateDetail>(
    `/api/v1/rates/details/${id}`,
    { body: JSON.stringify(data), method: 'PATCH' },
    { withCsrf: true }
  );
}

export async function getComplaintMatrix() {
  return apiRequest<any[]>('/api/v1/reports/complaint-matrix');
}
