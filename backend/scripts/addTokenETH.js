const { assert, expect } = require("chai");
const { ethers } = require('hardhat');

async function main() {
    const c2p = await hre.ethers.deployContract("C2PToken");
    await c2p.waitForDeployment();
    console.log(`C2PToken deployed to ${c2p.target}`);
    const usdc = await hre.ethers.deployContract("USDC");
    await usdc.waitForDeployment();
    console.log(`USDC deployed to ${usdc.target}`);
    const eth = await hre.ethers.deployContract("ETH");
    await eth.waitForDeployment();
    console.log(`ETH deployed to ${eth.target}`);
    const projectsFarm = await hre.ethers.deployContract("ProjectsFarm");
    await projectsFarm.waitForDeployment();
    console.log(`Projects Farm deployed to ${projectsFarm.target}`);
    const staking = await hre.ethers.deployContract("Staking", [usdc.target, c2p.target]);
    await staking.waitForDeployment();
    console.log(`Staking deployed to ${staking.target}`);
    await staking.addToken("ETH", eth.target);
    console.log(`Token ETH added ${eth.target}`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });