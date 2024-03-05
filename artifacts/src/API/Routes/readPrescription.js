const connectToNetwork = require("./../Helpers/connectToNetwork");

async function readPrescription(identity, firstName, lastName, email) {
  const contract = await connectToNetwork(identity);
  const result = await contract.submitTransaction(
    "readPatientPrescription",
    firstName,
    lastName,
    email
  );
  return result;
}

module.exports = readPrescription;
