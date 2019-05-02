// const fs = require("fs");
const http = require("http");
// const https = require("https");
const WebSocket = require("ws");

// if (process.env.NODE_ENV === "production") {
// const cert = fs.readFileSync("server/server.cert", "utf8");
// const key = fs.readFileSync("server/server.key", "utf8");
// const server = https.createServer({
//   cert,
//   key
// });
const server = http.createServer();
const wsServer = new WebSocket.Server({ server });
const connectedSockets = [];

wsServer.on("connection", socket => {
  connectedSockets.push(socket);

  socket.on("message", message => {
    connectedSockets.forEach(socket => socket.send(message));
  });

  socket.on("close", () => {
    connectedSockets.splice(connectedSockets.indexOf(socket), 1);
  });
});

server.listen(9000);
// } else {
//   const server = http.createServer();
//   const wsServer = new WebSocket.Server({ server });
//   const connectedSockets = [];

//   wsServer.on("connection", socket => {
//     connectedSockets.push(socket);

//     socket.on("message", message => {
//       connectedSockets.forEach(socket => socket.send(message));
//     });

//     socket.on("close", () => {
//       connectedSockets.splice(connectedSockets.indexOf(socket), 1);
//     });
//   });

//   server.listen(9000);
// }
