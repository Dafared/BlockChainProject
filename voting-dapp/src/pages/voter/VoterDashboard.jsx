// VoterDashboard.jsx
import React from 'react';
import { Link } from 'react-router-dom';

export default function VoterDashboard() {
  return (
    <div className="p-6">
      <div className="ml-4">
        <h1 className="text-2xl font-bold">Voter Dashboard</h1>
        <nav className="mt-4 flex flex-col space-y-2">
          <Link to="/voter/register" className="btn">Voter Registration</Link>
          <Link to="/voter/vote" className="btn">Vote</Link>
          <Link to="/voter/candidates" className="btn">View Candidates</Link>
          <Link to="/voter/results" className="btn">Election Results</Link>
        </nav>
      </div>
    </div>
  );
}
