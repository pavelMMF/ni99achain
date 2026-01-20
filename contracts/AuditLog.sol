pragma solidity ^0.8.20;

contract AuditLog {
    address public owner;

    enum Action { CREATE, UPDATE, DELETE }

    struct Latest {
        bytes32 contentHash;
        uint64 version;
        bool exists;
    }

    mapping(bytes32 => Latest) public latest;

    event Record(
        bytes32 indexed docId,
        uint64 version,
        bytes32 contentHash,
        string uri,
        Action action,
        address indexed actor,
        uint256 timestamp
    );

    modifier onlyOwner() {
        require(msg.sender == owner, "NOT_OWNER");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "ZERO_ADDR");
        owner = newOwner;
    }

    function record(
        bytes32 docId,
        bytes32 contentHash,
        string calldata uri,
        Action action
    ) external onlyOwner {
        Latest storage s = latest[docId];
        uint64 nextVersion = s.version + 1;

        s.contentHash = contentHash;
        s.version = nextVersion;
        s.exists = (action != Action.DELETE);

        emit Record(docId, nextVersion, contentHash, uri, action, msg.sender, block.timestamp);
    }
}