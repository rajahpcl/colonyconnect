# Legacy JSP Application Modernization Blueprint

Scope date: 2026-04-21

Source basis: This blueprint is based only on files present in this workspace at `d:\HPCL\PH-Dev\ColonyManagement\colony_management`. I found no Java source files, servlet source files, build files, SQL scripts, property files, or deployment descriptors in the workspace; the current application is effectively an exploded JSP-era webapp plus compiled classes and third-party jars. Wherever intent could not be proven from the files, it is marked as an assumption.

## 1. Executive Summary

The legacy application is a JSP/scriptlet-heavy internal web application centered on colony complaint management, with supporting modules for IFMS task handling, vendor mapping, PO items, electricity readings, inventory/housing handover, vehicle registration, family-member OTP access, and operational reports.

Technically, the application is tightly coupled to live databases and infrastructure:

- Oracle via `connection.jsp`
- SAP SQL Server via `connection_sap.jsp`
- LDAP via `login.jsp`
- HPCL SSO/AES handshake via `index1.jsp`, `login_encrypt.jsp`, `login_encrypt1.jsp`
- Email via `WEB-INF/classes/gen_email/Gen_Email.class`
- SMS via `WEB-INF/classes/hpspeedsms/*`

The biggest modernization drivers are:

- Business logic, SQL, workflow transitions, validation, uploads, and email/SMS are embedded inside JSPs.
- Authentication, session, and authorization are inconsistent and partly menu-driven rather than centrally enforced.
- Secrets and integration endpoints are hard-coded in JSPs.
- There is heavy duplicated logic across pages like `request.jsp`, `request_proxy.jsp`, `request_test.jsp`, `electric_reading.jsp`, and `get_calulate_reading.jsp`.
- The workspace lacks source/build history for compiled helpers, so some behavior must be reimplemented rather than directly ported.

Recommended migration approach: a strangler-pattern migration to a new Spring Boot backend and React frontend, initially against the same Oracle database, with modules replaced in business-value order rather than a full big-bang rewrite.

Recommended implementation order:

1. Authentication/session shell and shared master-data APIs
2. Resident complaint creation and tracking
3. IFMS complaint handling, vendor assignment, PO capture, voucher/report flows
4. Resident self-service and electricity modules
5. Inventory/housing handover module
6. Reports/downloads, data cleanup, and hardening

## 2. Legacy Application Inventory

### 2.1 File Inventory

Observed top-level and bundled artifacts:

- `73` JSP files in the application root
- `23` JavaScript files under `js/`
- `19` CSS files under `css/` including nested vendor assets
- `48` image/PDF assets under `images/`
- `13` jars under `WEB-INF/lib/`
- `7` compiled classes under `WEB-INF/classes/`
- `0` Java source files
- `0` servlet source files
- `0` `pom.xml` / `build.gradle` / `package.json`
- `0` `web.xml`
- `0` SQL scripts
- `0` application property/yaml files
- `0` batch/shell scripts in this workspace

### 2.2 Runtime Shape

This is not a modern source-first project. It looks like a deployed or unpacked WAR assembled elsewhere.

Evidence:

- `META-INF/MANIFEST.MF` shows `Created-By: 1.7.0_21`
- `WEB-INF/lib/` contains runtime jars only
- `WEB-INF/classes/` contains only compiled helper classes, not source

[Assumption] The original build/deployment pipeline and some shared corporate libraries live outside this workspace.

### 2.3 Shared Includes and Layout

Core shared files:

- `header.jsp`: shared navigation, manual CSRF token check via `ct`, session reads, role/menu logic, theme/font preferences
- `footer.jsp`: shared footer
- `connection.jsp`: Oracle connection bootstrap
- `connection_sap.jsp`: SAP SQL Server connection bootstrap
- `common.jsp`: global flag `send_mail = true`

### 2.4 Compiled Helpers and Missing Source

Present as compiled classes only:

- `WEB-INF/classes/gen_email/Gen_Email.class`
- `WEB-INF/classes/hpspeedsms/HpSpeedSMS*.class`

Referenced but not present as source in workspace:

- `com.toml.dp.util.AES128Bit` from `index1.jsp`, `login_encrypt.jsp`, `login_encrypt1.jsp`

Implication: email, SMS, and AES/SSO helper behavior must be reimplemented or sourced from current enterprise libraries during migration.

### 2.5 Third-Party Libraries

Bundled jars in `WEB-INF/lib/`:

- `ojdbc6.jar`: Oracle JDBC
- `jtds-1.3.1.jar`: SQL Server JDBC
- `mysql-connector-java-3.1.6-bin.jar`: present but no direct evidence of current MySQL use
- `mail.jar`: email support
- `poi-3.9-20121203.jar`, `poi-ooxml-3.9-20121203.jar`, `poi-ooxml-schemas-3.9-20121203.jar`: Office export support
- `commons-fileupload-1.3.jar`, `commons-io-2.4.jar`: multipart upload handling
- `jstl-1.2.jar`: JSTL
- `jt400.jar`: present; no clear usage seen in JSPs
- `aes6.0.jar`: likely corporate AES utility dependency

Frontend library usage from static assets and CDNs:

- Multiple jQuery versions: `jquery-1.11.1`, `jquery-3.2.1`, `jquery-3.3.1`, plus jQuery 3.6 from CDN
- Bootstrap
- jQuery UI
- Select2
- DataTables and export plugins
- Magnific Popup
- Jssor slider
- html2pdf.js

### 2.6 Data Stores and External Dependencies

Confirmed integrations from actual files:

| Dependency | Evidence | Usage |
| --- | --- | --- |
| Oracle app DB | `connection.jsp` | Main colony app data, workflow, housing, vendor, report tables |
| SAP SQL Server | `connection_sap.jsp`, `LoginDetails.jsp` | Dependent/family-member lookup |
| LDAP | `login.jsp` | Employee authentication |
| HPCL SSO | `index1.jsp`, `login_encrypt.jsp`, `login_encrypt1.jsp` | SSO bootstrap/login handoff |
| Email engine | `request.jsp`, `request_proxy.jsp`, `request_test.jsp`, `bvg_request.jsp`, `electric_reading.jsp`, `inventory_security.jsp`, `test_email.jsp` | Notifications |
| SMS | `index3.jsp`, `otp_test11.jsp` | Family OTP |
| File system under webroot | `request.jsp`, `request_proxy.jsp`, `request_test.jsp`, `bvg_request.jsp` | Attachment storage in `Attachment_Upload/` |

### 2.7 Important Tables and Schemas

High-traffic tables inferred from JSP usage:

- `COLONY_REQUEST`
- `COLONY_ACTION_HISTORY`
- `COLONY_STATUS`
- `COLONY_COMPLAINT_CATEGORY`
- `COLONY_COMPLAINT_SUBCATEGORY`
- `COLONY_VENDOR_MSTR`
- `colony_vendor_mapping`
- `COLONY_PO_MASTER`
- `colony_po_submitted`
- `COLONY_BVG_MASTER`
- `COLONY_ELECTRIC_RATE`
- `COLONY_ELECTRIC_READING`
- `COLONY_INVENTORY_MAIN`
- `colony_inventory_entry`
- `COLONY_INVENTORY_HISTORY`
- `COLONY_INVENTORY_MASTER`
- `COLONY_VEHICLEINFO`
- `colony_family_member_login`
- `colony_login_otp`
- `housing_complex_list`
- `housing_alloted`
- `housing_allotment`
- `housing_allotment_audit`
- `housing_master`
- `workflow.empmaster`
- `DISB.user_mstr`
- `disb.vendemail`
- `${sap_schema}.ZHRCV_DEPENDENT`

### 2.8 Missing and Notable Absences

Not found in workspace:

- Controller source
- Service/repository layers
- Central configuration
- Automated tests
- Database DDL/migration scripts
- API documentation
- Role definitions outside JSP/menu logic

This materially increases migration discovery effort.

## 3. Module/Page Catalog

### 3.1 Business Modules

