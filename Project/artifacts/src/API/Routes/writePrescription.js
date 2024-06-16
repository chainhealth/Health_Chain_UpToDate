const connectToNetwork = require("../Helpers/connectToNetwork");
const getUserPeer = require("../Helpers/userPeer");

async function writePrescription(username, patiendId, prescription) {
  try {
    const identity = getUserPeer(username);
    const contract = await connectToNetwork(identity);
    const result = await contract.submitTransaction(
      "writePatientPrescription",
      patiendId,
      username,
      prescription
    );
    return result;
  } catch (error) {
    throw new Error(`Error occurred, can not write prescription!, ${error}`);
  }
}

module.exports = writePrescription;
