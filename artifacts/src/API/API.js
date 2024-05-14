var morgan = require("morgan");
const express = require("express");
var bodyParser = require("body-parser");
const enrollAdmin = require("./enrollAdmin");
const enrollPeer = require("./enrollPeer");

const app = express();
const PORT = 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan("tiny"));

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
