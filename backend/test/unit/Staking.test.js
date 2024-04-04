const { assert, expect } = require("chai");
const { ethers } = require('hardhat');

describe("Test Staking Contract", function () {
    let C2PToken;
    let USDCToken;
    let ETHToken;
    let ProjectsFarm;
    let Staking;
    let owner, addr1, addr2;

    describe('Initialisation', function() {
        beforeEach(async function() {
            [owner, addr1, addr2] = await ethers.getSigners();
            let C2PTokenContract = await ethers.getContractFactory('C2PToken');
            C2PToken = await C2PTokenContract.deploy();
            let USDCTokenContract = await ethers.getContractFactory('USDC');
            USDCToken = await USDCTokenContract.deploy();
            let ETHTokenContract = await ethers.getContractFactory('ETH');
            ETHToken = await ETHTokenContract.deploy();
            let ProjectsFarmContract = await ethers.getContractFactory('ProjectsFarm');
            ProjectsFarm = await ProjectsFarmContract.deploy();
            let StakingContract = await ethers.getContractFactory('Staking');
            Staking = await StakingContract.deploy(USDCToken.target, C2PToken.target);
        })

        it('should deploy the smart contract', async function() {

        })
    })

    describe('Stake and Withdraw USDC and another token', async function () {
        beforeEach(async function() {
            [owner, addr1, addr2] = await ethers.getSigners();
            let C2PTokenContract = await ethers.getContractFactory('C2PToken');
            C2PToken = await C2PTokenContract.deploy();
            let USDCTokenContract = await ethers.getContractFactory('USDC');
            USDCToken = await USDCTokenContract.deploy();
            let ETHTokenContract = await ethers.getContractFactory('ETH');
            ETHToken = await ETHTokenContract.deploy();
            let ProjectsFarmContract = await ethers.getContractFactory('ProjectsFarm');
            ProjectsFarm = await ProjectsFarmContract.deploy();
            let StakingContract = await ethers.getContractFactory('Staking');
            Staking = await StakingContract.deploy(USDCToken.target, C2PToken.target);
            await C2PToken.approve(Staking.target, 1000);
            await USDCToken.approve(Staking.target, 1000);
            await ETHToken.approve(Staking.target, 1000);
        })

        it('should NOT stake USDC if amount = 0', async function () {
            await expect(
                Staking
                .stakeUSDC(0, USDCToken.target))
                .to.be.revertedWith(
                    "amount = 0"
                )
        })

        it('should NOT stake USDC if token is not USDC', async function () {
            await expect(
                Staking
                .stakeUSDC(10, addr2.address))
                .to.be.revertedWith(
                    "NOT USDC"
                )
        })

        it('should NOT stake another token if amount = 0', async function () {
            await expect(
                Staking
                .stakeOtherToken(0, ETHToken.target))
                .to.be.revertedWith(
                    "amount = 0"
                )
        })

        it('should NOT stake another token if token is not registered', async function () {
            await Staking.addToken("ETH", ETHToken.target);
            await expect(
                Staking
                .stakeOtherToken(10, addr2.address))
                .to.be.revertedWith(
                    "Not stakable"
                )
        })

        it('should NOT withdraw USDC if amount = 0', async function () {
            await Staking.stakeUSDC(10, USDCToken.target);
            await expect(
                Staking
                .withdrawUSDC(0, USDCToken.target, 0))
                .to.be.revertedWith(
                    "amount = 0"
                )
        })

        it('should NOT withdraw USDC if token is not USDC', async function () {
            await Staking.stakeUSDC(10, USDCToken.target);
            await expect(
                Staking
                .withdrawUSDC(10, addr2.address, 0))
                .to.be.revertedWith(
                    "NOT USDC"
                )
        })

        it('should NOT withdraw another token if amount = 0', async function () {
            await Staking.stakeOtherToken(10, ETHToken.target);
            await expect(
                Staking
                .withdrawOtherToken(0, USDCToken.target, 0))
                .to.be.revertedWith(
                    "amount = 0"
                )
        })

        it('should NOT withdraw another if token is not registered', async function () {
            await Staking.addToken("ETH", ETHToken.target);
            await Staking.stakeOtherToken(10, ETHToken.target);
            await expect(
                Staking
                .withdrawOtherToken(10, addr2.address, 0))
                .to.be.revertedWith(
                    "Not stakable"
                )
        })

        it('should STAKE USDC', async function () {
            await Staking.stakeUSDC(10, USDCToken.target);
            let balanceOwner = await Staking.balances(owner);
            expect(balanceOwner.balanceUSDC).to.be.equal(10);
        })

        it('should STAKE an other token', async function () {
            await Staking.stakeOtherToken(10, ETHToken.target);
            let balanceOwner = await Staking.balances(owner);
            expect(balanceOwner.balanceOtherToken).to.be.equal(10);
        })

        it('should WITHDRAW USDC', async function () {
            await Staking.stakeUSDC(10, USDCToken.target);
            await Staking.withdrawUSDC(2, USDCToken.target, 0);
            let balanceOwner = await Staking.balances(owner);
            expect(balanceOwner.balanceUSDC).to.be.equal(8);
        })

        it('should WITHDRAW an other token', async function () {
            await Staking.stakeOtherToken(10, USDCToken.target);
            await Staking.withdrawOtherToken(1, USDCToken.target, 0);
            let balanceOwner = await Staking.balances(owner);
            expect(balanceOwner.balanceOtherToken).to.be.equal(9);
        })

        it('should emit an event when a contributor STAKE USDC', async function () {
            await expect(
                Staking
                .stakeUSDC(10, USDCToken.target))
                .to.emit(
                    Staking,
                    "StakeUSDC"
                )
                .withArgs(
                    10,
                    USDCToken.target
                )
        })

        it('should emit an event when a contributor STAKE an other token', async function () {
            await Staking.addToken("ETH", ETHToken.target);
            await expect(
                Staking
                .stakeOtherToken(10, ETHToken.target))
                .to.emit(
                    Staking,
                    "StakeOtherToken"
                )
                .withArgs(
                    10,
                    ETHToken.target
                )

        })

        it('should emit an event when a contributor WITHDRAW USDC', async function () {
            await Staking.stakeUSDC(10, USDCToken.target);
            await expect(
                Staking
                .withdrawUSDC(2, USDCToken.target, 0))
                .to.emit(
                    Staking,
                    "WithdrawUSDC"
                )
                .withArgs(
                    2,
                    USDCToken.target,
                    0
                )

        })

        it('should emit an event when a contributor WITHDRAW an other token', async function () {
            await Staking.addToken("ETH", ETHToken.target);
            await Staking.stakeOtherToken(10, ETHToken.target);
            await expect(
                Staking
                .withdrawOtherToken(1, ETHToken.target, 0))
                .to.emit(
                    Staking,
                    "WithdrawOtherToken"
                )
                .withArgs(
                    1,
                    ETHToken.target,
                    0
                )
        })
    })
})
