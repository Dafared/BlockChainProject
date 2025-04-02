// Web3Context.js
import React, { createContext, useEffect, useState } from 'react';
import { ethers } from 'ethers';

export const Web3Context = createContext(null);

export function Web3Provider({ children }) {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [account, setAccount] = useState(null);
  const [network, setNetwork] = useState(null);

  useEffect(() => {
    // Initialize provider if MetaMask is available
    if (window.ethereum) {
      const ethProvider = new ethers.providers.Web3Provider(window.ethereum);
      setProvider(ethProvider);

      // Check if already connected (e.g., user previously granted access)
      ethProvider.listAccounts().then(accounts => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          setSigner(ethProvider.getSigner());
        }
      });
      ethProvider.getNetwork().then(net => setNetwork(net));

      // Listen for account changes
      window.ethereum.on('accountsChanged', accounts => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          setSigner(ethProvider.getSigner());
        } else {
          // No accounts means wallet disconnected
          setAccount(null);
          setSigner(null);
        }
      });

      // Listen for network changes
      window.ethereum.on('chainChanged', chainId => {
        // Reload the page on network change (refreshes state & contracts)
        window.location.reload();
      });
    } else {
      console.warn('MetaMask not found. Please install or enable it.');
    }
  }, []);

  // Helper: Connect to MetaMask wallet
  const connectWallet = async () => {
    if (!window.ethereum) {
      alert('MetaMask not detected. Please install it.');
      return;
    }
    try {
      const ethProvider = new ethers.providers.Web3Provider(window.ethereum);
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      setProvider(ethProvider);
      if (accounts.length > 0) {
        setAccount(accounts[0]);
        setSigner(ethProvider.getSigner());
        const net = await ethProvider.getNetwork();
        setNetwork(net);
        console.log(`Connected to ${accounts[0]} on network ${net.name}`);
      }
    } catch (err) {
      console.error('Wallet connection failed:', err);
    }
  };

  // Helper: "Disconnect" wallet (just clears state, MetaMask cannot be force-disconnected)
  const disconnectWallet = () => {
    setAccount(null);
    setSigner(null);
    console.log('Wallet disconnected');
  };

  return (
    <Web3Context.Provider value={{ provider, signer, account, network, connectWallet, disconnectWallet }}>
      {children}
    </Web3Context.Provider>
  );
}
