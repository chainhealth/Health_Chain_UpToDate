var morgan = require("morgan");
const express = require("express");
const cors = require("cors");
var bodyParser = require("body-parser");
const getAllRecords = require("./Routes/getAllRecords");
const login = require("./Routes/login");
const getPrescriptionInformation = require("./Routes/prescription");
const getPatientInformation = require("./Routes/getPatientInfo");
const confirmPrescriptionPharmacy = require("./Routes/confirmPrescriptionPharmacy");
const confirmPrescriptionPatient = require("./Routes/confirmPrescriptionPatient");

const app = express();
const PORT = 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan("tiny"));
app.use(cors());

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
// app.get("/login", async (req, res) => {
//   const username = req.body.username;
//   const password = req.body.password;

//   if (!username || !password) {
//     return res.status(400).send("Missing required parameter(s)");
//   }

//   try {
//     const result = await login(username, password);
//     res.status(200).send(result);
//     console.log(result);
//   } catch (error) {
//     res.status(400).send(error.message);
//   }
// });

app.post("/login", async (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.status(400).send("Missing required parameter(s)");
  }
  try {
    const result = await login(username, password);
    res.status(200).send(result);
    console.log(result);
  } catch (error) {
    res.status(400).send(error.message);
  }
  // try {
    
  //   if (username === 'admin' && password === 'password') {
  //     res.status(200).json({ success: true, role: 'admin' });
  //   } else {
  //     res.status(401).json({ success: false, message: 'Invalid credentials' });
  //   }
  // } catch (error) {
  //   res.status(500).send(error.message);
  // }


});


// app.post('/login', async (req, res) => {
//   const username = req.body.username;
//   const password = req.body.password;

//   if (!username || !password) {
//     return res.status(400).send("Missing required parameter(s)");
//   }

//   try {
//     const result = await login(username, password);
//     res.status(200).send(result);
//   } catch (error) {
//     res.status(400).send(error.message);
//   }
// });





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
