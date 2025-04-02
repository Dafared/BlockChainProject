// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./Voting.sol";
import "./ElectionResults.sol";
import "./VoterRegistration.sol";
import "./CandidateRegistration.sol";

/**
 * @title ElectionVerification
 * @dev Contract for auditing and verifying election integrity
 */
contract ElectionVerification {
    address public electionCommission;
    Voting public votingContract;
    ElectionResults public resultsContract;
    VoterRegistration public voterContract;
    CandidateRegistration public candidateContract;
    
    // Auditor structure
    struct Auditor {
        address auditorAddress;
        string organization;
        bool isApproved;
    }
    
    // Mapping of approved auditors
    mapping(address => Auditor) public auditors;
    
    // Verification records
    struct VerificationRecord {
        address auditor;
        uint256 timestamp;
        string comments;
        bool verificationPassed;
    }
    
    // Array to store verification records
    VerificationRecord[] public verificationRecords;
    
    // Events
    event AuditorApproved(address indexed auditorAddress, string organization);
    event VerificationCompleted(address indexed auditor, bool passed);
    
    // Modifiers
    modifier onlyElectionCommission() {
        require(msg.sender == electionCommission, "Only election commission can perform this action");
        _;
    }
    
    modifier onlyApprovedAuditor() {
        require(auditors[msg.sender].isApproved, "Only approved auditors can perform this action");
        _;
    }
    
    /**
     * @dev Constructor sets the related contracts
     * @param _votingAddress Address of the Voting contract
     * @param _resultsAddress Address of the ElectionResults contract
     * @param _voterAddress Address of the VoterRegistration contract
     * @param _candidateAddress Address of the CandidateRegistration contract
     */
    constructor(
        address _votingAddress,
        address _resultsAddress,
        address _voterAddress,
        address _candidateAddress
    ) {
        electionCommission = msg.sender;
        votingContract = Voting(_votingAddress);
        resultsContract = ElectionResults(_resultsAddress);
        voterContract = VoterRegistration(_voterAddress);
        candidateContract = CandidateRegistration(_candidateAddress);
    }
    
    /**
     * @dev Approve an auditor
     * @param _auditorAddress Address of the auditor
     * @param _organization Name of the auditor's organization
     */
    function approveAuditor(address _auditorAddress, string memory _organization) 
        public 
        onlyElectionCommission 
    {
        auditors[_auditorAddress] = Auditor({
            auditorAddress: _auditorAddress,
            organization: _organization,
            isApproved: true
        });
        
        emit AuditorApproved(_auditorAddress, _organization);
    }
    
    /**
     * @dev Submit a verification record
     * @param _comments Comments about the verification
     * @param _verificationPassed Whether the verification passed
     */
    function submitVerification(string memory _comments, bool _verificationPassed) 
        public 
        onlyApprovedAuditor 
    {
        verificationRecords.push(VerificationRecord({
            auditor: msg.sender,
            timestamp: block.timestamp,
            comments: _comments,
            verificationPassed: _verificationPassed
        }));
        
        emit VerificationCompleted(msg.sender, _verificationPassed);
    }
    
    /**
     * @dev Verify that the number of votes matches the number of voters who voted
     * @return bool True if the verification passes
     */
    function verifyVoteCounts() public view returns (bool) {
        uint256 totalVotesCounted = resultsContract.totalVotesCast();
        
        uint256 votersWhoVoted = 0;
        uint256 totalVoters = voterContract.getTotalVoters();
        
        for (uint i = 0; i < totalVoters; i++) {
            address voterAddress = voterContract.registeredVoterAddresses(i);
            if (voterContract.hasVoted(voterAddress)) {
                votersWhoVoted++;
            }
        }
        
        return totalVotesCounted == votersWhoVoted;
    }
    
    /**
     * @dev Check a specific voter's vote by national ID (restricted to auditors)
     * @param _nationalID National ID of the voter
     * @return uint256 The candidate ID the voter voted for (0 if not voted)
     */
    function checkVoteByNationalID(string memory _nationalID) 
        public 
        view 
        onlyApprovedAuditor 
        returns (uint256) 
    {
        require(votingContract.state() == Voting.ElectionState.Ended, "Election must be ended for vote verification");
        return votingContract.getVoteByNationalID(_nationalID);
    }
    
    /**
     * @dev Get the number of verification records
     * @return uint256 Number of verification records
     */
    function getVerificationCount() public view returns (uint256) {
        return verificationRecords.length;
    }
    
    /**
     * @dev Get a verification record by index
     * @param _index Index of the verification record
     * @return VerificationRecord The verification record
     */
    function getVerificationRecord(uint256 _index) public view returns (VerificationRecord memory) {
        require(_index < verificationRecords.length, "Index out of bounds");
        return verificationRecords[_index];
    }
    
    /**
     * @dev Get all verification records
     * @return VerificationRecord[] Array of all verification records
     */
    function getAllVerificationRecords() public view returns (VerificationRecord[] memory) {
        return verificationRecords;
    }
}