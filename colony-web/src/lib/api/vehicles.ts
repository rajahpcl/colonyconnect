import { apiRequest, toQueryString } from './client';

export type Vehicle = {
  id?: number;
  vehicleNo: string;
  type: string;
  owner: string;
  flatNo: string;
  registrationDate?: string;
  status: 'active' | 'inactive';
};

export async function listVehicles(params?: Record<string, any>) {
  return apiRequest<Vehicle[]>(`/api/v1/vehicles${toQueryString(params ?? {})}`);
}

export async function getVehicle(id: number) {
  return apiRequest<Vehicle>(`/api/v1/vehicles/${id}`);
}

export async function createVehicle(data: Vehicle) {
  return apiRequest<Vehicle>(
    '/api/v1/vehicles',
    { body: JSON.stringify(data), method: 'POST' },
    { withCsrf: true }
  );
}

export async function updateVehicle(id: number, data: Vehicle) {
  return apiRequest<Vehicle>(
    `/api/v1/vehicles/${id}`,
    { body: JSON.stringify(data), method: 'PATCH' },
    { withCsrf: true }
  );
}

export async function getVehicleReport(params?: Record<string, any>) {
  return apiRequest<any[]>(`/api/v1/vehicles/report${toQueryString(params ?? {})}`);
}
