# Student Data Portal

## Current State
- Full-stack student data portal with Motoko backend and React frontend
- Students can be added via a form with fields: Roll No, Name, G.R. No, PEN No, APAAR No, UDISE Code, Aadhar No, Col1, Col2, Col3
- Table shows all students sorted by ID
- Delete functionality with confirmation dialog
- Custom editable column headings (col1, col2, col3) stored in localStorage
- No edit/update functionality exists

## Requested Changes (Diff)

### Add
- Backend: `updateStudent` function that accepts id + all student fields and updates the record
- Frontend: Edit button (pencil icon) in each table row's action column
- Frontend: Edit modal/dialog pre-filled with student's current data; save triggers `updateStudent`
- Frontend: `useUpdateStudent` hook in useQueries.ts
- Sorting: Students sorted by Roll No (ascending) in the table instead of by ID

### Modify
- Backend: `getStudents` query to sort by `rollNo` instead of `id`
- Frontend: Table action column to include Edit button alongside Delete button

### Remove
- Nothing removed

## Implementation Plan
1. Generate new Motoko backend with `updateStudent` function and `getStudents` sorted by rollNo
2. Add `useUpdateStudent` mutation hook to useQueries.ts
3. Add Edit button per row in the table
4. Add Edit Dialog (pre-filled form) that calls updateStudent on save
5. Wire everything with proper data-ocid markers
6. Validate and deploy
