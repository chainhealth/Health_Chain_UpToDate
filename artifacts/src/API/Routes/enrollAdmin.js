const FabricCAServices = require("fabric-ca-client");
const readPemFile = require("./../Helpers/readPemFile");
const readCCP = require("./../Helpers/readCCPFile");
const Wallet = require("./../Helpers/wallet");

async function enrollAdmin(
  organization,
  enrollmentID,
  enrollmentSecret,
  username
) {
  try {
    // load the network configuration
    let ccp = readCCP();

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
      return;
    }

    // Enroll the admin user, and import the new identity into the wallet.
    await wallet.enrollToWallet(
      ca,
      organization,
      enrollmentID,
      enrollmentSecret,
      username
    );
    return `Successfully enrolled admin user "${username}" and imported it into the wallet`;
  } catch (error) {
    console.log(error);
  }
}

module.exports = enrollAdmin;
