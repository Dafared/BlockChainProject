// components/AdminRoute.jsx
import React, { useContext, useEffect, useState } from 'react';
import { Web3Context } from '../context/Web3Context';
import { ADMIN_ADDRESS } from '../config';
import NotAuthorized from './NotAuthorized';
import { Outlet } from 'react-router-dom';

export default function AdminRoute() {
  const { account, connectWallet } = useContext(Web3Context);
  const [isAdmin, setIsAdmin] = useState(null);

  useEffect(() => {
    if (!account) {
      connectWallet();
      return;
    }
    setIsAdmin(account.toLowerCase() === ADMIN_ADDRESS.toLowerCase());
  }, [account, connectWallet]);

  if (isAdmin === null) {
    return <div className="p-6">Checking permissions...</div>;
  }

  return isAdmin ? <Outlet /> : <NotAuthorized />;
}
