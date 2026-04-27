import { apiRequest, toQueryString } from './client';

export type IFMSTask = {
  id?: number;
  requestId: number;
  assignedTo: string;
  status: string;
  dueDate?: string;
  priority?: string;
};

export type ProxyRequest = {
  id?: number;
  requestedBy: string;
  representBy: string;
  fromDate: string;
  toDate: string;
  status: string;
};

export async function listMyPendingTasks() {
  return apiRequest<IFMSTask[]>('/api/v1/ifms/pending');
}

export async function listAllTasks(params?: Record<string, any>) {
  return apiRequest<IFMSTask[]>(`/api/v1/ifms/tasks${toQueryString(params ?? {})}`);
}

export async function getTask(id: number) {
  return apiRequest<IFMSTask>(`/api/v1/ifms/tasks/${id}`);
}

export async function updateTaskStatus(id: number, status: string) {
  return apiRequest<IFMSTask>(
    `/api/v1/ifms/tasks/${id}/status`,
    { body: JSON.stringify({ status }), method: 'PATCH' },
    { withCsrf: true }
  );
}

export async function createProxyRequest(data: ProxyRequest) {
  return apiRequest<ProxyRequest>(
    '/api/v1/ifms/proxy',
    { body: JSON.stringify(data), method: 'POST' },
    { withCsrf: true }
  );
}

export async function listProxyRequests() {
  return apiRequest<ProxyRequest[]>('/api/v1/ifms/proxy');
}
