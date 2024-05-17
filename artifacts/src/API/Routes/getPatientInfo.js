const connectToNetwork = require("./../Helpers/connectToNetwork");
const getUserPeer = require("./../Helpers/userPeer");

async function getPatientInfo(username, patientId) {
  try {
    const identity = getUserPeer(username);
    const contract = await connectToNetwork(identity);
    const result = await contract.submitTransaction(
      "getPatientInfo",
      patientId
    );
    return result;
  } catch (error) {
    throw new Error("No patient found with the entered id!" + error);
  }
}

module.exports = getPatientInfo;