| Module | Primary Pages | Helper Pages | Actors |
| --- | --- | --- | --- |
| Authentication and access | `index.jsp`, `index_security.jsp`, `index1.jsp`, `index3.jsp`, `login.jsp`, `login_encrypt.jsp`, `login_encrypt1.jsp`, `logout.jsp`, `LoginDetails.jsp` | `connection.jsp`, `connection_sap.jsp` | Employee, family member, security, vendor, IFMS |
| Resident complaint management | `request.jsp`, `request_test.jsp`, `myRequestList.jsp`, `proxy_request.jsp`, `request_proxy.jsp` | `GetSubCategory.jsp`, `admin_emp_search.jsp`, `admin_emp_search_page.jsp`, `get_flats.jsp` | Resident, family member, IFMS/admin proxy |
| Complaint operations and IFMS | `AdminViewList.jsp`, `Dashboard.jsp`, `Report.jsp`, `bvg_pending.jsp`, `bvg_request.jsp`, `bvgAckByMe.jsp`, `generate_voucher.jsp`, `print_complaint.jsp` | `get_po_rate.jsp` | Admin, IFMS, vendor |
| Master data and admin config | `vendorMstr.jsp`, `colony_vendor_mapping.jsp`, `colony_po.jsp`, `AddComplaintType.jsp`, `AddSubCategoryType.jsp`, `bvg_master.jsp`, `status_master.jsp`, `admin_role.jsp`, `colonyassign.jsp`, `buildingMstr.jsp` | `GetVendorData.jsp`, `GetVendorCategoryList.jsp`, `GetBuildingInfo2.jsp`, `fetchAgtmItem.jsp` | Admin |
| Electricity | `electric_rate.jsp`, `electric_rate_add.jsp`, `electric_reading.jsp`, `emp_electric_reading.jsp` | `GetBuildingInfo.jsp`, `Getflatno.jsp`, `GetEmployeeAlloted.jsp`, `GetLastReading.jsp`, `get_calulate_reading.jsp` | Admin, security, resident |
| Inventory / housing handover | `Inventory.jsp`, `Inventory_List.jsp`, `inventory_security.jsp`, `inventory_report.jsp`, `undertaking_residence.jsp` | `GetEmpData.jsp`, `List.jsp`, `GetInventoryData.jsp` | Employee, security, HR/admin |
| Resident self-service | `vehicle_info.jsp`, `vehicle_report.jsp`, `LoginDetails.jsp`, static PDFs via `images/*.pdf` | - | Resident, admin |
| Legacy/test/stale | `VendorViewList.jsp`, `otp_test11.jsp`, `test_email.jsp`, `colony_po_data.jsp` | - | Developer/test/unknown |

### 3.2 Navigation Observed from `header.jsp`

Main navigation groups:

- Home
- IFMS Task
- Complaints
- Admin
- Masters
- Report
- Resident Dashboard
- Logout

Key role/menu conditions in `header.jsp`:

- `isAdmin`
- `isVendor`
- IFMS/BVG inferred from `COLONY_BVG_MASTER`
- family-member session state
- special-case status master visibility for employee `31982600`

Important finding: page authorization is not consistently enforced server-side. Many admin/master/report pages only check whether `empno` exists and rely on the menu to hide access. Example pages include `vendorMstr.jsp`, `electric_rate.jsp`, `Inventory_List.jsp`, `Report.jsp`, `vehicle_report.jsp`, and others.

### 3.3 Core Functional Actors

Observed roles from actual files:

- Resident employee
- Family member using OTP-based proxy login
- Security user using PIN `1234`
- Vendor user authenticated through `disb.user_mstr`
- Complex admin
- IFMS/BVG team member
- HR/admin for inventory/electricity/master data

## 4. Target Architecture Proposal

### 4.1 Recommended Architecture Style

Use a modular monolith first, not microservices.

Rationale:

- The current app is one tightly coupled deployment.
- Modules share the same Oracle data model.
- There is no existing API boundary to preserve.
- The immediate challenge is behavior extraction, access control, and data cleanup, not independent scaling.

Recommended deployment units:

- `colony-api`: Spring Boot application
- `colony-web`: React SPA
- Shared object/file storage for attachments
- Reverse proxy / ingress routing

### 4.2 Proposed Frontend Structure

Recommended stack:

- React + TypeScript
- Vite
- React Router
- TanStack Query for server state
- React Hook Form + Zod for forms/validation
- Zustand or Context for auth/session and lightweight UI state
- Component library based on a shared design system

Suggested route structure:

- `/login`
- `/family-login`
- `/security-login`
- `/app/home`
- `/app/complaints/new`
- `/app/complaints/:id`
- `/app/complaints/my`
- `/app/complaints/admin`
- `/app/ifms/pending`
- `/app/ifms/requests`
- `/app/ifms/requests/:id`
- `/app/ifms/proxy-request`
- `/app/masters/vendors`
- `/app/masters/vendor-mappings`
- `/app/masters/complaint-categories`
- `/app/masters/complaint-subcategories`
- `/app/masters/po-items`
- `/app/admin/electricity/rates`
- `/app/admin/electricity/readings`
- `/app/resident/electricity`
- `/app/resident/vehicles`
- `/app/resident/family-access`
- `/app/inventory`
- `/app/inventory/:id`
- `/app/reports/*`

### 4.3 Proposed Backend Layering

Recommended Spring Boot layering:

- Controllers: REST endpoints only
- Application services: workflow orchestration and transaction boundaries
- Domain services: complaint, electricity, inventory, auth, master data rules
- Repositories:
  - JPA repositories for CRUD-heavy tables
  - `JdbcTemplate` or MyBatis/jOOQ for report-heavy SQL and legacy joins
- Integration adapters:
  - Oracle main DB
  - SAP dependent lookup
  - corporate SSO/LDAP
  - email/SMS
  - file/object storage

Suggested package/modules:

- `auth`
- `complaints`
- `ifms`
- `vendors`
- `masters`
- `electricity`
- `inventory`
- `resident`
- `reports`
- `integrations`
- `common`

### 4.4 API Design Approach

Use REST JSON APIs with consistent resource boundaries and audit metadata.

Conventions:

- Base path `/api/v1`
- `GET` for reads and filters
- `POST` for workflow actions that change state
- `PATCH` for targeted updates
- `multipart/form-data` only for upload endpoints
- Async or generated-file endpoints for large exports
- Standardized pagination and filtering contracts

### 4.5 Authentication and Session Strategy

Recommended target:

- Spring Security with server-side session cookies for the internal web app
- Corporate SSO/OIDC preferred for employees and IFMS users
- Vendor auth either via dedicated realm or federated local credential bridge
- Separate OTP flow for family-member access
- CSRF protection handled by Spring Security, not manual `ct` query parameters

[Assumption] HPCL can expose a modern SSO/OIDC/SAML integration for the replacement system. If not, keep LDAP/legacy SSO as an interim adapter inside the auth module.

### 4.6 State Management Approach

- TanStack Query for fetched lists/details
- Form-local state for data entry
- Lightweight global state for:
  - current user
  - role set
  - complex selection filters
  - UI preferences if still needed

Avoid storing sensitive auth tokens in browser storage.

### 4.7 Error Handling and Logging

Backend:

- `@ControllerAdvice` with RFC 7807 Problem Details responses
- Validation errors returned with field-level messages
- Structured audit logging for complaint, inventory, and master-data changes
- Correlation/request IDs
- Integration failure logging with retry policy where appropriate

Frontend:

- Standard API error banners
- Field-level validation messages
- Workflow-safe optimistic updates only where low risk

### 4.8 Deployment Considerations

- Externalize all secrets and URLs
- Move attachments out of webroot to object storage or secured file storage
- Containerize API and frontend separately
- Put DB migration under Flyway/Liquibase once schema ownership is established
- Maintain a coexistence route plan during migration:
  - old JSP app continues serving untouched modules
  - reverse proxy sends migrated routes to React/Spring Boot

## 5. Detailed Module-Wise Migration Plan

### 5.1 Authentication and Access

