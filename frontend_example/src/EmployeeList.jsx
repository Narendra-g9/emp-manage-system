import React, { useEffect, useState } from 'react';
import axios from 'axios';

axios.defaults.withCredentials = true;

export default function EmployeeList() {
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState('');
  const [showActiveOnly, setShowActiveOnly] = useState(false);

  const [form, setForm] = useState({ eid: '', name: '', mobile_no: '', age: '', department: '', salary: '', is_active: true, address: '' });
  const [editing, setEditing] = useState(false);

  const fetchEmployees = async () => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (showActiveOnly) params.append('is_active', 'true');
    const url = `/api/employees/?${params.toString()}`;
    const res = await axios.get(url);
    setEmployees(res.data);
  };

  useEffect(() => { fetchEmployees(); }, []);

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
    const payload = {
      eid: Number(form.eid),
      name: form.name,
      mobile_no: Number(form.mobile_no),
      age: Number(form.age),
      department: form.department,
      salary: Number(form.salary),
      is_active: !!form.is_active,
      address: form.address,
    };

    if (editing) {
      await axios.put(`/api/employees/${form.eid}/`, payload);
    } else {
      await axios.post('/api/employees/', payload);
    }
    setForm({ eid: '', name: '', mobile_no: '', age: '', department: '', salary: '', is_active: true, address: '' });
    setEditing(false);
    fetchEmployees();
  };

  const cancelEdit = () => {
    setForm({ eid: '', name: '', mobile_no: '', age: '', department: '', salary: '', is_active: true, address: '' });
    setEditing(false);
  };

  const deleteEmployee = async (eid) => {
    if (!window.confirm('Delete employee ' + eid + '?')) return;
    await axios.delete(`/api/employees/${eid}/`);
    fetchEmployees();
  };

  const toggleActive = async (eid, current) => {
    await axios.patch(`/api/employees/${eid}/`, { is_active: !current });
    fetchEmployees();
  };

  return (
    <div>
      <h3>{editing ? 'Edit Employee' : 'Create Employee'}</h3>
      <form onSubmit={submitForm} style={{ marginBottom: 16 }}>
        <input name="eid" placeholder="EID" value={form.eid} onChange={handleChange} required />
        <input name="name" placeholder="Name" value={form.name} onChange={handleChange} required style={{ marginLeft: 8 }} />
        <input name="mobile_no" placeholder="Mobile" value={form.mobile_no} onChange={handleChange} style={{ marginLeft: 8 }} />
        <input name="department" placeholder="Department" value={form.department} onChange={handleChange} style={{ marginLeft: 8 }} />
        <label style={{ marginLeft: 8 }}>
          Active
          <input name="is_active" type="checkbox" checked={form.is_active} onChange={handleChange} style={{ marginLeft: 4 }} />
        </label>
        <button type="submit" style={{ marginLeft: 8 }}>{editing ? 'Update' : 'Create'}</button>
        {editing && <button type="button" onClick={cancelEdit} style={{ marginLeft: 8 }}>Cancel</button>}
      </form>

      <h4>Search</h4>
      <form onSubmit={handleSearch}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name, eid or mobile" />
        <label style={{marginLeft:8}}>
          <input type="checkbox" checked={showActiveOnly} onChange={e => setShowActiveOnly(e.target.checked)} /> Active only
        </label>
        <button type="submit" style={{ marginLeft: 8 }}>Search</button>
      </form>

      <ul>
        {employees.map(emp => (
          <li key={emp.eid} style={{marginTop:8}}>
            <strong>{emp.name}</strong> (eid: {emp.eid}) - {emp.department} - {emp.mobile_no}
            <label style={{marginLeft:12}}>
              Active:
              <input type="checkbox" checked={emp.is_active} onChange={() => toggleActive(emp.eid, emp.is_active)} />
            </label>
            <button onClick={() => startEdit(emp)} style={{ marginLeft: 12 }}>Edit</button>
            <button onClick={() => deleteEmployee(emp.eid)} style={{ marginLeft: 8, color: 'darkred' }}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
