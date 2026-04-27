import { apiRequest, toQueryString } from './client';

export type InventoryItem = {
  id?: number;
  itemCode: string;
  itemName: string;
  categoryId: number;
  quantity: number;
  unit: string;
  location: string;
  lastUpdated?: string;
};

export async function listInventory(params?: Record<string, any>) {
  return apiRequest<InventoryItem[]>(`/api/v1/inventory${toQueryString(params ?? {})}`);
}

export async function getInventory(id: number) {
  return apiRequest<InventoryItem>(`/api/v1/inventory/${id}`);
}

export async function createInventory(data: InventoryItem) {
  return apiRequest<InventoryItem>(
    '/api/v1/inventory',
    { body: JSON.stringify(data), method: 'POST' },
    { withCsrf: true }
  );
}

export async function updateInventory(id: number, data: InventoryItem) {
  return apiRequest<InventoryItem>(
    `/api/v1/inventory/${id}`,
    { body: JSON.stringify(data), method: 'PATCH' },
    { withCsrf: true }
  );
}

export async function getInventoryReport(params?: Record<string, any>) {
  return apiRequest<any[]>(`/api/v1/inventory/report${toQueryString(params ?? {})}`);
}