| Page / Flow | Current Purpose | Legacy Files | Business Logic Used | Spring Boot APIs / Services | React Pages / Components | Tables / Integrations | Validations / Risks | Sequence | Effort |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Employee login | Main resident/admin/vendor login | `index.jsp`, `login.jsp`, `logout.jsp`, `header.jsp` | Employee lookup in `workflow.empmaster`; LDAP auth; vendor auth from `disb.user_mstr`; admin inferred from `housing_complex_list.complex_admin`; forced vehicle-info gate | `POST /auth/login`, `POST /auth/logout`, `GET /auth/me`; `AuthService`, `RoleResolver`, `VehicleGateService` | `LoginPage`, `AppShell`, route guards | `workflow.empmaster`, `disb.user_mstr`, `housing_complex_list`, `COLONY_VEHICLEINFO`, LDAP | Hard-coded bypass password in `login.jsp`; session via JSP; mixed employee/vendor auth logic; direct role inference from comma-separated field | Phase 1 | High |
| Security login | PIN-based security access | `index_security.jsp`, `login.jsp` | Hard-coded PIN `1234`, session user `SECURITY`, limited home actions | `POST /auth/security-login` | `SecurityLoginPage` | none beyond session | Weak auth model; must be replaced by real credential/role model | Phase 1 | Medium |
| SSO employee login | Redirect through HPCL SSO and AES token handling | `index1.jsp`, `login_encrypt.jsp` | AES-based APPID/time/version request; decrypt empno on return; create session and admin flag | `GET /auth/sso/start`, `GET /auth/sso/callback` or OIDC adapter | no dedicated page beyond redirect callback | HPCL SSO, `workflow.empmaster`, `housing_complex_list`, AES lib | Current implementation depends on missing helper source and hard-coded keys | Phase 1 | High |
| IFMS SSO login | SSO-based IFMS member login | `login_encrypt1.jsp` | Decrypt token, verify in `COLONY_BVG_MASTER`, login as IFMS | `GET /auth/ifms/callback` | callback-only | `COLONY_BVG_MASTER`, SSO/AES | Same key-management issue as employee SSO | Phase 1 | High |
| Family OTP login | Family member mobile-based login | `index3.jsp`, `login.jsp` | Verify mobile in `colony_family_member_login`; create OTP in `colony_login_otp`; send SMS; verify within 300 seconds; login on behalf of employee | `POST /auth/family/send-otp`, `POST /auth/family/verify-otp` | `FamilyLoginPage`, OTP stepper | `colony_family_member_login`, `colony_login_otp`, SMS service | OTP and SMS logic embedded in JSP; OTP invalidation and throttling need formalization | Phase 2 | Medium |
| Family access maintenance | Employee manages which family members can use OTP | `LoginDetails.jsp`, `connection_sap.jsp` | Read dependents from SAP `ZHRCV_DEPENDENT`; insert/deactivate `colony_family_member_login` entries | `GET /resident/family-members`, `POST /resident/family-access`, `DELETE /resident/family-access/{id}` | `FamilyAccessPage` | SAP SQL Server, `colony_family_member_login` | Cross-DB dependency; user-visible mobile validation only on client side | Phase 4 | Medium |

### 5.2 Resident Complaint Management

| Page / Flow | Current Purpose | Legacy Files | Business Logic Used | Spring Boot APIs / Services | React Pages / Components | Tables / Integrations | Validations / Risks | Sequence | Effort |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| New complaint / edit saved complaint | Create, save, edit, and view complaint | `request.jsp`, `request_test.jsp`, `admin_emp_search.jsp`, `admin_emp_search_page.jsp`, `GetSubCategory.jsp` | Status `10` save vs `20` submit; derive building from `housing_master`; vendor mapping from `colony_vendor_mapping` with building fallback to `ALL`; attachment upload; insert `COLONY_REQUEST` + `COLONY_ACTION_HISTORY`; email resident and IFMS | `POST /complaints`, `PATCH /complaints/{id}`, `GET /complaints/{id}`, `POST /complaints/{id}/attachments`; `ComplaintService`, `AttachmentService`, `ComplaintWorkflowService` | `ComplaintCreatePage`, `ComplaintDetailPage`, `ComplaintForm`, `AttachmentUploader`, `EmployeeSearchDialog` | `COLONY_REQUEST`, `COLONY_ACTION_HISTORY`, `COLONY_COMPLAINT_CATEGORY`, `COLONY_COMPLAINT_SUBCATEGORY`, `colony_vendor_mapping`, `housing_master`, `housing_alloted`, email | Business logic duplicated across three JSPs; uploads stored in webroot; no centralized validation; admin actions mixed into same page | Phase 2 | High |
| My complaints | Resident complaint list | `myRequestList.jsp` | Lists own complaints; saved complaints route to `request_test.jsp`; others to `request.jsp?view=View` | `GET /complaints/my` | `MyComplaintsPage`, list/grid component | `colony_request`, `colony_status`, category tables | Relies on status semantics and duplicate page behavior | Phase 2 | Medium |
| Proxy complaint selection | Raise complaint for another resident | `proxy_request.jsp`, `get_flats.jsp` | Choose complex + flat to derive employee, or enter employee directly, then hand off to `request_proxy.jsp` | `GET /residents/by-complex/{code}/flats`, `GET /residents/by-flat`, `POST /complaints/proxy` | `ProxyComplaintPage`, resident selector | `housing_alloted`, `housing_complex_list` | Two different resident-selection paths must be unified and authorization tightened | Phase 3 | Medium |
| Proxy complaint submit | IFMS/admin creates complaint on behalf of another employee | `request_proxy.jsp` | Same complaint creation workflow as `request.jsp`, but uses proxy employee and emails target resident | `POST /complaints/proxy` | reuse `ComplaintForm` with “on behalf of” mode | `COLONY_REQUEST`, `COLONY_ACTION_HISTORY`, same as complaint module | Duplicated code with high merge risk; should become a mode of the same complaint API | Phase 3 | Medium |

### 5.3 Complaint Operations, IFMS, and Vendor Workflow

| Page / Flow | Current Purpose | Legacy Files | Business Logic Used | Spring Boot APIs / Services | React Pages / Components | Tables / Integrations | Validations / Risks | Sequence | Effort |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Admin complaint list | Search/filter complaint worklist, export, print | `AdminViewList.jsp`, `print_complaint.jsp` | Filters by date, complex, status, vendor-assigned flag; prints selected complaints to Word | `GET /complaints/admin`, `POST /reports/complaints/print` | `ComplaintAdminListPage`, filter panel, bulk actions | `colony_request`, `colony_action_history`, `colony_status`, category/vendor tables | Dynamic SQL concatenation; Word export is HTML/doc; access control mostly menu-driven | Phase 3 | High |
| Admin/report search | Richer complaint search/report | `Report.jsp` | Search by complaint no or by date/employee/complex/status/flat/category/vendor; download Excel | `GET /reports/complaints` | `ComplaintReportPage` | `colony_request`, `colony_status`, vendor/category tables | Dynamic SQL string building; duplicated search/report logic vs admin list | Phase 4 | High |
| Dashboard | Complaint summary by complex and status | `Dashboard.jsp` | Aggregate counts for `20`, `25`, `30`, `40`, `50`, `55`, `60`; drill to admin list | `GET /reports/complaints/dashboard` | `ComplaintDashboardPage` | `colony_request`, `housing_complex_list` | Straightforward, but status definitions must be formalized | Phase 4 | Medium |
| IFMS pending queue | IFMS pending complaint list | `bvg_pending.jsp` | IFMS queue filtered by complex/status; links into `bvg_request.jsp` | `GET /ifms/complaints/pending` | `IfmsPendingPage` | `colony_request`, `colony_status`, category tables | Dynamic SQL; role control must be explicit | Phase 3 | Medium |
| IFMS work page | Main complaint handling page for IFMS/vendor/admin | `bvg_request.jsp` | Acknowledge/reject/update status; manage PO items; delete submitted PO lines; complete and add items; email notifications; attachment handling; history | `GET /ifms/complaints/{id}`, `POST /ifms/complaints/{id}/transition`, `POST /ifms/complaints/{id}/po-lines`, `DELETE /ifms/complaints/{id}/po-lines/{lineId}`, `GET /ifms/complaints/{id}/history` | `IfmsComplaintWorkPage`, `StatusActionPanel`, `PoWorkTable`, `HistoryTimeline` | `COLONY_REQUEST`, `COLONY_ACTION_HISTORY`, `COLONY_PO_MASTER`, `colony_po_submitted`, `COLONY_STATUS`, vendor/category tables, email | Most complex page in app; magic statuses `15/20/25/30/40/50/51/52/53/55/60/70/110/120/130`; mixed complaint and inventory statuses; duplicate upload logic | Phase 3 | Very High |
| IFMS request list | IFMS handled/completed complaint list with voucher access | `bvgAckByMe.jsp`, `generate_voucher.jsp` | Filtered request list, PO totals, voucher downloads | `GET /ifms/complaints`, `POST /reports/vouchers/{complaintId}` | `IfmsRequestListPage`, `VoucherPage` | `colony_request`, `colony_action_history`, `colony_po_submitted`, `colony_vendor_mstr` | More dynamic SQL; status/date filtering tied to history table | Phase 3 | High |
| Vendor legacy list | Old vendor-only resolve list | `VendorViewList.jsp` | Sets complaint status to `55`; references older master tables | `POST /vendor/complaints/{id}/resolve` if kept; otherwise retire | likely no React page; replace with IFMS/vendor worklist | `COLONY_REQUEST`, `colony_complainttype_mstr`, `colony_subcategorytype_mstr` | Strong sign of stale legacy behavior; should not be migrated 1:1 | Retire or absorb in Phase 3 | Low |
| Complaint print | Printable complaint form | `print_complaint.jsp` | Generates HTML-as-Word download for selected complaints | `POST /reports/complaints/print` | maybe modal/print-preview | `COLONY_REQUEST`, category/vendor/housing tables | Export implementation should move server-side with templating or PDF library | Phase 4 | Medium |
| Job voucher | Downloadable voucher for completed work | `generate_voucher.jsp` | Builds complaint/job voucher and client-side PDF export | `GET /reports/vouchers/{id}` or `POST /reports/vouchers/{id}` | `JobVoucherPage` | `COLONY_REQUEST`, `colony_po_submitted`, category/vendor/housing tables | Business and presentation mixed; should become backend-rendered report or clean printable React page | Phase 3 | Medium |

