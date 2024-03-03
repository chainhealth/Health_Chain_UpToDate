const fs = require("fs");

function readPemFile(filePath) {
  const certificate = fs.readFileSync(filePath, { encoding: "utf8" });
  return certificate;
}

module.exports = readPemFile;
