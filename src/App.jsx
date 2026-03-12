import React, { useState, useEffect } from "react";
import Login from "./Login";
import { motion } from "framer-motion";
import { io } from "socket.io-client";
import * as XLSX from "xlsx";
import utcBg from "./assets/utc.jpg";
import Scan from "./Scan";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

const socket = io("https://qr-server-n6pp.onrender.com", {
  transports: ["websocket"],
  reconnection: true,
});

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [page, setPage] = useState("dashboard");
  const [dark, setDark] = useState(false);

  const [history, setHistory] = useState([]);
  const [lastScan, setLastScan] = useState(null);

  const [orderList, setOrderList] = useState([]);
  const [scannedList, setScannedList] = useState([]);

  useEffect(() => {
    socket.on("new_scan", (data) => {
      setHistory((prev) => [data, ...prev]);
      setLastScan(data);

      setScannedList((prev) => {
        if (prev.includes(data.code)) return prev;
        return [...prev, data.code];
      });

      const audio = new Audio("/scan.mp3");
      audio.play().catch(() => {});
    });
  }, []);

  if (!loggedIn) {
    return <Login onLogin={() => setLoggedIn(true)} />;
  }

  return (
    <div style={styles.container}>
      <div
        style={{
          display: "flex",
          width: "100%",
          background: dark ? "rgba(2,6,23,0.6)" : "rgba(255,255,255,0.4)",
          backdropFilter: "blur(10px)",
        }}
      >
        <Sidebar page={page} setPage={setPage} dark={dark} setDark={setDark} />

        <div style={styles.main}>
          {page === "dashboard" && (
            <Dashboard history={history} lastScan={lastScan} dark={dark} />
          )}

          {page === "live" && <LiveScan lastScan={lastScan} />}

          {page === "orders" && (
            <Orders
              orderList={orderList}
              setOrderList={setOrderList}
              scannedList={scannedList}
              dark={dark}
            />
          )}

          {page === "map" && <DeliveryMap dark={dark} />}

          {page === "scan" && <Scan />}

          {page === "history" && <History history={history} dark={dark} />}

          {page === "settings" && (
            <Settings logout={() => setLoggedIn(false)} dark={dark} />
          )}
        </div>
      </div>
    </div>
  );
}

function Sidebar({ page, setPage, dark, setDark }) {
  return (
    <div
      style={{
        ...styles.sidebar,
        background: dark ? "#020617" : "#e2e8f0",
      }}
    >
      <h2 style={{ ...styles.logo, color: dark ? "white" : "black" }}>
        AI Factory
      </h2>

      <Menu
        text="Dashboard"
        icon="📊"
        active={page === "dashboard"}
        click={() => setPage("dashboard")}
        dark={dark}
      />
      <Menu
        text="Live Scan"
        icon="📡"
        active={page === "live"}
        click={() => setPage("live")}
        dark={dark}
      />
      <Menu
        text="Orders"
        icon="📦"
        active={page === "orders"}
        click={() => setPage("orders")}
        dark={dark}
      />
      <Menu
        text="Delivery Map"
        icon="🗺"
        active={page === "map"}
        click={() => setPage("map")}
        dark={dark}
      />
      <Menu
        text="Scan GPS"
        icon="📍"
        active={page === "scan"}
        click={() => setPage("scan")}
        dark={dark}
      />
      <Menu
        text="History"
        icon="📁"
        active={page === "history"}
        click={() => setPage("history")}
        dark={dark}
      />
      <Menu
        text="Settings"
        icon="⚙"
        active={page === "settings"}
        click={() => setPage("settings")}
        dark={dark}
      />

      <button onClick={() => setDark(!dark)} style={styles.themeButton}>
        {dark ? "☀ Light Mode" : "🌙 Dark Mode"}
      </button>
    </div>
  );
}

function Menu({ text, icon, active, click, dark }) {
  return (
    <motion.div
      whileHover={{ x: 6 }}
      whileTap={{ scale: 0.95 }}
      onClick={click}
      style={{
        ...styles.menu,
        background: active ? (dark ? "#334155" : "#cbd5f5") : "transparent",
        color: active
          ? dark
            ? "white"
            : "#1e293b"
          : dark
            ? "#cbd5f5"
            : "#334155",
        fontWeight: active ? "600" : "400",
      }}
    >
      {icon} {text}
    </motion.div>
  );
}

/* ===== DASHBOARD ===== */

