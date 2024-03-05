const connectToNetwork = require("./../Helpers/connectToNetwork");

async function queryRecord(identity, patientNumber) {
  const contract = await connectToNetwork(identity);
  const result = await contract.submitTransaction("queryRecord", patientNumber);
  return result;
}

module.exports = queryRecord;
