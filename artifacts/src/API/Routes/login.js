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
    return result;
  } catch (error) {
    throw new Error(`Error during login: Invalid username or password!`);
  }
}

module.exports = login;
