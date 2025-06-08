// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract KYCContract {
    // ========== STATE VARIABLES ==========
    
    // Admin related state
    address public admin;
    mapping(address => bool) public isAdmin;
    mapping(address => string) public adminUsernames;
    mapping(address => string) public adminPasswordHashes;

    // Bank related state
    uint public bankCount = 0;
    uint public pendingBankCount = 0;
    uint public approvedBankCount = 0;
    
    struct Bank {
        uint id;
        string bankNumber;
        string name;
        string country;
        string state;
        string pincode;
        string adminName;
        address walletAddress;
        bool isApproved;
        string passwordHash;
    }

    // Customer related state
    uint public customerCount = 0;
    
    enum CustomerStatus { 
        Pending,
        Approved,
        Rejected,
        Verified
    }
    
    struct Customer {
        uint id;
        string documentName;
        string username;
        string passwordHash;
        address walletAddress;
        CustomerStatus status;
        uint bankId;
        uint approvalDate;
        string remarks;
        string verificationHash;
    }

    struct Document {
        string docType;
        string docHash;
    }

    struct BankRequest {
        uint bankId;
        uint requestDate;
        bool responded;
        bool accessGranted;
        string bankName;
    }

    // ========== MAPPINGS ==========
    
    mapping(uint => Bank) public banks;
    mapping(address => uint) public bankIds;
    mapping(uint => Customer) public customers;
    mapping(uint => Document[]) public customerDocuments;
    mapping(uint => uint[]) public bankCustomers;
    mapping(uint => BankRequest[]) public customerBankRequests;
    mapping(uint => mapping(uint => bool)) public bankCustomerAccess;
    mapping(address => uint[]) public customerWalletMapping;
    mapping(uint => uint[]) public bankPendingRequests; 
    mapping(uint => uint[]) public bankApprovedCustomers; 

    // ========== EVENTS ==========
    
    event AdminAdded(address indexed adminAddress);
    event BankRegistered(uint indexed bankId, address indexed bankAddress);
    event BankApproved(uint indexed bankId, address indexed adminAddress);
    event CustomerRegistered(uint indexed customerId, address indexed customerWallet);
    event CustomerApproved(uint indexed customerId, uint indexed bankId);
    event CustomerRejected(uint indexed customerId, uint indexed bankId);
    event CustomerVerified(uint indexed customerId, string verificationHash);
    event BankRequestedAccess(uint indexed customerId, uint indexed bankId, string bankName);
    event AccessGranted(uint indexed customerId, uint indexed bankId);
    event AccessDenied(uint indexed customerId, uint indexed bankId);
    event DocumentsAdded(uint indexed customerId, uint documentCount);
    event StatusChanged(uint indexed customerId, CustomerStatus newStatus);

    // ========== MODIFIERS ==========
    
    modifier onlyAdmin() {
        require(isAdmin[msg.sender], "Only admin can call this");
        _;
    }

    modifier onlyApprovedBank() {
        uint bankId = bankIds[msg.sender];
        require(bankId != 0 && banks[bankId].isApproved, "Only approved banks");
        _;
    }

    modifier validCustomer(uint customerId) {
        require(customerId > 0 && customerId <= customerCount, "Invalid customer ID");
        _;
    }

    // ========== CONSTRUCTOR ==========
    
    constructor() {
        admin = msg.sender;
        isAdmin[admin] = true;
    }

    // ========== ADMIN FUNCTIONS ==========
    
    function adminLogin(string memory username, string memory passwordHash) external view returns (bool) {
        require(isAdmin[msg.sender], "Not an admin");
        require(keccak256(bytes(adminUsernames[msg.sender])) == keccak256(bytes(username)), "Invalid username");
        require(keccak256(bytes(adminPasswordHashes[msg.sender])) == keccak256(bytes(passwordHash)), "Invalid password");
        return true;
    }

    function addAdmin(address _admin, string memory username, string memory passwordHash) external onlyAdmin {
        isAdmin[_admin] = true;
        adminUsernames[_admin] = username;
        adminPasswordHashes[_admin] = passwordHash;
        emit AdminAdded(_admin);
    }

    function approveBank(uint _bankId) external onlyAdmin {
        require(_bankId > 0 && _bankId <= bankCount, "Invalid bank ID");
        require(!banks[_bankId].isApproved, "Bank already approved");

        banks[_bankId].isApproved = true;
        approvedBankCount++;
        pendingBankCount--;
        emit BankApproved(_bankId, msg.sender);
    }

    // ========== BANK FUNCTIONS ==========
    
    function registerBank(
        string memory _bankNumber,
        string memory _name,
        string memory _country,
        string memory _state,
        string memory _pincode,
        string memory _adminName,
        string memory _passwordHash
    ) external {
        require(bankIds[msg.sender] == 0, "Bank already registered");
        require(bytes(_bankNumber).length > 0, "Bank number required");
        require(bytes(_name).length > 0, "Bank name required");

        bankCount++;
        pendingBankCount++;
        uint newBankId = bankCount;

        banks[newBankId] = Bank({
            id: newBankId,
            bankNumber: _bankNumber,
            name: _name,
            country: _country,
            state: _state,
            pincode: _pincode,
            adminName: _adminName,
            walletAddress: msg.sender,
            isApproved: false,
            passwordHash: _passwordHash
        });

        bankIds[msg.sender] = newBankId;
        emit BankRegistered(newBankId, msg.sender);
    }

    function bankLogin(string memory _name, string memory _passwordHash) external view returns (bool) {
        uint bankId = bankIds[msg.sender];
        require(bankId != 0, "Bank not registered");
        require(keccak256(bytes(banks[bankId].name)) == keccak256(bytes(_name)), "Invalid bank name");
        require(keccak256(bytes(banks[bankId].passwordHash)) == keccak256(bytes(_passwordHash)), "Invalid password");
        require(banks[bankId].isApproved, "Bank not approved by admin");
        return true;
    }

    function approveCustomer(uint customerId, string memory remarks) external onlyApprovedBank validCustomer(customerId) {
        Customer storage customer = customers[customerId];
        uint bankId = bankIds[msg.sender];
        
        require(customer.bankId == bankId, "Customer not assigned to your bank");
        require(customer.status == CustomerStatus.Pending, "Customer not pending");

        customer.status = CustomerStatus.Approved;
        customer.approvalDate = block.timestamp;
        customer.remarks = remarks;
        
        
        removePendingRequest(bankId, customerId);
        bankApprovedCustomers[bankId].push(customerId);
        
        emit CustomerApproved(customerId, bankId);
        emit StatusChanged(customerId, CustomerStatus.Approved);
    }

    function rejectCustomer(uint customerId, string memory remarks) external onlyApprovedBank validCustomer(customerId) {
        Customer storage customer = customers[customerId];
        uint bankId = bankIds[msg.sender];
        
        require(customer.bankId == bankId, "Customer not assigned to your bank");
        require(customer.status == CustomerStatus.Pending, "Customer not pending");

        customer.status = CustomerStatus.Rejected;
        customer.remarks = remarks;
        
        
        removePendingRequest(bankId, customerId);
        
        emit CustomerRejected(customerId, bankId);
        emit StatusChanged(customerId, CustomerStatus.Rejected);
    }

    // Bank requests access to customer documents
    function requestCustomerAccess(uint customerId) external onlyApprovedBank validCustomer(customerId) {
        uint bankId = bankIds[msg.sender];
        require(!hasPendingRequest(customerId, bankId), "Request already pending");
        
        customerBankRequests[customerId].push(BankRequest({
            bankId: bankId,
            requestDate: block.timestamp,
            responded: false,
            accessGranted: false,
            bankName: banks[bankId].name
        }));
        
        emit BankRequestedAccess(customerId, bankId, banks[bankId].name);
    }

    // Bank views customer documents (only if approved)
    function getCustomerDocumentsForBank(uint customerId) external view onlyApprovedBank validCustomer(customerId) returns (Document[] memory) {
        uint bankId = bankIds[msg.sender];
        require(bankCustomerAccess[bankId][customerId], "Access not granted");
        return customerDocuments[customerId];
    }

    // ========== CUSTOMER FUNCTIONS ==========
    
    function registerCustomer(
        string memory _username,
        string memory _documentName,
        string memory _passwordHash
    ) external {
        require(bytes(_username).length > 0, "Username required");
        require(bytes(_documentName).length > 0, "Document name required");

        customerCount++;
        uint newCustomerId = customerCount;

        customers[newCustomerId] = Customer({
            id: newCustomerId,
            documentName: _documentName,
            username: _username,
            passwordHash: _passwordHash,
            walletAddress: msg.sender,
            status: CustomerStatus.Pending,
            bankId: 0,
            approvalDate: 0,
            remarks: "",
            verificationHash: ""
        });

        customerWalletMapping[msg.sender].push(newCustomerId);
        emit CustomerRegistered(newCustomerId, msg.sender);
    }

    function customerLogin(string memory _username, string memory _passwordHash) external view returns (bool) {
        uint[] memory customerIds = customerWalletMapping[msg.sender];
        require(customerIds.length > 0, "No customers for this wallet");
        
        for (uint i = 0; i < customerIds.length; i++) {
            Customer memory customer = customers[customerIds[i]];
            if (keccak256(bytes(customer.username)) == keccak256(bytes(_username)) && 
                keccak256(bytes(customer.passwordHash)) == keccak256(bytes(_passwordHash))) {
                return true;
            }
        }
        return false;
    }

    function submitKYCRequest(
        uint _bankId,
        Document[] memory _documents
    ) external {
        require(_bankId > 0 && _bankId <= bankCount, "Invalid bank ID");
        require(banks[_bankId].isApproved, "Bank not approved");
        
        uint[] memory customerIds = customerWalletMapping[msg.sender];
        require(customerIds.length > 0, "No customer profile");
        
        uint customerId = customerIds[0];
        Customer storage customer = customers[customerId];
        
        // Store documents
        for (uint i = 0; i < _documents.length; i++) {
            customerDocuments[customerId].push(_documents[i]);
        }
        
        // Update customer status and bank assignment
        customer.bankId = _bankId;
        customer.status = CustomerStatus.Pending;
        
        //  optimized mappings
        bankPendingRequests[_bankId].push(customerId);
        
        emit BankRequestedAccess(customerId, _bankId, banks[_bankId].name);
        emit DocumentsAdded(customerId, _documents.length);
        emit StatusChanged(customerId, CustomerStatus.Pending);
    }

    // Customer responds to bank request
   function respondToBankRequest(uint customerId, uint bankId, bool grantAccess) external {
    // Check if the customerId belongs to the msg.sender
    bool isCustomer = false;
    uint[] storage customerIds = customerWalletMapping[msg.sender];
    for (uint i = 0; i < customerIds.length; i++) {
        if (customerIds[i] == customerId) {
            isCustomer = true;
            break;
        }
    }
    require(isCustomer, "Not your customer profile");
    
    BankRequest[] storage requests = customerBankRequests[customerId];
    for (uint i = 0; i < requests.length; i++) {
        if (requests[i].bankId == bankId && !requests[i].responded) {
            requests[i].responded = true;
            requests[i].accessGranted = grantAccess;
            
            if (grantAccess) {
                bankCustomerAccess[bankId][customerId] = true;
                emit AccessGranted(customerId, bankId);
            } else {
                emit AccessDenied(customerId, bankId);
            }
            return;
        }
    }
    revert("No pending request found");
}

    // ========== VIEW FUNCTIONS ==========
    
    function getPendingBanks() public view onlyAdmin returns (Bank[] memory) {
        Bank[] memory pending = new Bank[](pendingBankCount);
        uint counter = 0;
        for (uint i = 1; i <= bankCount; i++) {
            if (!banks[i].isApproved) {
                pending[counter] = banks[i];
                counter++;
            }
        }
        return pending;
    }

    function getApprovedBanks() public view returns (Bank[] memory) {
        Bank[] memory approved = new Bank[](approvedBankCount);
        uint counter = 0;
        for (uint i = 1; i <= bankCount; i++) {
            if (banks[i].isApproved) {
                approved[counter] = banks[i];
                counter++;
            }
        }
        return approved;
    }

    function getBankStatus(address _bankAddress) public view returns (
        bool isRegistered,
        bool isApproved,
        string memory name,
        string memory email
    ) {
        uint bankId = bankIds[_bankAddress];
        if (bankId == 0) return (false, false, "", "");
        Bank memory bank = banks[bankId];
        return (true, bank.isApproved, bank.name, bank.adminName);
    }

    function isBankApproved(address _bankAddress) public view returns (bool) {
        uint bankId = bankIds[_bankAddress];
        return bankId != 0 && banks[bankId].isApproved;
    }

    function checkBankRegistration(address _bankAddress) public view returns (bool) {
        return bankIds[_bankAddress] != 0;
    }

    function getCustomerStatus(address _customerAddress) external view returns (CustomerStatus) {
        uint[] memory customerIds = customerWalletMapping[_customerAddress];
        require(customerIds.length > 0, "No customer linked to this wallet");
        return customers[customerIds[0]].status;
    }

    function getCustomerDocuments(uint customerId) public view validCustomer(customerId) returns (Document[] memory) {
        return customerDocuments[customerId];
    }

    function getCustomerBankRequests(uint customerId) public view validCustomer(customerId) returns (BankRequest[] memory) {
        return customerBankRequests[customerId];
    }

    function getBankPendingRequests(uint bankId) external view returns (uint[] memory) {
        require(bankId > 0 && bankId <= bankCount, "Invalid bank ID");
        return bankPendingRequests[bankId];
    }

    function getBankApprovedCustomers(uint bankId) external view returns (uint[] memory) {
        require(bankId > 0 && bankId <= bankCount, "Invalid bank ID");
        return bankApprovedCustomers[bankId];
    }

    function hasPendingRequest(uint customerId, uint bankId) public view returns (bool) {
        BankRequest[] storage requests = customerBankRequests[customerId];
        for (uint i = 0; i < requests.length; i++) {
            if (requests[i].bankId == bankId && !requests[i].responded) {
                return true;
            }
        }
        return false;
    }

    function getCustomerId(address wallet) external view returns (uint) {
        uint[] memory ids = customerWalletMapping[wallet];
        return ids.length > 0 ? ids[0] : 0;
    }

    function getCustomerDetails(uint customerId) external view returns (
        string memory username,
        string memory documentName,
        address walletAddress,
        CustomerStatus status,
        uint bankId,
        uint approvalDate,
        string memory remarks,
        string memory verificationHash
    ) {
        Customer memory customer = customers[customerId];
        return (
            customer.username,
            customer.documentName,
            customer.walletAddress,
            customer.status,
            customer.bankId,
            customer.approvalDate,
            customer.remarks,
            customer.verificationHash
        );
    }

    function getCustomerIdByAddress(address wallet) external view returns (uint) {
        uint[] memory ids = customerWalletMapping[wallet];
        return ids.length > 0 ? ids[0] : 0;
    }

    function getCustomerStatusById(uint customerId) external view returns (uint) {
        return uint(customers[customerId].status);
    }

    // ========== PRIVATE FUNCTIONS ==========
    
    function removePendingRequest(uint bankId, uint customerId) private {
        uint[] storage pending = bankPendingRequests[bankId];
        for (uint i = 0; i < pending.length; i++) {
            if (pending[i] == customerId) {
                pending[i] = pending[pending.length - 1];
                pending.pop();
                break;
            }
        }
    }
}