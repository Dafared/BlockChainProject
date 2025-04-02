// AdminDashboard.jsx
import React from 'react';
import { Link } from 'react-router-dom';

export default function AdminDashboard() {
  return (
    <div className="p-6">
      <div className="ml-4">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <nav className="mt-4 flex flex-col space-y-2">
          <Link to="/admin/candidates" className="btn">Candidate Management</Link>
          <Link to="/admin/voters" className="btn">Voter Management</Link>
          <Link to="/admin/election-phase" className="btn">Election Phase Management</Link>
          <Link to="/admin/results" className="btn">Election Results Management</Link>
          <Link to="/admin/auditor" className="btn">Auditor Management</Link>
        </nav>
      </div>
    </div>
  );
}
