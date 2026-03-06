# Soft Delete Implementation Plan

## Steps to implement:
1. [x] Analyze current code structure
2. [ ] Add `deleted_at` field to Employee model
3. [ ] Create and run migration for the new field
4. [ ] Update views.py to implement soft delete
5. [ ] Update frontend to show/restore deleted employees

## Changes Required:

### Backend:
- Add `deleted_at` models.DateTimeField(null=True, blank=True) to Employee model
- Override `destroy()` in EmployeeViewSet for soft delete
- Override `queryset` to exclude soft-deleted by default
- Add custom action for restore

### Frontend:
- Add "Show Deleted" toggle button
- Add "Restore" button for deleted employees
- Show deleted_at date if available

