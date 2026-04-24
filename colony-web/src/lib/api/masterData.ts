import { apiRequest, toQueryString } from './client';

export type MasterResource =
  | 'vendors'
  | 'vendor-mappings'
  | 'complaint-categories'
  | 'complaint-subcategories'
  | 'po-items'
  | 'ifms-members'
  | 'statuses';

export type MasterRecord = {
  id?: number | string;
  [key: string]: unknown;
};

export async function listMasterData<T extends MasterRecord>(
  resource: MasterResource,
  params?: Record<string, string | number | undefined | null>
) {
  return apiRequest<T[]>(`/api/v1/masters/${resource}${toQueryString(params ?? {})}`);
}

export async function createMasterData<T extends MasterRecord>(resource: MasterResource, payload: MasterRecord) {
  return apiRequest<T>(
    `/api/v1/masters/${resource}`,
    {
      body: JSON.stringify(payload),
      method: 'POST',
    },
    { withCsrf: true }
  );
}

export async function updateMasterData<T extends MasterRecord>(
  resource: MasterResource,
  id: number | string,
  payload: MasterRecord
) {
  return apiRequest<T>(
    `/api/v1/masters/${resource}/${id}`,
    {
      body: JSON.stringify(payload),
      method: 'PATCH',
    },
    { withCsrf: true }
  );
}

export async function deleteMasterData(resource: MasterResource, id: number | string) {
  return apiRequest<{ message: string }>(
    `/api/v1/masters/${resource}/${id}`,
    {
      method: 'DELETE',
    },
    { withCsrf: true }
  );
}
