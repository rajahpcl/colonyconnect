# ColonyConnect Database Tables

The application uses **23 tables** across two schemas (`orainfo` for application-specific data and `workflow` for shared employee master data):

## 1. Colony Application Tables (`orainfo` Schema)

| # | Table Name (`@Table`) | Entity Class | Description / Purpose |
|---|---|---|---|
| 1 | `COLONY_ACTION_HISTORY` | `ActionHistory` | Tracks audit history, status updates, and remarks for complaints/requests. |
| 2 | `COLONY_BUILDING_MSTR` | `BuildingMaster` | Maps colony buildings to administrators, escalation contacts, and vendors. |
| 3 | `COLONY_REQUEST` | `Complaint` | Main table storing resident complaints/service requests. |
| 4 | `COLONY_COMPLAINT_CATEGORY` | `ComplaintCategory` | Master list of complaint categories (e.g., Electrical, Civil, Plumbing). |
| 5 | `COLONY_COMPLAINT_SUBCATEGORY` | `ComplaintSubcategory` | Subcategories tied to each complaint category. |
| 6 | `COLONY_ELECTRIC_RATE` | `ElectricRate` | Tariff rates, fixed charges, and energy charges for electricity readings. |
| 7 | `COLONY_ELECTRIC_READING` | `ElectricReading` | Flat-wise electricity meter readings and calculated amounts. |
| 8 | `COLONY_FAMILY_MEMBER_LOGIN` | `FamilyMemberLogin` | Login accounts and profiles for employee family members/dependents. |
| 9 | `housing_alloted` | `HousingAllotment` | Flat allotments mapping residents (`EMP_NO`) to flats and complexes. |
| 10 | `housing_complex_list` | `HousingComplex` | Master list of colony complexes and assigned complex administrators. |
| 11 | `HOUSING_MASTER` | `HousingMaster` | Detailed flat dimensions, rooms, bathrooms, and floor information. |
| 12 | `COLONY_BVG_MASTER` | `IfmsMember` | BVG/IFMS team members assigned to colony maintenance tasks. |
| 13 | `COLONY_INVENTORY_ENTRY` | `InventoryEntry` | Itemized handover/taking-over quantities during flat inventory checks. |
| 14 | `COLONY_INVENTORY_HISTORY` | `InventoryHistory` | Audit and history log for inventory transactions. |
| 15 | `COLONY_INVENTORY_MAIN` | `InventoryMain` | Main record for flat inventory inspection, handover, and taking over. |
| 16 | `COLONY_INVENTORY_MASTER` | `InventoryMaster` | Master catalog of inventory items (Electricals, Furniture, Keys, etc.). |
| 17 | `COLONY_PO_MASTER` | `PoItem` | Purchase Order contract line items, rates, material descriptions, and GL codes. |
| 18 | `COLONY_PO_SUBMITTED` | `PoSubmitted` | Purchase orders submitted or linked against specific service requests. |
| 19 | `COLONY_STATUS` | `StatusCatalog` | Standard catalog of request/workflow status IDs and names. |
| 20 | `COLONY_VEHICLEINFO` | `VehicleInfo` | Resident vehicle registrations (make, model, registration number, type). |
| 21 | `COLONY_VENDOR_MSTR` | `Vendor` | Colony service vendors and contractors. |
| 22 | `colony_vendor_mapping` | `VendorMapping` | Mapping relationships between vendors, categories, and locations. |

---

## 2. External / Shared Enterprise Tables (`workflow` Schema)

| # | Table Name (`@Table`) | Entity Class | Description / Purpose |
|---|---|---|---|
| 23 | `empmaster` | `User` | Enterprise employee master data (read-only reference to employee details, grades, designations, and emails). |
