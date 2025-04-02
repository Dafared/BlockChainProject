// HomePage.jsx
import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Web3Context } from '../../context/Web3Context';
import { ADMIN_ADDRESS } from '../../config';
import { isApprovedAuditor } from '../../utils/contractUtils';

export default function HomePage() {
  const { account, provider, connectWallet } = useContext(Web3Context);
  const navigate = useNavigate();
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    if (!account) return;

    async function checkRole() {
      setChecking(true);
      if (account.toLowerCase() === ADMIN_ADDRESS.toLowerCase()) {
        navigate('/admin');
      } else {
        try {
          const approved = await isApprovedAuditor(provider, account);
          if (approved) {
            navigate('/auditor');
          } else {
            navigate('/voter');
          }
        } catch (err) {
          console.error('Failed to check auditor status:', err);
          navigate('/voter');
        }
      }
      setChecking(false);
    }

    checkRole();
  }, [account, provider, navigate]);

  if (!account) {
    return (
      <div className="p-6 flex flex-col items-center justify-center">
        <h1 className="text-3xl font-bold mb-4">Welcome to Blockchain Voting System</h1>
        <button onClick={connectWallet} className="btn">
          Connect Wallet
        </button>
      </div>
    );
  }

  if (checking) {
    return (
      <div className="p-6 flex flex-col items-center justify-center">
        <h1 className="text-xl">Checking your role...</h1>
      </div>
    );
  }

  return (
    <div className="p-6 flex flex-col items-center justify-center">
      <h1 className="text-xl">Redirecting based on your role...</h1>
    </div>
  );
}
