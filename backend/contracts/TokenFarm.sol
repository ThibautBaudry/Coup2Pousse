//SPDX-License-Identifier: MIT

pragma solidity 0.8.24;

/// @title Deux contrats intelligents pour la création de 2 tokens
/// @author Thibaut Baudry
/// @notice Ces contrats intelligents créent le C2P qui rémunérera les stakers et le USDC qui pourra être staké (qui simule le véritable USDC)
/// @dev Les contrats intelligents sont deux ERC-20

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract C2PToken is ERC20 {

    /// @notice Crée le C2P et mint 1000 tokens au déploiement
    constructor() ERC20("Coup2Pousse", "C2P"){
        _mint(msg.sender, 1000000 * 10**decimals());
    }
}

contract USDC is ERC20 {

    /// @notice Crée l'USDC fictif et mint 1000 tokens au déploiement
    constructor() ERC20("USDC", "USDC"){
        _mint(msg.sender, 1000000 * 10**decimals());
    }
}

contract ETH is ERC20 {

    /// @notice Crée l'ETH fictif et mint 1000 tokens au déploiement
    constructor() ERC20("ETH", "ETH"){
        _mint(msg.sender, 1000000 * 10**decimals());
    }
}