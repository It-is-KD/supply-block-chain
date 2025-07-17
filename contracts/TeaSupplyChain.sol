// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract TeaSupplyChain {
    enum Role { None, Farmer, Processor, Warehouse, Distributor, Retailer, Authority }
    enum Stage { Cultivation, Processing, Warehousing, Distribution, Retail, Sold }
    
    struct Participant {
        address participantAddress;
        Role role;
        string name;
        string location;
        bool isActive;
    }
    
    struct Product {
        uint256 productId;
        string batchId;
        string productName;
        string origin;
        string grade;
        uint256 quantity;
        uint256 timestamp;
        Stage currentStage;
        address currentOwner;
        bool exists;
    }
    
    struct StageInfo {
        address handler;
        string location;
        uint256 timestamp;
        string notes;
        Stage stage;
    }
    
    mapping(address => Participant) public participants;
    mapping(uint256 => Product) public products;
    mapping(uint256 => StageInfo[]) public productHistory;
    mapping(string => uint256) public batchToProductId;
    
    uint256 public productCounter;
    address public owner;
    
    event ParticipantRegistered(address indexed participant, Role role, string name);
    event ProductCreated(uint256 indexed productId, string batchId, address indexed creator);
    event ProductTransferred(uint256 indexed productId, address indexed from, address indexed to, Stage stage);
    event StageUpdated(uint256 indexed productId, Stage stage, address indexed handler);
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only contract owner can perform this action");
        _;
    }
    
    modifier onlyParticipant() {
        require(participants[msg.sender].isActive, "Only registered participants can perform this action");
        _;
    }
    
    modifier onlyRole(Role _role) {
        require(participants[msg.sender].role == _role, "Unauthorized role");
        _;
    }
    
    modifier productExists(uint256 _productId) {
        require(products[_productId].exists, "Product does not exist");
        _;
    }
    
    constructor() {
        owner = msg.sender;
        participants[msg.sender] = Participant({
            participantAddress: msg.sender,
            role: Role.Authority,
            name: "Tea Board Authority",
            location: "India",
            isActive: true
        });
    }
    
    function registerParticipant(
        address _participant,
        uint8 _role,
        string memory _name,
        string memory _location
    ) public onlyOwner {
        require(_role > 0 && _role <= 6, "Invalid role");
        require(_participant != address(0), "Invalid address");
        
        participants[_participant] = Participant({
            participantAddress: _participant,
            role: Role(_role),
            name: _name,
            location: _location,
            isActive: true
        });
        
        emit ParticipantRegistered(_participant, Role(_role), _name);
    }
    
    function createProduct(
        string memory _batchId,
        string memory _productName,
        string memory _origin,
        string memory _grade,
        uint256 _quantity,
        string memory _notes
    ) public onlyRole(Role.Farmer) {
        require(batchToProductId[_batchId] == 0, "Batch ID already exists");
        
        productCounter++;
        uint256 productId = productCounter;
        
        products[productId] = Product(
            productId,
            _batchId,
            _productName,
            _origin,
            _grade,
            _quantity,
            block.timestamp,
            Stage.Cultivation,
            msg.sender,
            true
        );
        
        batchToProductId[_batchId] = productId;
        
        productHistory[productId].push(StageInfo(
            msg.sender,
            participants[msg.sender].location,
            block.timestamp,
            _notes,
            Stage.Cultivation
        ));
        
        emit ProductCreated(productId, _batchId, msg.sender);
        emit StageUpdated(productId, Stage.Cultivation, msg.sender);
    }
    
    function updateProductStage(
        uint256 _productId,
        Stage _newStage,
        string memory _notes
    ) public onlyParticipant productExists(_productId) {
        Product storage product = products[_productId];
        require(uint8(_newStage) == uint8(product.currentStage) + 1, "Invalid stage progression");
        
        Role requiredRole = getRequiredRoleForStage(_newStage);
        require(participants[msg.sender].role == requiredRole, "Unauthorized for this stage");
        
        product.currentStage = _newStage;
        product.currentOwner = msg.sender;
        
        productHistory[_productId].push(StageInfo(
            msg.sender,
            participants[msg.sender].location,
            block.timestamp,
            _notes,
            _newStage
        ));
        
        emit StageUpdated(_productId, _newStage, msg.sender);
        emit ProductTransferred(_productId, product.currentOwner, msg.sender, _newStage);
    }
    
    function getRequiredRoleForStage(Stage _stage) internal pure returns (Role) {
        if (_stage == Stage.Processing) return Role.Processor;
        if (_stage == Stage.Warehousing) return Role.Warehouse;
        if (_stage == Stage.Distribution) return Role.Distributor;
        if (_stage == Stage.Retail) return Role.Retailer;
        if (_stage == Stage.Sold) return Role.Retailer;
        return Role.None;
    }
    
    function getProductByBatch(string memory _batchId) public view returns (Product memory) {
        uint256 productId = batchToProductId[_batchId];
        require(productId != 0, "Product not found");
        return products[productId];
    }
    
    function getProductHistory(uint256 _productId) public view returns (StageInfo[] memory) {
        return productHistory[_productId];
    }
    
    function getParticipant(address _participant) public view returns (Participant memory) {
        return participants[_participant];
    }
    
    function getAllProductsByOwner(address _owner) public view returns (uint256[] memory) {
        uint256[] memory result = new uint256[](productCounter);
        uint256 counter = 0;
        
        for (uint256 i = 1; i <= productCounter; i++) {
            if (products[i].currentOwner == _owner) {
                result[counter] = i;
                counter++;
            }
        }
        
        uint256[] memory trimmedResult = new uint256[](counter);
        for (uint256 i = 0; i < counter; i++) {
            trimmedResult[i] = result[i];
        }
        
        return trimmedResult;
    }
}