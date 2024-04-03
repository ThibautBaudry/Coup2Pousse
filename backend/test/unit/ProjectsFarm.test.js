const { assert, expect } = require("chai");
const { ethers } = require('hardhat');

describe("Test ProjectsFarm Contract", function () {
    let projectsFarm;
    let owner, addr1, addr2;

    describe('Initialisation', function() {
        beforeEach(async function() {
            [owner] = await ethers.getSigners();
            let contract = await ethers.getContractFactory('ProjectsFarm');
            projectsFarm = await contract.deploy();
        })

        it('should deploy the smart contract', async function() {
            let theOwner = await projectsFarm.owner();
            assert.equal(owner.address, theOwner)
        })
    })

    describe('Register Delete and Get Association', async function () {
        beforeEach(async function() {
            [owner, addr1, addr2] = await ethers.getSigners();
            let contract = await ethers.getContractFactory('ProjectsFarm');
            projectsFarm = await contract.deploy();
        })

        it('should NOT add an association if not the owner', async function () {
            await expect(
                projectsFarm
                .connect(addr1)
                .addAssociation("Mon association", 12345, addr2.address)
                ).to.be.revertedWithCustomError(
                    projectsFarm,
                    "OwnableUnauthorizedAccount"
                ).withArgs(
                    addr1.address
                )
            })
        
        it('should NOT delete an association if not the owner', async function () {
            await expect(
                projectsFarm
                .connect(addr1)
                .deleteAssociation("Mon association", addr2.address)
                ).to.be.revertedWithCustomError(
                    projectsFarm,
                    "OwnableUnauthorizedAccount"
                ).withArgs(
                    addr1.address
                )
            })

        it('should NOT add an association if the association is already registered', async function () {
            await projectsFarm.addAssociation("Mon association", 12345, addr2.address);
            await expect(
                projectsFarm
                .addAssociation("Mon association", 12345, addr2.address))
                .to.be.revertedWith(
                    "Already registered"
                )
            })

        it('should ADD an association and register the association', async function () {
            await projectsFarm.addAssociation("Mon association", 12345, addr2.address);
            let association = await projectsFarm.getAssociation(addr2.address);
            expect(association.isRegistered).to.be.equal(true);
            expect(association.name).to.be.equal("Mon association");
            expect(association.RNA).to.be.equal(12345);
            expect(association.numberOfProjects).to.be.equal(1);
            })

        it('should DELETE an association and deregister the association', async function () {
            await projectsFarm.addAssociation("Mon association", 12345, addr2.address);
            await projectsFarm.deleteAssociation("Mon association", addr2.address);
            let association = await projectsFarm.getAssociation(addr2.address);
            expect(association.isRegistered).to.be.equal(false);
            expect(association.numberOfProjects).to.be.equal(0);
            })
            
        it('should emit an event when an association is registered', async function () { 
            await expect(
                projectsFarm
                .addAssociation("Mon association", 12345, addr2.address))
                .to.emit(
                    projectsFarm,
                    "AssociationRegistered"
                )
                .withArgs(
                    "Mon association",
                    addr2.address
                )
            })

        it('should emit an event when an association is deleted', async function () { 
            await projectsFarm.addAssociation("Mon association", 12345, addr2.address);
            await expect(
                projectsFarm
                .deleteAssociation("Mon association", addr2.address))
                .to.emit(
                    projectsFarm,
                    "AssociationDeleted"
                )
                .withArgs(
                    "Mon association",
                    addr2.address
                )
            })

        it('should GET an association', async function () {
            projectsFarm.addAssociation("Mon association", 12345, addr2.address);
            await expect(
                projectsFarm
                .getAssociation(addr2.address)) 
            })
    })

    describe('Register Delete and Get Projet Agricole', async function () {
        beforeEach(async function() {
            [owner, addr1, addr2] = await ethers.getSigners();
            let contract = await ethers.getContractFactory('ProjectsFarm');
            projectsFarm = await contract.deploy();
        })

        it('should NOT add a Projet Agricole if not an association', async function () {
            await expect(
                projectsFarm
                .connect(addr1)
                .addProjectAgriculteur("OeufsBio", 12345, addr1.address, addr2.address)
                ).to.be.revertedWith(
                    "You're not an association"
                )
            })
        
        it('should NOT delete a Projet Agricole if not an association', async function () {
            await projectsFarm.addAssociation("Mon association", 12345, addr2.address);
            await projectsFarm.connect(addr2).addProjectAgriculteur("OeufsBio", 12345, addr1.address, addr2.address);
            await expect(
                projectsFarm
                .connect(addr1)
                .deleteProjectAgriculteur("OeufsBio", addr1.address, addr2.address)
                ).to.be.revertedWith(
                    "You're not an association"
                )
            })

        it('should NOT add a Projet Agricole if the projet agricole is already registered', async function () {
            await projectsFarm.addAssociation("Mon association", 12345, addr2.address);
            await projectsFarm.connect(addr2).addProjectAgriculteur("OeufsBio", 12345, addr1.address, addr2.address);
            await expect(
                projectsFarm
                .connect(addr2)
                .addProjectAgriculteur("OeufsBio", 12345, addr1.address, addr2.address))
                .to.be.revertedWith(
                    "Already registered"
                )
            })

        it('should ADD a Projet Agricole and register the project', async function () {
            await projectsFarm.addAssociation("Mon association", 12345, addr2.address);
            await projectsFarm.connect(addr2).addProjectAgriculteur("OeufsBio", 12345, addr1.address, addr2.address);
            let projetAgricole = await projectsFarm.getProjetAgricole(addr2.address, addr1.address);
            expect(projetAgricole.isRegistered).to.be.equal(true);
            expect(projetAgricole.projectDescription).to.be.equal("OeufsBio");
            expect(projetAgricole.SIRET).to.be.equal(12345);
            expect(projetAgricole.associationAddress).to.be.equal(addr2.address);
            })

        it('should DELETE a Projet Agricole and deregister the project', async function () {
            await projectsFarm.addAssociation("Mon association", 12345, addr2.address);
            await projectsFarm.connect(addr2).addProjectAgriculteur("OeufsBio", 12345, addr1.address, addr2.address);
            await projectsFarm.connect(addr2).deleteProjectAgriculteur("OeufsBio", addr1.address, addr2.address);
            let projetAgricole = await projectsFarm.getProjetAgricole(addr2.address, addr1.address);
            expect(projetAgricole.isRegistered).to.be.equal(false);
            })
            
        it('should emit an event when a projet agricole is registered', async function () { 
            await projectsFarm.addAssociation("Mon association", 12345, addr2.address);
            await expect(
                projectsFarm
                .connect(addr2)
                .addProjectAgriculteur("OeufsBio", 12345, addr1.address, addr2.address))
                .to.emit(
                    projectsFarm,
                    "ProjetAgricoleRegistered"
                )
                .withArgs(
                    "OeufsBio",
                    addr1.address
                )
            })

        it('should emit an event when a projet agricole is deleted', async function () { 
            await projectsFarm.addAssociation("Mon association", 12345, addr2.address);
            await projectsFarm.connect(addr2).addProjectAgriculteur("OeufsBio", 12345, addr1.address, addr2.address);
            await expect(
                projectsFarm
                .connect(addr2)
                .deleteProjectAgriculteur("OeufsBio", addr1.address, addr2.address))
                .to.emit(
                    projectsFarm,
                    "ProjetAgricoleDeleted"
                )
                .withArgs(
                    "OeufsBio",
                    addr1.address
                )
            })

        it('should GET a projet Agricole', async function () {
            await projectsFarm.addAssociation("Mon association", 12345, addr2.address);
            await projectsFarm.connect(addr2).addProjectAgriculteur("OeufsBio", 12345, addr1.address, addr2.address);
            await expect(
                projectsFarm
                .getProjetAgricole(addr2.address, addr1.address)) 
            })
    })
})