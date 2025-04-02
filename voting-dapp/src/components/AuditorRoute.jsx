// components/AuditorRoute.jsx
import React, { useContext, useEffect, useState } from 'react';
import { Web3Context } from '../context/Web3Context';
import { isApprovedAuditor } from '../utils/contractUtils';
import NotAuthorized from './NotAuthorized';
import { Outlet } from 'react-router-dom';

export default function AuditorRoute() {
  const { account, provider, connectWallet } = useContext(Web3Context);
  const [loading, setLoading] = useState(true);
  const [approved, setApproved] = useState(false);

  useEffect(() => {
    async function checkAuditor() {
      if (!account) {
        await connectWallet(); 
        setLoading(false);
        return;
      }
      try {
        const isAuditor = await isApprovedAuditor(provider, account);
        setApproved(isAuditor);
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    }
    checkAuditor();
  }, [account, provider, connectWallet]);

  if (loading) {
    return <div className="p-6">Checking auditor permissions...</div>;
  }

  return approved ? <Outlet /> : <NotAuthorized />;
}
