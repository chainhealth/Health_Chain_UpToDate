const connectToNetwork = require("../Helpers/connectToNetwork");
const getUserPeer = require("../Helpers/userPeer");

async function confirmPrescriptionPatient(username, presId) {
  try {
    const identity = getUserPeer(username);
    const contract = await connectToNetwork(identity);
    const result = await contract.submitTransaction(
      "confirmPrescriptionSalePatient",
      username,
      presId
    );
    return result;
  } catch (error) {
    throw new Error(`Error occurred, can not confirm prescription!, ${error}`);
  }
}

module.exports = confirmPrescriptionPatient;
