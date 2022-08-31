// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract PROPTOKEN is ERC20, Ownable {
    using SafeERC20 for IERC20;  

    constructor(uint _initialSupply) ERC20("PROP TOKEN", "PROP") {
        _mint(msg.sender, _initialSupply);
    }

    function decimals() public view virtual override(ERC20) returns (uint8) {
        return 8;
    }

    function getOwner() public view returns (address owner_) {
        owner_ = owner();
    }

    function withdrawal(address _token, address _recipient, uint _amount) public onlyOwner {
        IERC20(_token).safeTransfer(_recipient, _amount);
    }

    function withdrawalNative(address _recipient, uint _amount) public onlyOwner {
        payable(_recipient).transfer(_amount);
    }
}
