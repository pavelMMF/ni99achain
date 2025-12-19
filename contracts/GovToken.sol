// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/contracts/token/ERC20/extensions/ERC20Permit.sol";
import "@openzeppelin/contracts/contracts/token/ERC20/extensions/ERC20Votes.sol";
import "@openzeppelin/contracts/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/contracts/utils/Nonces.sol";

contract GovToken is ERC20, ERC20Permit, ERC20Votes, Ownable {
    constructor()
        ERC20("GovToken", "GOV")
        ERC20Permit("GovToken")
        Ownable(msg.sender)
    {
        _mint(msg.sender, 1_000_000 ether);
    }

    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }

    // OZ v5: required override for ERC20Votes
    function _update(address from, address to, uint256 value)
        internal
        override(ERC20, ERC20Votes)
    {
        super._update(from, to, value);
    }

    // ERC20Permit and Votes both use Nonces
    function nonces(address owner)
        public
        view
        override(ERC20Permit, Nonces)
        returns (uint256)
    {
        return super.nonces(owner);
    }
}
