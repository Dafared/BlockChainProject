// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./VoterRegistration.sol";
import "./CandidateRegistration.sol";

/**
 * @title Voting
 * @dev Contract for managing the voting process
 */
contract Voting {
    address public electionCommission;
    VoterRegistration public voterContract;
    CandidateRegistration public candidateContract;
    address public verificationContract; 
    
    // Election status
    enum ElectionState { Created, Registration, Voting, Ended }
    ElectionState public state;
    
    // Election details
    string public electionName;
    uint256 public startTime;
    uint256 public endTime;
    
    // Vote counting
    mapping(uint256 => uint256) public votesReceived; // candidateID => votes
    
    // National ID to vote mapping for audit purposes (if needed)
    mapping(string => uint256) private nationalIDToCandidateVote;
    
    // Events
    event VoteCast(address indexed voter, uint256 indexed candidateID, string voterNationalID);
    event ElectionStateChanged(ElectionState newState);
    event VerificationContractSet(address verificationContract);
    
    // Modifiers
    modifier onlyElectionCommission() {
        require(msg.sender == electionCommission, "Only election commission can perform this action");
        _;
    }
    
    modifier onlyElectionCommissionOrVerifier() {
        require(
            msg.sender == electionCommission || msg.sender == verificationContract, 
            "Only election commission or verification contract can perform this action"
        );
        _;
    }
    
    modifier inState(ElectionState _state) {
        require(state == _state, "Invalid election state for this action");
        _;
    }
    
     /**
     * @dev Constructor sets the election commission address and contracts
     * @param _voterContractAddress Address of the VoterRegistration contract
     * @param _candidateContractAddress Address of the CandidateRegistration contract
     * @param _electionName Name of the election
     */
    constructor(
        address _voterContractAddress, 
        address _candidateContractAddress,
        string memory _electionName
    ) {
        electionCommission = msg.sender;
        voterContract = VoterRegistration(_voterContractAddress);
        candidateContract = CandidateRegistration(_candidateContractAddress);
        electionName = _electionName;
        state = ElectionState.Created;
    }

    /**
     * @dev Set the verification contract address
     * @param _verificationContract Address of the ElectionVerification contract
     */
    function setVerificationContract(address _verificationContract) 
        public 
        onlyElectionCommission 
    {
        verificationContract = _verificationContract;
        emit VerificationContractSet(_verificationContract);
    }
    
    /**
     * @dev Start the registration phase
     */
    function startRegistration() 
        public 
        onlyElectionCommission 
        inState(ElectionState.Created) 
    {
        state = ElectionState.Registration;
        emit ElectionStateChanged(ElectionState.Registration);
    }
    
    /**
     * @dev Start the voting phase
     * @param _durationInMinutes Duration of the voting period in minutes
     */
    function startVoting(uint256 _durationInMinutes) 
        public 
        onlyElectionCommission 
        inState(ElectionState.Registration) 
    {
        state = ElectionState.Voting;
        startTime = block.timestamp;
        endTime = startTime + (_durationInMinutes * 1 minutes);
        emit ElectionStateChanged(ElectionState.Voting);
    }
    
    /**
     * @dev End the election
     */
    function endElection() 
        public 
        onlyElectionCommission 
        inState(ElectionState.Voting) 
    {
        require(block.timestamp >= endTime, "Voting period not ended yet");
        state = ElectionState.Ended;
        emit ElectionStateChanged(ElectionState.Ended);
    }
    
    /**
     * @dev Cast a vote for a candidate
     * @param _candidateID ID of the candidate to vote for
     */
    function castVote(uint256 _candidateID) 
        public 
        inState(ElectionState.Voting) 
    {
        // Check if election is ongoing
        require(block.timestamp <= endTime, "Voting period has ended");
        
        // Check if voter is registered
        require(voterContract.isRegisteredVoter(msg.sender), "Voter not registered");
        
        // Check if voter has not voted yet
        require(!voterContract.hasVoted(msg.sender), "Voter has already voted");
        
        // Check if candidate is valid
        require(candidateContract.isValidCandidate(_candidateID), "Invalid candidate");
        
        // Get voter's national ID for record-keeping
        string memory voterNationalID = voterContract.getVoterNationalID(msg.sender);
        
        // Record the vote
        votesReceived[_candidateID]++;
        
        // Store the vote for audit purposes (optional, can be removed for more privacy)
        nationalIDToCandidateVote[voterNationalID] = _candidateID;
        
        // Mark voter as having voted
        voterContract.markVoted(msg.sender);
        
        emit VoteCast(msg.sender, _candidateID, voterNationalID);
    }
    
    /**
     * @dev Cast a vote using national ID (for systems that verify identity separately)
     * @param _nationalID National ID of the voter
     * @param _candidateID ID of the candidate to vote for
     * @notice This function is provided for testing and would require additional security in production
     */
    function castVoteByNationalID(string memory _nationalID, uint256 _candidateID) 
        public 
        onlyElectionCommission // Restricted to election commission for security
        inState(ElectionState.Voting) 
    {
        // Check if election is ongoing
        require(block.timestamp <= endTime, "Voting period has ended");
        
        // Get voter address from national ID
        address voterAddress = voterContract.nationalIDToAddress(_nationalID);
        require(voterAddress != address(0), "Voter with this national ID not registered");
        
        // Check if voter has not voted yet
        require(!voterContract.hasVoted(voterAddress), "Voter has already voted");
        
        // Check if candidate is valid
        require(candidateContract.isValidCandidate(_candidateID), "Invalid candidate");
        
        // Record the vote
        votesReceived[_candidateID]++;
        
        // Store the vote for audit purposes
        nationalIDToCandidateVote[_nationalID] = _candidateID;
        
        // Mark voter as having voted
        voterContract.markVoted(voterAddress);
        
        emit VoteCast(voterAddress, _candidateID, _nationalID);
    }
    
    /**
     * @dev Check what candidate a particular national ID voted for (for auditing)
     * @param _nationalID National ID of the voter
     * @return uint256 Candidate ID that the voter voted for (0 if not voted)
     */
    function getVoteByNationalID(string memory _nationalID) 
        public 
        view 
        onlyElectionCommissionOrVerifier 
        returns (uint256) 
    {
        return nationalIDToCandidateVote[_nationalID];
    }
    
    /**
     * @dev Get the number of votes received by a candidate
     * @param _candidateID ID of the candidate
     * @return uint256 Number of votes received
     */
    function getVoteCount(uint256 _candidateID) public view returns (uint256) {
        require(candidateContract.isValidCandidate(_candidateID), "Invalid candidate");
        return votesReceived[_candidateID];
    }
    
    /**
     * @dev Get remaining time for voting in seconds
     * @return uint256 Remaining time in seconds
     */
    function getRemainingTime() public view inState(ElectionState.Voting) returns (uint256) {
        if (block.timestamp >= endTime) {
            return 0;
        }
        return endTime - block.timestamp;
    }
}