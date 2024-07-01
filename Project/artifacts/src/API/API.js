require("dotenv").config();

var morgan = require("morgan");
const express = require("express");
var bodyParser = require("body-parser");
const cors = require("cors"); // Import cors
const jwt = require("jsonwebtoken");
const login = require("./Routes/login");
const getHomePage = require("./Routes/homePage");
const getPrescriptionInformation = require("./Routes/prescription");
const getPatientInformation = require("./Routes/getPatientInfo");
const getInsuranceClaims = require("./Routes/insuranceClaims");
const confirmPrescriptionPharmacy = require("./Routes/confirmPrescriptionPharmacy");
const confirmPrescriptionPatient = require("./Routes/confirmPrescriptionPatient");
const writePrescription = require("./Routes/writePrescription");
const getMedicineList = require("./Routes/medicines");

const app = express();
const PORT = 3000;

app.use(cors()); // Use cors middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan("tiny"));

// Authenticate the token (Valid or not valid)
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

// Generate Token
function generateAccessToken(user) {
  return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "30m" });
}

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
  const authenticationResults = authenticateToken(req);
  if (authenticationResults === false) res.status(401).send("Invalid Token!");
  else {
    try {
      const username = authenticationResults.username;
      const homePage = await getHomePage(username);
      res.status(200).send(homePage);
    } catch (error) {
      res.status(400).send(error.message);
    }
  }
});

app.post("/prescription", async (req, res) => {
  const prescriptionId = req.body.prescriptionId;

  if (!prescriptionId) {
    return res.status(400).send("Missing required parameter(s)");
  }

  const authenticationResults = authenticateToken(req);
  if (authenticationResults === false) res.status(401).send("Invalid Token!");
  else {
    const username = authenticationResults.username;
    let patientUsername = null;
    if (username.includes("patient")) {
      patientUsername = username;
    } else {
      patientUsername = req.body.patientUsername;
      if (!patientUsername) {
        return res.status(400).send("Missing required parameter(s)");
      }
    }
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
  const patientId = req.query.patientId;

  if (!patientId) {
    return res.status(400).send("Missing required parameter(s)");
  }

  const authenticationResults = authenticateToken(req);
  if (authenticationResults === false) res.status(401).send("Invalid Token!");
  else {
    const username = authenticationResults.username;
    try {
      const result = await getPatientInformation(username, patientId);
      res.status(200).send(result);
    } catch (error) {
      res.status(400).send(error.message);
    }
  }
});

app.get("/insuranceClaims", async (req, res) => {
  const patientId = req.body.patientId;

  if (!patientId) {
    return res.status(400).send("Missing required parameter(s)");
  }

  const authenticationResults = authenticateToken(req);
  if (authenticationResults === false) res.status(401).send("Invalid Token!");
  else {
    const username = authenticationResults.username;
    try {
      const result = await getInsuranceClaims(username, patientId);
      res.status(200).send(result);
    } catch (error) {
      res.status(400).send(error.message);
    }
  }
});

app.post("/confirmPrescriptionPharmacy", async (req, res) => {
  const patientId = req.body.patientId;
  const presId = req.body.prescriptionId;

  if (!patientId || !presId) {
    return res.status(400).send("Missing required parameter(s)");
  }

  const authenticationResults = authenticateToken(req);
  if (authenticationResults === false) res.status(401).send("Invalid Token!");
  else {
    const username = authenticationResults.username;
    try {
      const result = await confirmPrescriptionPharmacy(
        username,
        patientId,
        presId
      );
      res.status(200).json({ result });
    } catch (error) {
      res.status(400).send(error.message);
    }
  }
});

app.post("/confirmPrescriptionPatient", async (req, res) => {
  const presId = req.body.prescriptionId;

  if (!presId) {
    return res.status(400).send("Missing required parameter(s)");
  }

  const authenticationResults = authenticateToken(req);
  if (authenticationResults === false) res.status(401).send("Invalid Token!");
  else {
    const username = authenticationResults.username;
    try {
      const result = await confirmPrescriptionPatient(username, presId);
      res.status(200).json({ result });
    } catch (error) {
      res.status(400).send(error.message);
    }
  }
});

app.post("/writePrescription", async (req, res) => {
  const patientId = req.body.patientId;
  const prescription = req.body.prescription;

  if (!patientId || !prescription) {
    return res.status(400).send("Missing required parameter(s)");
  }

  const authenticationResults = authenticateToken(req);
  if (authenticationResults === false) res.status(401).send("Invalid Token!");
  else {
    const username = authenticationResults.username;
    try {
      const result = await writePrescription(
        username,
        patientId,
        JSON.stringify(prescription)
      );
      res.status(200).send(`result: ${result}`);
    } catch (error) {
      res.status(400).send(error.message);
    }
  }
});

app.get("/medicines", async (req, res) => {
  const authenticationResults = authenticateToken(req);
  if (authenticationResults === false) res.status(401).send("Invalid Token!");
  else {
    const username = authenticationResults.username;
    try {
      const medicineNames = await getMedicineList(username);
      res.status(200).json({ medicineNames });
    } catch (error) {
      res.status(400).send(error.message);
    }
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
