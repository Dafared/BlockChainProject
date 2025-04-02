// ResultsManagement.jsx
import React, { useEffect, useState, useContext } from 'react';
import { Web3Context } from '../../context/Web3Context';
import { getResults, getWinner, getVoterTurnout } from '../../utils/contractUtils';
import UserFriendlyError from '../../components/UserFriendlyError';

export default function ResultsManagement() {
  const { provider } = useContext(Web3Context);
  const [results, setResults] = useState([]);
  const [winner, setWinner] = useState(null);
  const [turnout, setTurnout] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const resultsData = await getResults(provider);
        const winnerData = await getWinner(provider);
        const turnoutData = await getVoterTurnout(provider);

        setResults(resultsData);
        setWinner(winnerData);
        setTurnout(turnoutData);
      } catch (error) {
        const message = error.reason || error.data?.message || error.message || '';
        if (message.includes('Results not finalized yet')) {
          setError({
            title: 'Results Not Finalized',
            message: 'You need to finalize election results first before viewing them.'
          });
        } else if (message.includes('Election must be ended')) {
          setError({
            title: 'Election Still Ongoing',
            message: 'The election has not yet ended. Results will be available once the election concludes.'
          });
        } else {
          setError({
            title: 'Unexpected Error',
            message: 'An unexpected error occurred. Please try again later.'
          });
        }
      }
    }
    fetchData();
  }, [provider]);

  if (error) {
    return (
      <div className="p-6">
        <h2 className="text-xl font-bold">Election Results Management</h2>
        <UserFriendlyError title={error.title} message={error.message} />
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold">Election Results Management</h2>
      {winner && (
        <div className="mt-4">
          <h3 className="font-semibold">
            Winner: {winner.name} ({winner.party}) - {winner.voteCount} votes
          </h3>
          <p>Voter Turnout: {turnout}%</p>
        </div>
      )}
      <div className="mt-6">
        {results.map(c => (
          <p key={c.candidateId}>{c.name}: {c.voteCount} votes</p>
        ))}
      </div>
    </div>
  );
}
