//SPDX-License-Identifier: MIT

pragma solidity 0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract C2PToken is ERC20 {

    address public owner;

    constructor(uint256 initialSupply) ERC20("Coup2Pousse", "C2P"){
        owner = msg.sender;
        _mint(msg.sender, initialSupply);
    }

    function approveC2PToken(address _addressToApprove, uint256 _value) external {
        require(_addressToApprove != address(0), "Address 0");
        _approve(owner, _addressToApprove, _value);
    }

    function getC2PToken(address _addressContributor, uint256 _numberOfTokens) external {
        require(_addressContributor != address(0), "Address 0");
        _transfer(owner, _addressContributor, _numberOfTokens);  
    }
}

contract ETHToken is ERC20 {

    address public owner;

    constructor(uint256 initialSupply) ERC20("ETH", "ETH"){
        owner = msg.sender;
        _mint(msg.sender, initialSupply);
    }

    function approveETHToken(address _addressToApprove, uint256 _value) external {
        require(_addressToApprove != address(0), "Address 0");
        _approve(owner, _addressToApprove, _value);
    }

    function getETHToken(address _addressContributor, uint256 _numberOfTokens) external {
        require(_addressContributor != address(0), "Address 0");
        _transfer(owner, _addressContributor, _numberOfTokens);  
    }
}

contract USDC is ERC20 {

    address public owner;

    constructor(uint256 initialSupply) ERC20("USDC", "USDC"){
        owner = msg.sender;
        _mint(msg.sender, initialSupply);
    }

    function approveUSDCToken(address _addressToApprove, uint256 _value) external {
        require(_addressToApprove != address(0), "Address 0");
        _approve(owner, _addressToApprove, _value);
    }

    function getUSDCToken(address _addressContributor, uint256 _numberOfTokens) external {
        require(_addressContributor != address(0), "Address 0");
        _transfer(owner, _addressContributor, _numberOfTokens);  
    }
}