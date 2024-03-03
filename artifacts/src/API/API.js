var morgan = require("morgan");
const express = require("express");
var bodyParser = require("body-parser");
const enrollAdmin = require("./Routes/enrollAdmin");
const enrollPeer = require("./Routes/enrollPeer");
const getAllRecords = require("./Routes/getAllRecords");

const app = express();
const PORT = 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan("tiny"));

app.get("/addAdmin", async (req, res) => {
  const organization = req.body.organization;
  const enrollmentID = req.body.enrollmentID;
  const enrollmentSecret = req.body.enrollmentSecret;
  const username = req.body.username;
  const respond = await enrollAdmin(
    organization,
    enrollmentID,
    enrollmentSecret,
    username
  );
  res.status(200).send(respond);
});

app.get("/addPeer", async (req, res) => {
  const organization = req.body.organization;
  const peerNumber = req.body.peerNumber;
  const enrollmentID = req.body.enrollmentID;
  const enrollmentSecret = req.body.enrollmentSecret;
  const respond = await enrollPeer(
    organization,
    peerNumber,
    enrollmentID,
    enrollmentSecret
  );
  res.status(200).send(respond);
});

app.get("/getAllRecords", async (req, res) => {
  const identity = req.body.identity;
  console.log(identity);
  const result = await getAllRecords(identity);
  res.status(200).send(result);
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
