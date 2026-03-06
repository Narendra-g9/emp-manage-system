import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import EmployeeList from './EmployeeList.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <EmployeeList />
  </StrictMode>,
)
