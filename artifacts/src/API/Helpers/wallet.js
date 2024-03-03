const { Wallets } = require("fabric-network");
const path = require("path");

class Wallet {
  constructor() {
    this.wallet = null;
  }

  async createWallet() {
    const walletPath = path.join(process.cwd(), "wallet");
    this.wallet = await Wallets.newFileSystemWallet(walletPath);
  }

  getWallet() {
    return this.wallet;
  }

  async getUser(username) {
    return await this.wallet.get(username);
  }

  async enrollToWallet(
    ca,
    organization,
    enrollmentID,
    enrollmentSecret,
    username
  ) {
    // Enroll the admin user, and import the new identity into the wallet.
    const enrollment = await ca.enroll({
      enrollmentID: enrollmentID,
      enrollmentSecret: enrollmentSecret,
    });
    const x509Identity = {
      credentials: {
        certificate: enrollment.certificate,
        privateKey: enrollment.key.toBytes(),
      },
      mspId: `${
        organization.charAt(0).toUpperCase() + organization.slice(1)
      }MSP`,
      type: "X.509",
    };
    await this.wallet.put(username, x509Identity);
  }
}

module.exports = Wallet;
