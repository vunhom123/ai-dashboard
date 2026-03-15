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

  socket.on("chat_message", (data) => {
    socket.broadcast.emit("chat_message", data);
  });

  socket.on("chat_join", () => {
    io.emit("chat_online", io.engine.clientsCount);
  });

  socket.on("disconnect", () => {
    console.log("client disconnected:", socket.id);
    io.emit("chat_online", io.engine.clientsCount);
  });
});

// POST /scan — nhận từ Raspberry Pi hoặc mobile app
// Body: { qr, lat?, lng?, accuracy? }
app.post("/scan", (req, res) => {
  const { qr, lat, lng, accuracy } = req.body;

  const data = {
    code: qr,
    time: new Date().toLocaleTimeString(),
    // Gửi kèm GPS nếu có (từ mobile)
    ...(lat !== undefined && { lat: Number(lat) }),
    ...(lng !== undefined && { lng: Number(lng) }),
    ...(accuracy !== undefined && { accuracy: Number(accuracy) }),
  };

  console.log("new_scan:", data);
  io.emit("new_scan", data);
  res.send("ok");
});

// POST /location — cập nhật vị trí shipper
app.post("/location", (req, res) => {
  const { lat, lng } = req.body;

  const data = {
    lat: Number(lat),
    lng: Number(lng),
    time: new Date().toLocaleTimeString(),
  };

  console.log("shipper_location:", data);
  io.emit("shipper_location", data);
  res.send("ok");
});

server.listen(5000, () => {
  console.log("server running on port 5000");
});
