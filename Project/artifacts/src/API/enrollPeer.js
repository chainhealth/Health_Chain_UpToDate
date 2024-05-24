const FabricCAServices = require("fabric-ca-client");
const path = require("path");
const readPemFile = require("./Helpers/readPemFile");
const readCCP = require("./Helpers/readCCPFile");
const Wallet = require("./Helpers/wallet");

async function enrollPeer() {
  // load the network configuration
  let ccp = readCCP();
  const peers = Object.keys(ccp.peers);

  try {
    for (const peer of peers) {
      const organization = peer.split(".")[1];
      const peerNumber = peer.split(".")[0].match(/(\d+)/)[0];

      // Extract CA information for the peer
      const peerInfo = ccp.peers[`${peer}`];
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

      const username = `peer${peerNumber}.${organization}.chainhealth.com`;
      // Check if peer identity already exists in the wallet
      const identity = await wallet.getUser(username);
      if (identity) {
        console.log(
          `An identity for the peer "${username}" already exists in the wallet`
        );
        break;
      }

      await wallet.enrollToWallet(
        ca,
        organization,
        "admin",
        "adminpw",
        username
      );

      console.log(
        `Sucessfully added peer${peerNumber}.${organization} in wallet!`
      );
    }
  } catch (error) {
    throw new Error("Error occurred while adding peer: " + error);
  }
}

enrollPeer();
