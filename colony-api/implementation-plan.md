# Implementation Plan: JSP to React + SpringBoot Migration

**Based on:** MODERNIZATION_BLUEPRINT.md (2026-04-21)
**Target Architecture:** Spring Boot API + React SPA (modular monolith)

---

## Phase 0: Discovery & Foundation (Weeks 1-2)

### 0.1 Schema Mapping & DB Access
- [ ] Connect to Oracle DB via existing `connection.jsp` credentials
- [ ] Reverse-engineer all tables listed in blueprint section 2.7
- [ ] Document current `COLONY_STATUS` meanings (confirm status 54)
- [ ] Validate complaint status IDs: 10,15,20,25,30,40,50,51,52,53,55,60,70,110,120,130
- [ ] Capture sample data exports from Report.jsp, Dashboard.jsp for UAT comparison

### 0.2 Role Matrix & Business Validation
- [ ] Interview SMEs on active pages: `buildingMstr.jsp`, `VendorViewList.jsp`, `electric_rate_add.jsp`
- [ ] Confirm vendor user login path status (active vs deprecated)
- [ ] Validate "vehicle details required before complaints" rule relevance
- [ ] Document security PIN workflow target identity model
- [ ] Determine audit/retention requirements for complaint history, OTP logs

### 0.3 Technical Environment Setup
- [ ] Set up Oracle DB connection (reuse existing credentials)
- [ ] Set up SAP SQL Server connection for dependent lookup
- [ ] Configure LDAP access or confirm SSO upgrade path
- [ ] Set up email service integration
- [ ] Set up SMS service for OTP
- [ ] Configure attachment storage (object store or secured file system)

### 0.4 Project Initialization
- [ ] Create Spring Boot project (`colony-api`) with dependencies:
  - Spring Web, Security, Data JPA
  - Oracle JDBC driver
  - SQL Server JDBC driver
  - Flyway/Liquibase
  - Lombok, mapstruct
- [ ] Create React project (`colony-web`) with Vite, TypeScript
- [ ] Configure CORS and reverse proxy routing for coexistence period

**Deliverables:** Schema documentation, role matrix, working dev environments

---

## Phase 1: Auth Shell + Master Data (Weeks 3-6)

### 1.1 Backend Foundation
- [ ] Configure Spring Boot application properties (externalized config)
- [ ] Set up Oracle and SAP datasources
- [ ] Implement AuthService with employee/vendor lookup
- [ ] Implement RoleService for role resolution
- [ ] Implement Security config with session cookies and CSRF

### 1.2 Authentication Endpoints
- [ ] `POST /api/v1/auth/login` - employee/vendor login
- [ ] `POST /api/v1/auth/logout`
- [ ] `GET /api/v1/auth/me` - current user info
- [ ] `POST /api/v1/auth/security-login` - security PIN login
- [ ] `GET /api/v1/auth/sso/start` - SSO redirect
- [ ] `GET /api/v1/auth/sso/callback` - SSO callback

### 1.3 Master Data APIs
- [ ] `GET/POST /api/v1/masters/vendors` - vendor CRUD
- [ ] `GET /api/v1/masters/vendors/by-code/{code}` - vendor lookup
- [ ] `GET/POST /api/v1/masters/vendor-mappings` - vendor-complex-category mapping
- [ ] `GET/POST /api/v1/masters/complaint-categories` - category CRUD
- [ ] `GET/POST /api/v1/masters/complaint-subcategories` - subcategory CRUD
- [ ] `GET/POST /api/v1/masters/po-items` - PO items CRUD
- [ ] `GET /api/v1/masters/po-items/next-number` - next AGTM number
- [ ] `GET/POST /api/v1/masters/ifms-members` - IFMS team CRUD
- [ ] `GET /api/v1/masters/statuses` - status catalog

### 1.4 Vendor Routing Service
- [ ] Implement vendor derivation from complex/building/category mapping
- [ ] Preserve fallback logic to "ALL" building mapping

