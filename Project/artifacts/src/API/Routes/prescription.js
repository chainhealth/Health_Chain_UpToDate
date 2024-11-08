const connectToNetwork = require("./../Helpers/connectToNetwork");
const getUserPeer = require("./../Helpers/userPeer");

async function getPrescriptionInformation(
  username,
  patientUsername,
  prescriptionId
) {
  try {
    const identity = getUserPeer(username);
    const contract = await connectToNetwork(identity);
    const result = await contract.submitTransaction(
      "getPrescriptionInformation",
      patientUsername,
      prescriptionId
    );
    return result;
  } catch (error) {
    throw new Error(`No presction found with the entered id!`);
  }
}

module.exports = getPrescriptionInformation;
