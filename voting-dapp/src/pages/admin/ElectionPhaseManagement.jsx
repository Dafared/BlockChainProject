// ElectionPhaseManagement.jsx
import React, { useContext, useState } from 'react';
import { Web3Context } from '../../context/Web3Context';
import { startRegistration, startVoting, endElection, finalizeResults } from '../../utils/contractUtils';
import UserFriendlyError from '../../components/UserFriendlyError';

export default function ElectionPhaseManagement() {
  const { signer } = useContext(Web3Context);
  const [error, setError] = useState(null);
  const [votingDuration, setVotingDuration] = useState('60');

  const handleStartRegistration = async () => {
    try {
      await startRegistration(signer);
    } catch (error) {
      handleContractError(error);
    }
  };

  const handleStartVoting = async () => {
    try {
      const durationNum = parseInt(votingDuration, 10);
      if (isNaN(durationNum) || durationNum <= 0) {
        setError({
          title: 'Invalid Duration',
          message: 'Please enter a positive number of minutes.'
        });
        return;
      }
      await startVoting(signer, durationNum);
    } catch (error) {
      handleContractError(error);
    }
  };

  const handleEndElection = async () => {
    try {
      await endElection(signer);
    } catch (error) {
      handleContractError(error);
    }
  };

  const handleFinializeElection = async () => {
    try {
      await finalizeResults(signer);
    } catch (error) {
      handleContractError(error);
    }
  };

  const handleContractError = (error) => {
    const message = error.reason || error.data?.message || error.message || '';
    if (message.includes('Invalid election state for this action')) {
      setError({
        title: 'Invalid Election State',
        message: 'The current election state does not allow this action.'
      });
    } else if (message.includes('Voting period not ended yet')) {
      setError({
        title: 'Voting Period Not Ended',
        message: 'You cannot end the election because the voting period is still ongoing.'
      });
    } else if (message.includes('Only election commission can perform this action')) {
      setError({
        title: 'Unauthorized Action',
        message: 'Only the election commission (admin) can perform this action.'
      });
    } else if (message.includes('Results already finalized')) {
      setError({
        title: 'Election Already Ended',
        message: 'The election has already been finalized. You cannot end it again.'
      });
    } else if (message.includes('ended before finalizing results')) {
      setError({
        title: 'Election has not Ended',
        message: 'Election must be ended before finalizing results. You cannot finialize it now.'
      });
    } else {
      setError({
        title: 'Unexpected Error',
        message: 'An unexpected error occurred. Please try again later.'
      });
    }
  };

  return (
    <div className="ml-4">
      <h2 className="text-xl font-bold">Election Phase Management</h2>

      {error && <UserFriendlyError title={error.title} message={error.message} />}
      <div>
        <button className="btn mt-3" onClick={handleStartRegistration}>
          Start Registration Phase
        </button>
      </div>
      <div>
        <label className="mr-2">Voting Duration (minutes):</label>
        <input
          type="number"
          className="input"
          style={{ marginRight: '1rem'}}
          value={votingDuration}
          onChange={(e) => setVotingDuration(e.target.value)}
        />
        <button className="btn" onClick={handleStartVoting}>
          Start Voting Phase
        </button>
      </div>
      <div>
        <button className="btn mt-3" onClick={handleEndElection}>
          End Election
        </button>
      </div>
      <div>
        <button className="btn mt-3" onClick={handleFinializeElection}>
          Finalize Election
        </button>
      </div>
    </div>
  );
}
