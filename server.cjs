const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());

// serve frontend
app.use(express.static(path.join(__dirname, "dist")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

const io = new Server(server, { cors: { origin: "*" } });

const shippers = {};

io.on("connection", (socket) => {
  console.log("connected:", socket.id);

  socket.on("chat_message", (data) => {
    io.emit("chat_message", data);
  });

  socket.on("chat_join", () => {
    io.emit("chat_online", io.engine.clientsCount);
  });

  socket.on("gps_update", (data) => {
    const id = data.userId || socket.id;
    shippers[id] = {
      id,
      name: data.name || "Shipper " + String(id).slice(0, 6),
      lat: Number(data.lat),
      lng: Number(data.lng),
      accuracy: data.accuracy || null,
      time: new Date().toLocaleTimeString(),
      socketId: socket.id,
    };

    io.emit("shipper_location", shippers[id]);
    io.emit("all_shippers", Object.values(shippers));
  });

  socket.on("disconnect", () => {
    for (const id in shippers) {
      if (shippers[id].socketId === socket.id) {
        delete shippers[id];
      }
    }
    io.emit("all_shippers", Object.values(shippers));
  });
});

app.post("/scan", (req, res) => {
  const { qr } = req.body;
  if (!qr) return res.status(400).json({ error: "missing qr" });

  const data = {
    code: qr,
    time: new Date().toLocaleTimeString(),
  };

  io.emit("new_scan", data);
  res.json({ ok: true });
});

const PORT = process.env.PORT || 10000;
server.listen(PORT, () => console.log("server running:", PORT));
