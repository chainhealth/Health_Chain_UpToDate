const connectToNetwork = require("./../Helpers/connectToNetwork");
const getUserPeer = require("./../Helpers/userPeer");

async function login(username, password) {
  try {
    const identity = getUserPeer(username);
    const contract = await connectToNetwork(identity);
    const result = await contract.submitTransaction(
      "login",
      username,
      password
    );

    // Parse and return the result if successful
    return JSON.parse(result.toString());
  } catch (error) {
    // Handle specific error cases if needed
    if (error.message.includes('Identity not found')) {
      throw new Error(`Error during login: Identity not found for ${username}`);
    } else if (error.message.includes('Error connecting to network')) {
      throw new Error(`Error during login: Unable to connect to network`);
    } else {
      throw new Error(`Error during login: ${error.message}`);
    }
  }
}


module.exports = login;
