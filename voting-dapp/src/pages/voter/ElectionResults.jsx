// ElectionResults.jsx
import React, { useEffect, useState, useContext } from 'react';
import { Web3Context } from '../../context/Web3Context';
import { getResults, getWinner, getVoterTurnout } from '../../utils/contractUtils';
import UserFriendlyError from '../../components/UserFriendlyError';

export default function ElectionResults() {
  const { provider } = useContext(Web3Context);
  const [results, setResults] = useState([]);
  const [winner, setWinner] = useState(null);
  const [turnout, setTurnout] = useState(null);
  const [isFinalized, setIsFinalized] = useState(true); // 假设已完成状态为true

  useEffect(() => {
    async function fetchData() {
      try {
        const winnerData = await getWinner(provider);
        const resultsData = await getResults(provider);
        const turnoutData = await getVoterTurnout(provider);
        
        setWinner(winnerData);
        setResults(resultsData);
        setTurnout(turnoutData);
        setIsFinalized(true);
      } catch (error) {
        if (error.reason === "Results not finalized yet") {
          setIsFinalized(false);
        } else {
          console.error(error);
        }
      }
    }
    fetchData();
  }, [provider]);

  if (!isFinalized) {
    return (
      <div className="p-6">
        <h2 className="text-xl font-bold">Election Results</h2>
        <UserFriendlyError title={"Results not finalized yet"} message={"The election results have not yet been finalized by the administrator. Please check back later."} />
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold">Election Results</h2>
      {winner && (
        <div className="mt-4">
          <h3 className="font-semibold">Winner: {winner.name} ({winner.party}) - {winner.voteCount} votes</h3>
          <p>Voter Turnout: {turnout}%</p>
        </div>
      )}
      <div className="mt-6">
        {results.map(candidate => (
          <p key={candidate.candidateId}>
            {candidate.name} ({candidate.party}): {candidate.voteCount} votes
          </p>
        ))}
      </div>
    </div>
  );
}
