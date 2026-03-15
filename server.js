const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());

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
    console.log("disconnected:", socket.id);
    io.emit("chat_online", io.engine.clientsCount);

    for (const id in shippers) {
      if (shippers[id].socketId === socket.id) {
        delete shippers[id];
      }
    }
    io.emit("all_shippers", Object.values(shippers));
  });
});

app.post("/scan", (req, res) => {
  const { qr, lat, lng, accuracy, userId, name } = req.body;
  if (!qr) return res.status(400).json({ error: "missing qr" });

  const data = {
    code: qr,
    time: new Date().toLocaleTimeString(),
    userId: userId || null,
    name: name || null,
    ...(lat != null && { lat: Number(lat) }),
    ...(lng != null && { lng: Number(lng) }),
    ...(accuracy != null && { accuracy: Number(accuracy) }),
  };

  console.log("new_scan:", data);
  io.emit("new_scan", data);
  res.json({ ok: true });
});

app.post("/location", (req, res) => {
  const { userId, name, lat, lng, accuracy } = req.body;
  if (lat == null || lng == null)
    return res.status(400).json({ error: "missing lat/lng" });

  const id = userId || "http_" + Date.now();
  shippers[id] = {
    id,
    name: name || "Shipper " + String(id).slice(0, 6),
    lat: Number(lat),
    lng: Number(lng),
    accuracy: accuracy ? Number(accuracy) : null,
    time: new Date().toLocaleTimeString(),
    socketId: null,
  };

  io.emit("shipper_location", shippers[id]);
  io.emit("all_shippers", Object.values(shippers));
  res.json({ ok: true });
});

app.get("/shippers", (_req, res) => {
  res.json(Object.values(shippers));
});

server.listen(5000, () => console.log("server running :5000"));
