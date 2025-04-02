// Candidates.jsx
import React, { useEffect, useState, useContext } from 'react';
import { Web3Context } from '../../context/Web3Context';
import { getCandidates } from '../../utils/contractUtils';

export default function Candidates() {
  const { provider } = useContext(Web3Context);
  const [candidates, setCandidates] = useState([]);

  useEffect(() => {
    async function fetchCandidates() {
      setCandidates(await getCandidates(provider));
    }
    fetchCandidates();
  }, [provider]);

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold">Candidates List</h2>
      {candidates.map(candidate => (
        <div key={candidate.id} className="mt-3 border p-3 rounded">
          <h3 className="font-semibold">{candidate.name} ({candidate.party})</h3>
          <p>{candidate.manifesto}</p>
        </div>
      ))}
    </div>
  );
}