### 5.4 Master Data and Admin Configuration

| Page / Flow | Current Purpose | Legacy Files | Business Logic Used | Spring Boot APIs / Services | React Pages / Components | Tables / Integrations | Validations / Risks | Sequence | Effort |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Vendor master | Maintain vendor code/name/email/phone/category mapping | `vendorMstr.jsp`, `GetVendorData.jsp` | Vendor code lookup from `DISB.user_mstr` and `disb.vendemail`; one row per complaint category; soft delete `ACTIVE='0'` | `GET /masters/vendors`, `POST /masters/vendors`, `PATCH /masters/vendors/{id}`, `DELETE /masters/vendors/{id}` | `VendorMasterPage` | `COLONY_VENDOR_MSTR`, `COLONY_COMPLAINT_CATEGORY`, `DISB.user_mstr`, `disb.vendemail` | Data model duplicates vendor per category; access control currently weak | Phase 1 | Medium |
| Vendor mapping | Map vendor to complex/building/category | `colony_vendor_mapping.jsp`, `GetVendorCategoryList.jsp`, `GetBuildingInfo2.jsp` | Multi-building insert; active rows marked `A` or `D`; category list derived from vendor master | `GET /masters/vendor-mappings`, `POST /masters/vendor-mappings`, `PATCH /masters/vendor-mappings/{id}`, `DELETE /masters/vendor-mappings/{id}` | `VendorMappingPage` | `colony_vendor_mapping`, `COLONY_VENDOR_MSTR`, `COLONY_COMPLAINT_CATEGORY`, `housing_complex_list`, `housing_master` | Critical for complaint routing; current fallback logic must be preserved in service layer | Phase 1 | High |
| PO master | Maintain PO category/item/rate/accounting metadata | `colony_po.jsp`, `fetchAgtmItem.jsp`, `get_po_rate.jsp` | Unique AGTM item per category; auto next item number = max + 10; soft delete via `STATUS=0` | `GET /masters/po-items`, `POST /masters/po-items`, `PATCH /masters/po-items/{id}`, `DELETE /masters/po-items/{id}` | `PoMasterPage` | `COLONY_PO_MASTER` | Key dependency for IFMS completion and analytics | Phase 1 | Medium |
| Complaint categories | Maintain complaint categories | `AddComplaintType.jsp` | Insert active `A`; soft deactivate to `I` | `GET /masters/complaint-categories`, `POST /masters/complaint-categories`, `DELETE /masters/complaint-categories/{id}` | `ComplaintCategoryPage` | `COLONY_COMPLAINT_CATEGORY` | Low complexity | Phase 1 | Low |
| Complaint subcategories | Maintain complaint subcategories | `AddSubCategoryType.jsp`, `GetSubCategory.jsp` | Insert/update/deactivate subcategories by category | `GET /masters/complaint-subcategories`, `POST /masters/complaint-subcategories`, `PATCH /masters/complaint-subcategories/{id}`, `DELETE /masters/complaint-subcategories/{id}` | `ComplaintSubcategoryPage` | `COLONY_COMPLAINT_SUBCATEGORY`, `COLONY_COMPLAINT_CATEGORY` | Used heavily by complaints and reports | Phase 1 | Medium |
| IFMS team master | Maintain IFMS members | `bvg_master.jsp` | Insert with unique team member id; soft delete by `STATUS=0` | `GET /masters/ifms-members`, `POST /masters/ifms-members`, `DELETE /masters/ifms-members/{id}` | `IfmsMasterPage` | `COLONY_BVG_MASTER` | Direct dependency for IFMS auth and notification routing | Phase 1 | Low |
| Status master | Maintain status IDs/names | `status_master.jsp` | Insert by numeric ID; hard delete rows | `GET /masters/statuses`, `POST /masters/statuses`, `DELETE /masters/statuses/{id}` | `StatusMasterPage` | `COLONY_STATUS` | Dangerous because statuses are hard-coded throughout legacy pages; migrate cautiously | Phase 2 | Medium |
| Admin role assignment | Assign complex admins | `admin_role.jsp` | Appends employee numbers into comma-separated `housing_complex_list.complex_admin` | `GET /admin/complex-admins`, `POST /admin/complex-admins` | `ComplexAdminPage` | `housing_complex_list` | Must be normalized in target model; current design is brittle and query-unfriendly | Phase 1 | Medium |
| Flat assignment | Manual add/update of current housing allotment | `colonyassign.jsp` | Insert/update `housing_alloted` rows by complex/employee/flat | `GET /admin/flat-assignments`, `POST /admin/flat-assignments`, `PATCH /admin/flat-assignments/{id}` | `FlatAssignmentPage` | `housing_alloted`, `housing_complex_list` | High business impact because many modules depend on current allotment | Phase 4 | Medium |
| Building master | Building administration | `buildingMstr.jsp` | CRUD on `COLONY_BUILDING_MSTR`; menu entry commented out | likely retire unless business confirms need | probably none | `COLONY_BUILDING_MSTR`, `colony_vendor_mstr`, `housing_complex_list` | Appears hidden/unused; confirm before migrating | Confirm first | Low |

### 5.5 Electricity

| Page / Flow | Current Purpose | Legacy Files | Business Logic Used | Spring Boot APIs / Services | React Pages / Components | Tables / Integrations | Validations / Risks | Sequence | Effort |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Rate master | Maintain monthly electricity slab/rate setup | `electric_rate.jsp`, `electric_rate_add.jsp` | Monthly slabs `0-100`, `101-300`, `301-500`, `>500`; update or insert monthly tariffs | `GET /electricity/rates`, `POST /electricity/rates`, `PATCH /electricity/rates/{month}` | `ElectricRatePage` | `COLONY_ELECTRIC_RATE` | `electric_rate_add.jsp` is redundant and partially inconsistent; collapse into one module | Phase 4 | Medium |
| Reading entry/approval | Enter and approve meter readings and bills | `electric_reading.jsp`, `GetBuildingInfo.jsp`, `Getflatno.jsp`, `GetEmployeeAlloted.jsp`, `GetLastReading.jsp`, `get_calulate_reading.jsp`, `common.jsp` | Reads prior reading; calculates slab-based bill, RA, FAC, wheeling, 16% electricity duty, 0.2604/unit tax; supports two reading sets; approve/delete actions; selective email | `GET /electricity/readings`, `POST /electricity/readings`, `POST /electricity/readings/{id}/approve`, `DELETE /electricity/readings/{id}`, `POST /electricity/calculate` | `ElectricReadingAdminPage`, calculator panel | `COLONY_ELECTRIC_READING`, `COLONY_ELECTRIC_RATE`, `housing_alloted`, `housing_complex_list`, `workflow.empmaster`, email | Calculation duplicated in two pages; delete is hard delete; admin/security access needs formalization | Phase 4 | High |
| Resident reading view | Resident bill/read-only view | `emp_electric_reading.jsp` | Lists approved readings only | `GET /resident/electricity-readings` | `ResidentElectricityPage` | `COLONY_ELECTRIC_READING` | Low complexity read-only module | Phase 4 | Low |

### 5.6 Inventory and Housing Handover

