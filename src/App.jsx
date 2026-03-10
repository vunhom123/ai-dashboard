import React, { useState, useEffect } from "react";
import Login from "./Login";
import { motion } from "framer-motion";
import { io } from "socket.io-client";
import * as XLSX from "xlsx";
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

const socket = io("http://localhost:5000");

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [page, setPage] = useState("dashboard");

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
      <Sidebar page={page} setPage={setPage} />

      <div style={styles.main}>
        {page === "dashboard" && (
          <Dashboard history={history} lastScan={lastScan} />
        )}

        {page === "live" && <LiveScan lastScan={lastScan} />}

        {page === "orders" && (
          <Orders
            orderList={orderList}
            setOrderList={setOrderList}
            scannedList={scannedList}
          />
        )}

        {page === "map" && <DeliveryMap />}

        {page === "history" && <History history={history} />}

        {page === "settings" && <Settings logout={() => setLoggedIn(false)} />}
      </div>
    </div>
  );
}

function Sidebar({ page, setPage }) {
  return (
    <div style={styles.sidebar}>
      <h2 style={styles.logo}>AI Factory</h2>

      <Menu
        text="Dashboard"
        icon="📊"
        active={page === "dashboard"}
        click={() => setPage("dashboard")}
      />
      <Menu
        text="Live Scan"
        icon="📡"
        active={page === "live"}
        click={() => setPage("live")}
      />
      <Menu
        text="Orders"
        icon="📦"
        active={page === "orders"}
        click={() => setPage("orders")}
      />
      <Menu
        text="Delivery Map"
        icon="🗺"
        active={page === "map"}
        click={() => setPage("map")}
      />
      <Menu
        text="History"
        icon="📁"
        active={page === "history"}
        click={() => setPage("history")}
      />
      <Menu
        text="Settings"
        icon="⚙"
        active={page === "settings"}
        click={() => setPage("settings")}
      />
    </div>
  );
}

function Menu({ text, icon, active, click }) {
  return (
    <motion.div
      whileHover={{ x: 6 }}
      whileTap={{ scale: 0.95 }}
      onClick={click}
      style={{
        ...styles.menu,
        background: active ? "#1e293b" : "transparent",
      }}
    >
      {icon} {text}
    </motion.div>
  );
}

function Dashboard({ history, lastScan }) {
  const data = history.map((h, i) => ({
    name: i,
    value: 1,
  }));

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <h1>AI Monitoring Dashboard</h1>

      <div style={styles.cards}>
        <Card title="Total Scan" value={history.length} />
        <Card title="OK" value={history.length} color="#22c55e" />
        <Card title="Fail" value="0" color="#ef4444" />
        <Card title="Error %" value="0%" />
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

      <div style={styles.panel}>
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

function LiveScan({ lastScan }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <h1>Live Scanner Feed</h1>

      <div style={styles.panel}>
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

function Orders({ orderList, setOrderList, scannedList }) {
  const handleFile = (e) => {
    const file = e.target.files[0];

    const reader = new FileReader();

    reader.onload = (evt) => {
      const data = new Uint8Array(evt.target.result);

      const workbook = XLSX.read(data, { type: "array" });

      const sheet = workbook.Sheets[workbook.SheetNames[0]];

      const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

      const orders = rows
        .flat()
        .map((x) => String(x).trim())
        .filter((x) => x);

      setOrderList(orders);
    };

    reader.readAsArrayBuffer(file);
  };

  return (
    <div>
      <h1>Order Checking</h1>

      <input type="file" accept=".xlsx,.csv,.txt" onChange={handleFile} />

      <div style={{ marginTop: "30px" }}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th>QR Code</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {orderList.map((code) => {
              let status = "❌ Missing";

              if (scannedList.includes(code)) status = "✔ OK";

              return (
                <tr key={code}>
                  <td>{code}</td>
                  <td>{status}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function DeliveryMap() {
  const [position, setPosition] = useState([21.0285, 105.8542]);

  useEffect(() => {
    socket.on("shipper_location", (data) => {
      setPosition([data.lat, data.lng]);
    });
  }, []);

  const icon = new L.Icon({
    iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
    iconSize: [35, 35],
  });

  return (
    <div>
      <h1>Delivery Tracking</h1>

      <MapContainer
        center={position}
        zoom={13}
        style={{ height: "500px", width: "100%" }}
      >
        <TileLayer
          attribution="© OpenStreetMap"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <Marker position={position} icon={icon}>
          <Popup>Shipper Location</Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}

function History({ history }) {
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
      <h1>Scan History</h1>

      <button style={styles.export} onClick={exportCSV}>
        Export CSV
      </button>

      <div style={styles.panel}>
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

function Settings({ logout }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <h1>Settings</h1>

      <div style={styles.panel}>
        <button style={styles.logout} onClick={logout}>
          Logout
        </button>
      </div>
    </motion.div>
  );
}

function Card({ title, value, color = "white" }) {
  return (
    <motion.div whileHover={{ scale: 1.05 }} style={styles.card}>
      <p style={{ opacity: 0.6 }}>{title}</p>

      <h2 style={{ color }}>{value}</h2>
    </motion.div>
  );
}

const styles = {
  container: {
    display: "flex",
    background: "#0f172a",
    color: "white",
    minHeight: "100vh",
    fontFamily: "Segoe UI",
  },
  sidebar: { width: "230px", background: "#020617", padding: "30px" },
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
  card: {
    background: "#1e293b",
    padding: "25px",
    borderRadius: "15px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.4)",
  },
  panel: {
    background: "#1e293b",
    padding: "20px",
    borderRadius: "15px",
    marginTop: "30px",
  },
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
};
