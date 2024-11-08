const connectToNetwork = require("../Helpers/connectToNetwork");
const getUserPeer = require("../Helpers/userPeer");

async function confirmPrescriptionPharmacy(username, patientId, presId) {
  try {
    const identity = getUserPeer(username);
    const contract = await connectToNetwork(identity);
    const result = await contract.submitTransaction(
      "confirmPrescriptionSalePharmacy",
      username,
      patientId,
      presId
    );
    return result;
  } catch (error) {
    throw new Error(`Error occurred, can not confirm prescription!, ${error}`);
  }
}

module.exports = confirmPrescriptionPharmacy;
