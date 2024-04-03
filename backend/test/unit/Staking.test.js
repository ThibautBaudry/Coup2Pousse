const { assert, expect } = require("chai");
const { ethers } = require('hardhat');

describe("Test Staking Contract", async function () {
    const c2p = await hre.ethers.deployContract("C2PToken");
    await c2p.waitForDeployment();
    //console.log(`C2PToken deployed to ${c2p.target}`);
    const usdc = await hre.ethers.deployContract("USDC");
    await usdc.waitForDeployment();
    //console.log(`USDC deployed to ${usdc.target}`);
    let staking;
    let owner, addr1, addr2;

    describe('Initialisation', function() {
        beforeEach(async function() {
            [owner, addr1, addr2] = await ethers.getSigners();
            staking = await hre.ethers.deployContract("Staking", [usdc.target, c2p.target]);
            await staking.waitForDeployment();
        })

        it('should deploy the smart contract', async function() {

        })
    })

    describe('Stake and Withdraw USDC and another token', async function () {
        beforeEach(async function() {
            [owner, addr1, addr2] = await ethers.getSigners();
            const staking = await hre.ethers.deployContract("Staking", [usdc.target, c2p.target]);
            await staking.waitForDeployment();
            await c2p.approve(staking.target, 1000);
            await usdc.approve(staking.target, 1000);
        })

        it('should NOT stake USDC if amount = 0', async function () {
            await expect(
                staking
                .stakeUSDC(0, usdc.target))
                .to.be.revertedWith(
                    "amount = 0"
                )
        })
/*
        it('should NOT stake USDC if token is not USDC', async function () {
            await expect(
                staking
                .stakeUSDC(10, addr2.address))
                .to.be.revertedWith(
                    "NOT USDC"
                )
        })
        
        it('should stake USDC', async function () {
            await staking.connect(addr1).stakeUSDC(10, usdc.target);
            let balance = await staking.balanceOf(addr2.address);
            expect(association.isRegistered).to.be.equal(true);
            expect(association.name).to.be.equal("Mon association");
            expect(association.RNA).to.be.equal(12345);
            expect(association.numberOfProjects).to.be.equal(1);
        })
*/

        it('should emit an event when somebody stakes USDC', async function () {

        })
    

    })

    describe('it should get USDC and another token value in USD', async function () {

    })

    describe('it should calculate Rewards get Rewards and support a Project', async function () {
            
    })
})
