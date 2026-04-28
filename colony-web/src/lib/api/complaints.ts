import { apiRequest, toQueryString } from './client';

export type ComplaintStatus = {
  id: string | number;
  name: string;
};

export type ComplaintCategory = {
  id: string | number;
  name: string;
  active: string;
};

export type ComplaintSubCategory = {
  id: string | number;
  name: string;
  categoryId: string | number;
  active: string;
};

export type Complaint = {
  id?: string | number;
  empNo?: string;
  complexCode?: string;
  flatNo?: string;
  compDetails: string;
  submitDate?: string;
  updateDate?: string;
  subcategoryId: string | number;
  vendor?: string;
  status?: string;
  uploadFile?: File | null;
  uploadFile1?: File | null;
};

export type ComplaintResponse = {
  id: string | number;
  empNo: string;
  complexCode: string;
  flatNo: string;
  compDetails: string;
  submitDate: string;
  updateDate?: string;
  subcategoryId: string | number;
  vendor?: string;
  status: string;
  statusName?: string;
  categoryName?: string;
  subcategoryName?: string;
  vendorName?: string;
};

export async function listComplaintCategories() {
  return apiRequest<ComplaintCategory[]>('/api/v1/masters/complaint-categories');
}

export async function listComplaintSubCategories(categoryId: string | number) {
  return apiRequest<ComplaintSubCategory[]>(
    `/api/v1/masters/complaint-subcategories${toQueryString({ categoryId: categoryId.toString() })}`
  );
}

export async function listComplaintStatuses() {
  return apiRequest<ComplaintStatus[]>('/api/v1/complaints/statuses');
}

export async function createComplaint(payload: FormData | string) {
  return apiRequest<ComplaintResponse>(
    '/api/v1/complaints',
    {
      body: payload as BodyInit,
      method: 'POST',
    },
    { withCsrf: true }
  );
}

export async function updateComplaint(
  id: string | number,
  payload: FormData | string
) {
  return apiRequest<ComplaintResponse>(
    `/api/v1/complaints/${id}`,
    {
      body: payload as BodyInit,
      method: 'PATCH',
    },
    { withCsrf: true }
  );
}

export async function getComplaint(id: string | number) {
  return apiRequest<ComplaintResponse>(`/api/v1/complaints/${id}`);
}

export async function listMyComplaints(
  params?: Record<string, string | number | undefined | null>
) {
  return apiRequest<ComplaintResponse[]>(
    `/api/v1/complaints/my${toQueryString(params ?? {})}`
  );
}

export async function listAllComplaints(
  params?: Record<string, string | number | undefined | null>
) {
  return apiRequest<ComplaintResponse[]>(
    `/api/v1/complaints${toQueryString(params ?? {})}`
  );
}