function Dashboard({ history, lastScan, dark }) {
  const data = history.map((h, i) => ({ name: i, value: 1 }));

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <h1 style={{ color: dark ? "white" : "black" }}>
        AI Monitoring Dashboard
      </h1>

      <div style={styles.cards}>
        <Card title="Total Scan" value={history.length} dark={dark} />
        <Card title="OK" value={history.length} color="#22c55e" dark={dark} />
        <Card title="Fail" value="0" color="#ef4444" dark={dark} />
        <Card title="Error %" value="0%" dark={dark} />
      </div>

      {lastScan && (
        <motion.div
          key={lastScan.code}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          style={styles.scanHighlight}
        >
          Latest Scan: {lastScan.code}
        </motion.div>
      )}

      <div style={styles.panel(dark)}>
        <h3>Scan Activity</h3>

        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={data}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Line dataKey="value" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}

/* ===== LIVE ===== */

function LiveScan({ lastScan }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <h1>Live Scanner Feed</h1>

      <div style={styles.panel(false)}>
        {lastScan ? (
          <motion.div
            key={lastScan.code}
            initial={{ scale: 0.7 }}
            animate={{ scale: 1 }}
            style={styles.liveBox}
          >
            <h2>{lastScan.code}</h2>
            <p>{lastScan.time}</p>
          </motion.div>
        ) : (
          <p>Waiting for scanner...</p>
        )}
      </div>
    </motion.div>
  );
}

/* ===== MAP ===== */

function DeliveryMap({ dark }) {
  const [position, setPosition] = useState([21.0285, 105.8542]);

  useEffect(() => {
    socket.on("shipper_location", (data) => {
      setPosition([data.lat, data.lng]);
    });
  }, []);

  return (
    <div>
      <h1 style={{ color: dark ? "white" : "black" }}>Delivery Tracking</h1>

      <MapContainer
        center={position}
        zoom={13}
        style={{ height: "500px", width: "100%" }}
      >
        <TileLayer
          attribution="© OpenStreetMap"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <Marker position={position}>
          <Popup>Package Location</Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}

/* ===== HISTORY ===== */

function History({ history, dark }) {
  const exportCSV = () => {
    const rows = history.map((h) => `${h.time},${h.code}`).join("\n");

    const csv = "Time,QR\n" + rows;

    const blob = new Blob([csv]);

    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");

    a.href = url;
    a.download = "scan-history.csv";
    a.click();
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <h1 style={{ color: dark ? "white" : "black" }}>Scan History</h1>

      <button style={styles.export} onClick={exportCSV}>
        Export CSV
      </button>

      <div style={styles.panel(false)}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th>Time</th>
              <th>QR Code</th>
            </tr>
          </thead>

          <tbody>
            {history.map((h, i) => (
              <tr key={i}>
                <td>{h.time}</td>
                <td>{h.code}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}

/* ===== SETTINGS ===== */

function Settings({ logout, dark }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <h1 style={{ color: dark ? "white" : "black" }}>Settings</h1>

      <div style={styles.panel(dark)}>
        <button style={styles.logout} onClick={logout}>
          Logout
        </button>
      </div>
    </motion.div>
  );
}

function Card({ title, value, color = "white", dark }) {
  return (
    <motion.div whileHover={{ scale: 1.05 }} style={styles.card(dark)}>
      <p style={{ opacity: 0.6 }}>{title}</p>

      <h2 style={{ color }}>{value}</h2>
    </motion.div>
  );
}

const styles = {
  container: {
    display: "flex",
    minHeight: "100vh",
    fontFamily: "Segoe UI",
    backgroundImage: `url(${utcBg})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
  },

  sidebar: {
    width: "230px",
    padding: "30px",
  },

  logo: { marginBottom: "40px" },

  menu: {
    padding: "12px",
    marginBottom: "10px",
    borderRadius: "10px",
    cursor: "pointer",
  },

  main: { flex: 1, padding: "40px" },

  cards: {
    display: "grid",
    gridTemplateColumns: "repeat(4,1fr)",
    gap: "20px",
    marginTop: "20px",
  },

  card: (dark) => ({
    background: dark ? "#1e293b" : "#ffffff",
    padding: "30px",
    borderRadius: "20px",
    color: dark ? "white" : "#111",
    boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
  }),

  panel: (dark) => ({
    background: dark ? "#1e293b" : "#ffffff",
    color: dark ? "white" : "black",
    padding: "20px",
    borderRadius: "15px",
    marginTop: "30px",
  }),

  liveBox: { fontSize: "30px", textAlign: "center" },

  scanHighlight: {
    background: "#22c55e",
    padding: "15px",
    borderRadius: "10px",
    marginTop: "20px",
  },

  export: {
    padding: "10px 15px",
    marginTop: "10px",
    background: "#3b82f6",
    border: "none",
    borderRadius: "6px",
    color: "white",
    cursor: "pointer",
  },

  table: { width: "100%", marginTop: "10px" },

  logout: {
    padding: "12px 20px",
    background: "#ef4444",
    border: "none",
    borderRadius: "8px",
    color: "white",
    cursor: "pointer",
  },

  themeButton: {
    marginTop: "40px",
    padding: "10px",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
  },
};
