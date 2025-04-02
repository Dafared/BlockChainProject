// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title VoterRegistration
 * @dev Contract for registering eligible voters in an election using national IDs
 */
contract VoterRegistration {
    address public electionCommission;
    
    // Voter structure
    struct Voter {
        bool isRegistered;
        bool hasVoted;
        string nationalID;  // National ID string
        string name;
    }
    
    // Mapping from voter address to voter details
    mapping(address => Voter) public voters;
    // Mapping from national ID to address to prevent duplicate registrations
    mapping(string => address) public nationalIDToAddress;
    // Array to keep track of registered voter addresses
    address[] public registeredVoterAddresses;
    // Total number of registered voters
    uint256 public voterCount;
    
    // Events
    event VoterRegistered(address indexed voterAddress, string nationalID);
    event VoterStatusUpdated(address indexed voterAddress, bool hasVoted);
    
    // Modifiers
    modifier onlyElectionCommission() {
        require(msg.sender == electionCommission, "Only election commission can perform this action");
        _;
    }
    
    modifier notRegistered() {
        require(!voters[msg.sender].isRegistered, "Voter already registered");
        _;
    }
    
    /**
     * @dev Constructor sets the election commission address
     */
    constructor() {
        electionCommission = msg.sender;
        voterCount = 0;
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
     * @dev Register a new voter
     * @param _voterAddress Address of the voter
     * @param _nationalID National ID of the voter
     * @param _name Name of the voter
     */
    function registerVoter(address _voterAddress, string memory _nationalID, string memory _name) 
        public 
        onlyElectionCommission
    {
        require(!voters[_voterAddress].isRegistered, "Voter already registered");
        require(isValidNationalID(_nationalID), "Invalid national ID format");
        require(nationalIDToAddress[_nationalID] == address(0), "National ID already registered");
        
        voterCount++;
        voters[_voterAddress] = Voter({
            isRegistered: true,
            hasVoted: false,
            nationalID: _nationalID,
            name: _name
        });
        
        nationalIDToAddress[_nationalID] = _voterAddress;
        registeredVoterAddresses.push(_voterAddress);
        
        emit VoterRegistered(_voterAddress, _nationalID);
    }
    
    /**
     * @dev Self-registration for voters (simplified for testing)
     * @param _nationalID National ID of the voter
     * @param _name Name of the voter
     */
    function selfRegister(string memory _nationalID, string memory _name) 
        public 
        notRegistered 
    {
        require(isValidNationalID(_nationalID), "Invalid national ID format");
        require(nationalIDToAddress[_nationalID] == address(0), "National ID already registered");
        
        voterCount++;
        voters[msg.sender] = Voter({
            isRegistered: true,
            hasVoted: false,
            nationalID: _nationalID,
            name: _name
        });
        
        nationalIDToAddress[_nationalID] = msg.sender;
        registeredVoterAddresses.push(msg.sender);
        
        emit VoterRegistered(msg.sender, _nationalID);
    }
    
    /**
     * @dev Mark voter as having voted (only called by Voting contract)
     * @param _voterAddress Address of the voter
     */
    function markVoted(address _voterAddress) external {
        require(voters[_voterAddress].isRegistered, "Voter not registered");
        require(!voters[_voterAddress].hasVoted, "Voter already voted");
        
        voters[_voterAddress].hasVoted = true;
        
        emit VoterStatusUpdated(_voterAddress, true);
    }
    
    /**
     * @dev Check if a voter is registered
     * @param _voterAddress Address of the voter
     * @return bool True if voter is registered
     */
    function isRegisteredVoter(address _voterAddress) public view returns (bool) {
        return voters[_voterAddress].isRegistered;
    }
    
    /**
     * @dev Check if a national ID is already registered
     * @param _nationalID National ID to check
     * @return bool True if national ID is already registered
     */
    function isRegisteredNationalID(string memory _nationalID) public view returns (bool) {
        return nationalIDToAddress[_nationalID] != address(0);
    }
    
    /**
     * @dev Check if a voter has already voted
     * @param _voterAddress Address of the voter
     * @return bool True if voter has voted
     */
    function hasVoted(address _voterAddress) public view returns (bool) {
        return voters[_voterAddress].hasVoted;
    }
    
    /**
     * @dev Get total number of registered voters
     * @return uint256 The total number of registered voters
     */
    function getTotalVoters() public view returns (uint256) {
        return voterCount;
    }
    
    /**
     * @dev Get voter's national ID
     * @param _voterAddress Address of the voter
     * @return string The voter's national ID
     */
    function getVoterNationalID(address _voterAddress) public view returns (string memory) {
        require(voters[_voterAddress].isRegistered, "Voter not registered");
        return voters[_voterAddress].nationalID;
    }
}