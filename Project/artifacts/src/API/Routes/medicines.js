const connectToNetwork = require("./../Helpers/connectToNetwork");
const getUserPeer = require("./../Helpers/userPeer");

async function getMedicineList(username) {
  try {
    const identity = getUserPeer(username);
    const contract = await connectToNetwork(identity);
    const result = await contract.submitTransaction("getMedicineList");
    return result;
  } catch (error) {
    throw new Error(`Error: ${error.message}`);
  }
}

module.exports = getMedicineList;
