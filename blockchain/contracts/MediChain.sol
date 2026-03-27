// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract MediChain {

    address public admin;

    constructor() {
        admin = msg.sender;
    }

    /* -----------------------------------------
        ROLES & APPROVAL
    ------------------------------------------*/

    enum Role {
        None,
        Manufacturer,
        Distributor,
        Pharmacy
    }

    mapping(address => Role) public roles;
    mapping(address => bool) public approved;

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin");
        _;
    }

    modifier onlyApproved(Role _role) {
        require(roles[msg.sender] == _role, "Invalid role");
        require(approved[msg.sender], "Not approved");
        _;
    }

    function approveManufacturer(address _user) external onlyAdmin {
        roles[_user] = Role.Manufacturer;
        approved[_user] = true;
    }

    function approveDistributor(address _user) external {
        require(roles[msg.sender] == Role.Manufacturer || msg.sender == admin, "Not authorized");
        require(approved[msg.sender] || msg.sender == admin, "Not approved");
        roles[_user] = Role.Distributor;
        approved[_user] = true;
    }
    
    function approvePharmacy(address _user) external {
        require(roles[msg.sender] == Role.Distributor || msg.sender == admin, "Not authorized");
        require(approved[msg.sender] || msg.sender == admin, "Not approved");
        roles[_user] = Role.Pharmacy;
        approved[_user] = true;
    }

    /* -----------------------------------------
        MEDICINE STRUCT
    ------------------------------------------*/

    struct Medicine {
        string name;
        string batchId;
        string manufacturerName;
        string licenseNo;
        uint256 quantity;
        uint256 manufactureDate;
        uint256 expiryDate;
        string description;

        address manufacturer;

        // QR + verification
        string qrHash;     
        string imageUrl;   

        bool exists;
    }

    mapping(string => Medicine) public medicines;

    /* -----------------------------------------
        SUPPLY CHAIN TRACKING
    ------------------------------------------*/

    struct Transaction {
        address from;
        address to;
        string location;
        uint256 timestamp;
        string status; // InTransit, Delivered, Delayed
    }

    mapping(string => Transaction[]) public history;

    /* -----------------------------------------
        EVENTS
    ------------------------------------------*/

    event MedicineRegistered(string batchId, address manufacturer);
    event ShipmentUpdated(string batchId, address from, address to, string status);
    event ReceiptConfirmed(string batchId, address pharmacy);

    /* -----------------------------------------
        REGISTER MEDICINE (WITH QR)
    ------------------------------------------*/

    function registerMedicine(
        string memory _name,
        string memory _batchId,
        string memory _manufacturerName,
        string memory _licenseNo,
        uint256 _quantity,
        uint256 _manufactureDate,
        uint256 _expiryDate,
        string memory _description,
        string memory _qrHash,
        string memory _imageUrl
    ) external onlyApproved(Role.Manufacturer) {

        require(!medicines[_batchId].exists, "Batch exists");

        medicines[_batchId] = Medicine({
            name: _name,
            batchId: _batchId,
            manufacturerName: _manufacturerName,
            licenseNo: _licenseNo,
            quantity: _quantity,
            manufactureDate: _manufactureDate,
            expiryDate: _expiryDate,
            description: _description,
            manufacturer: msg.sender,
            qrHash: _qrHash,
            imageUrl: _imageUrl,
            exists: true
        });

        emit MedicineRegistered(_batchId, msg.sender);
    }

    /* -----------------------------------------
        UPDATE SHIPMENT
    ------------------------------------------*/

    function updateShipment(
        string memory _batchId,
        address _to,
        string memory _location,
        string memory _status
    ) external {

        require(medicines[_batchId].exists, "Invalid batch");

        Role senderRole = roles[msg.sender];

        require(
            senderRole == Role.Manufacturer ||
            senderRole == Role.Distributor,
            "Not authorized"
        );

        history[_batchId].push(Transaction({
            from: msg.sender,
            to: _to,
            location: _location,
            timestamp: block.timestamp,
            status: _status
        }));

        emit ShipmentUpdated(_batchId, msg.sender, _to, _status);
    }

    /* -----------------------------------------
        PHARMACY RECEIPT
    ------------------------------------------*/

    function confirmReceipt(
        string memory _batchId,
        string memory _location
    ) external onlyApproved(Role.Pharmacy) {

        require(medicines[_batchId].exists, "Invalid batch");

        history[_batchId].push(Transaction({
            from: msg.sender,
            to: msg.sender,
            location: _location,
            timestamp: block.timestamp,
            status: "Delivered"
        }));

        emit ReceiptConfirmed(_batchId, msg.sender);
    }

    /* -----------------------------------------
        VERIFY MEDICINE (ANTI-COUNTERFEIT)
    ------------------------------------------*/

    function verifyMedicine(
        string memory _batchId,
        string memory _qrHash
    )
        external
        view
        returns (
            bool isValid,
            bool isExpired,
            string memory name,
            string memory manufacturer,
            string memory imageUrl
        )
    {
        if (!medicines[_batchId].exists) {
            return (false, false, "", "", "");
        }

        Medicine memory med = medicines[_batchId];

        // QR mismatch → counterfeit
        if (
            keccak256(abi.encodePacked(med.qrHash)) !=
            keccak256(abi.encodePacked(_qrHash))
        ) {
            return (false, false, med.name, med.manufacturerName, med.imageUrl);
        }

        bool expired = block.timestamp > med.expiryDate;

        return (
            true,
            expired,
            med.name,
            med.manufacturerName,
            med.imageUrl
        );
    }

    /* -----------------------------------------
        GET DATA
    ------------------------------------------*/

    function getMedicine(string memory _batchId)
        external
        view
        returns (Medicine memory)
    {
        require(medicines[_batchId].exists, "Not found");
        return medicines[_batchId];
    }

    function getHistory(string memory _batchId)
        external
        view
        returns (Transaction[] memory)
    {
        require(medicines[_batchId].exists, "Not found");
        return history[_batchId];
    }
}