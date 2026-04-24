import type { MasterResource } from '../api/masterData';

export type MasterField = {
  key: string;
  label: string;
  placeholder: string;
  required?: boolean;
  type?: 'text' | 'email' | 'number';
};

export type MasterPageConfig = {
  title: string;
  description: string;
  resource: MasterResource;
  allowedRoles: string[];
  fields: MasterField[];
  defaults?: Record<string, string>;
};

const adminRoles = ['ADMIN', 'COMPLEX_ADMIN', 'SYSTEM_ADMIN'];

export const masterPageConfigs: Record<string, MasterPageConfig> = {
  vendors: {
    title: 'Vendor Master',
    description: 'Maintain the vendor master rows that drive complaint assignments and communication details.',
    resource: 'vendors',
    allowedRoles: adminRoles,
    defaults: { isActive: '1' },
    fields: [
      { key: 'vendorCode', label: 'Vendor code', placeholder: 'V001', required: true },
      { key: 'vendorName', label: 'Vendor name', placeholder: 'A-One Services', required: true },
      { key: 'email', label: 'Email', placeholder: 'vendor@example.com', type: 'email' },
      { key: 'phone', label: 'Phone', placeholder: '9876543210' },
      { key: 'category', label: 'Category', placeholder: 'PLUMBING' },
      { key: 'isActive', label: 'Active flag', placeholder: '1' },
    ],
  },
  'vendor-mappings': {
    title: 'Vendor Mapping',
    description: 'Preserve the complex/building/category routing model, including the ALL-building fallback rows.',
    resource: 'vendor-mappings',
    allowedRoles: adminRoles,
    defaults: { status: 'A' },
    fields: [
      { key: 'vendorCode', label: 'Vendor code', placeholder: 'V001', required: true },
      { key: 'complexCode', label: 'Complex code', placeholder: 'MUMBAI', required: true },
      { key: 'buildingCode', label: 'Building code', placeholder: 'B1 or ALL', required: true },
      { key: 'categoryId', label: 'Category ID', placeholder: '4', type: 'number', required: true },
      { key: 'status', label: 'Status', placeholder: 'A' },
    ],
  },
  'complaint-categories': {
    title: 'Complaint Categories',
    description: 'Maintain top-level complaint types used by residents, IFMS, and reporting.',
    resource: 'complaint-categories',
    allowedRoles: adminRoles,
    defaults: { status: 'A' },
    fields: [
      { key: 'categoryName', label: 'Category name', placeholder: 'Electrical', required: true },
      { key: 'status', label: 'Status', placeholder: 'A' },
    ],
  },
  'complaint-subcategories': {
    title: 'Complaint Subcategories',
    description: 'Capture category-linked subcategories so the complaint form and reports can stay aligned.',
    resource: 'complaint-subcategories',
    allowedRoles: adminRoles,
    defaults: { status: 'A' },
    fields: [
      { key: 'categoryId', label: 'Category ID', placeholder: '4', type: 'number', required: true },
      { key: 'subcategoryName', label: 'Subcategory name', placeholder: 'Leakage', required: true },
      { key: 'status', label: 'Status', placeholder: 'A' },
    ],
  },
  'po-items': {
    title: 'PO Items',
    description: 'Maintain AGTM-linked PO master rows used later by the IFMS workbench and voucher flow.',
    resource: 'po-items',
    allowedRoles: adminRoles,
    defaults: { status: '1' },
    fields: [
      { key: 'categoryId', label: 'Category ID', placeholder: '4', type: 'number' },
      { key: 'itemName', label: 'Item name', placeholder: 'Motor rewinding', required: true },
      { key: 'agtmItemNumber', label: 'AGTM item number', placeholder: '120', type: 'number' },
      { key: 'unitRate', label: 'Unit rate', placeholder: '3500', type: 'number' },
      { key: 'accountCode', label: 'Account code', placeholder: '410020' },
      { key: 'status', label: 'Status', placeholder: '1' },
    ],
  },
  'ifms-members': {
    title: 'IFMS Members',
    description: 'Manage IFMS team members for access control, queues, and future notification routing.',
    resource: 'ifms-members',
    allowedRoles: adminRoles,
    defaults: { status: '1' },
    fields: [
      { key: 'empNo', label: 'Employee number', placeholder: '31982600', required: true },
      { key: 'memberName', label: 'Member name', placeholder: 'IFMS Coordinator', required: true },
      { key: 'email', label: 'Email', placeholder: 'ifms@example.com', type: 'email' },
      { key: 'complexCode', label: 'Complex code', placeholder: 'MUMBAI' },
      { key: 'status', label: 'Status', placeholder: '1' },
    ],
  },
  statuses: {
    title: 'Status Catalog',
    description: 'Keep the status catalog visible while the legacy complaint and inventory status meanings are validated.',
    resource: 'statuses',
    allowedRoles: adminRoles,
    fields: [
      { key: 'id', label: 'Status ID', placeholder: '20', type: 'number', required: true },
      { key: 'statusName', label: 'Status name', placeholder: 'Submitted', required: true },
      { key: 'domainName', label: 'Domain', placeholder: 'COMPLAINT' },
      { key: 'description', label: 'Description', placeholder: 'Resident complaint submitted' },
    ],
  },
};
