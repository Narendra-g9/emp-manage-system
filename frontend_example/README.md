React example (minimal)

Instructions:

1. Create a React app (e.g., using `create-react-app`) or place these files into your existing frontend.
2. Ensure your React dev server proxies `/api` to your Django backend (or use full backend URL).
3. Install deps:

```bash
npm install
```

4. Run your React app and open the page containing `EmployeeList` component.

Notes:
- The component expects the API to be available at `/api/employees/`.
- Toggle sends `PATCH /api/employees/{eid}/` with `{ is_active: boolean }`.
- You may need to adjust CORS and Django URL prefix.