| Page / Flow | Current Purpose | Legacy Files | Business Logic Used | Spring Boot APIs / Services | React Pages / Components | Tables / Integrations | Validations / Risks | Sequence | Effort |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Inventory form | Employee inventory checklist entry | `Inventory.jsp`, `GetEmpData.jsp`, `List.jsp` | Save draft and final submit; statuses `10`, `11`, `20`, `30`; insert/update main and entry rows; item quantities and remarks by inventory master | `GET /inventory/{empNo}`, `POST /inventory`, `PATCH /inventory/{id}`, `POST /inventory/{id}/submit`, `POST /inventory/{id}/approve`, `POST /inventory/{id}/send-back` | `InventoryFormPage`, tabbed checklist | `COLONY_INVENTORY_MAIN`, `colony_inventory_entry`, `COLONY_INVENTORY_MASTER`, `COLONY_INVENTORY_HISTORY`, `housing_alloted`, `empmaster` | Significant state machine; current page mixes employee and admin actions | Phase 5 | High |
| Inventory list | List by current residence, allotted-not-occupied, outgoing, or employee view | `Inventory_List.jsp`, `GetInventoryData.jsp` | Types `o`, `a`, `g`; search/filter; download Excel | `GET /inventory`, `GET /inventory/employee`, `GET /inventory/report` | `InventoryListPage` | `COLONY_INVENTORY_MAIN`, `housing_alloted`, `housing_allotment`, `housing_complex_list`, `workflow.empmaster` | `GetInventoryData.jsp` is empty and pagination helper is effectively dead | Phase 5 | Medium |
| Inventory acknowledgement/security/HR | Security capture, employee acknowledgement, HR approval | `inventory_security.jsp`, `undertaking_residence.jsp`, `GetEmpData.jsp`, `List.jsp`, `common.jsp` | Statuses `110/120/130`; email HR on acknowledgement; on HR approval and type `a`, updates `housing_allotment`, replaces `housing_alloted`, writes `housing_allotment_audit`; uses undertaking popup | `GET /inventory/{id}/workflow`, `POST /inventory/{id}/security-submit`, `POST /inventory/{id}/acknowledge`, `POST /inventory/{id}/hr-approve` | `InventoryWorkflowPage`, undertaking modal | `COLONY_INVENTORY_MAIN`, `COLONY_INVENTORY_HISTORY`, `housing_allotment`, `housing_alloted`, `housing_allotment_audit`, email | One of the riskiest modules because it writes operational housing tables | Phase 5 | Very High |
| Inventory report | Filter/report inventory states | `inventory_report.jsp` | Lists inventory by status and complex | `GET /reports/inventory` | `InventoryReportPage` | `COLONY_INVENTORY_MAIN`, `colony_status`, `housing_complex_list` | Read-only but depends on final inventory status model | Phase 5 | Low |

### 5.7 Resident Self-Service

| Page / Flow | Current Purpose | Legacy Files | Business Logic Used | Spring Boot APIs / Services | React Pages / Components | Tables / Integrations | Validations / Risks | Sequence | Effort |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Vehicle info | Mandatory resident vehicle setup before complaint access | `vehicle_info.jsp` | Up to two vehicles per type; “no vehicle” row via `FLAG='-1'`; delete via `FLAG='1'`; stale skip message still allows home | `GET /resident/vehicles`, `POST /resident/vehicles`, `DELETE /resident/vehicles/{id}`, `POST /resident/vehicles/no-vehicle` | `VehicleInfoPage` | `COLONY_VEHICLEINFO` | Flag-based model should become explicit status; current skip behavior conflicts with mandatory gate intent | Phase 2 | Medium |
| Vehicle report | Admin report of vehicles by colony | `vehicle_report.jsp` | Read-only report/export | `GET /reports/vehicles` | `VehicleReportPage` | `COLONY_VEHICLEINFO`, `housing_alloted`, `housing_master`, `housing_complex_list`, `workflow.empmaster` | Low complexity | Phase 4 | Low |
| Static resident references | Approved makes and contact details | `images/Approved_Make.pdf`, `images/Contact_Details.pdf` | Static document links | static document service or CMS | `ResidentReferencePage` or direct links | static assets | Easy lift-and-shift | Phase 4 | Low |

## 6. Page-Wise Conversion Mapping

### 6.1 Primary Interactive Pages

| Legacy File | Current Role | Target Mapping | Disposition |
| --- | --- | --- | --- |
| `index.jsp` | employee/vendor login UI | React `LoginPage` + `/api/v1/auth/login` | Rebuild |
| `index_security.jsp` | security PIN login UI | React `SecurityLoginPage` + `/api/v1/auth/security-login` | Rebuild |
| `index1.jsp` | SSO launch | Spring auth redirect endpoint | Replace |
| `index3.jsp` | family OTP login UI | React `FamilyLoginPage` + family OTP APIs | Rebuild |
| `login.jsp` | multi-mode auth processor | Spring `AuthController` / `AuthService` | Replace |
| `login_encrypt.jsp` | SSO callback auth | Spring security/OIDC callback | Replace |
| `login_encrypt1.jsp` | IFMS SSO callback auth | Spring security/OIDC callback + IFMS role resolver | Replace |
| `logout.jsp` | logout | Spring logout endpoint | Replace |
| `home.jsp` | home/shortcut page | React `HomePage` | Rebuild |
| `request.jsp` | complaint create/detail/action | React complaint module | Rebuild |
| `request_test.jsp` | duplicate complaint page | merge into complaint module | Consolidate |
| `myRequestList.jsp` | resident complaint list | React `MyComplaintsPage` | Rebuild |
| `proxy_request.jsp` | proxy resident selection | React `ProxyComplaintPage` | Rebuild |
| `request_proxy.jsp` | proxy complaint submit/detail | complaint module “proxy mode” | Consolidate |
| `AdminViewList.jsp` | admin complaint queue | React `ComplaintAdminListPage` | Rebuild |
| `Dashboard.jsp` | complaint dashboard | React `ComplaintDashboardPage` | Rebuild |
| `Report.jsp` | complaint search report | React `ComplaintReportPage` | Rebuild |
| `bvg_pending.jsp` | IFMS pending queue | React `IfmsPendingPage` | Rebuild |
| `bvg_request.jsp` | IFMS workbench | React `IfmsComplaintWorkPage` | Rebuild |
| `bvgAckByMe.jsp` | IFMS request list | React `IfmsRequestListPage` | Rebuild |
| `generate_voucher.jsp` | job voucher | React printable voucher page or backend PDF | Rebuild |
| `print_complaint.jsp` | complaint print doc | backend report endpoint | Replace |
| `vendorMstr.jsp` | vendor master | React `VendorMasterPage` | Rebuild |
| `colony_vendor_mapping.jsp` | vendor mapping | React `VendorMappingPage` | Rebuild |
| `colony_po.jsp` | PO master | React `PoMasterPage` | Rebuild |
| `AddComplaintType.jsp` | complaint category master | React `ComplaintCategoryPage` | Rebuild |
| `AddSubCategoryType.jsp` | complaint subcategory master | React `ComplaintSubcategoryPage` | Rebuild |
| `bvg_master.jsp` | IFMS master | React `IfmsMasterPage` | Rebuild |
| `status_master.jsp` | status master | React `StatusMasterPage` | Rebuild cautiously |
| `admin_role.jsp` | complex admin mapping | React `ComplexAdminPage` | Rebuild with normalized model |
| `colonyassign.jsp` | flat assignment | React `FlatAssignmentPage` | Rebuild |
| `buildingMstr.jsp` | building master | only if confirmed needed | Probably retire |
| `electric_rate.jsp` | electricity rates | React `ElectricRatePage` | Rebuild |
| `electric_rate_add.jsp` | redundant rate page | absorb into `ElectricRatePage` | Retire |
| `electric_reading.jsp` | electricity reading admin | React `ElectricReadingAdminPage` | Rebuild |
| `emp_electric_reading.jsp` | resident electricity view | React `ResidentElectricityPage` | Rebuild |
| `Inventory.jsp` | employee inventory form | React `InventoryFormPage` | Rebuild |
| `Inventory_List.jsp` | inventory listing | React `InventoryListPage` | Rebuild |
| `inventory_security.jsp` | security/HR inventory workflow | React `InventoryWorkflowPage` | Rebuild |
| `inventory_report.jsp` | inventory reporting | React `InventoryReportPage` | Rebuild |
| `undertaking_residence.jsp` | inventory undertaking popup | React modal/printable component | Rebuild |
| `vehicle_info.jsp` | resident vehicle maintenance | React `VehicleInfoPage` | Rebuild |
| `vehicle_report.jsp` | vehicle report | React `VehicleReportPage` | Rebuild |
| `LoginDetails.jsp` | family login access maintenance | React `FamilyAccessPage` | Rebuild |
| `Occupancy_report.jsp` | occupancy/vacancy report | React `OccupancyReportPage` | Rebuild |
| `matrixReport.jsp` | PO vs complaints matrix | React `PoComplaintMatrixPage` | Rebuild |
| `poitemqtyReport.jsp` | PO items vs total quantity report | React `PoQuantityReportPage` | Rebuild |
| `VendorViewList.jsp` | old vendor resolve list | replace with IFMS/vendor list if still needed | Probably retire |

