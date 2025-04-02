// App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Web3Provider } from './context/Web3Context';

// Shared pages
import HomePage from './pages/shared/HomePage';

// Voter pages
import VoterDashboard from './pages/voter/VoterDashboard';
import VoterRegistration from './pages/voter/VoterRegistration';
import Voting from './pages/voter/Voting';
import Candidates from './pages/voter/Candidates';
import ElectionResults from './pages/voter/ElectionResults';

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard';
import CandidateManagement from './pages/admin/CandidateManagement';
import VoterManagement from './pages/admin/VoterManagement';
import ElectionPhaseManagement from './pages/admin/ElectionPhaseManagement';
import ResultsManagement from './pages/admin/ResultsManagement';
import AuditorManagement from './pages/admin/AuditorManagement';

// Auditor pages
import AuditorRoute from './components/AuditorRoute';
import AuditDashboard from './pages/auditor/AuditDashboard';

// Components for admin route protection
import AdminRoute from './components/AdminRoute';

export default function App() {
  return (
    <Web3Provider>
      <Router>
        <Routes>
          {/* Shared Home Page */}
          <Route path="/" element={<HomePage />} />

          {/* Voter Routes */}
          <Route path="/voter" element={<VoterDashboard />} />
          <Route path="/voter/register" element={<VoterRegistration />} />
          <Route path="/voter/vote" element={<Voting />} />
          <Route path="/voter/candidates" element={<Candidates />} />
          <Route path="/voter/results" element={<ElectionResults />} />

          {/* Admin Routes (protected) */}
          <Route path="/admin" element={<AdminRoute />}>
            <Route index element={<AdminDashboard />} />
            <Route path="candidates" element={<CandidateManagement />} />
            <Route path="voters" element={<VoterManagement />} />
            <Route path="election-phase" element={<ElectionPhaseManagement />} />
            <Route path="results" element={<ResultsManagement />} />
            <Route path="auditor" element={<AuditorManagement />} />
          </Route>

          {/* Auditor protected routes */}
          <Route path="/auditor" element={<AuditorRoute />}>
            <Route index element={<AuditDashboard />} />
          </Route>
        </Routes>
      </Router>
    </Web3Provider>
  );
}
