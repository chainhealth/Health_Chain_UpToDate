const connectToNetwork = require("../Helpers/connectToNetwork");

async function writePrescription(
  identity,
  firstName,
  lastName,
  email,
  prescription
) {
  const contract = await connectToNetwork(identity);
  const result = await contract.submitTransaction(
    "writePatientPrescription",
    firstName,
    lastName,
    email,
    prescription
  );
  return result;
}

module.exports = writePrescription;
