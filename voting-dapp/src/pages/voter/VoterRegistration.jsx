// VoterRegistration.jsx
import React, { useState, useContext } from 'react';
import { Web3Context } from '../../context/Web3Context';
import { selfRegisterVoter } from '../../utils/contractUtils';
import UserFriendlyError from '../../components/UserFriendlyError';
import { checkCitizenInfo } from '../../mockDatabase/mockCitizenDatabase';

export default function VoterRegistration() {
  const { signer, account, connectWallet } = useContext(Web3Context);
  const [nationalID, setNationalID] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleRegister = async () => {
    if (!signer) return connectWallet();
    setError(null);
    setSuccess(false);

    // 1) Offline check against mockCitizenDatabase
    const isValidOffline = checkCitizenInfo(nationalID, name);
    if (!isValidOffline) {
      setError({
        title: 'No Match Found',
        message: 'Your ID and name do not appear in the citizen database.'
      });
      return;
    }

    // 2) If offline check passes, proceed with chain registration
    try {
      await selfRegisterVoter(signer, { nationalID, name });
      setSuccess(true);
    } catch (error) {
      const message = error.reason || error.data?.message || error.message || '';
      if (message.includes('Voter already registered')) {
        setError({ title: 'Already Registered', message: 'This wallet address is already registered as a voter.' });
      } else if (message.includes('National ID already registered')) {
        setError({ title: 'ID Already Registered', message: 'The provided National ID has already been registered.' });
      } else if (message.includes('Invalid national ID format')) {
        setError({ title: 'Invalid National ID', message: 'The National ID provided is invalid or incorrectly formatted.' });
      } else {
        setError({ title: 'Unexpected Error', message: 'An unexpected error occurred. Please try again later.' });
      }
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold">Voter Self-Registration</h2>

      {error && <UserFriendlyError title={error.title} message={error.message} />}
      {success && <div className="mt-4 text-green-600 font-semibold">Registration successful!</div>}

      <input
        type="text"
        placeholder="National ID"
        value={nationalID}
        onChange={(e) => setNationalID(e.target.value)}
        className="input mt-4"
      />
      <input
        type="text"
        placeholder="Full Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="input mt-2"
      />
      <button onClick={handleRegister} className="btn mt-4">
        {account ? 'Register Now' : 'Connect Wallet to Register'}
      </button>
    </div>
  );
}