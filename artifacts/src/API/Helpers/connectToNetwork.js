const { Gateway, Wallets } = require("fabric-network");
const readCCP = require("./readCCPFile");
const Wallet = require("./wallet");
const fs = require("fs");
const path = require("path");

async function connectToNetwork(identity) {
  // Load the network configuration
  let connectionProfile = readCCP();

  // Create a new file system based wallet for managing identities.
  const walletPath = path.join(process.cwd(), "wallet");
  const wallet = await Wallets.newFileSystemWallet(walletPath);

  // Create a new gateway for connecting to our peer node.
  const gateway = new Gateway();
  await gateway.connect(connectionProfile, {
    wallet,
    identity: identity,
    discovery: { enabled: true, asLocalhost: true },
  });

  // Get the network (channel) our contract is deployed to.
  const network = await gateway.getNetwork("chainhealth-channel");

  // Get the contract from the network.
  const contract = network.getContract("chainHeath-ChainCode");

  return contract;
}

module.exports = connectToNetwork;