### 6.2 Helper / AJAX Endpoints

| Legacy File | Current Role | Target Mapping | Disposition |
| --- | --- | --- | --- |
| `GetSubCategory.jsp` | subcategory dropdown HTML | `GET /masters/complaint-subcategories?categoryId=` JSON | Replace |
| `admin_emp_search.jsp` | employee search JSON | `GET /residents/search` JSON | Replace |
| `admin_emp_search_page.jsp` | popup shell | React dialog component | Replace |
| `get_flats.jsp` | flats list and emp-by-flat lookup | split into resident lookup APIs | Replace |
| `GetBuildingInfo.jsp` | building dropdown options | `GET /complexes/{code}/buildings` JSON | Replace |
| `GetBuildingInfo2.jsp` | building checkbox list | same as above | Consolidate |
| `Getflatno.jsp` | flat dropdown options | `GET /complexes/{code}/flats` JSON | Replace |
| `GetEmployeeAlloted.jsp` | employee details by flat/complex | `GET /residents/by-flat` JSON | Replace |
| `GetEmpData.jsp` | employee housing/inventory context | `GET /inventory/employee-context/{empNo}` | Replace |
| `List.jsp` | autocomplete employee search | `GET /employees/search` JSON | Replace |
| `GetVendorData.jsp` | vendor code lookup | `GET /masters/vendors/by-code/{code}` | Replace |
| `GetVendorCategoryList.jsp` | categories for vendor | `GET /masters/vendors/{code}/categories` | Replace |
| `fetchAgtmItem.jsp` | next AGTM item number | `GET /masters/po-items/next-number?category=` | Replace |
| `get_po_rate.jsp` | PO rate/account lookup | `GET /masters/po-items/{poCode}` | Replace |
| `GetLastReading.jsp` | previous electricity reading | `GET /electricity/readings/last` | Replace |
| `get_calulate_reading.jsp` | bill calculator | `POST /electricity/calculate` | Replace |
| `GetInventoryData.jsp` | supposed inventory pagination helper | no equivalent needed; proper paginated API | Retire |

### 6.3 Shared / Utility / Test / Placeholder Files

| Legacy File | Current Role | Target Mapping | Disposition |
| --- | --- | --- | --- |
| `header.jsp` | layout, role/menu, CSRF checks | React app shell + route guards | Replace |
| `footer.jsp` | footer | React layout component | Replace |
| `common.jsp` | global mail flag | backend configuration property | Replace |
| `connection.jsp` | Oracle connection bootstrap | Spring datasource config | Replace |
| `connection_sap.jsp` | SAP datasource bootstrap | Spring integration datasource config | Replace |
| `otp_test11.jsp` | SMS test page | no user-facing equivalent | Retire |
| `test_email.jsp` | email test page | no user-facing equivalent | Retire |
| `colony_po_data.jsp` | empty PO placeholder | none | Retire |

## 7. API and Backend Service Plan

### 7.1 Recommended Backend Service Boundaries

| Service | Main Responsibilities | Key Tables / Integrations |
| --- | --- | --- |
| `AuthService` | employee/vendor/security/family login, logout, session, current user | `workflow.empmaster`, `disb.user_mstr`, LDAP, SSO, `colony_family_member_login`, `colony_login_otp` |
| `RoleService` | resolve admin/IFMS/vendor/family permissions | `housing_complex_list`, `COLONY_BVG_MASTER` |
| `ComplaintService` | CRUD for complaints, attachments, resident views | `COLONY_REQUEST`, `COLONY_ACTION_HISTORY`, categories/subcategories |
| `ComplaintWorkflowService` | state transitions, history, notification triggering | `COLONY_REQUEST`, `COLONY_ACTION_HISTORY`, email |
| `VendorRoutingService` | derive vendor from complex/building/category mapping | `colony_vendor_mapping`, `COLONY_VENDOR_MSTR`, `housing_master` |
| `IfmsService` | pending queues, IFMS actions, PO completion | complaint tables, `COLONY_PO_MASTER`, `colony_po_submitted` |
| `MasterDataService` | complaint categories/subcategories, PO items, vendor master, IFMS members, statuses | master tables |
| `ElectricityService` | rate maintenance, bill calculation, reading entry/approval | `COLONY_ELECTRIC_RATE`, `COLONY_ELECTRIC_READING` |
| `InventoryService` | inventory form, acknowledgement, HR approval, housing updates | inventory tables, `housing_allotment`, `housing_alloted`, `housing_allotment_audit` |
| `ResidentService` | vehicle info, resident dashboards, family access | `COLONY_VEHICLEINFO`, `colony_family_member_login` |
| `ReportsService` | complaint, occupancy, vehicle, PO and inventory reports/downloads | multiple reporting joins |
| `NotificationService` | email/SMS abstractions | email engine, SMS service |
| `AttachmentService` | upload/download storage and validation | object storage or secured file store |

### 7.2 Recommended Core Endpoints

Authentication:

- `POST /api/v1/auth/login`
- `POST /api/v1/auth/security-login`
- `POST /api/v1/auth/family/send-otp`
- `POST /api/v1/auth/family/verify-otp`
- `GET /api/v1/auth/me`
- `POST /api/v1/auth/logout`
- `GET /api/v1/auth/sso/start`
- `GET /api/v1/auth/sso/callback`

Complaint module:

- `GET /api/v1/complaints/my`
- `POST /api/v1/complaints`
- `GET /api/v1/complaints/{id}`
- `PATCH /api/v1/complaints/{id}`
- `POST /api/v1/complaints/{id}/submit`
- `POST /api/v1/complaints/{id}/attachments`
- `GET /api/v1/complaints/{id}/history`
- `POST /api/v1/complaints/proxy`
- `GET /api/v1/complaints/admin`
- `POST /api/v1/complaints/{id}/transition`

IFMS/PO:

- `GET /api/v1/ifms/complaints/pending`
- `GET /api/v1/ifms/complaints`
- `GET /api/v1/ifms/complaints/{id}`
- `POST /api/v1/ifms/complaints/{id}/transition`
- `POST /api/v1/ifms/complaints/{id}/po-lines`
- `DELETE /api/v1/ifms/complaints/{id}/po-lines/{lineId}`

Master data:

- `GET /api/v1/masters/vendors`
- `GET /api/v1/masters/vendors/by-code/{code}`
- `GET /api/v1/masters/vendor-mappings`
- `GET /api/v1/masters/complaint-categories`
- `GET /api/v1/masters/complaint-subcategories`
- `GET /api/v1/masters/po-items`
- `GET /api/v1/masters/po-items/next-number`
- `GET /api/v1/masters/statuses`
- `GET /api/v1/masters/ifms-members`

Resident/electricity/inventory:

- `GET /api/v1/resident/vehicles`
- `POST /api/v1/resident/vehicles`
- `GET /api/v1/resident/family-access`
- `POST /api/v1/resident/family-access`
- `GET /api/v1/electricity/rates`
- `POST /api/v1/electricity/calculate`
- `GET /api/v1/electricity/readings`
- `POST /api/v1/electricity/readings/{id}/approve`
- `GET /api/v1/inventory`
- `GET /api/v1/inventory/{id}`
- `POST /api/v1/inventory/{id}/acknowledge`
- `POST /api/v1/inventory/{id}/hr-approve`

Reports:

- `GET /api/v1/reports/complaints/dashboard`
- `GET /api/v1/reports/complaints`
- `POST /api/v1/reports/complaints/print`
- `GET /api/v1/reports/occupancy`
- `GET /api/v1/reports/vehicles`
- `GET /api/v1/reports/inventory`
- `GET /api/v1/reports/po-matrix`
- `GET /api/v1/reports/po-quantity`
- `GET /api/v1/reports/vouchers/{complaintId}`

### 7.3 Backend Entity and Workflow Notes

Recommended explicit enums/constants:

- `ComplaintStatus`
- `InventoryStatus`
- `UserRole`
- `VehicleDeclarationType`
- `AttachmentType`

Important legacy values to preserve initially:

- Complaint status IDs: `10`, `15`, `20`, `25`, `30`, `40`, `50`, `51`, `52`, `53`, `54`, `55`, `60`, `70`
- Inventory status IDs: `10`, `11`, `20`, `30`, `110`, `120`, `130`

