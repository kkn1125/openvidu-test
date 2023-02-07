require("dotenv").config(
  !!process.env.CONFIG ? { path: process.env.CONFIG } : {}
);
var express = require("express");
var bodyParser = require("body-parser");
var http = require("http");
var OpenVidu = require("openvidu-node-client").OpenVidu;
var cors = require("cors");
var app = express();
const axios = require("axios");

// Environment variable: PORT where the node server is listening
var SERVER_PORT = process.env.SERVER_PORT || 5000;
// Environment variable: URL where our OpenVidu server is listening
var OPENVIDU_URL = process.env.OPENVIDU_OTHER_URL || "http://localhost:4443";
// Environment variable: secret shared with our OpenVidu server
var OPENVIDU_SECRET = process.env.OPENVIDU_SECRET || "MY_SECRET";
console.log(SERVER_PORT, OPENVIDU_URL, OPENVIDU_SECRET);
// Enable CORS support
app.use(
  cors({
    origin: "*",
  })
);

const roomMap = new Map();

var server = http.createServer(app);
var openvidu = new OpenVidu(OPENVIDU_URL, OPENVIDU_SECRET);
// Allow application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));
// Allow application/json
app.use(bodyParser.json());

// Serve static resources if available
app.use(express.static(__dirname + "/public"));

// Serve application
server.listen(SERVER_PORT, () => {
  console.log("Application started on port: ", SERVER_PORT);
  console.warn("Application server connecting to OpenVidu at " + OPENVIDU_URL);
});

app.get("/api/sessions", async (req, res) => {
  // console.log(1);
  let sessions = openvidu.activeSessions;
  // console.log(JSON.stringify(sessions))
  // try {
  //   const result = await axios.get(OPENVIDU_URL + "/api/sessions", {
  //     headers: {
  //       Authorization: "Basic T1BFTlZJRFVBUFA6TVlfU0VDUkVU",
  //       "Content-Type": "application/json",
  //     },
  //   });
  // } catch (e) {
  //   console.log(e.message);
  // }
  // console.log(result.data);
  // console.log(data);
  res.send(JSON.stringify({}));
});

app.post("/api/sessions", async (req, res) => {
  console.log("온다!");

  // notion 참조 원복하려면 필요 토큰 조정함
  var session = await openvidu.createSession(req.body);
  res.send(session.sessionId);
});

app.post("/api/sessions/:sessionId/connections", async (req, res) => {
  var session = openvidu.activeSessions.find(
    (s) => s.sessionId === req.params.sessionId
  );
  let isAdmin = false;
  if (roomMap.get(req.params.sessionId) === true) {
    isAdmin = false;
  } else {
    if (roomMap.get(req.params.sessionId) === undefined) {
      roomMap.set(req.params.sessionId, true);
      isAdmin = true;
    }
  }

  if (!session) {
    res.status(404).send();
  } else {
    var connection = await session.createConnection(req.body);
    console.log(connection);

    console.log("connection", isAdmin);
    res.send(
      JSON.stringify({
        token: connection.token,
        isAdmin: isAdmin,
      })
    );
  }
});

process.on("uncaughtException", (err) => console.error(err));
