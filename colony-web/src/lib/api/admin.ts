import { apiRequest, toQueryString } from './client';

export type ElectricRate = {
  id?: number;
  rateId: number;
  rate: number;
  unit: string;
  effectiveDate?: string;
};

export type AdminRole = {
  id?: number;
  role: string;
  empNo: string;
  complexCode: string;
  permissions: string[];
};

export type Dashboard = {
  totalComplaints: number;
  pendingComplaints: number;
  resolvedComplaints: number;
  averageResolutionTime: number;
  totalInventory: number;
  totalVehicles: number;
  pendingPOs: number;
};

export async function getAdminDashboard() {
  return apiRequest<Dashboard>('/api/v1/admin/dashboard');
}

export async function listAdminComplaints(params?: Record<string, any>) {
  return apiRequest<any[]>(`/api/v1/admin/complaints${toQueryString(params ?? {})}`);
}

export async function updateComplaintStatus(id: number, status: string, remark: string) {
  return apiRequest<any>(
    `/api/v1/admin/complaints/${id}`,
    { body: JSON.stringify({ status, remark }), method: 'PATCH' },
    { withCsrf: true }
  );
}

export async function listElectricRates() {
  return apiRequest<ElectricRate[]>('/api/v1/admin/electric-rates');
}

export async function createElectricRate(data: ElectricRate) {
  return apiRequest<ElectricRate>(
    '/api/v1/admin/electric-rates',
    { body: JSON.stringify(data), method: 'POST' },
    { withCsrf: true }
  );
}

export async function updateElectricRate(id: number, data: ElectricRate) {
  return apiRequest<ElectricRate>(
    `/api/v1/admin/electric-rates/${id}`,
    { body: JSON.stringify(data), method: 'PATCH' },
    { withCsrf: true }
  );
}

export async function listAdminRoles() {
  return apiRequest<AdminRole[]>('/api/v1/admin/roles');
}

export async function createAdminRole(data: AdminRole) {
  return apiRequest<AdminRole>(
    '/api/v1/admin/roles',
    { body: JSON.stringify(data), method: 'POST' },
    { withCsrf: true }
  );
}
