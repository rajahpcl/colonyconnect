import { apiRequest } from './client';

// ── Shared types ────────────────────────────────────────────────────────────

export type Colony = { code: string; name: string };
export type StatusOption = { id: number; name: string };

/** Mirrors ComplaintDto returned by the backend */
export type ComplaintRecord = {
  id: number;
  empNo: string;
  flatNo?: string;
  complexCode?: string;
  complexName?: string;
  subcategoryId?: number;
  subcategoryName?: string;
  categoryName?: string;
  compDetails?: string;
  status?: number;
  statusName?: string;
  submitDate?: string;
  updateDate?: string;
  vendorName?: string;
  poTotalAmount?: number;
};

// ── Dropdown helpers ─────────────────────────────────────────────────────────

/** All colonies (housing_complex_list) ordered by name — for multi-selects */
export async function listColonies(): Promise<Colony[]> {
  return apiRequest<Colony[]>('/api/v1/ifms/colonies');
}

/** All status options (colony_status) — for Request List status multi-select */
export async function listStatuses(): Promise<StatusOption[]> {
  return apiRequest<StatusOption[]>('/api/v1/ifms/statuses');
}

/** Colonies that have at least one allotment entry — for Proxy Request */
export async function listAllotmentComplexes(): Promise<Colony[]> {
  return apiRequest<Colony[]>('/api/v1/housing/allotment-complexes');
}

/** Flat numbers for a complex (housing_alloted) */
export async function listFlatsByComplex(complexCode: string): Promise<string[]> {
  return apiRequest<string[]>(`/api/v1/housing/flats?complexCode=${encodeURIComponent(complexCode)}`);
}

/** Employee number for a specific flat */
export async function getEmployeeByFlat(complexCode: string, flatNo: string): Promise<string> {
  const result = await apiRequest<{ empNo: string }>(
    `/api/v1/housing/employee?complexCode=${encodeURIComponent(complexCode)}&flatNo=${encodeURIComponent(flatNo)}`
  );
  return result?.empNo ?? '';
}

// ── My Pending Tasks (bvg_pending.jsp) ──────────────────────────────────────

/**
 * Returns requests with STATUS = 20 (Submitted) filtered by selected complexes.
 * If no complexes are supplied, returns an empty list (matches legacy validation).
 */
export async function listMyPendingTasks(complexCodes?: string[]): Promise<ComplaintRecord[]> {
  if (!complexCodes || complexCodes.length === 0) return [];
  const params = complexCodes.map((c) => `complexCodes=${encodeURIComponent(c)}`).join('&');
  return apiRequest<ComplaintRecord[]>(`/api/v1/ifms/pending?${params}`);
}

// ── Request List (bvgAckByMe.jsp) ───────────────────────────────────────────

export type RequestListParams = {
  complexCodes?: string[];
  statuses?: number[];
  fromDate?: string;
  toDate?: string;
};

/**
 * Returns requests filtered by complex, status, and optional date range.
 * Returns empty list when required dropdowns (colony + status) are not selected.
 */
export async function listRequests(params: RequestListParams): Promise<ComplaintRecord[]> {
  const { complexCodes = [], statuses = [], fromDate, toDate } = params;
  if (complexCodes.length === 0 || statuses.length === 0) return [];

  const parts: string[] = [];
  complexCodes.forEach((c) => parts.push(`complexCodes=${encodeURIComponent(c)}`));
  statuses.forEach((s) => parts.push(`statuses=${s}`));
  if (fromDate) parts.push(`fromDate=${encodeURIComponent(fromDate)}`);
  if (toDate) parts.push(`toDate=${encodeURIComponent(toDate)}`);

  return apiRequest<ComplaintRecord[]>(`/api/v1/ifms/requests?${parts.join('&')}`);
}

// ── Raise Proxy Request (proxy_request.jsp) ──────────────────────────────────

export type ProxyRequestPayload = {
  empNo: string;       // target employee number
  raiserEmpNo?: string;
};

export async function raiseProxyRequest(payload: ProxyRequestPayload) {
  return apiRequest<ComplaintRecord>(
    '/api/v1/ifms/proxy',
    { method: 'POST', body: JSON.stringify(payload) },
    { withCsrf: true }
  );
}

// ── Legacy stubs (kept for backward-compat) ──────────────────────────────────

export async function updateTaskStatus(_id: number, _status: string) {
  return Promise.resolve(undefined);
}
export async function listAllTasks(_params?: Record<string, unknown>) {
  return [] as ComplaintRecord[];
}
export async function createProxyRequest(_data: unknown) {
  return Promise.resolve(undefined);
}
export async function listProxyRequests() {
  return [] as ComplaintRecord[];
}