Note: status `54` is referenced in complaint notifications but no meaning is defined in code. Confirm from live `COLONY_STATUS`.

## 8. React Component/Page Plan

### 8.1 Recommended Frontend Module Structure

```text
src/
  app/
    router/
    providers/
    layout/
  features/
    auth/
    complaints/
    ifms/
    masters/
    electricity/
    inventory/
    resident/
    reports/
  components/
    tables/
    forms/
    dialogs/
    layout/
    feedback/
  lib/
    api/
    auth/
    validation/
    formatters/
```

### 8.2 Shared Reusable Components

Common components to extract early:

- `AppShell`
- `RoleBasedNav`
- `ProtectedRoute`
- `SearchableDataTable`
- `FilterBar`
- `StatusBadge`
- `HistoryTimeline`
- `AttachmentUploader`
- `AttachmentList`
- `EmployeeSearchDialog`
- `ResidentSelector`
- `ComplexBuildingFlatSelector`
- `ConfirmActionDialog`
- `ExportButtonGroup`
- `FormErrorSummary`

### 8.3 Route-to-Component Mapping

| Route | Main Components | Notes |
| --- | --- | --- |
| `/login` | `LoginPage`, `LoginForm` | employee/vendor login |
| `/family-login` | `FamilyLoginPage`, `OtpForm` | two-step OTP flow |
| `/app/complaints/new` | `ComplaintForm`, `ComplexContextBanner` | resident create |
| `/app/complaints/:id` | `ComplaintDetail`, `ComplaintHistory`, `ActionPanel` | role-aware actions |
| `/app/complaints/my` | `MyComplaintsTable` | resident list |
| `/app/complaints/admin` | `ComplaintAdminFilters`, `ComplaintAdminTable` | admin queue |
| `/app/ifms/requests/:id` | `IfmsWorkPanel`, `PoItemsEditor`, `ComplaintHistory` | highest-complexity page |
| `/app/masters/vendors` | `VendorTable`, `VendorForm` | CRUD |
| `/app/admin/electricity/readings` | `ElectricityReadingForm`, `BillCalculator`, `ReadingTable` | admin/security |
| `/app/inventory/:id` | `InventoryChecklist`, `UndertakingModal`, `WorkflowActions` | security/HR/employee variants |
| `/app/reports/*` | report filters + table/export components | shared report pattern |

## 9. Data and Integration Migration Considerations

### 9.1 Data Migration Strategy

Recommended initial posture:

- Keep Oracle as system of record during first migration phases.
- Build Spring Boot APIs directly on current schema first.
- Introduce controlled schema improvements only after behavior parity and reporting validation.

### 9.2 Tables That Need Modeling Cleanup

| Legacy Pattern | Current Evidence | Recommended Target |
| --- | --- | --- |
| Comma-separated admin users | `housing_complex_list.complex_admin` via `admin_role.jsp`, `login.jsp` | normalized `complex_admin_assignment` table |
| Vehicle flag overload | `COLONY_VEHICLEINFO.FLAG` values `0`, `1`, `-1` in `vehicle_info.jsp`, `login.jsp` | explicit active/no-vehicle/deleted enum |
| Status IDs mixed across domains | complaint and inventory statuses both referenced in `bvg_request.jsp` and inventory pages | separate status enums/tables per domain or a typed status catalog |
| Duplicate complaint pages | `request.jsp`, `request_proxy.jsp`, `request_test.jsp` | single complaint UI with mode flags |
| Duplicated calculation logic | `electric_reading.jsp`, `get_calulate_reading.jsp` | one backend calculation service |
| Vendor duplicated per category | `vendorMstr.jsp` inserts one row per selected category | normalize vendor + vendor-category relationship |

### 9.3 Integration Migration Notes

| Integration | Legacy Behavior | Target Recommendation |
| --- | --- | --- |
| Oracle main DB | direct JDBC from JSPs | Spring datasource + repositories |
| SAP dependent lookup | direct secondary JDBC in `LoginDetails.jsp` | dedicated adapter/service with timeout and fallback handling |
| LDAP | direct bind in `login.jsp` | Spring Security LDAP only as interim if modern SSO unavailable |
| HPCL SSO/AES | hard-coded keys and callback pages | replace with supported enterprise SSO integration |
| Email | direct `gen_email_call(...)` from JSPs | `NotificationService` with templates and auditable event triggers |
| SMS | OTP sending in `index3.jsp` | dedicated OTP service with throttling, expiry, resend limits, audit |
| File uploads | stored under `Attachment_Upload/` in webroot | secure object/file store with metadata table |

### 9.4 Reporting Considerations

Reports are SQL-heavy and close to the DB. Recommended pattern:

- Use read-optimized query services with `JdbcTemplate`, MyBatis, or jOOQ.
- Do not force all report queries through JPA entities.
- Validate each report against current JSP output during UAT.

### 9.5 Data Quality / Cleanup Candidates

- Confirm meaning of complaint status `54`
- Confirm whether `buildingMstr.jsp` and `COLONY_BUILDING_MSTR` are still active
- Decide whether `VendorViewList.jsp` is obsolete
- Remove stale 2019 vehicle message in `vehicle_info.jsp`
- Clean unused helpers `GetInventoryData.jsp`, `colony_po_data.jsp`, test pages

## 10. Phased Implementation Roadmap

| Phase | Scope | Dependencies | Output |
| --- | --- | --- | --- |
| Phase 0 | Detailed schema mapping, status catalog validation, role matrix, report sample capture | access to DB and business SMEs | signed-off discovery baseline |
| Phase 1 | New auth/session shell, layout, master data APIs/pages, vendor routing service | Phase 0 | secure app shell + master-data parity |
| Phase 2 | Resident complaint creation, my complaints, vehicle gate, family OTP flows | Phase 1 | resident-facing MVP |
| Phase 3 | IFMS queue, complaint transitions, proxy complaints, vendor/PO completion, voucher generation | Phase 1-2 | operational complaint workflow in new stack |
| Phase 4 | Dashboard, complaint reports, electricity module, resident self-service documents/reports | Phase 2-3 | admin/resident reporting parity |
| Phase 5 | Inventory and housing handover workflow, occupancy reporting, flat assignment stabilization | Phase 1-4 | housing/inventory parity |
| Phase 6 | Remaining exports, cleanup, role hardening, attachment storage migration, performance tuning | Phase 1-5 | production-ready cutover |
| Phase 7 | JSP retirement, data cleanup, legacy route shutdown | Phase 6 | full migration completion |

Recommended delivery order inside each phase:

1. Backend API + automated tests
2. React page and role guard
3. Notification/export wiring
4. UAT with current JSP output comparison
5. Feature-flagged production rollout

## 11. End-User Workflow Document

### 11.1 Major Business Processes

#### A. Employee complaint lifecycle

1. Employee logs in through employee login or SSO.
2. If vehicle details are missing, the employee may be redirected to `vehicle_info.jsp`.
3. Employee creates a complaint in `request.jsp`.
4. System derives flat/complex/building and assigns a vendor from `colony_vendor_mapping`.
5. Complaint is saved as draft (`10`) or submitted (`20`).
6. IFMS picks the complaint from `bvg_pending.jsp`.
7. IFMS acknowledges (`25`), progresses (`30`), puts on hold (`40`), sends to vendor (`50`), or updates terminal/semi-terminal statuses (`51/52/53/55/60/70`).
8. Completed complaints may produce a voucher in `generate_voucher.jsp`.
9. Admin/IFMS/report users review progress through `AdminViewList.jsp`, `Report.jsp`, and dashboards.

Inputs:

- Complaint category
- Complaint subcategory
- Complaint details
- Attachments

Outputs:

- Complaint number
- Status history
- Emails to resident/IFMS/vendor depending on action

#### B. Family-member complaint lifecycle

1. Employee enables family access in `LoginDetails.jsp`.
2. Family member uses mobile number in `index3.jsp`.
3. System sends OTP by SMS and validates it.
4. On successful verification, family member is logged in on behalf of the employee.
5. Complaint flow is the same as resident complaint flow, but audit text includes family-member context.

#### C. IFMS proxy complaint

1. IFMS/admin opens `proxy_request.jsp`.
2. They select resident via complex + flat or direct employee number.
3. They submit complaint through `request_proxy.jsp`.
4. Complaint enters normal workflow for the selected resident.

#### D. Electricity reading process

1. Admin/security sets monthly slab rates in `electric_rate.jsp`.
2. Admin/security records meter readings in `electric_reading.jsp`.
3. System calculates units and bill components.
4. Reading is approved.
5. Resident views approved bill in `emp_electric_reading.jsp`.

