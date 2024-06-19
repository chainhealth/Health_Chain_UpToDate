require("dotenv").config();

var morgan = require("morgan");
const express = require("express");
var bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const getAllRecords = require("./Routes/getAllRecords");
const login = require("./Routes/login");
const getHomePage = require("./Routes/homePage");
const getPrescriptionInformation = require("./Routes/prescription");
const getPatientInformation = require("./Routes/getPatientInfo");
const confirmPrescriptionPharmacy = require("./Routes/confirmPrescriptionPharmacy");
const confirmPrescriptionPatient = require("./Routes/confirmPrescriptionPatient");
const writePrescription = require("./Routes/writePrescription");

const app = express();
const PORT = 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan("tiny"));

function authenticateToken(req) {
  var authenticationResult = false;
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return false;

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (!err) authenticationResult = user;
  });
  return authenticationResult;
}

function generateAccessToken(user) {
  return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "30m" });
}

// TODO: remove
app.get("/getAllRecords", async (req, res) => {
  const identity = req.body.username;

  if (!identity) {
    return res.status(400).send("Missing required parameter(s)");
  }

  try {
    const result = await getAllRecords(identity);
    res.status(200).send(result);
  } catch (error) {
    res.status(400).send(error.message);
  }
});

// Return home page data for user and insurace
// Return true for pharmacy and doctor
// Return status 200 if successful, 400 if not
app.post("/login", async (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.status(400).send("Missing required parameter(s)");
  }

  try {
    await login(username, password);
    const accessToken = generateAccessToken({ username });
    res.status(200).send({ accessToken });
  } catch (error) {
    res.status(400).send(error.message);
  }
});

app.get("/homePage", async (req, res) => {
  const username = req.body.username;

  if (!username) {
    return res.status(400).send("Missing required parameter(s)");
  }

  const authenticationResults = authenticateToken(req);
  if (authenticationResults === false) res.status(401).send("Invalid Token!");
  else {
    try {
      const homePage = await getHomePage(username);
      res.status(200).send(homePage);
    } catch (error) {
      res.status(400).send(error.message);
    }
  }
});

app.get("/prescription", async (req, res) => {
  const username = req.body.username;
  const patientUsername = req.body.patientUsername;
  const prescriptionId = req.body.prescriptionId;

  if (!username || !prescriptionId) {
    return res.status(400).send("Missing required parameter(s)");
  }

  const authenticationResults = authenticateToken(req);
  if (authenticationResults === false) res.status(401).send("Invalid Token!");
  else {
    try {
      const result = await getPrescriptionInformation(
        username,
        patientUsername,
        prescriptionId
      );
      res.status(200).send(result);
    } catch (error) {
      res.status(400).send(error.message);
    }
  }
});

app.get("/searchPatient", async (req, res) => {
  const username = req.body.username;
  const patientId = req.body.patientId;

  if (!username || !patientId) {
    return res.status(400).send("Missing required parameter(s)");
  }

  const authenticationResults = authenticateToken(req);
  if (authenticationResults === false) res.status(401).send("Invalid Token!");
  else {
    try {
      const result = await getPatientInformation(username, patientId);
      res.status(200).send(result);
    } catch (error) {
      res.status(400).send(error.message);
    }
  }
});

app.post("/confirmPrescriptionPharmacy", async (req, res) => {
  const username = req.body.username;
  const patientId = req.body.patientId;
  const presId = req.body.prescriptionId;

  if (!username || !patientId || !presId) {
    return res.status(400).send("Missing required parameter(s)");
  }

  const authenticationResults = authenticateToken(req);
  if (authenticationResults === false) res.status(401).send("Invalid Token!");
  else {
    try {
      const result = await confirmPrescriptionPharmacy(
        username,
        patientId,
        presId
      );
      res.status(200).send(result);
    } catch (error) {
      res.status(400).send(error.message);
    }
  }
});

app.post("/confirmPrescriptionPatient", async (req, res) => {
  const username = req.body.username;
  const presId = req.body.prescriptionId;

  if (!username || !presId) {
    return res.status(400).send("Missing required parameter(s)");
  }

  const authenticationResults = authenticateToken(req);
  if (authenticationResults === false) res.status(401).send("Invalid Token!");
  else {
    try {
      const result = await confirmPrescriptionPatient(username, presId);
      res.status(200).send(result);
    } catch (error) {
      res.status(400).send(error.message);
    }
  }
});

app.post("/writePrescription", async (req, res) => {
  const username = req.body.username;
  const patientId = req.body.patientId;
  const prescription = req.body.prescription;

  if (!username || !patientId || !prescription) {
    return res.status(400).send("Missing required parameter(s)");
  }

  const authenticationResults = authenticateToken(req);
  if (authenticationResults === false) res.status(401).send("Invalid Token!");
  else {
    try {
      const result = await writePrescription(
        username,
        patientId,
        JSON.stringify(prescription)
      );
      res.status(200).send(result);
    } catch (error) {
      res.status(400).send(error.message);
    }
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