### 1.5 Frontend Shell
- [ ] Set up React router with route structure
- [ ] Implement AppShell component with navigation
- [ ] Implement ProtectedRoute with role-based guards
- [ ] Implement RoleBasedNav based on user roles

### 1.6 Frontend Auth Pages
- [ ] LoginPage with employee/vendor credentials
- [ ] SecurityLoginPage with PIN

### 1.7 Frontend Master Data Pages
- [ ] VendorMasterPage
- [ ] VendorMappingPage
- [ ] ComplaintCategoryPage
- [ ] ComplaintSubcategoryPage
- [ ] PoMasterPage
- [ ] IfmsMasterPage

**Deliverables:** Working auth + master data in new stack, React app shell

---

## Phase 2: Resident Complaint MVP (Weeks 7-10)

### 2.1 Complaint Backend
- [ ] Implement ComplaintService (CRUD)
- [ ] Implement AttachmentService for file uploads
- [ ] Implement ComplaintWorkflowService (state transitions, history)
- [ ] `POST /api/v1/complaints` - create complaint
- [ ] `GET /api/v1/complaints/{id}` - get complaint
- [ ] `PATCH /api/v1/complaints/{id}` - update complaint
- [ ] `POST /api/v1/complaints/{id}/attachments` - upload attachment
- [ ] `GET /api/v1/complaints/{id}/history` - history timeline

### 2.2 Resident Complaint Pages
- [ ] ComplaintCreatePage with form
- [ ] ComplaintDetailPage with history timeline
- [ ] MyComplaintsPage (resident complaint list)
- [ ] Implement EmployeeSearchDialog
- [ ] Implement ComplexBuildingFlatSelector
- [ ] Implement AttachmentUploader

### 2.3 Vehicle Gate
- [ ] VehicleInfoPage for resident vehicle registration
- [ ] Implement "no vehicle" option
- [ ] Enforce vehicle check before complaint access (gate logic)

### 2.4 Family OTP Flow
- [ ] `POST /api/v1/auth/family/send-otp` - send OTP
- [ ] `POST /api/v1/auth/family/verify-otp` - verify OTP
- [ ] FamilyLoginPage with two-step OTP
- [ ] `GET /api/v1/resident/family-access` - list family members
- [ ] `POST/DELETE /api/v1/resident/family-access` - manage family access

### 2.5 Notification Integration
- [ ] Implement NotificationService (email abstraction)
- [ ] Wire complaint creation/submission emails
- [ ] Connect to SMS service for OTP

**Deliverables:** Resident-facing complaint flow, vehicle gate, family OTP

---

## Phase 3: IFMS & Complaint Operations (Weeks 11-16)

### 3.1 IFMS Backend
- [ ] Implement IfmsService
- [ ] `GET /api/v1/ifms/complaints/pending` - pending queue
- [ ] `GET /api/v1/ifms/complaints` - handled list
- [ ] `GET /api/v1/ifms/complaints/{id}` - IFMS work view
- [ ] `POST /api/v1/ifms/complaints/{id}/transition` - status transition
- [ ] `POST /api/v1/ifms/complaints/{id}/po-lines` - add PO items
- [ ] `DELETE /api/v1/ifms/complaints/{id}/po-lines/{lineId}` - remove PO items

### 3.2 Proxy Complaint
- [ ] `GET /api/v1/residents/by-complex/{code}/flats` - flats by complex
- [ ] `GET /api/v1/residents/by-flat` - employee lookup by flat
- [ ] `POST /api/v1/complaints/proxy` - proxy complaint creation

### 3.3 Voucher Generation
- [ ] Implement ReportsService
- [ ] `GET /api/v1/reports/vouchers/{complaintId}` - voucher download
- [ ] Backend PDF generation or React printable page

### 3.4 IFMS Pages
- [ ] IfmsPendingPage - pending queue
- [ ] IfmsComplaintWorkPage - main workbench (highest complexity)
- [ ] IfmsRequestListPage - handled/completed list
- [ ] ProxyComplaintPage - raise for another resident

### 3.5 Admin Complaint Pages
- [ ] ComplaintAdminListPage with filters
- [ ] `GET /api/v1/complaints/admin` - admin complaint list

