
import React, { useEffect, useState } from 'react';
import axios from 'axios';

// API base URL: set VITE_API_URL in .env for production builds
// In dev mode, leave empty to use Vite proxy
const API_BASE = import.meta.env.VITE_API_URL || '';

// small helper to format mobile
const fmtMobile = (m) => m ? String(m) : '';

// helper to format date
const fmtDate = (d) => d ? new Date(d).toLocaleString() : '';

// Add error interceptor for debugging
axios.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default function EmployeeList() {
  const [employees, setEmployees] = useState([]);
  const [deletedEmployees, setDeletedEmployees] = useState([]);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState(null); // {type:'success'|'danger', text: '...'}
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;
  const [search, setSearch] = useState('');
  const [showActiveOnly, setShowActiveOnly] = useState(false);
  const [showDeleted, setShowDeleted] = useState(false);

  const [form, setForm] = useState({ eid: '', name: '', mobile_no: '', age: '', department: '', salary: '', is_active: true, address: '' });
  const [editing, setEditing] = useState(false);

  const fetchEmployees = async () => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (showActiveOnly) params.append('is_active', 'true');
    const url = `${API_BASE}/api/employees/?${params.toString()}`;
    const res = await axios.get(url);
    setEmployees(res.data);
    setCurrentPage(1);
  };

  const fetchDeletedEmployees = async () => {
    const res = await axios.get(`${API_BASE}/api/employees/deleted/`);
    setDeletedEmployees(res.data);
  };

  useEffect(() => { 
    fetchEmployees(); 
    fetchDeletedEmployees();
  }, []);

  useEffect(() => {
    // refetch when active-only toggles
    fetchEmployees();
  }, [showActiveOnly]);

  const handleSearch = async (e) => {
    e && e.preventDefault();
    await fetchEmployees();
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const startEdit = (emp) => {
    setForm({
      eid: emp.eid,
      name: emp.name || '',
      mobile_no: emp.mobile_no || '',
      age: emp.age || '',
      department: emp.department || '',
      salary: emp.salary || '',
      is_active: !!emp.is_active,
      address: emp.address || '',
    });
    setEditing(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const submitForm = async (e) => {
    e && e.preventDefault();
    const errs = {};
    if (!form.name || String(form.name).trim().length < 2) errs.name = 'Name is required (min 2 chars)';
    if (!form.eid) errs.eid = 'EID is required';
    if (form.mobile_no && !/^\d+$/.test(String(form.mobile_no))) errs.mobile_no = 'Mobile must be numeric';
    if (form.age && (isNaN(Number(form.age)) || Number(form.age) <= 0)) errs.age = 'Age must be a positive number';
    if (Object.keys(errs).length) { setErrors(errs); setMessage(null); return; }
    setErrors({});
    
    // Build payload - only include fields with values
    const payload = {
      eid: Number(form.eid),
      name: form.name,
      is_active: !!form.is_active,
    };
    
    // Add optional fields only if they have values
    if (form.mobile_no && String(form.mobile_no).trim()) {
      payload.mobile_no = Number(form.mobile_no);
    }
    if (form.age && String(form.age).trim()) {
      payload.age = Number(form.age);
    }
    if (form.department && String(form.department).trim()) {
      payload.department = form.department;
    }
    if (form.salary && String(form.salary).trim()) {
      payload.salary = Number(form.salary);
    }
    if (form.address && String(form.address).trim()) {
      payload.address = form.address;
    }

    try {
      if (editing) {
        await axios.put(`${API_BASE}/api/employees/${form.eid}/`, payload);
        setMessage({ type: 'success', text: 'Employee updated' });
      } else {
        await axios.post(`${API_BASE}/api/employees/`, payload);
        setMessage({ type: 'success', text: 'Employee created' });
      }
      setForm({ eid: '', name: '', mobile_no: '', age: '', department: '', salary: '', is_active: true, address: '' });
      setEditing(false);
      fetchEmployees();
    } catch (err) {
      setMessage({ type: 'danger', text: 'Failed to save employee' });
    }
  };

  const cancelEdit = () => {
    setForm({ eid: '', name: '', mobile_no: '', age: '', department: '', salary: '', is_active: true, address: '' });
    setEditing(false);
  };

  const deleteEmployee = async (eid) => {
    if (!window.confirm('Delete employee ' + eid + '?')) return;
    try {
      await axios.delete(`${API_BASE}/api/employees/${eid}/`);
      setMessage({ type: 'success', text: 'Employee deleted (soft delete)' });
      fetchEmployees();
      fetchDeletedEmployees();
    } catch (err) {
      setMessage({ type: 'danger', text: 'Failed to delete' });
    }
  };

  const restoreEmployee = async (eid) => {
    if (!window.confirm('Restore employee ' + eid + '?')) return;
    try {
      await axios.post(`${API_BASE}/api/employees/${eid}/restore/`);
      setMessage({ type: 'success', text: 'Employee restored' });
      fetchEmployees();
      fetchDeletedEmployees();
    } catch (err) {
      setMessage({ type: 'danger', text: 'Failed to restore' });
    }
  };

  const toggleActive = async (eid, current) => {
    try {
      await axios.patch(`${API_BASE}/api/employees/${eid}/`, { is_active: !current });
      setMessage({ type: 'success', text: 'Status updated' });
      fetchEmployees();
    } catch (err) {
      setMessage({ type: 'danger', text: 'Failed to update status' });
    }
  };

  const toggleShowDeleted = () => {
    setShowDeleted(!showDeleted);
    if (!showDeleted) {
      fetchDeletedEmployees();
    }
  };

  // pagination
  const displayEmployees = showDeleted ? deletedEmployees : employees;
  const totalPages = Math.max(1, Math.ceil(displayEmployees.length / pageSize));
  const startIdx = (currentPage - 1) * pageSize;
  const visibleEmployees = displayEmployees.slice(startIdx, startIdx + pageSize);

  const goToPage = (n) => {
    if (n < 1 || n > totalPages) return;
    setCurrentPage(n);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="app-container">
      {message && (
        <div className="app-alert">
          <div className={`alert alert-${message.type} alert-dismissible fade show`} role="alert">
            {message.text}
            <button type="button" className="btn-close" aria-label="Close" onClick={() => setMessage(null)}></button>
          </div>
        </div>
      )}
      <nav className="navbar navbar-expand-lg navbar-light bg-white mb-4 shadow-sm">
        <div className="container-fluid">
          <a className="navbar-brand" href="#">Employee Manager</a>
          <button 
            className={`btn btn-sm ${showDeleted ? 'btn-warning' : 'btn-outline-secondary'}`}
            onClick={toggleShowDeleted}
          >
            {showDeleted ? 'Show Active' : `Show Deleted (${deletedEmployees.length})`}
          </button>
        </div>
      </nav>

      {!showDeleted && (
        <div className="card p-4 mb-4">
          <h5 className="mb-3">{editing ? 'Edit Employee' : 'Create Employee'}</h5>
          <form onSubmit={submitForm} className="form-inline">
            <input className="form-control" name="eid" placeholder="EID" value={form.eid} onChange={handleChange} required />
            <input className="form-control" name="name" placeholder="Name" value={form.name} onChange={handleChange} required />
            <input className="form-control" name="mobile_no" placeholder="Mobile" value={form.mobile_no} onChange={handleChange} />
            <input className="form-control" name="department" placeholder="Department" value={form.department} onChange={handleChange} />
            <div className="form-check" style={{alignSelf:'center'}}>
              <input className="form-check-input" name="is_active" type="checkbox" checked={form.is_active} onChange={handleChange} id="activeCheck" />
              <label className="form-check-label small-muted" htmlFor="activeCheck">Active</label>
            </div>
            <div>
              <button className="btn btn-primary" type="submit">{editing ? 'Update' : 'Create'}</button>
              {editing && <button type="button" onClick={cancelEdit} className="btn btn-secondary ms-2">Cancel</button>}
            </div>
          </form>
        </div>
      )}

        <div className="card p-3 mb-4">
        {!showDeleted && (
          <form onSubmit={handleSearch} className="d-flex gap-2 mb-3">
            <input className="form-control" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name, eid or mobile" />
            <div className="form-check align-self-center">
              <input className="form-check-input" type="checkbox" checked={showActiveOnly} onChange={e => setShowActiveOnly(e.target.checked)} id="filterActive" />
              <label className="form-check-label small-muted" htmlFor="filterActive">Active only</label>
            </div>
            <button className="btn btn-outline-primary" type="submit">Search</button>
          </form>
        )}

        {showDeleted && (
          <h5 className="mb-3">Deleted Employees</h5>
        )}

        <div>
          {visibleEmployees.length === 0 ? (
            <div className="empty-state">
              <i className="bi bi-people-fill" />
              <div>{showDeleted ? 'No deleted employees' : 'No employees found'}</div>
              <div className="small-muted">{showDeleted ? 'Deleted employees will appear here' : 'Use the form above to create a new employee.'}</div>
            </div>
          ) : (
            visibleEmployees.map(emp => (
              <div key={emp.eid} className={`employee-item ${emp.deleted_at ? 'deleted-employee' : ''}`}>
                <div className="employee-meta">
                  <div>
                    <div>
                      <strong>{emp.name}</strong>
                      {emp.deleted_at && <span className="badge bg-danger ms-2">Deleted</span>}
                    </div>
                    <div className="small-muted">
                      eid: {emp.eid} • {emp.department} • {fmtMobile(emp.mobile_no)}
                      {emp.deleted_at && <span className="text-danger ms-2">Deleted: {fmtDate(emp.deleted_at)}</span>}
                    </div>
                  </div>
                </div>
                <div className="d-flex align-items-center actions">
                  {showDeleted ? (
                    <button className="btn btn-sm btn-outline-success" onClick={() => restoreEmployee(emp.eid)}>
                      <i className="bi bi-arrow-counterclockwise" /> Restore
                    </button>
                  ) : (
                    <>
                      <div className="form-check me-3">
                        <input className="form-check-input" type="checkbox" checked={emp.is_active} onChange={() => toggleActive(emp.eid, emp.is_active)} />
                      </div>
                      <button className="btn btn-sm btn-outline-secondary" onClick={() => startEdit(emp)}><i className="bi bi-pencil" /> Edit</button>
                      <button className="btn btn-sm btn-outline-danger ms-2" onClick={() => deleteEmployee(emp.eid)}><i className="bi bi-trash" /> Delete</button>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
          {/* pagination */}
          {displayEmployees.length > pageSize && (
            <nav>
              <ul className="pagination mt-3">
                <li className={`page-item ${currentPage===1? 'disabled':''}`}><button className="page-link" onClick={() => goToPage(currentPage-1)}>Previous</button></li>
                {Array.from({length: totalPages}).map((_,i)=> (
                  <li key={i} className={`page-item ${currentPage===i+1? 'active':''}`}><button className="page-link" onClick={() => goToPage(i+1)}>{i+1}</button></li>
                ))}
                <li className={`page-item ${currentPage===totalPages? 'disabled':''}`}><button className="page-link" onClick={() => goToPage(currentPage+1)}>Next</button></li>
              </ul>
            </nav>
          )}
        </div>
      </div>
    </div>
  );
}

