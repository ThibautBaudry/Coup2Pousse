//SPDX-License-Identifier: MIT

pragma solidity 0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";

contract ProjectsFarm is Ownable {

    struct Association {
        bool isRegistered;
        string name;
        uint256 RNA;
        uint256 numberOfProjects;
    }

    struct Agriculteur {
        bool isRegistered;
        string projectDescription;
        uint256 SIRET;
        address associationAddress;
    }

    mapping (address => Association) associations;

    mapping (address => mapping (address => Agriculteur)) agriculteurs;

    event AssociationRegistered (string associationName, address associationAddress);

    event AssociationDeleted (string associationName, address associationDeleted);

    event ProjectAgriculteurRegistered (string projectDescription, address agriculteurAddress);

    event ProjectAgriculteurDeleted (string projectDescription, address agriculteurDeleted);

    constructor() Ownable(msg.sender) {    }

    modifier onlyAssociation() {
        require(associations[msg.sender].isRegistered, "You're not an association");
        _;
    }

    function getAssociation(address _associationAddress) external view returns (Association memory) {
        return associations[_associationAddress];
    }

    function getAgriculteur(address _associationAddress, address _agriculteurAddress) external view returns (Agriculteur memory) {
        return agriculteurs[_associationAddress][_agriculteurAddress];
    }

    function addAssociation(string calldata _associationName, uint256 _rna, address _newAssociationAddress) external onlyOwner {
        require(_newAssociationAddress != address(0), "Address 0");
        require(associations[_newAssociationAddress].isRegistered != true, "Association already registered");

        associations[_newAssociationAddress].isRegistered = true;
        associations[_newAssociationAddress].name = _associationName;
        associations[_newAssociationAddress].RNA = _rna;

        emit AssociationRegistered(_associationName, _newAssociationAddress);
    }

    function deleteAssociation(string calldata _associationName, address _associationAddressToDelete) external onlyOwner {
        require(_associationAddressToDelete != address(0), "Address 0");
        require(associations[_associationAddressToDelete].isRegistered = true, "Association not registered");

        associations[_associationAddressToDelete].isRegistered = false;

        emit AssociationDeleted (_associationName, _associationAddressToDelete);
    }
    
    function addProjectAgriculteur(string calldata _projectDescription, uint256 _siret, address _newProjectAddress, address _associationAddress) external onlyAssociation {
        require(_newProjectAddress != address(0), "Address 0");
        require(agriculteurs[_associationAddress][_newProjectAddress].isRegistered != true, "Project already registered");

        agriculteurs[_associationAddress][_newProjectAddress].isRegistered = true;
        agriculteurs[_associationAddress][_newProjectAddress].projectDescription = _projectDescription;
        agriculteurs[_associationAddress][_newProjectAddress].SIRET = _siret;
        agriculteurs[_associationAddress][_newProjectAddress].associationAddress = _associationAddress;
        associations[_associationAddress].numberOfProjects ++;
        
        emit ProjectAgriculteurRegistered(_projectDescription, _newProjectAddress);
    }

    function deleteProjectAgriculteur(string calldata _projectDescription, address _projectAddressToDelete, address _associationAddress) external onlyAssociation {
        require(_projectAddressToDelete != address(0), "Address 0");
        require(agriculteurs[_associationAddress][_projectAddressToDelete].isRegistered = true, "Project not registered");

        agriculteurs[_associationAddress][_projectAddressToDelete].isRegistered = false;

        emit ProjectAgriculteurDeleted (_projectDescription, _projectAddressToDelete);

    }
}