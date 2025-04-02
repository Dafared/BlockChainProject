// CandidateManagement.jsx
import React, { useState, useContext, useEffect } from 'react';
import { Web3Context } from '../../context/Web3Context';
import { registerCandidate, getCandidates } from '../../utils/contractUtils';
import UserFriendlyError from '../../components/UserFriendlyError';
import { checkCitizenInfo } from '../../mockDatabase/mockCitizenDatabase';

export default function CandidateManagement() {
  const { signer, provider } = useContext(Web3Context);
  const [nationalID, setNationalID] = useState('');
  const [name, setName] = useState('');
  const [party, setParty] = useState('');
  const [manifesto, setManifesto] = useState('');
  const [candidates, setCandidates] = useState([]);
  const [error, setError] = useState(null);

  const handleRegister = async () => {

    // 1) Offline check
    const isValidOffline = checkCitizenInfo(nationalID, name);
    if (!isValidOffline) {
      setError({
        title: 'No Match Found',
        message: 'This person is not in the mock citizen database.'
      });
      return;
    }

    // 2) If offline check passes, proceed with chain registration
    try {
      await registerCandidate(signer, { nationalID, name, party, manifesto });
      alert('Candidate registered!');
      setError(null);
    } catch (err) {
      const message = err.reason || err.data?.message || err.message || '';
      if (message.includes('Only election commission can perform this action')) {
        setError({
          title: 'Unauthorized Action',
          message: 'Only the election commission (admin) can register a candidate.'
        });
      } else if (message.includes('Invalid national ID format')) {
        setError({
          title: 'Invalid National ID',
          message: 'The provided National ID is invalid. Please check and try again.'
        });
      } else if (message.includes('Candidate with this national ID already registered')) {
        setError({
          title: 'Duplicate Registration',
          message: 'A candidate with this National ID is already registered.'
        });
      } else {
        setError({
          title: 'Unexpected Error',
          message: 'An unexpected error occurred during registration.'
        });
      }
    }
  };

  useEffect(() => {
    async function fetchCandidates() {
      setCandidates(await getCandidates(provider));
    }
    fetchCandidates();
  }, [provider]);

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold">Candidate Management</h2>

      {error && <UserFriendlyError title={error.title} message={error.message} />}

      <input placeholder="National ID" className="input" value={nationalID} onChange={(e) => setNationalID(e.target.value)} />
      <input placeholder="Name" className="input mt-2" value={name} onChange={(e) => setName(e.target.value)} />
      <input placeholder="Party" className="input mt-2" value={party} onChange={(e) => setParty(e.target.value)} />
      <textarea placeholder="Manifesto" className="input mt-2" value={manifesto} onChange={(e) => setManifesto(e.target.value)} />
      <button onClick={handleRegister} className="btn mt-3">Register Candidate</button>

      <h3 className="font-bold mt-6">Registered Candidates</h3>
      {candidates.map(c => (
        <div key={c.id} className="border p-2 mt-2">
          {c.name} ({c.party}) - {c.nationalID}
        </div>
      ))}
    </div>
  );
}
