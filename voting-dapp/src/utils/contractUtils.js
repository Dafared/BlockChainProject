// contractUtils.js
import { ethers } from 'ethers';
import {
  voterContractAddress,
  votingContractAddress,
  candidateContractAddress,
  resultsContractAddress,
  verificationContractAddress,
} from '../config';
import { VoterABI, VotingABI, CandidateABI, ResultsABI, VerificationABI} from '../config';

// Voter Status: Checks if voter is registered and has voted
export async function getVoterStatus(provider, account) {
  if (!account) throw new Error('Account address is required');

  const voterContract = new ethers.Contract(voterContractAddress, VoterABI, provider);

  const isRegistered = await voterContract.isRegisteredVoter(account);
  const hasVoted = await voterContract.hasVoted(account);

  return { isRegistered, hasVoted };
}

// Register Voter: Admin-only voter registration
export async function registerVoter(signer, { voterAddress, nationalID, name }) {
  if (!signer) throw new Error('Signer is required');

  const voterContract = new ethers.Contract(voterContractAddress, VoterABI, signer);
  const tx = await voterContract.registerVoter(voterAddress, nationalID, name);

  return tx;
}

// Self-register as voter
export async function selfRegisterVoter(signer, { nationalID, name }) {
  if (!signer) throw new Error('Signer is required');

  const voterContract = new ethers.Contract(voterContractAddress, VoterABI, signer);
  const tx = await voterContract.selfRegister(nationalID, name);

  return tx;
}

// Register Candidate (by admin)
export async function registerCandidate(signer, { nationalID, name, party, manifesto }) {
  if (!signer) throw new Error('Signer is required');

  const candidateContract = new ethers.Contract(candidateContractAddress, CandidateABI, signer);
  const tx = await candidateContract.registerCandidate(nationalID, name, party, manifesto);

  return tx;
}

// Self-register as candidate
export async function selfRegisterCandidate(signer, { nationalID, name, party, manifesto }) {
  if (!signer) throw new Error('Signer is required');

  const candidateContract = new ethers.Contract(candidateContractAddress, CandidateABI, signer);
  const tx = await candidateContract.selfRegisterAsCandidate(nationalID, name, party, manifesto);

  return tx;
}

// Get all candidates
export async function getCandidates(provider) {
  const candidateContract = new ethers.Contract(candidateContractAddress, CandidateABI, provider);

  const candidateIDs = await candidateContract.getAllCandidateIDs();

  const candidates = await Promise.all(
    candidateIDs.map(async (id) => {
      const candidate = await candidateContract.getCandidate(id);
      return {
        id: candidate.candidateID.toNumber(),
        nationalID: candidate.nationalID,
        name: candidate.name,
        party: candidate.party,
        manifesto: candidate.manifesto,
        isRegistered: candidate.isRegistered,
      };
    })
  );

  return candidates;
}

// Cast Vote
export async function castVote(signer, candidateId) {
  if (!signer) throw new Error('Signer is required');

  const votingContract = new ethers.Contract(votingContractAddress, VotingABI, signer);
  const tx = await votingContract.castVote(candidateId);

  return tx;
}

// Election state transitions
export async function startRegistration(signer) {
  const votingContract = new ethers.Contract(votingContractAddress, VotingABI, signer);
  return await votingContract.startRegistration();
}

export async function startVoting(signer, durationInMinutes) {
  const votingContract = new ethers.Contract(votingContractAddress, VotingABI, signer);
  return await votingContract.startVoting(durationInMinutes);
}

export async function endElection(signer) {
  const votingContract = new ethers.Contract(votingContractAddress, VotingABI, signer);
  return await votingContract.endElection();
}

export async function finalizeResults(signer) {
  const resultsContract = new ethers.Contract(resultsContractAddress, ResultsABI, signer);
  return await resultsContract.finalizeResults();
}

// Get Election Results
export async function getResults(provider) {
  const resultsContract = new ethers.Contract(resultsContractAddress, ResultsABI, provider);
  const results = await resultsContract.getAllResults();

  return results.map((res) => ({
    candidateId: res.candidateID.toNumber(),
    nationalID: res.nationalID,
    name: res.candidateName,
    party: res.party,
    voteCount: res.voteCount.toNumber(),
  }));
}

// Get Winner Details
export async function getWinner(provider) {
  const resultsContract = new ethers.Contract(resultsContractAddress, ResultsABI, provider);
  const winner = await resultsContract.getWinner();

  return {
    candidateId: winner.candidateID.toNumber(),
    nationalID: winner.nationalID,
    name: winner.candidateName,
    party: winner.party,
    voteCount: winner.voteCount.toNumber(),
  };
}

// Get Voter Turnout
export async function getVoterTurnout(provider) {
  const resultsContract = new ethers.Contract(resultsContractAddress, ResultsABI, provider);
  const turnoutPercentage = await resultsContract.getVoterTurnout();

  return turnoutPercentage.toNumber();
}

// Get total counts
export async function getCandidateCount(provider) {
  const candidateContract = new ethers.Contract(candidateContractAddress, CandidateABI, provider);
  const count = await candidateContract.getTotalCandidates();
  return count.toNumber();
}

export async function getVoterCount(provider) {
  const voterContract = new ethers.Contract(voterContractAddress, VoterABI, provider);
  const count = await voterContract.getTotalVoters();
  return count.toNumber();
}

// Voting contract instance utility
export function getVotingContract(providerOrSigner) {
  return new ethers.Contract(votingContractAddress, VotingABI, providerOrSigner);
}

function getVerificationContract(providerOrSigner) {
  return new ethers.Contract(verificationContractAddress, VerificationABI, providerOrSigner);
}

export async function isApprovedAuditor(providerOrSigner, address) {
  const contract = getVerificationContract(providerOrSigner);
  const auditorData = await contract.auditors(address); 
  // auditorData.isApproved 
  return auditorData.isApproved;
}

export async function approveAuditor(signer, auditorAddress, organization) {
  const contract = getVerificationContract(signer);
  const tx = await contract.approveAuditor(auditorAddress, organization);
  return tx.wait();
}

export async function submitVerification(signer, comments, verificationPassed) {
  const contract = getVerificationContract(signer);
  const tx = await contract.submitVerification(comments, verificationPassed);
  return tx.wait();
}

export async function getAllVerificationRecords(provider) {
  const contract = getVerificationContract(provider);
  return await contract.getAllVerificationRecords();
}

export async function verifyVoteCounts(provider) {
  const contract = getVerificationContract(provider);
  return await contract.verifyVoteCounts();
}

export async function checkVoteByNationalID(signerOrProvider, nationalID) {
  const contract = getVerificationContract(signerOrProvider);
  return await contract.checkVoteByNationalID(nationalID);
}

export async function getAllAuditors(provider) {
  const contract = getVerificationContract(provider);

  // Filter for AuditorApproved(address auditor, string organization)
  const filter = contract.filters.AuditorApproved(null, null);

  // Query all matching events from block 0 to latest 
  // (in production you might start from the block the contract was deployed)
  const events = await contract.queryFilter(filter, 0, 'latest');

  // Parse results
  const auditors = events.map(evt => ({
    auditorAddress: evt.args.auditorAddress,
    organization: evt.args.organization
  }));

  const unique = auditors.reduce((acc, current) => {
    const found = acc.find(a => a.auditorAddress.toLowerCase() === current.auditorAddress.toLowerCase());
    if (!found) acc.push(current);
    return acc;
  }, []);

  return unique;
}