const connectToNetwork = require("./../Helpers/connectToNetwork");
const getUserPeer = require("../Helpers/userPeer");

async function getAllRecords(username) {
  const identity = getUserPeer(username);
  const contract = await connectToNetwork(identity);
  const result = await contract.submitTransaction("getAllRecords");
  return result;
}

module.exports = getAllRecords;
