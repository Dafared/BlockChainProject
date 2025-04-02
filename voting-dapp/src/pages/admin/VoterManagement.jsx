// VoterManagement.jsx
import React, { useState, useContext, useEffect } from 'react';
import { Web3Context } from '../../context/Web3Context';
import { registerVoter, getVoterCount } from '../../utils/contractUtils';

export default function VoterManagement() {
  const { signer, provider } = useContext(Web3Context);
  const [voterAddress, setVoterAddress] = useState('');
  const [nationalID, setNationalID] = useState('');
  const [name, setName] = useState('');
  const [totalVoters, setTotalVoters] = useState(0);

  const handleRegister = async () => {
    await registerVoter(signer, { voterAddress, nationalID, name });
    alert('Voter registered!');
  };

  useEffect(() => {
    async function fetchVoterCount() {
      setTotalVoters(await getVoterCount(provider));
    }
    fetchVoterCount();
  }, [provider]);

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold">Voter Management</h2>
      <input placeholder="Voter Address" className="input" value={voterAddress} onChange={(e) => setVoterAddress(e.target.value)} />
      <input placeholder="National ID" className="input mt-2" value={nationalID} onChange={(e) => setNationalID(e.target.value)} />
      <input placeholder="Name" className="input mt-2" value={name} onChange={(e) => setName(e.target.value)} />
      <button onClick={handleRegister} className="btn mt-3">Register Voter</button>

      <p className="mt-4">Total Registered Voters: {totalVoters}</p>
    </div>
  );
}
