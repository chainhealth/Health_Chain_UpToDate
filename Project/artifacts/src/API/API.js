const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const getAllRecords = require("./Routes/getAllRecords");
const login = require("./Routes/login");
const getPrescriptionInformation = require("./Routes/prescription");
const getPatientInformation = require("./Routes/getPatientInfo");
const confirmPrescriptionPharmacy = require("./Routes/confirmPrescriptionPharmacy");
const confirmPrescriptionPatient = require("./Routes/confirmPrescriptionPatient");

const app = express();
const PORT = 3000;
const SECRET_KEY = "your_secret_key"; // Use a secure key and store it safely

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors({ origin: 'http://localhost:4200', credentials: true }));
app.use(cookieParser());
app.use(session({
  secret: SECRET_KEY,
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: false, // Set to true if using HTTPS
    sameSite: 'lax', // 'strict' or 'none' if using cross-site requests
  }
}));

// Middleware to verify JWT
const authenticateJWT = (req, res, next) => {
  const token = req.cookies.auth_token;

  if (token) {
    jwt.verify(token, SECRET_KEY, (err, user) => {
      if (err) {
        return res.sendStatus(403);
      }
      req.user = user;
      next();
    });
  } else {
    res.sendStatus(401);
  }
};

app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).send("Missing required parameter(s)");
  }

  try {
    const result = await login(username, password); // Assume this function validates the user and returns user data
    console.log(result);

    if (result ) {
      const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: '1h' });
      res.cookie('auth_token', token, { httpOnly: true, sameSite: 'lax' });
      res.status(200).send(result);
    } else {
      res.status(400).send("Invalid credentials");
    }
  } catch (error) {
    res.status(400).send(error.message);
  }
});

app.get("/prescription", async (req, res) => {
  const username = req.body.username;
  const patientUsername = req.body.patientUsername;
  const prescriptionId = req.body.prescriptionId;

  if (!username || !prescriptionId) {
    return res.status(400).send("Missing required parameter(s)");
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
});

app.get("/searchPatient", async (req, res) => {
  const username = req.body.username;
  const patientId = req.body.patientId;

  if (!username || !patientId) {
    return res.status(400).send("Missing required parameter(s)");
  }

  try {
    const result = await getPatientInformation(username, patientId);
    res.status(200).send(result);
  } catch (error) {
    res.status(400).send(error.message);
  }
});

app.post("/confirmPrescriptionPharmacy", async (req, res) => {
  const username = req.body.username;
  const patientId = req.body.patientId;
  const presId = req.body.prescriptionId;

  if (!username || !patientId || !presId) {
    return res.status(400).send("Missing required parameter(s)");
  }

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
});

app.post("/confirmPrescriptionPatient", async (req, res) => {
  const username = req.body.username;
  const presId = req.body.prescriptionId;

  if (!username || !presId) {
    return res.status(400).send("Missing required parameter(s)");
  }

  try {
    const result = await confirmPrescriptionPatient(username, presId);
    res.status(200).send(result);
  } catch (error) {
    res.status(400).send(error.message);
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});