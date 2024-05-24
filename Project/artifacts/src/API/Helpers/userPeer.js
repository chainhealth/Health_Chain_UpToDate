const readCCP = require("./readCCPFile");

function getUserPeer(username) {
  let connectionProfile = readCCP();

  if (!connectionProfile.users[username]) {
    throw new Error("Wronggggg");
  }
  return connectionProfile.users[username].peer;
}

module.exports = getUserPeer;
