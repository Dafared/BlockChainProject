// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title CandidateRegistration
 * @dev Contract for registering candidates in an election
 */
contract CandidateRegistration {
    address public electionCommission;
    
    // Candidate structure
    struct Candidate {
        uint256 candidateID;
        string nationalID;  // National ID for the candidate
        string name;
        string party;
        string manifesto;
        bool isRegistered;
    }
    
    // Mapping from candidate ID to candidate details
    mapping(uint256 => Candidate) public candidates;
    // Mapping from national ID to candidate ID
    mapping(string => uint256) public nationalIDToCandidateID;
    // Array to keep track of registered candidate IDs
    uint256[] public candidateIDs;
    // Total number of registered candidates
    uint256 public candidateCount;
    
    // Events
    event CandidateRegistered(uint256 indexed candidateID, string name, string party);
    
    // Modifiers
    modifier onlyElectionCommission() {
        require(msg.sender == electionCommission, "Only election commission can perform this action");
        _;
    }
    
    /**
     * @dev Constructor sets the election commission address
     */
    constructor() {
        electionCommission = msg.sender;
        candidateCount = 0;
    }
    
    /**
     * @dev Check if a national ID is valid (basic validation)
     * @param _nationalID National ID to validate
     * @return bool Whether the ID is valid
     */
    function isValidNationalID(string memory _nationalID) internal pure returns (bool) {
        bytes memory idBytes = bytes(_nationalID);
        // Basic validation: Check that ID is not empty and has reasonable length
        return idBytes.length > 0 && idBytes.length <= 20;
    }
    
    /**
     * @dev Register a new candidate
     * @param _nationalID National ID of the candidate
     * @param _name Name of the candidate
     * @param _party Political party of the candidate
     * @param _manifesto Candidate's electoral manifesto
     */
    function registerCandidate(string memory _nationalID, string memory _name, string memory _party, string memory _manifesto) 
        public 
        onlyElectionCommission 
    {
        require(isValidNationalID(_nationalID), "Invalid national ID format");
        require(nationalIDToCandidateID[_nationalID] == 0, "Candidate with this national ID already registered");
        
        candidateCount++;
        
        candidates[candidateCount] = Candidate({
            candidateID: candidateCount,
            nationalID: _nationalID,
            name: _name,
            party: _party,
            manifesto: _manifesto,
            isRegistered: true
        });
        
        nationalIDToCandidateID[_nationalID] = candidateCount;
        candidateIDs.push(candidateCount);
        
        emit CandidateRegistered(candidateCount, _name, _party);
    }
    
    /**
     * @dev Self-registration for candidates (for testing purposes)
     * @param _nationalID National ID of the candidate
     * @param _name Name of the candidate
     * @param _party Political party of the candidate
     * @param _manifesto Candidate's electoral manifesto
     */
    function selfRegisterAsCandidate(string memory _nationalID, string memory _name, string memory _party, string memory _manifesto) 
        public 
    {
        require(isValidNationalID(_nationalID), "Invalid national ID format");
        require(nationalIDToCandidateID[_nationalID] == 0, "Candidate with this national ID already registered");
        
        candidateCount++;
        
        candidates[candidateCount] = Candidate({
            candidateID: candidateCount,
            nationalID: _nationalID,
            name: _name,
            party: _party,
            manifesto: _manifesto,
            isRegistered: true
        });
        
        nationalIDToCandidateID[_nationalID] = candidateCount;
        candidateIDs.push(candidateCount);
        
        emit CandidateRegistered(candidateCount, _name, _party);
    }
    
    /**
     * @dev Check if a candidate ID is valid
     * @param _candidateID ID of the candidate
     * @return bool True if the candidate is registered
     */
    function isValidCandidate(uint256 _candidateID) public view returns (bool) {
        return candidates[_candidateID].isRegistered;
    }
    
    /**
     * @dev Check if a national ID is already registered as a candidate
     * @param _nationalID National ID to check
     * @return bool True if national ID is already registered
     */
    function isRegisteredCandidateNationalID(string memory _nationalID) public view returns (bool) {
        return nationalIDToCandidateID[_nationalID] != 0;
    }
    
    /**
     * @dev Get candidate details
     * @param _candidateID ID of the candidate
     * @return Candidate memory The candidate details
     */
    function getCandidate(uint256 _candidateID) public view returns (Candidate memory) {
        require(candidates[_candidateID].isRegistered, "Candidate not registered");
        return candidates[_candidateID];
    }
    
    /**
     * @dev Get candidate ID by national ID
     * @param _nationalID National ID of the candidate
     * @return uint256 The candidate ID
     */
    function getCandidateIDByNationalID(string memory _nationalID) public view returns (uint256) {
        uint256 candidateID = nationalIDToCandidateID[_nationalID];
        require(candidateID != 0, "No candidate found with this national ID");
        return candidateID;
    }
    
    /**
     * @dev Get total number of registered candidates
     * @return uint256 The total number of registered candidates
     */
    function getTotalCandidates() public view returns (uint256) {
        return candidateCount;
    }
    
    /**
     * @dev Get all candidate IDs
     * @return uint256[] Array of all candidate IDs
     */
    function getAllCandidateIDs() public view returns (uint256[] memory) {
        return candidateIDs;
    }
}