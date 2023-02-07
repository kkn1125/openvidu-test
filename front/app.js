import * as OpenViduBrowser from "openvidu-browser";
import axios from "axios";

const { OpenVidu } = OpenViduBrowser;

var OV;
var session;

window.addEventListener("submit", (e) => {
  const target = e.target;
  if (target.id !== "otm") joinSession();
  else {
    joinOneToManyJoin();
  }
});

window.addEventListener("click", (e) => {
  if (e.target.id === "leave") {
    leaveSession();
  }
});

function joinOneToManyJoin() {
  var mySessionId = document.getElementById("sessionId2").value;

  OV = new OpenVidu();
  session = OV.initSession();

  session.on("streamCreated", function (event) {
    session.subscribe(event.stream, "subscriber");
  });

  getToken(mySessionId).then(({ data }) => {
    console.log("✅ token check", data);

    console.log("is admin?", data.isAdmin);
    session
      .connect(data.token)
      .then(() => {
        document.getElementById("session-header").innerText = mySessionId;
        document.getElementById("join").style.display = "none";
        document.getElementById("session").style.display = "block";

        if (data.isAdmin) {
          var publisher = OV.initPublisher("publisher");
          session.publish(publisher);
        } else {
          var publisher = OV.initPublisher("publisher");
          session.publish(publisher);
        }
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

function joinSession() {
  var mySessionId = document.getElementById("sessionId").value;

  OV = new OpenVidu();
  session = OV.initSession();

  session.on("streamCreated", function (event) {
    session.subscribe(event.stream, "subscriber");
  });

  getToken(mySessionId).then(({ data }) => {
    console.log("✅ token check", data);
    console.log(
      data.token.replace(
        /ws:\/\/localhost:4443/g,
        location.hostname === "localhost"
          ? "ws://localhost:4443"
          : "wss://df19-61-74-229-172.jp.ngrok.io"
      )
    );
    session
      .connect(
        data.token.replace(
          /ws:\/\/localhost:4443/g,
          location.hostname === "localhost"
            ? "ws://localhost:4443"
            : "wss://df19-61-74-229-172.jp.ngrok.io"
        )
      )
      .then(() => {
        console.log(123)
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
//778e-61-74-229-172.jp.ngrok.io
var APPLICATION_SERVER_URL =
  (location.hostname === "localhost" ? "http://" : "/proxy") +
  (location.hostname === "localhost" ? "localhost" : "") +
  (location.hostname === "localhost" ? ":" + 5000 : "") +
  "";
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
      data?.content?.forEach((content) => {
        document.getElementById("room-list").innerHTML = `<li>
          <span>${data.id}</span>
          <span>${new Date(data.createdAt).toLocaleString("ko")}</span>
        </li>`;
      });
    });
});

function getToken(mySessionId) {
  console.log(mySessionId);
  return createSession(mySessionId).then(({ data }) => {
    console.log(data);
    return createToken(data);
  });
}

function createSession(sessionId) {
  return axios.post(
    APPLICATION_SERVER_URL + `/api/sessions`,
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
  console.log(sessionId);
  return axios.post(
    APPLICATION_SERVER_URL + "/api/sessions/" + sessionId + "/connections",
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
