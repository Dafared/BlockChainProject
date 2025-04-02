// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./Voting.sol";
import "./CandidateRegistration.sol";
import "./VoterRegistration.sol";

/**
 * @title ElectionResults
 * @dev Contract for calculating and publishing election results
 */
contract ElectionResults {
    address public electionCommission;
    Voting public votingContract;
    CandidateRegistration public candidateContract;
    VoterRegistration public voterContract;
    
    // Results structure
    struct ElectionResult {
        uint256 candidateID;
        string nationalID;
        string candidateName;
        string party;
        uint256 voteCount;
    }
    
    // Election statistics
    uint256 public totalVotesCast;
    uint256 public winningCandidateID;
    bool public resultFinalized;
    
    // Events
    event ResultsFinalized(uint256 indexed winningCandidateID, uint256 totalVotes);
    
    // Modifiers
    modifier onlyElectionCommission() {
        require(msg.sender == electionCommission, "Only election commission can perform this action");
        _;
    }
    
    modifier electionEnded() {
        require(votingContract.state() == Voting.ElectionState.Ended, "Election must be ended before finalizing results");
        _;
    }
    
    /**
     * @dev Constructor sets the related contracts
     * @param _votingAddress Address of the Voting contract
     * @param _candidateAddress Address of the CandidateRegistration contract
     * @param _voterAddress Address of the VoterRegistration contract
     */
    constructor(
        address _votingAddress,
        address _candidateAddress,
        address _voterAddress
    ) {
        electionCommission = msg.sender;
        votingContract = Voting(_votingAddress);
        candidateContract = CandidateRegistration(_candidateAddress);
        voterContract = VoterRegistration(_voterAddress);
        resultFinalized = false;
    }
    
    /**
     * @dev Finalize and publish the election results
     */
    function finalizeResults() 
        public 
        onlyElectionCommission 
        electionEnded 
    {
        require(!resultFinalized, "Results already finalized");
        
        uint256 highestVotes = 0;
        uint256 winningID = 0;
        totalVotesCast = 0;
        
        // Get all candidate IDs
        uint256[] memory candidateIDs = candidateContract.getAllCandidateIDs();
        
        // Find the winner
        for (uint i = 0; i < candidateIDs.length; i++) {
            uint256 candidateID = candidateIDs[i];
            uint256 voteCount = votingContract.getVoteCount(candidateID);
            
            totalVotesCast += voteCount;
            
            if (voteCount > highestVotes) {
                highestVotes = voteCount;
                winningID = candidateID;
            }
        }
        
        winningCandidateID = winningID;
        resultFinalized = true;
        
        emit ResultsFinalized(winningCandidateID, totalVotesCast);
    }
    
    /**
     * @dev Get the results for all candidates
     * @return ElectionResult[] Array of results for all candidates
     */
    function getAllResults() public view returns (ElectionResult[] memory) {
        uint256[] memory candidateIDs = candidateContract.getAllCandidateIDs();
        ElectionResult[] memory results = new ElectionResult[](candidateIDs.length);
        
        for (uint i = 0; i < candidateIDs.length; i++) {
            uint256 candidateID = candidateIDs[i];
            CandidateRegistration.Candidate memory candidate = candidateContract.getCandidate(candidateID);
            uint256 voteCount = votingContract.getVoteCount(candidateID);
            
            results[i] = ElectionResult({
                candidateID: candidateID,
                nationalID: candidate.nationalID,
                candidateName: candidate.name,
                party: candidate.party,
                voteCount: voteCount
            });
        }
        
        return results;
    }
    
    /**
     * @dev Get the winning candidate's details
     * @return ElectionResult The winning candidate's result
     */
    function getWinner() public view returns (ElectionResult memory) {
        require(resultFinalized, "Results not finalized yet");
        
        CandidateRegistration.Candidate memory winner = candidateContract.getCandidate(winningCandidateID);
        uint256 voteCount = votingContract.getVoteCount(winningCandidateID);
        
        return ElectionResult({
            candidateID: winningCandidateID,
            nationalID: winner.nationalID,
            candidateName: winner.name,
            party: winner.party,
            voteCount: voteCount
        });
    }
    
    /**
     * @dev Get voter turnout statistics
     * @return uint256 Percentage of registered voters who voted
     */
    function getVoterTurnout() public view returns (uint256) {
        uint256 totalRegisteredVoters = voterContract.getTotalVoters();
        if (totalRegisteredVoters == 0) return 0;
        
        return (totalVotesCast * 100) / totalRegisteredVoters;
    }
}