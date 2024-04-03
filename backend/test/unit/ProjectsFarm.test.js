const { assert, expect } = require("chai");
const { ethers } = require('hardhat');

describe("Test ProjectsFarm Contract", function() {
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