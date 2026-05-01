import { apiRequest } from './client';

export async function getComplaintReport() {
  return apiRequest<any[]>('/api/v1/reports/complaints');
}

export async function getReportVehicles() {
  return apiRequest<any[]>('/api/v1/reports/vehicles');
}

export async function getOccupancyReport() {
  return apiRequest<any[]>('/api/v1/reports/occupancy');
}

export async function getMatrixReport() {
  return apiRequest<any[]>('/api/v1/reports/matrix');
}

export async function getPoQuantityReport() {
  return apiRequest<any[]>('/api/v1/reports/po-quantity');
}

export async function getDashboardStats() {
  return apiRequest<any>('/api/v1/reports/dashboard');
}