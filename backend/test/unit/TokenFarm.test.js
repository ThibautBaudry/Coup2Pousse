const { assert, expect } = require("chai");
const { ethers } = require('hardhat');

describe("Test TokenFarm Contract", function () {
    let C2PToken;
    let USDCToken;
    let ETHToken;
    let owner;

    describe('Initialisation', function() {
        beforeEach(async function() {
            [owner] = await ethers.getSigners();
            let C2PTokenContract = await ethers.getContractFactory('C2PToken');
            C2PToken = await C2PTokenContract.deploy();
            let USDCTokenContract = await ethers.getContractFactory('USDC');
            USDCToken = await USDCTokenContract.deploy();
            let ETHTokenContract = await ethers.getContractFactory('ETH');
            ETHToken = await ETHTokenContract.deploy();
        })

        it('should mint 1000 C2P to the msg.sender', async function() {
            let balanceC2P = await C2PToken.balanceOf(owner.address);
            assert.equal(balanceC2P.toString(), "1000")
        })

        it('should mint 1000 USDC to the msg.sender', async function() {
            let balanceUSDC = await USDCToken.balanceOf(owner.address);
            assert.equal(balanceUSDC.toString(), "1000")
        })

        it('should mint 1000 USDC to the msg.sender', async function() {
            let balanceETH = await ETHToken.balanceOf(owner.address);
            assert.equal(balanceETH.toString(), "1000")
        })
    })
})