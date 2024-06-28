const connectToNetwork = require("./../Helpers/connectToNetwork");
const getUserPeer = require("./../Helpers/userPeer");

async function getHomePage(username) {
  try {
    const identity = getUserPeer(username);
    const contract = await connectToNetwork(identity);
    const result = await contract.submitTransaction("getHomePage", username);
    return result;
  } catch (error) {
    throw new Error(`Error: ${error}`);
  }
}

module.exports = getHomePage;