**Deliverables:** Full IFMS workflow, proxy complaints, voucher generation

---

## Phase 4: Reports & Electricity (Weeks 17-20)

### 4.1 Dashboard & Reports
- [ ] `GET /api/v1/reports/complaints/dashboard` - complaint summary
- [ ] `GET /api/v1/reports/complaints` - complaint search/export
- [ ] ComplaintDashboardPage
- [ ] ComplaintReportPage with filters and Excel export
- [ ] `POST /api/v1/reports/complaints/print` - Word export

### 4.2 Electricity Backend
- [ ] Implement ElectricityService
- [ ] `GET/POST /api/v1/electricity/rates` - rate maintenance
- [ ] `POST /api/v1/electricity/calculate` - bill calculation
- [ ] `GET/POST /api/v1/electricity/readings` - reading entry
- [ ] `POST /api/v1/electricity/readings/{id}/approve` - approve reading
- [ ] `GET /api/v1/electricity/readings/last` - last reading lookup

### 4.3 Electricity Frontend
- [ ] ElectricRatePage - monthly tariff setup
- [ ] ElectricReadingAdminPage - reading entry/approval
- [ ] ResidentElectricityPage - resident bill view

### 4.4 Vehicle Report
- [ ] `GET /api/v1/reports/vehicles` - vehicle report
- [ ] VehicleReportPage

### 4.5 Resident Self-Service Documents
- [ ] Serve static PDFs (Approved_Make.pdf, Contact_Details.pdf)
- [ ] ResidentReferencePage or direct links

**Deliverables:** Full reporting suite, electricity module, resident self-service

---

## Phase 5: Inventory & Housing Handover (Weeks 21-24)

### 5.1 Inventory Backend
- [ ] Implement InventoryService
- [ ] `GET /api/v1/inventory/{empNo}` - employee inventory
- [ ] `POST /api/v1/inventory` - create inventory
- [ ] `PATCH /api/v1/inventory/{id}` - update inventory
- [ ] `POST /api/v1/inventory/{id}/submit` - submit
- [ ] `POST /api/v1/inventory/{id}/approve` - admin approve
- [ ] `POST /api/v1/inventory/{id}/send-back` - send back
- [ ] `POST /api/v1/inventory/{id}/security-submit` - security capture
- [ ] `POST /api/v1/inventory/{id}/acknowledge` - employee acknowledge
- [ ] `POST /api/v1/inventory/{id}/hr-approve` - HR approval
- [ ] Wire housing_allotment updates on HR approval (type 'a')

### 5.2 Inventory Frontend
- [ ] InventoryFormPage - checklist form
- [ ] InventoryListPage - listing with type tabs
- [ ] InventoryWorkflowPage - security/HR/employee variants
- [ ] UndertakingModal - undertaking popup

### 5.3 Inventory Reports
- [ ] `GET /api/v1/reports/inventory` - inventory report
- [ ] InventoryReportPage

### 5.4 Flat Assignment
- [ ] `GET/POST /api/v1/admin/flat-assignments` - flat CRUD
- [ ] FlatAssignmentPage

### 5.5 Occupancy Report
- [ ] `GET /api/v1/reports/occupancy` - occupancy/vacancy report
- [ ] OccupancyReportPage

**Deliverables:** Inventory/housing handover workflow, occupancy reporting

---

## Phase 6: Hardening & Optimization (Weeks 25-28)

### 6.1 Role Hardening
- [ ] Audit all endpoint role checks
- [ ] Add server-side role enforcement (not just menu hiding)
- [ ] Implement proper complex admin normalization (remove comma-separated field)

### 6.2 Attachment Storage Migration
- [ ] Move attachments from webroot to object storage
- [ ] Update AttachmentService to use new storage
- [ ] Implement metadata table for attachments

### 6.3 Performance Tuning
- [ ] Optimize slow report queries (JdbcTemplate/MyBatis)
- [ ] Add pagination to all list endpoints
- [ ] Cache frequently accessed master data

