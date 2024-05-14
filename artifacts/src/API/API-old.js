var morgan = require("morgan");
const express = require("express");
var bodyParser = require("body-parser");
const enrollAdmin = require("./enrollAdmin");
const enrollPeer = require("./enrollPeer");
const getAllRecords = require("./Routes/getAllRecords");
const queryRecord = require("./Routes/queryRecords");
const getPatientRecord = require("./Routes/getPatientRecord");
const writePrescription = require("./Routes/writePrescription");
const readPrescription = require("./Routes/readPrescription");

const app = express();
const PORT = 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan("tiny"));

app.post("/addAdmin", async (req, res) => {
  const organization = req.body.organization;
  const enrollmentID = req.body.enrollmentID;
  const enrollmentSecret = req.body.enrollmentSecret;
  const username = req.body.username;

  if (!organization || !enrollmentID || !enrollmentSecret || !username) {
    if (!organization || !peerNumber || !enrollmentID || !enrollmentSecret) {
      return res.status(400).send("Missing required parameter(s)");
    }
  }

  try {
    const respond = await enrollAdmin(
      organization,
      enrollmentID,
      enrollmentSecret,
      username
    );
    res.status(200).send(respond);
  } catch (error) {
    res.status(400).send(error);
  }
});

app.post("/addPeer", async (req, res) => {
  const organization = req.body.organization;
  const peerNumber = req.body.peerNumber;
  const enrollmentID = req.body.enrollmentID;
  const enrollmentSecret = req.body.enrollmentSecret;

  if (
    !organization ||
    !peerNumber.length === 0 ||
    !enrollmentID ||
    !enrollmentSecret
  ) {
    return res.status(400).send("Missing required parameter(s)");
  }

  try {
    const respond = await enrollPeer(
      organization,
      peerNumber,
      enrollmentID,
      enrollmentSecret
    );
    res.status(200).send(respond);
  } catch (error) {
    res.status(400).send(error);
  }
});

app.get("/getAllRecords", async (req, res) => {
  const identity = req.body.identity;

  if (!identity) {
    return res.status(400).send("Missing required parameter(s)");
  }

  try {
    const result = await getAllRecords(identity);
    res.status(200).send(result);
  } catch (error) {
    res.status(400).send(error);
  }
});

app.get("/queryRecord", async (req, res) => {
  const identity = req.body.identity;
  const patientNumber = req.body.patientNumber;

  if (!patientNumber || !identity) {
    return res.status(400).send("Missing required parameter(s)");
  }
  try {
    const result = await queryRecord(identity, patientNumber);
    res.status(200).send(result);
  } catch (error) {
    res.status(400).send(error);
  }
});

app.get("/patientRecord", async (req, res) => {
  const identity = req.body.identity;
  const firstName = req.body.firstName;
  const lastName = req.body.lastName;
  const email = req.body.email;

  if (!identity || !firstName || !lastName || !email) {
    return res.status(400).send("Missing required parameter(s)");
  }

  try {
    const result = await getPatientRecord(identity, firstName, lastName, email);
    res.status(200).send(result);
  } catch (error) {
    res.status(400).send(error);
  }
});

app.post("/writePrescription", async (req, res) => {
  const identity = req.body.identity;
  const firstName = req.body.firstName;
  const lastName = req.body.lastName;
  const email = req.body.email;
  const prescription = req.body.prescription;

  if (!identity || !firstName || !lastName || !email || !prescription) {
    return res.status(400).send("Missing required parameter(s)");
  }

  try {
    const result = await writePrescription(
      identity,
      firstName,
      lastName,
      email,
      prescription
    );
    res.status(200).send(result);
  } catch (error) {
    res.status(400).send(error);
  }
});

app.get("/readPrescription", async (req, res) => {
  const identity = req.body.identity;
  const firstName = req.body.firstName;
  const lastName = req.body.lastName;
  const email = req.body.email;

  if (!identity || !firstName || !lastName || !email) {
    return res.status(400).send("Missing required parameter(s)");
  }

  try {
    const result = await readPrescription(identity, firstName, lastName, email);
    res.status(200).send(result);
  } catch (error) {
    res.status(400).send(error);
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
