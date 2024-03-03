const connectToNetwork = require("./../Helpers/connectToNetwork");

async function getAllRecords(identity) {
  const contract = await connectToNetwork(identity);
  const result = await contract.submitTransaction("getAllRecords");
  return result;
}

module.exports = getAllRecords;