#### E. Inventory / residence handover process

1. Employee or admin starts inventory record in `Inventory.jsp`.
2. Security captures or submits inventory in `inventory_security.jsp`.
3. Employee acknowledges inventory and undertaking.
4. HR/admin approves inventory.
5. For allotted-not-occupied cases, housing allotment tables are updated.

### 11.2 Actor-Wise Actions

| Actor | Main Actions |
| --- | --- |
| Resident employee | login, register vehicle, raise complaint, track complaint, view electricity reading, manage family OTP access, acknowledge inventory |
| Family member | login via OTP, raise complaint on behalf of resident |
| Security | login via PIN, enter electricity reading, participate in inventory flow |
| IFMS member | pick pending complaints, update statuses, manage PO line items, complete work, raise proxy complaints |
| Vendor | legacy login path exists; current workflow seems increasingly IFMS-centered |
| Complex admin | complaint oversight, reports, master data, electricity, assignments |
| HR/admin | inventory approval, flat assignment, role/master management |

### 11.3 Page Navigation Highlights

Observed main navigation:

- Login -> Home -> Complaints / IFMS Task / Admin / Masters / Report / Resident Dashboard
- Resident Dashboard -> Vehicle Info / Electric Reading / Inventory / Family Login Access / PDFs
- IFMS Task -> Pending Queue / Request List / Raise Proxy Request

## 12. Functional User Manual

### 12.1 Login and Access

| Page | Purpose | Key Fields / Actions | Common Guidance |
| --- | --- | --- | --- |
| `index.jsp` | employee/vendor login | employee number, password, login, family login | “Invalid Emp No” means employee/vendor record not found; “Invalid authentication” means password/LDAP failure |
| `index3.jsp` | family OTP login | mobile number, OTP, verify/send OTP | mobile must already exist in family access list; OTP expires after about 300 seconds |
| `LoginDetails.jsp` | manage family OTP access | select family member, phone number, submit/delete | phone must be 10 digits; only active SAP dependents appear |

### 12.2 Complaints

| Page | Purpose | Key Fields / Actions | Common Guidance |
| --- | --- | --- | --- |
| `request.jsp` | raise complaint | complaint type, subcategory, details, attachments, Save, Submit | complaint type, subcategory, and details are required; only image/PDF-style attachments are accepted; saved complaints can be resumed |
| `myRequestList.jsp` | track own complaints | complaint number links | saved complaints open in edit mode; other complaints open in view mode |
| `proxy_request.jsp` | raise for another resident | complex, flat, employee number | either select resident from complex/flat or enter employee number directly |

### 12.3 IFMS/Admin Complaint Handling

| Page | Purpose | Key Fields / Actions | Common Guidance |
| --- | --- | --- | --- |
| `bvg_pending.jsp` | IFMS pending queue | filters by complex/status, action link | use this to pick submitted/pending tasks |
| `bvg_request.jsp` | complaint workbench | action type, remarks, vendor, PO lines, complete | remarks should be filled for action changes; completion may require PO item entry |
| `AdminViewList.jsp` | complaint search and export | date range, complex, status, assigned-to-vendor, print | select complaints before using print |
| `Report.jsp` | detailed complaint report | complaint no or filters by date/employee/flat/status/category/vendor | complaint number search is alternate to filter search |

### 12.4 Electricity

| Page | Purpose | Key Fields / Actions | Common Guidance |
| --- | --- | --- | --- |
| `electric_rate.jsp` | monthly tariff setup | month, slab rates, fixed/energy/wheeling/RA/FAC charges | all slab values should be entered before saving |
| `electric_reading.jsp` | reading entry and approval | month, complex, building, flat, initial/final readings, approve | final reading must be greater than or equal to initial reading |
| `emp_electric_reading.jsp` | resident bill view | month/history table | only approved readings appear |

### 12.5 Inventory / Residence Handover

| Page | Purpose | Key Fields / Actions | Common Guidance |
| --- | --- | --- | --- |
| `Inventory.jsp` | checklist preparation | employee, contact no, flat, inventory taken on, reason, quantities | save draft first if data is incomplete; final submit advances workflow |
| `Inventory_List.jsp` | inventory listing | type tabs, search, export | tabs represent current residence, allotted-not-occupied, and outgoing |
| `inventory_security.jsp` | security/employee/HR workflow | security info, occupied on, acknowledgement, HR submit | employee acknowledgement and HR approval are separate steps |

### 12.6 Resident Self-Service

| Page | Purpose | Key Fields / Actions | Common Guidance |
| --- | --- | --- | --- |
| `vehicle_info.jsp` | maintain vehicle details | type, make, model, registration no, color, no vehicle | only up to two vehicles of the same type can be added |
| `LoginDetails.jsp` | family mobile OTP setup | family member, phone, delete | delete removes future OTP login access |

### 12.7 Common Validation / Message Guidance Identified in Code

- Mobile number must be a valid 10-digit number in `LoginDetails.jsp`
- OTP failure shows “Invalid OTP. Please try again.”
- Vehicle form blocks more than two entries per vehicle type
- Complaint form requires complaint type, subcategory, and details
- Electricity final reading must be greater than initial reading
- Security login rejects wrong PIN with “Invalid Pin Number”

## 13. Risks, Assumptions, and Open Questions

### 13.1 Major Risks

1. Security risk: hard-coded DB credentials and auth secrets are present in `connection.jsp`, `connection_sap.jsp`, `login.jsp`, `index1.jsp`, and SSO pages.
2. Security risk: authorization is inconsistently enforced. Many admin/master/report JSPs rely on menu visibility instead of server-side role checks.
3. Data risk: complaint, inventory, and housing workflows update live operational tables directly from JSPs.
4. Migration risk: compiled helper classes exist without source (`Gen_Email`, SMS classes, AES utility usage), so behavior parity requires reimplementation.
5. SQL risk: many pages build SQL through string concatenation, increasing injection and regression risk.
6. Scope risk: duplicate and stale pages (`request_test.jsp`, `electric_rate_add.jsp`, `VendorViewList.jsp`, `buildingMstr.jsp`, `GetInventoryData.jsp`, `colony_po_data.jsp`) can inflate migration scope unless deliberately retired.
7. Workflow risk: status IDs are magic numbers spread across complaint and inventory modules.

### 13.2 Assumptions

- [Assumption] `COLONY_STATUS` in production defines status `54`; its business meaning is not recoverable from code alone.
- [Assumption] `buildingMstr.jsp` is either dormant or low-usage because its menu link is commented out in `header.jsp`.
- [Assumption] `VendorViewList.jsp` is legacy and superseded by IFMS-oriented workflows, because it references older complaint master tables.
- [Assumption] SSO can be upgraded to a supported enterprise integration instead of preserving the current AES-based callback mechanism.
- [Assumption] Oracle remains the initial source of truth during migration.

### 13.3 Open Questions for Business / SME Validation

1. What is the authoritative meaning of complaint status `54`?
2. Which pages are actively used today: `buildingMstr.jsp`, `VendorViewList.jsp`, `electric_rate_add.jsp`?
3. Should vendor users continue to log in directly, or has IFMS fully replaced vendor self-service?
4. Which reports are business-critical and must be reproduced pixel-for-pixel versus functionally equivalent?
5. Can the “vehicle details required before complaints” rule still be enforced, or is it obsolete?
6. Is the security PIN workflow still valid, and if so, what is the target identity model for security staff?
7. Can attachments move from webroot storage to managed object storage?
8. What audit and retention requirements apply to complaint history, inventory acknowledgements, OTP logs, and notifications?

### 13.4 Dead Code / Duplicated Logic / Risky Areas to Flag Immediately

- Dead/placeholder: `GetInventoryData.jsp`, `colony_po_data.jsp`, `otp_test11.jsp`, `test_email.jsp`
- Likely stale: `VendorViewList.jsp`, `buildingMstr.jsp`, `electric_rate_add.jsp`
- Duplicate complaint logic: `request.jsp`, `request_proxy.jsp`, `request_test.jsp`
- Duplicate electricity billing logic: `electric_reading.jsp`, `get_calulate_reading.jsp`
- Duplicate/weak UI libraries: multiple jQuery versions, DataTables loaded both locally and from CDN
- Access-control smell: menu-based role hiding in `header.jsp` without corresponding page-level protection
- Data-model smell: `housing_complex_list.complex_admin` stores comma-separated employee numbers
- Bug candidate: `admin_emp_search.jsp` looks up complex/flat using the raw search term instead of each returned employee record

