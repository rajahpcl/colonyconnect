export type SessionUser = {
  empNo: string;
  name: string;
  role: string;
  roles: string[];
  complexCode?: string | null;
  complexName?: string | null;
  flatNo?: string | null;
  vehicleRegistered: boolean;
  redirectUrl: string;
};
