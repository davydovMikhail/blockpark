// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract PropToken is ERC20, Pausable, AccessControl {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    address private _owner;

    mapping(address => bool) public whitelist;
    mapping(address => bool) public blocklist;

    event WhitelistChanged(
        address Address,
        bool Status
    );

    event BlocklistChanged(
        address Address,
        bool Status
    );

    event OwnershipTransfered(
        address OldOwner,
        address NewOwner
    );

    constructor(uint _initialSupply) ERC20("PROP TOKEN", "PROP") {
        _mint(msg.sender, _initialSupply);
        _owner = msg.sender;
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
    }

    function pause() public onlyRole(ADMIN_ROLE) {
        _pause();
    }

    function unpause() public onlyRole(ADMIN_ROLE) {
        _unpause();
    }

    function changeWhitelist(address user, bool status) public onlyRole(ADMIN_ROLE) {
        whitelist[user] = status;
        emit WhitelistChanged(user, status);
    }

    function changeBlocklist(address user, bool status) public onlyRole(ADMIN_ROLE) {
        blocklist[user] = status;
        emit BlocklistChanged(user, status);
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal override {
        require(!blocklist[from] && !blocklist[to], "You are blocklisted.");
        if (paused()) {
            require(whitelist[msg.sender], "Token on pause.");
        }
        super._beforeTokenTransfer(from, to, amount);
    }

    function setNewOwner(address _newOwner) external {
        require(_owner == _msgSender(), "This function can only be called by the current owner.");
        emit OwnershipTransfered(_owner, _newOwner);
        _owner = _newOwner;
    }

    function decimals() public view virtual override(ERC20) returns (uint8) {
        return 8;
    }

    function getOwner() public view returns (address) {
        return _owner;
    }
}
