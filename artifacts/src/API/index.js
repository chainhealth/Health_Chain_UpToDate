const { Gateway, Wallets } = require("fabric-network");
const FabricCAServices = require("fabric-ca-client");
const fs = require("fs");
const path = require("path");
const express = require("express");
const app = express();

const port = 3000;

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
    const caTLSCACerts = caInfo.tlsCACerts.pem;
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
    identity: "admin",
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

app.get("/getAllRecords", async (req, res) => {
  try {
    await enrollAdmin();
    const contract = await connectToNetwork();
    const result = await getAllRecords(contract);
    res.send(result.toString());
    console.log("Sent data!");
  } catch (error) {
    console.error(`Failed to evaluate transaction: ${error}`);
    res.status(500).json({ error: error.toString() });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
