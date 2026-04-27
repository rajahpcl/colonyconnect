import { apiRequest, toQueryString } from './client';

export type ElectricReadingForm = {
  complexCode: string;
  building: string;
  flatNo: string;
  empNo?: string;
  reading: number;
  readingDate: string;
  rateId?: number;
  amount?: number;
};

export type IFMSMaster = {
  id?: number;
  bvgTeamMemberId: string;
  email: string;
  phoneNo: string;
  status?: number;
  insertedBy?: string;
  insertedOn?: string;
};

export type FlatAssignment = {
  id?: number;
  complexCode: string;
  empNo: string;
  flatNo: string;
  allotmentDate?: string;
};

// Electric Reading
export async function getComplexList() {
  return apiRequest<any[]>('/api/v1/admin/complex-list');
}

export async function getBuildingsByComplex(complexCode: string) {
  return apiRequest<any[]>(`/api/v1/admin/buildings?complexCode=${complexCode}`);
}

export async function getFlatsByComplexBuilding(complexCode: string, building: string) {
  return apiRequest<any[]>(
    `/api/v1/admin/flats?complexCode=${complexCode}&building=${building}`
  );
}

export async function getEmployeeByFlatComplex(flatNo: string, complexCode: string) {
  return apiRequest<any>(`/api/v1/admin/employee?flatNo=${flatNo}&complexCode=${complexCode}`);
}

export async function submitElectricReading(data: ElectricReadingForm) {
  return apiRequest<any>(
    '/api/v1/admin/electric-reading',
    { body: JSON.stringify(data), method: 'POST' },
    { withCsrf: true }
  );
}

export async function listElectricReadings(params?: Record<string, any>) {
  return apiRequest<any[]>(`/api/v1/admin/electric-readings${toQueryString(params ?? {})}`);
}

// IFMS Master
export async function listIFMSMaster() {
  return apiRequest<IFMSMaster[]>('/api/v1/admin/ifms-master');
}

export async function createIFMSMaster(data: IFMSMaster) {
  return apiRequest<IFMSMaster>(
    '/api/v1/admin/ifms-master',
    { body: JSON.stringify(data), method: 'POST' },
    { withCsrf: true }
  );
}

export async function deleteIFMSMaster(id: number) {
  return apiRequest<any>(
    `/api/v1/admin/ifms-master/${id}`,
    { method: 'DELETE' },
    { withCsrf: true }
  );
}

// Assign Flats
export async function listFlatAssignments(complexCode?: string) {
  const query = complexCode ? `?complexCode=${complexCode}` : '';
  return apiRequest<FlatAssignment[]>(`/api/v1/admin/flat-assignments${query}`);
}

export async function getEmployeeListByComplex(complexCode: string) {
  return apiRequest<any[]>(`/api/v1/admin/employees?complexCode=${complexCode}`);
}

export async function getAvailableFlats(complexCode: string) {
  return apiRequest<any[]>(`/api/v1/admin/available-flats?complexCode=${complexCode}`);
}

export async function createFlatAssignment(data: FlatAssignment) {
  return apiRequest<FlatAssignment>(
    '/api/v1/admin/flat-assignments',
    { body: JSON.stringify(data), method: 'POST' },
    { withCsrf: true }
  );
}

export async function updateFlatAssignment(id: number, data: FlatAssignment) {
  return apiRequest<FlatAssignment>(
    `/api/v1/admin/flat-assignments/${id}`,
    { body: JSON.stringify(data), method: 'PATCH' },
    { withCsrf: true }
  );
}
