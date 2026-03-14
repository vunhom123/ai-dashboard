const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());

const io = new Server(server, {
  cors: { origin: "*" },
});

io.on("connection", (socket) => {
  console.log("client connected:", socket.id);

  // ── CHAT ──────────────────────────────────────────────
  socket.on("chat_message", (data) => {
    // Broadcast cho tất cả trừ người gửi
    socket.broadcast.emit("chat_message", data);
  });

  socket.on("chat_join", () => {
    // Thông báo số người online cho tất cả
    io.emit("chat_online", io.engine.clientsCount);
  });

  socket.on("disconnect", () => {
    console.log("client disconnected:", socket.id);
    // Cập nhật lại số online khi có người thoát
    io.emit("chat_online", io.engine.clientsCount);
  });
});

// ── REST API ───────────────────────────────────────────
app.post("/scan", (req, res) => {
  const qr = req.body.qr;

  const data = {
    code: qr,
    time: new Date().toLocaleTimeString(),
  };

  io.emit("new_scan", data);
  res.send("ok");
});

app.post("/location", (req, res) => {
  const { lat, lng } = req.body;

  const data = {
    lat,
    lng,
    time: new Date().toLocaleTimeString(),
  };

  io.emit("shipper_location", data);
  res.send("ok");
});

server.listen(5000, () => {
  console.log("server running on port 5000");
});
