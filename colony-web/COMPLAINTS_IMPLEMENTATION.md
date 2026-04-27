# Complaints System Implementation

Migrated complaints management from JSP codebase to React + TypeScript.

## Files Created

### Components
- `src/pages/complaints/NewComplaintPage.tsx` - Submit new complaint with category, sub-category, details, 2-file upload
- `src/pages/complaints/MyComplaintsPage.tsx` - List user's complaints with search, filter by status
- `src/pages/complaints/ComplaintDetailPage.tsx` - View complaint details, edit if status is "Saved"
- `src/pages/complaints/index.ts` - Export barrel for complaint pages
- `src/pages/complaints/complaints.css` - Responsive styling

### API Layer
- `src/lib/api/complaints.ts` - API hooks and types for complaint operations

## Data Structure

Complaint fields mapped from JSP:
- `id` - Complaint ID (COLONY_REQUEST.ID)
- `empNo` - Employee number (EMP_NO)
- `complexCode` - Complex code (COMPLEX_CODE)
- `flatNo` - Flat number (FLAT_NO)
- `compDetails` - Complaint description (COMP_DETAILS)
- `submitDate` - Submission date (SUBMIT_DATE)
- `updateDate` - Last update date (UPDATE_DATE)
- `subcategoryId` - Sub-category ID (SUBCATEGORY_ID)
- `vendor` - Assigned vendor code (vendor)
- `status` - Status code (status: '10'=Saved, '20'=Submitted, '50'=InProgress, '60'=Completed)
- `uploadFile`, `uploadFile1` - File attachments (max 2)

## API Endpoints

Expected backend endpoints:
```
GET    /api/v1/complaints/categories              - List complaint categories
GET    /api/v1/complaints/subcategories?categoryId=X - List sub-categories
GET    /api/v1/complaints/statuses               - List statuses
GET    /api/v1/complaints/my                     - User's complaints
GET    /api/v1/complaints/:id                    - Single complaint detail
POST   /api/v1/complaints                        - Create complaint (FormData)
PATCH  /api/v1/complaints/:id                    - Update complaint (FormData)
```

## Routes

- `/app/complaints/new` - Create new complaint
- `/app/complaints/my` - View all user complaints
- `/app/complaints/:id` - View/edit complaint detail

## Features

### New Complaint
- Category selection
- Dynamic sub-category loading on category change
- Rich complaint details textarea
- File upload (up to 2 files: PDF, JPG, PNG, DOC, DOCX)
- Form validation
- Auto-redirect to complaints list on success

### My Complaints
- List all user's complaints with filters:
  - Complaint ID
  - Flat number
  - Category type
  - Status
- Search across all fields
- Edit action for "Saved" status
- View action for other statuses
- Responsive table layout
- Empty state with new complaint CTA

### Complaint Detail
- Read-only view of complaint details
- Editable fields if status = "Saved"
- File upload support for updates
- Status badge indicator
- Last updated date display
- Back navigation to list

## Status Codes

- `10` - Saved (draft)
- `20` - Submitted (pending review)
- `50` - In Progress (assigned to vendor)
- `60` - Completed (resolved)

## JSP Migration Mapping

| JSP Feature | React Implementation |
|-------------|----------------------|
| request.jsp (New) | NewComplaintPage.tsx |
| request_test.jsp (Edit) | ComplaintDetailPage.tsx (edit mode) |
| request.jsp?view=View | ComplaintDetailPage.tsx (view mode) |
| myRequestList.jsp | MyComplaintsPage.tsx |
| print_complaint.jsp | Detail view in ComplaintDetailPage |
| AddComplaintType.jsp | Master data page (existing) |
| GetSubCategory.jsp | API call in complaints.ts |

## Form Validation

- Category: Required
- Sub-category: Required
- Complaint details: Required, min 10 chars
- Files: Optional, max 2 files

## Dependencies

- react-query - Data fetching/caching
- react-hook-form - Form state management
- react-router-dom - Routing
- Zod - Data validation (ready for integration)

## Notes

Backend should implement multipart/form-data handling for file uploads.
CSRF protection integrated via existing client wrapper.
