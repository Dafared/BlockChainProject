// pages/auditor/AuditDashboard.jsx
import React, { useState, useContext, useEffect } from 'react';
import { Web3Context } from '../../context/Web3Context';
import {
  verifyVoteCounts,
  getAllVerificationRecords,
  submitVerification,
} from '../../utils/contractUtils';
import UserFriendlyError from '../../components/UserFriendlyError';

export default function AuditDashboard() {
  const { signer, provider } = useContext(Web3Context);

  const [records, setRecords] = useState([]);
  const [verificationPassed, setVerificationPassed] = useState(true);
  const [comments, setComments] = useState('');
  const [error, setError] = useState(null);
  const [voteCountsOk, setVoteCountsOk] = useState(null);

  useEffect(() => {
    async function fetchRecords() {
      try {
        const allRecords = await getAllVerificationRecords(provider);
        setRecords(allRecords);
      } catch (err) {
        console.error('Failed to fetch verification records:', err);
      }
    }
    fetchRecords();
  }, [provider]);

  async function handleVerifyVoteCounts() {
    try {
      const result = await verifyVoteCounts(provider);
      setVoteCountsOk(result);
    } catch (err) {
      console.error(err);
      setError({ title: 'Error', message: 'Failed to verify vote counts.' });
    }
  }

  async function handleSubmitVerification() {
    setError(null);
    try {
      await submitVerification(signer, comments, verificationPassed);
      alert('Verification submitted successfully!');

      // refresh the records
      const allRecords = await getAllVerificationRecords(provider);
      setRecords(allRecords);
    } catch (err) {
      const message = err.reason || err.message || '';
      if (message.includes('Only approved auditors can perform this action')) {
        setError({
          title: 'Unauthorized Auditor',
          message: 'You are not an approved auditor.',
        });
      } else {
        setError({ title: 'Error', message: 'Failed to submit verification.' });
      }
    }
  }

  return (
    <div className="p-6">
      <div className="ml-4">
        <h2 className="text-xl font-bold">Audit Dashboard</h2>
        {error && <UserFriendlyError title={error.title} message={error.message} />}

        <div className="mt-4">
          <button className="btn" onClick={handleVerifyVoteCounts}>
            Verify Vote Counts
          </button>
          {voteCountsOk !== null && (
            <p className="mt-2">
              Vote counts match? {voteCountsOk ? 'Yes' : 'No'}
            </p>
          )}
        </div>

        <div className="mt-4">
          <textarea
            className="input"
            placeholder="Comments about the verification"
            value={comments}
            onChange={(e) => setComments(e.target.value)}
          />
          <div className="mt-2">
            <label>
              <input
                type="checkbox"
                checked={verificationPassed}
                onChange={(e) => setVerificationPassed(e.target.checked)}
              />
              Verification Passed
            </label>
          </div>
          <button className="btn mt-2" onClick={handleSubmitVerification}>
            Submit Verification
          </button>
        </div>

        <div className="mt-6">
          <h3 className="font-semibold">All Verification Records</h3>
          {records.map((rec, idx) => (
            <div key={idx} className="border p-2 mt-2">
              <p>Auditor: {rec.auditor}</p>
              <p>Timestamp: {new Date(rec.timestamp * 1000).toLocaleString()}</p>
              <p>Comments: {rec.comments}</p>
              <p>Verification Passed? {rec.verificationPassed ? 'Yes' : 'No'}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
