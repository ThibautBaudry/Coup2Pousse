//SPDX-License-Identifier: MIT

pragma solidity 0.8.24;

/// @title Un contrat intelligent pour la création d'associations regroupant des projets agricoles
/// @author Thibaut Baudry
/// @notice Ce contrat intelligent permet d'ajouter des associations qui peuvent elle-mêmes ajouter des projets agricoles et supprimer des projets agricoles
/// @dev Le contrat intelligent est Ownable, le propriétaire du contrat peut ajouter et supprimer des associations

import "@openzeppelin/contracts/access/Ownable.sol";

contract ProjectsFarm is Ownable {

    struct Association {
        bool isRegistered;
        string name;
        uint256 RNA;
        uint256 numberOfProjects;
    }

    struct ProjetAgricole {
        bool isRegistered;
        string projectDescription;
        uint256 SIRET;
        address associationAddress;
    }

    mapping (address => Association) associations;
    mapping (address => mapping (address => ProjetAgricole)) projetsAgricoles;

    /// @notice Emit lorsqu'une association est enregistrée
    /// @param associationName Le nom de l'association
    /// @param associationAddress L'adresse de l'association
    event AssociationRegistered (string associationName, address associationAddress);

    /// @notice Emit lorsqu'une association est supprimée
    /// @param associationName Le nom de l'association
    /// @param associationDeleted L'adresse de l'association
    event AssociationDeleted (string associationName, address associationDeleted);

    /// @notice Emit lorsqu'un projet agricole est enregistré
    /// @param projectDescription La description du projet
    /// @param agriculteurAddress L'adresse de l'agriculteur
    event ProjetAgricoleRegistered (string projectDescription, address agriculteurAddress);

    /// @notice Emit lorsqu'un projet agricole est supprimé
    /// @param projectDescription La description du projet
    /// @param agriculteurDeleted L'adresse de l'agriculteur
    event ProjetAgricoleDeleted (string projectDescription, address agriculteurDeleted);

    /// @dev Définit l'adresse qui déploie comme propriétaire du contract
    constructor() Ownable(msg.sender) {    }

    /// @dev S'assure que l'appelant d'une fonction est une association
    modifier onlyAssociation() {
        require(associations[msg.sender].isRegistered, "You're not an association");
        _;
    }

    // ::::::::::::: GETTERS ::::::::::::: //

    /// @notice Récupère les informations d'une association
    /// @param _associationAddress L'adresse de l'association
    /// @return Association Toutes les informations de la structure Association en fonction de l'adresse
    function getAssociation(address _associationAddress) external view returns (Association memory) {
        return associations[_associationAddress];
    }

    /// @notice Récupère les informations d'un projet agricole
    /// @param _associationAddress L'adresse de l'association
    /// @param _agriculteurAddress L'adresse de l'agriculteur
    /// @return ProjetAgricole Toutes les informations de la structure ProjetAgricole en fonction de l'adresse
    function getProjetAgricole(address _associationAddress, address _agriculteurAddress) external view returns (ProjetAgricole memory) {
        return projetsAgricoles[_associationAddress][_agriculteurAddress];
    }

    // ::::::::::::: REGISTRATION ::::::::::::: //

    /// @notice Enregistre une association
    /// @dev Ne peut être exécuté que par le propriétaire du contrat
    /// @param _associationName Le nom de l'association à enregistrer
    /// @param _rna Son numéro RNA 
    /// @param _newAssociationAddress Son addresse
    function addAssociation(string calldata _associationName, uint256 _rna, address _newAssociationAddress) external onlyOwner {
        require(associations[_newAssociationAddress].isRegistered != true, "Already registered");

        associations[_newAssociationAddress].isRegistered = true;
        associations[_newAssociationAddress].name = _associationName;
        associations[_newAssociationAddress].RNA = _rna;
        associations[_newAssociationAddress].numberOfProjects ++;

        emit AssociationRegistered(_associationName, _newAssociationAddress);
    }

    /// @notice Supprime une association
    /// @dev Ne peut être exécuté que par le propriétaire du contrat
    /// @param _associationName Le nom de l'association à supprimer
    /// @param _associationAddressToDelete Son addresse
    function deleteAssociation(string calldata _associationName, address _associationAddressToDelete) external onlyOwner {

        associations[_associationAddressToDelete].isRegistered = false;
        associations[_associationAddressToDelete].numberOfProjects --;

        emit AssociationDeleted (_associationName, _associationAddressToDelete);
    }

    /// @notice Enregistre un projet agricole
    /// @dev Ne peut être exécuté que par une association enregistrée
    /// @param _projectDescription La description du projet agricole
    /// @param _siret Son SIRET
    /// @param _newProjectAddress Son adresse
    /// @param _associationAddress L'adresse de son association de référence
    function addProjectAgriculteur(string calldata _projectDescription, uint256 _siret, address _newProjectAddress, address _associationAddress) external onlyAssociation {
        require(projetsAgricoles[_associationAddress][_newProjectAddress].isRegistered != true, "Already registered");

        projetsAgricoles[_associationAddress][_newProjectAddress].isRegistered = true;
        projetsAgricoles[_associationAddress][_newProjectAddress].projectDescription = _projectDescription;
        projetsAgricoles[_associationAddress][_newProjectAddress].SIRET = _siret;
        projetsAgricoles[_associationAddress][_newProjectAddress].associationAddress = _associationAddress;
        associations[_associationAddress].numberOfProjects ++;
        
        emit ProjetAgricoleRegistered(_projectDescription, _newProjectAddress);
    }

    /// @notice Supprime un projet agricole
    /// @dev Ne peut être exécuté que par une association enregistrée
    /// @param _projectDescription La description du projet agricole
    /// @param _projectAddressToDelete Son adresse
    /// @param _associationAddress L'adresse de son association de référence
    function deleteProjectAgriculteur(string calldata _projectDescription, address _projectAddressToDelete, address _associationAddress) external onlyAssociation {

        projetsAgricoles[_associationAddress][_projectAddressToDelete].isRegistered = false;

        emit ProjetAgricoleDeleted (_projectDescription, _projectAddressToDelete);

    }
}