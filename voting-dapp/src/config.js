// src/config.js
import voterRegistrationAbi from "./abis/VoterRegistration.json";
import candidateRegistrationAbi from "./abis/CandidateRegistration.json";
import votingAbi from "./abis/Voting.json";
import electionResultsAbi from "./abis/ElectionResults.json";
import electionVerificationAbi from "./abis/ElectionVerification.json";

export const voterContractAddress = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";
export const candidateContractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
export const votingContractAddress = "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9";
export const resultsContractAddress = "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9";
export const verificationContractAddress = "0x5FC8d32690cc91D4c39d9d3abcBD16989F875707";

export const VoterABI = voterRegistrationAbi.abi;
export const CandidateABI = candidateRegistrationAbi.abi;
export const VotingABI = votingAbi.abi;
export const ResultsABI = electionResultsAbi.abi;
export const VerificationABI = electionVerificationAbi.abi;

export const ADMIN_ADDRESS = '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266';
