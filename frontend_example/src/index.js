import React from 'react';
import { createRoot } from 'react-dom/client';
import EmployeeList from './EmployeeList';

const root = createRoot(document.getElementById('root'));
root.render(<EmployeeList />);
