const FabricCAServices = require("fabric-ca-client");
const path = require("path");
const readPemFile = require("./../Helpers/readPemFile");
const readCCP = require("./../Helpers/readCCPFile");
const Wallet = require("./../Helpers/wallet");

async function enrollPeer(
  organization,
  peerNumber,
  enrollmentID,
  enrollmentSecret
) {
  try {
    // load the network configuration
    let ccp = readCCP();

    // Extract CA information for the peer
    const peerInfo =
      ccp.peers[`peer${peerNumber}.${organization}.chainhealth.com`];
    const caInfo = ccp.certificateAuthorities[peerInfo.caName];

    const tempPath = path.resolve(
      __dirname,
      "../fabric-artifacts",
      caInfo.tlsCACerts.path
    );
    const caTLSCAPath = String(tempPath).replace("src/", "");
    const caTLSCACerts = readPemFile(caTLSCAPath);
    const ca = new FabricCAServices(caInfo.url, {
      trustedRoots: caTLSCACerts,
      verify: false,
      caName: caInfo.caName,
    });

    // Create a new file system based wallet for managing identities.
    const wallet = new Wallet();
    await wallet.createWallet();

    const username = `peer${peerNumber}${organization}`;
    // Check if peer identity already exists in the wallet
    const identity = await wallet.getUser(username);
    if (identity) {
      console.log(
        `An identity for the peer "${username}" already exists in the wallet`
      );
      return;
    }

    await wallet.enrollToWallet(
      ca,
      organization,
      enrollmentID,
      enrollmentSecret,
      username
    );

    return `Successfully enrolled peer ${username} and imported it into the wallet`;
  } catch (error) {
    console.log(error);
  }
}

module.exports = enrollPeer;
