const FabricCAServices = require("fabric-ca-client");
const readPemFile = require("./Helpers/readPemFile");
const readCCP = require("./Helpers/readCCPFile");
const Wallet = require("./Helpers/wallet");

async function enrollAdmin() {
  // Load the network configuration
  let ccp = readCCP();
  const organizations = Object.keys(ccp.organizations);

  try {
    for (let organization of organizations) {
      organization = organization.toLowerCase();
      const username = `${organization}-admin`;

      // Create a new CA client for interacting with the CA.
      const caInfo =
        ccp.certificateAuthorities[`ca.${organization}.chainhealth.com`];
      const caTLSCAPath = caInfo.tlsCACerts.path;
      const caTLSCACerts = readPemFile(caTLSCAPath);
      const ca = new FabricCAServices(
        caInfo.url,
        { trustedRoots: caTLSCACerts, verify: false },
        caInfo.caName
      );

      // Create a new file system based wallet for managing identities.
      const wallet = new Wallet();
      await wallet.createWallet();

      // Check to see if we've already enrolled the admin user.
      const identity = await wallet.getUser(username);
      if (identity) {
        console.log(
          `An identity for the admin user "${username}" already exists in the wallet`
        );
        break;
      }

      // Enroll the admin user, and import the new identity into the wallet.
      await wallet.enrollToWallet(
        ca,
        organization,
        "admin",
        "adminpw",
        username
      );
      console.log(
        `Successfully enrolled admin user "${username}" and imported it into the wallet`
      );
    }
  } catch (error) {
    throw new Error("Error while enrolling admins" + error);
  }
}

enrollAdmin();
