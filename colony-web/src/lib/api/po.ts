import { apiRequest, toQueryString } from './client';

export type PO = {
  id?: number;
  poNumber: string;
  requestId?: number;
  vendorId?: number;
  amount: number;
  status: string;
  createdDate?: string;
  completedDate?: string;
};

export async function listPO(params?: Record<string, any>) {
  return apiRequest<PO[]>(`/api/v1/po${toQueryString(params ?? {})}`);
}

export async function getPO(id: number) {
  return apiRequest<PO>(`/api/v1/po/${id}`);
}

export async function createPO(data: PO) {
  return apiRequest<PO>(
    '/api/v1/po',
    { body: JSON.stringify(data), method: 'POST' },
    { withCsrf: true }
  );
}

export async function updatePO(id: number, data: PO) {
  return apiRequest<PO>(
    `/api/v1/po/${id}`,
    { body: JSON.stringify(data), method: 'PATCH' },
    { withCsrf: true }
  );
}

export async function getPendingPO() {
  return apiRequest<PO[]>('/api/v1/po/pending');
}

export async function approvePO(id: number) {
  return apiRequest<PO>(
    `/api/v1/po/${id}/approve`,
    { method: 'POST' },
    { withCsrf: true }
  );
}
