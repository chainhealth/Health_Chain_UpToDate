const { Gateway, Wallets } = require("fabric-network");
const FabricCAServices = require("fabric-ca-client");
const fs = require("fs");
const path = require("path");
var morgan = require("morgan");
const express = require("express");
const app = express();

const port = 3000;

function readPemFile(filePath) {
  const certificate = fs.readFileSync(filePath, { encoding: "utf8" });
  return certificate;
}

async function enrollPeer() {
  try {
    // load the network configuration
    const ccpPath = path.resolve(
      __dirname,
      "fabric-artifacts",
      "connection-profile.json"
    );
    let ccp = JSON.parse(fs.readFileSync(ccpPath, "utf8"));

    // Extract CA information for the peer
    const peerInfo = ccp.peers["peer0.pharmacy.chainhealth.com"];
    const caInfo = ccp.certificateAuthorities[peerInfo.caName];

    const tempPath = path.resolve(
      __dirname,
      "fabric-artifacts",
      caInfo.tlsCACerts.path
    );
    const caTLSCAPath = String(tempPath).replace("src/", "");
    const caTLSCACerts = fs.readFileSync(caTLSCAPath, "utf8");
    const ca = new FabricCAServices(caInfo.url, {
      trustedRoots: caTLSCACerts,
      verify: false,
      caName: caInfo.caName,
    });

    // Create a new file system based wallet for managing identities.
    const walletPath = path.join(process.cwd(), "wallet");
    const wallet = await Wallets.newFileSystemWallet(walletPath);

    // Check if peer identity already exists in the wallet
    const identity = await wallet.get("peer0");
    if (identity) {
      console.log(
        'An identity for the peer "peer0" already exists in the wallet'
      );
      return;
    }

    console.log("Error test 1");
    const enrollment = await ca.enroll({
      enrollmentID: "admin",
      enrollmentSecret: "adminpw",
    });
    console.log("Error test 2");
    const x509Identity = {
      credentials: {
        certificate: enrollment.certificate,
        privateKey: enrollment.key.toBytes(),
      },
      mspId: "PharmacyMSP", // Update this with your actual MSP ID
      type: "X.509",
    };
    await wallet.put("peer0", x509Identity);
    console.log(
      'Successfully enrolled peer "peer0" and imported it into the wallet'
    );
  } catch (error) {
    console.log(error);
  }
}

async function enrollAdmin() {
  try {
    // load the network configuration
    const ccpPath = path.resolve(
      __dirname,
      "fabric-artifacts",
      "connection-profile.json"
    );
    let ccp = JSON.parse(fs.readFileSync(ccpPath, "utf8"));

    // Create a new CA client for interacting with the CA.
    const caInfo = ccp.certificateAuthorities["ca.pharmacy.chainhealth.com"];
    const caTLSCAPath = caInfo.tlsCACerts.path;
    const caTLSCACerts = readPemFile(caTLSCAPath);
    const ca = new FabricCAServices(
      caInfo.url,
      { trustedRoots: caTLSCACerts, verify: false },
      caInfo.caName
    );

    // Create a new file system based wallet for managing identities.
    const walletPath = path.join(process.cwd(), "wallet");
    const wallet = await Wallets.newFileSystemWallet(walletPath);

    // Check to see if we've already enrolled the admin user.
    const identity = await wallet.get("admin");
    if (identity) {
      console.log(
        'An identity for the admin user "admin" already exists in the wallet'
      );
      return;
    }

    // Enroll the admin user, and import the new identity into the wallet.
    const enrollment = await ca.enroll({
      enrollmentID: "admin",
      enrollmentSecret: "adminpw",
    });
    const x509Identity = {
      credentials: {
        certificate: enrollment.certificate,
        privateKey: enrollment.key.toBytes(),
      },
      mspId: "PharmacyMSP",
      type: "X.509",
    };
    await wallet.put("admin", x509Identity);
    console.log(
      'Successfully enrolled admin user "admin" and imported it into the wallet'
    );
  } catch (error) {
    console.log(error);
  }
}

async function connectToNetwork() {
  // Load the network configuration
  let connectionProfile = JSON.parse(
    fs.readFileSync(
      path.resolve(__dirname, "fabric-artifacts", "connection-profile.json"),
      "utf8"
    )
  );

  // Create a new file system based wallet for managing identities.
  const walletPath = path.join(process.cwd(), "wallet");
  const wallet = await Wallets.newFileSystemWallet(walletPath);

  // Create a new gateway for connecting to our peer node.
  const gateway = new Gateway();
  await gateway.connect(connectionProfile, {
    wallet,
    identity: "peer0",
    discovery: { enabled: true, asLocalhost: true },
  });

  // Get the network (channel) our contract is deployed to.
  const network = await gateway.getNetwork("chainhealth-channel");

  // Get the contract from the network.
  const contract = network.getContract("chainHeath-ChainCode");

  return contract;
}

async function getAllRecords(contract) {
  const result = await contract.submitTransaction("getAllRecords");
  return result;
}

app.use(morgan("tiny"));

app.get("/getAllRecords", async (req, res) => {
  try {
    await enrollAdmin();
    await enrollPeer();
    const contract = await connectToNetwork();
    const result = await getAllRecords(contract);
    res.send(result.toString());
  } catch (error) {
    console.error(`Failed to evaluate transaction: ${error}`);
    res.status(500).json({ error: error.toString() });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
