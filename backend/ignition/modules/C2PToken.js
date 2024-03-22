const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("C2PTokenModule", (m) => {
  const c2pToken = m.contract("C2PToken");

  return { c2pToken };
});
