const connectToNetwork = require("./../Helpers/connectToNetwork");

async function getPatientRecord(identity, firstName, lastName, email) {
  const contract = await connectToNetwork(identity);
  const result = await contract.submitTransaction(
    "getPatientRecord",
    firstName,
    lastName,
    email
  );
  console.log("hello");
  return result;
}

module.exports = getPatientRecord;
