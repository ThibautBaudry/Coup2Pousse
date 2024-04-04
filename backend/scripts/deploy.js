const { assert, expect } = require("chai");
const { ethers } = require('hardhat');

async function main() {
  const c2p = await hre.ethers.deployContract("C2PToken");
  await c2p.waitForDeployment();
  console.log(`C2PToken deployed to ${c2p.target}`);
  const usdc = await hre.ethers.deployContract("USDC");
  await usdc.waitForDeployment();
  console.log(`USDC deployed to ${usdc.target}`);
  const staking = await hre.ethers.deployContract("Staking", [usdc.target, c2p.target]);
  await staking.waitForDeployment();
  console.log(`Staking deployed to ${staking.target}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
