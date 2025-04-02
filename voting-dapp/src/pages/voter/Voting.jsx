// Voting.jsx
import React, { useState, useEffect, useContext } from 'react';
import { Web3Context } from '../../context/Web3Context';
import { getCandidates, castVote, getVoterStatus } from '../../utils/contractUtils';
import UserFriendlyError from '../../components/UserFriendlyError';

export default function Voting() {
  const { provider, signer, account, connectWallet } = useContext(Web3Context);
  const [candidates, setCandidates] = useState([]);
  const [hasVoted, setHasVoted] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      if (!account) return;
      setCandidates(await getCandidates(provider));
      setHasVoted((await getVoterStatus(provider, account)).hasVoted);
    }
    fetchData();
  }, [account, provider]);

  const handleVote = async (candidateId) => {
    if (!signer) return connectWallet();
    try {
      await castVote(signer, candidateId);
      setHasVoted(true);
    } catch (error) {
      const message = error.reason || error.data?.message || error.message || '';
      
      if (message.includes('Invalid election state for this action')) {
        setError({
          title: 'Voting Not Active',
          message: 'The election is currently not in the voting phase. Please try again later.'
        });
      } else if (message.includes('Voter has already voted')) {
        setError({
          title: 'Already Voted',
          message: 'You have already voted.'
        });
      } else if (message.includes('Voting period has ended')) {
        setError({
          title: 'Voting Period Ended',
          message: 'The voting period has ended. You cannot vote anymore.'
        });
      } else if (message.includes('Voter not registered')) {
        setError({
          title: 'Not Registered',
          message: 'You are not registered as a voter.'
        });
      } else if (message.includes('Invalid candidate')) {
        setError({
          title: 'Invalid Candidate',
          message: 'The candidate selected is invalid.'
        });
      } else {
        setError({
          title: 'Unexpected Error',
          message: 'An unexpected error occurred. Please try again later.'
        });
      }
    }
  };

  if (error) {
    return (
      <div className="p-6">
        <h2 className="text-xl font-bold">Voting</h2>
        <UserFriendlyError title={error.title} message={error.message} />
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold">Vote for a Candidate</h2>
      {!account && <button onClick={connectWallet} className="btn">Connect Wallet to Vote</button>}
      {account && candidates.map(candidate => (
        <div key={candidate.id} className="mt-3 border p-3 rounded">
          <h3 className="font-semibold">{candidate.name} ({candidate.party})</h3>
          <p>{candidate.manifesto}</p>
          <button
            disabled={hasVoted}
            onClick={() => handleVote(candidate.id)}
            className="btn mt-2"
          >
            {hasVoted ? 'Already Voted' : 'Vote'}
          </button>
        </div>
      ))}
    </div>
  );
}
