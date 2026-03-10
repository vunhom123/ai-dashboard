const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*" },
});

io.on("connection", (socket) => {
  console.log("dashboard connected");
});

app.use(express.json());

app.post("/scan", (req, res) => {
  const qr = req.body.qr;

  io.emit("new_scan", {
    code: qr,
    time: new Date().toLocaleTimeString(),
  });

  res.send("ok");
});

server.listen(5000, () => {
  console.log("server running");
});
