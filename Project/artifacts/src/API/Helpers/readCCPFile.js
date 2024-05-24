const fs = require("fs");
const path = require("path");

function readCCP() {
  const ccpPath = path.resolve(
    __dirname,
    "../fabric-artifacts",
    "connection-profile.json"
  );
  let ccp = JSON.parse(fs.readFileSync(ccpPath, "utf8"));
  return ccp;
}

module.exports = readCCP;
