import * as OpenViduBrowser from "openvidu-browser";
import axios from "axios";

const { OpenVidu } = OpenViduBrowser;

var OV;
var session;

window.addEventListener("submit", (e) => {
  const target = e.target;
  joinSession();
});

window.addEventListener("click", (e) => {
  if (e.target.id === "leave") {
    leaveSession();
  }
});

function joinSession() {
  var mySessionId = document.getElementById("sessionId").value;

  OV = new OpenVidu();
  session = OV.initSession();

  session.on("streamCreated", function (event) {
    session.subscribe(event.stream, "subscriber");
  });

  getToken(mySessionId).then(({ data }) => {
    console.log("✅ token check", data.token);
    session
      .connect(data.token.replace(/192\.168\.88\.234/g, "localhost"))
      .then(() => {
        document.getElementById("session-header").innerText = mySessionId;
        document.getElementById("join").style.display = "none";
        document.getElementById("session").style.display = "block";

        var publisher = OV.initPublisher("publisher");
        session.publish(publisher);
      })
      .catch((error) => {
        console.log(
          "There was an error connecting to the session:",
          error.code,
          error.message
        );
      });
  });
}

function leaveSession() {
  session.disconnect();
  document.getElementById("join").style.display = "block";
  document.getElementById("session").style.display = "none";
}

window.onbeforeunload = function () {
  if (session) session.disconnect();
};

/**
 * --------------------------------------------
 * GETTING A TOKEN FROM YOUR APPLICATION SERVER
 * --------------------------------------------
 * The methods below request the creation of a Session and a Token to
 * your application server. This keeps your OpenVidu deployment secure.
 *
 * In this sample code, there is no user control at all. Anybody could
 * access your application server endpoints! In a real production
 * environment, your application server must identify the user to allow
 * access to the endpoints.
 *
 * Visit https://docs.openvidu.io/en/stable/application-server to learn
 * more about the integration of OpenVidu in your application server.
 */

var APPLICATION_SERVER_URL = "/api/openvidu";
const SECRET = "Basic T1BFTlZJRFVBUFA6TVlfU0VDUkVU";

// axios.defaults.withCredentials = true;

window.addEventListener("load", () => {
  // console.log(`${APPLICATION_SERVER_URL}/api/sessions`);
  axios
    .get(`${APPLICATION_SERVER_URL}/api/sessions`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: SECRET,
      },
    })
    .then((result) => {
      const { data } = result;
      console.log(data);
    });
});

function getToken(mySessionId) {
  return createSession(mySessionId).then(({ data }) =>
    createToken(data.sessionId)
  );
}

function createSession(sessionId) {
  return axios.post(
    APPLICATION_SERVER_URL + "/api/sessions",
    {
      customSessionId: sessionId,
    },
    {
      headers: {
        "Content-Type": "application/json",
        Autorization: SECRET,
      },
    }
  );
}

function createToken(sessionId) {
  return axios.post(
    APPLICATION_SERVER_URL + "/api/sessions/" + sessionId + "/connection",
    JSON.stringify({ sessionId }),
    {
      headers: {
        "Content-Type": "application/json",
        Autorization: SECRET,
      },
    }
  );
  // return new Promise((resolve, reject) => {
  //   $.ajax({
  //     type: "POST",
  //     url:
  //       APPLICATION_SERVER_URL + "/api/sessions/" + sessionId + "/connections",
  //     data: JSON.stringify({}),
  //     headers: { "Content-Type": "application/json" },
  //     success: (response) => resolve(response), // The token
  //     error: (error) => reject(error),
  //   });
  // });
}