### 6.4 Remaining Exports
- [ ] `GET /api/v1/reports/po-matrix` - PO vs complaints matrix
- [ ] `GET /api/v1/reports/po-quantity` - PO items vs total quantity
- [ ] Implement PoComplaintMatrixPage
- [ ] Implement PoQuantityReportPage

### 6.5 Security Improvements
- [ ] Remove hard-coded credentials from config
- [ ] Implement proper secret management
- [ ] Add request correlation IDs
- [ ] Add structured audit logging

**Deliverables:** Production-ready system with hardened security

---

## Phase 7: Cutover & Decommission (Weeks 29-30)

### 7.1 Coexistence Cleanup
- [ ] Feature-flag all migrated routes
- [ ] Route migrated traffic to new stack via reverse proxy
- [ ] Monitor error rates and performance

### 7.2 Data Cleanup
- [ ] Clean unused helper tables
- [ ] Archive or remove dead code: `GetInventoryData.jsp`, `colony_po_data.jsp`, test pages

### 7.3 JSP Retirement
- [ ] Disable JSP routes one by one
- [ ] Validate all functionality works in new stack
- [ ] Remove reverse proxy rules for JSP app

### 7.4 Final Validation
- [ ] Full UAT against original JSP outputs
- [ ] Sign-off from business SMEs
- [ ] Production cutover plan

**Deliverables:** Full migration complete, JSP app decommissioned

---

## Key Technical Decisions

### Backend Stack
- Spring Boot 3.x with Java 17+
- Spring Security with session cookies
- JPA for CRUD-heavy tables
- JdbcTemplate/MyBatis for report queries
- Flyway for DB migrations

### Frontend Stack
- React 18+ with TypeScript
- Vite for build
- React Router for routing
- TanStack Query for server state
- React Hook Form + Zod for forms
- Zustand for lightweight state

### Integration Points
| Integration | Approach |
|------------|----------|
| Oracle DB | Spring DataSource + JPA/JdbcTemplate |
| SAP SQL Server | Separate datasource for dependent lookup |
| LDAP | Spring Security LDAP (interim) or OIDC |
| Email | NotificationService with templates |
| SMS | Dedicated OTP service with throttling |
| File storage | Object storage or secured file system |

### API Conventions
- Base path: `/api/v1`
- GET for reads
- POST for workflow actions
- PATCH for targeted updates
- Multipart/form-data for uploads only

### Status Enums to Preserve
```
ComplaintStatus: 10,15,20,25,30,40,50,51,52,53,55,60,70
InventoryStatus: 10,11,20,30,110,120,130
```

---

## Dependencies & Sequence

```
Phase 0 ─────► Phase 1 ─────► Phase 2 ─────► Phase 3 ─────► Phase 4 ─────► Phase 5 ─────► Phase 6 ─────► Phase 7
   │              │              │              │              │              │              │              │
   ▼              ▼              ▼              ▼              ▼              ▼              ▼              ▼
Discovery    Auth+Master    Resident      IFMS+Proxy    Reports+      Inventory    Hardening    Decommission
             Data           Complaints   Operations    Electricity   +Housing
```

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Missing source for Gen_Email, SMS, AES utils | Reimplement with current enterprise libraries |
| Inconsistent authorization | Add server-side role checks, normalize admin model |
| Duplicate complaint pages | Consolidate into single complaint UI with mode flags |
| Status magic numbers | Formalize status enums, document all values |
| SQL injection in legacy code | Use parameterized queries in new implementation |
| Data model cleanup | Preserve legacy schema initially, improve in later phases |

---

## Estimated Effort Summary

| Phase | Key Modules | Effort |
|-------|------------|--------|
| 1 | Auth, Master Data | High |
| 2 | Complaints, Vehicle, Family OTP | High |
| 3 | IFMS, Proxy, Vouchers | Very High |
| 4 | Reports, Electricity | High |
| 5 | Inventory, Housing | Very High |
| 6 | Hardening, Performance | Medium |
| 7 | Cutover | Low |

**Total Estimated Duration:** ~30 weeks (with team of 3-4 developers)