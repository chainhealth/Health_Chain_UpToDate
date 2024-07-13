const connectToNetwork = require("./../Helpers/connectToNetwork");
const getUserPeer = require("./../Helpers/userPeer");

async function getMedicineList(username) {
  try {
    const identity = getUserPeer(username);
    const contract = await connectToNetwork(identity);
    const result = await contract.submitTransaction("getMedicineList");
    const resultString = result.toString('utf8'); // Convert buffer to string
    const resultJson = JSON.parse(resultString); // Parse string to JSON if it is in JSON format
    return resultJson;
  } catch (error) {
    throw new Error(`Error: ${error.message}`);
  }
}

module.exports = getMedicineList;
