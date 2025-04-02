import React, { useState, useContext, useEffect, useCallback } from 'react';
import { Web3Context } from '../../context/Web3Context';
import { approveAuditor, getAllAuditors } from '../../utils/contractUtils';
import UserFriendlyError from '../../components/UserFriendlyError';

export default function AuditorManagement() {
  const { signer, provider } = useContext(Web3Context);

  const [auditorAddress, setAuditorAddress] = useState('');
  const [organization, setOrganization] = useState('');

  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // For displaying the existing auditors
  const [auditors, setAuditors] = useState([]);

  // 1) Use useCallback to define loadAuditors
  const loadAuditors = useCallback(async () => {
    try {
      const list = await getAllAuditors(provider);
      setAuditors(list);
    } catch (err) {
      console.error('Failed to load auditors:', err);
    }
  }, [provider]);

  // 2) useEffect calls loadAuditors once on mount or when loadAuditors changes
  useEffect(() => {
    loadAuditors();
  }, [loadAuditors]);

  const handleApprove = async () => {
    setError(null);
    setSuccess(false);
    try {
      await approveAuditor(signer, auditorAddress, organization);
      setSuccess(true);

      // Reload the list after success
      loadAuditors();
    } catch (err) {
      const message = err.reason || err.message || '';
      if (message.includes('Only election commission can perform this action')) {
        setError({
          title: 'Unauthorized',
          message: 'You must be the election commission to approve an auditor.'
        });
      } else {
        setError({ title: 'Error', message: 'Failed to approve auditor.' });
      }
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold">Auditor Management</h2>

      {error && <UserFriendlyError title={error.title} message={error.message} />}
      {success && <div className="text-green-600 mt-2">Auditor Approved Successfully!</div>}

      <div className="mt-4">
        <input
          className="input"
          placeholder="Auditor Address"
          value={auditorAddress}
          onChange={(e) => setAuditorAddress(e.target.value)}
        />
        <input
          className="input mt-2"
          placeholder="Organization"
          value={organization}
          onChange={(e) => setOrganization(e.target.value)}
        />
        <button className="btn mt-2" onClick={handleApprove}>
          Approve Auditor
        </button>
      </div>

      {/* Display existing auditors */}
      <h3 className="mt-6 font-semibold">Existing Auditors</h3>
      {auditors.length === 0 && (
        <p className="text-gray-500">No auditors found.</p>
      )}
      {auditors.map((aud, idx) => (
        <div key={idx} className="border p-2 mt-2 rounded">
          <p><strong>Address:</strong> {aud.auditorAddress}</p>
          <p><strong>Organization:</strong> {aud.organization}</p>
        </div>
      ))}
    </div>
  );
}
