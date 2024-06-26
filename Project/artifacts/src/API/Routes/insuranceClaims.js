const connectToNetwork = require("./../Helpers/connectToNetwork");
const getUserPeer = require("./../Helpers/userPeer");

async function getInsuranceClaims(username, patientId) {
  try {
    const identity = getUserPeer(username);
    const contract = await connectToNetwork(identity);
    const result = await contract.submitTransaction(
      "getInsuranceClaimsPageData",
      patientId
    );
    return result;
  } catch (error) {
    throw new Error(`Error: ${error.message}`);
  }
}

module.exports = getInsuranceClaims;
