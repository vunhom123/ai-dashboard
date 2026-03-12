import React, { useState, useEffect, useRef } from "react";
import Login from "./Login";
import { motion, AnimatePresence } from "framer-motion";
import { io } from "socket.io-client";
import * as XLSX from "xlsx";
import utcBg from "./assets/utc.jpg";
import Scan from "./Scan";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

// Icon đặc biệt cho điểm scan QR
const qrIcon = new L.DivIcon({
  className: "",
  html: `<div style="
    width:32px;height:32px;
    background:linear-gradient(135deg,#38bdf8,#6366f1);
    border-radius:50% 50% 50% 0;
    transform:rotate(-45deg);
    border:2px solid white;
    box-shadow:0 4px 14px rgba(56,189,248,0.6);
  "></div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -36],
});

const shipperIcon = new L.DivIcon({
  className: "",
  html: `<div style="
    width:36px;height:36px;
    background:linear-gradient(135deg,#34d399,#059669);
    border-radius:50%;
    border:3px solid white;
    box-shadow:0 0 0 4px rgba(52,211,153,0.35), 0 4px 16px rgba(52,211,153,0.5);
    display:flex;align-items:center;justify-content:center;
    font-size:16px;
  ">📦</div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 18],
  popupAnchor: [0, -22],
});

const socket = io("https://qr-server-n6pp.onrender.com", {
  transports: ["websocket"],
  reconnection: true,
});

/* ─── THEMES ─────────────────────────────────────────────────── */
const THEMES = {
  dark: {
    bg: "#0a0f1a",
    card: "rgba(15,22,41,0.72)",
    cardBorder: "rgba(56,189,248,0.15)",
    panel: "rgba(15,22,41,0.72)",
    text: "#e2e8f0",
    muted: "#64748b",
    accent: "#38bdf8",
    accentGlow: "rgba(56,189,248,0.25)",
    success: "#34d399",
    danger: "#f87171",
    warning: "#fbbf24",
    menuActive: "rgba(56,189,248,0.15)",
    surface: "rgba(255,255,255,0.03)",
  },
  light: {
    bg: "#f0f4ff",
    card: "rgba(255,255,255,0.68)",
    cardBorder: "rgba(99,102,241,0.18)",
    panel: "rgba(255,255,255,0.68)",
    text: "#0f172a",
    muted: "#94a3b8",
    accent: "#6366f1",
    accentGlow: "rgba(99,102,241,0.2)",
    success: "#10b981",
    danger: "#ef4444",
    warning: "#f59e0b",
    menuActive: "rgba(99,102,241,0.12)",
    surface: "rgba(0,0,0,0.02)",
  },
};

/* ─── GLOBAL CSS ──────────────────────────────────────────────── */
const GlobalStyle = ({ dark }) => {
  const t = dark ? THEMES.dark : THEMES.light;
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&family=Raleway:wght@700;800;900&family=JetBrains+Mono:wght@400;700&display=swap');

      *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

      :root {
        --accent:       ${t.accent};
        --accent-glow:  ${t.accentGlow};
        --success:      ${t.success};
        --danger:       ${t.danger};
        --warning:      ${t.warning};
        --text:         ${t.text};
        --muted:        ${t.muted};
        --bg:           ${t.bg};
        --card:         ${t.card};
        --card-border:  ${t.cardBorder};
        --panel:        ${t.panel};
        --surface:      ${t.surface};
        --menu-active:  ${t.menuActive};
      }

      body {
        font-family: 'Nunito', 'Segoe UI', sans-serif;
        background: var(--bg);
        color: var(--text);
        overflow-x: hidden;
      }

      ::-webkit-scrollbar { width: 4px; }
      ::-webkit-scrollbar-track { background: transparent; }
      ::-webkit-scrollbar-thumb { background: var(--accent); border-radius: 10px; }

      /* ── mono code font ── */
      .mono { font-family: 'JetBrains Mono', monospace; }

      /* ── Stat card ── */
      .stat-card {
        background: var(--card);
        backdrop-filter: blur(14px);
        -webkit-backdrop-filter: blur(14px);
        border: 1px solid var(--card-border);
        border-radius: 18px;
        padding: 26px 22px;
        position: relative;
        overflow: hidden;
        transition: transform 0.2s, box-shadow 0.2s;
      }
      .stat-card::before {
        content: '';
        position: absolute; top: 0; left: 0; right: 0;
        height: 2px;
        background: linear-gradient(90deg, transparent, var(--accent), transparent);
        opacity: 0.55;
      }
      .stat-card:hover { transform: translateY(-3px); box-shadow: 0 12px 40px var(--accent-glow); }

      /* ── Panel ── */
      .panel {
        background: var(--panel);
        backdrop-filter: blur(14px);
        -webkit-backdrop-filter: blur(14px);
        border: 1px solid var(--card-border);
        border-radius: 20px;
        padding: 26px;
        margin-top: 22px;
      }

      /* ── Badges ── */
      .badge {
        display: inline-flex; align-items: center; gap: 5px;
        padding: 3px 10px; border-radius: 20px;
        font-size: 11px; font-weight: 800;
        letter-spacing: 0.04em; text-transform: uppercase;
        font-family: 'Nunito', sans-serif;
      }
      .badge-success { background: rgba(52,211,153,0.12); color: var(--success); border: 1px solid rgba(52,211,153,0.28); }
      .badge-danger  { background: rgba(248,113,113,0.12); color: var(--danger);  border: 1px solid rgba(248,113,113,0.28); }
      .badge-warning { background: rgba(251,191,36,0.12);  color: var(--warning); border: 1px solid rgba(251,191,36,0.28); }
      .badge-info    { background: rgba(56,189,248,0.12);  color: var(--accent);  border: 1px solid rgba(56,189,248,0.28); }

      /* ── Pulse dot ── */
      .pulse-dot {
        width: 8px; height: 8px; border-radius: 50%;
        background: var(--success);
        box-shadow: 0 0 0 0 rgba(52,211,153,0.4);
        animation: pulse-anim 1.6s infinite;
        display: inline-block;
      }
      @keyframes pulse-anim {
        0%   { box-shadow: 0 0 0 0   rgba(52,211,153,0.5); }
        70%  { box-shadow: 0 0 0 10px rgba(52,211,153,0);  }
        100% { box-shadow: 0 0 0 0   rgba(52,211,153,0);   }
      }

      /* ── Table ── */
      table { width: 100%; border-collapse: collapse; }
      thead tr { border-bottom: 1px solid var(--card-border); }
      th {
        text-align: left; padding: 11px 15px;
        font-size: 11px; font-weight: 800;
        letter-spacing: 0.1em; text-transform: uppercase;
        color: var(--muted); font-family: 'Nunito', sans-serif;
      }
      td { padding: 13px 15px; font-size: 14px; border-bottom: 1px solid var(--surface); }
      tbody tr { transition: background 0.15s; }
      tbody tr:hover { background: var(--surface); }

      /* ── Buttons ── */
      .btn-primary {
        padding: 10px 20px; background: var(--accent);
        border: none; border-radius: 10px;
        color: ${dark ? "#0a0f1a" : "#fff"};
        font-weight: 800; font-family: 'Nunito', sans-serif;
        font-size: 13px; cursor: pointer;
        transition: opacity 0.2s, transform 0.15s;
        letter-spacing: 0.02em;
      }
      .btn-primary:hover { opacity: 0.88; transform: translateY(-1px); }

      .btn-danger {
        padding: 10px 20px; background: transparent;
        border: 1px solid var(--danger); border-radius: 10px;
        color: var(--danger); font-weight: 800;
        font-family: 'Nunito', sans-serif;
        font-size: 13px; cursor: pointer;
        transition: background 0.2s, transform 0.15s;
      }
      .btn-danger:hover { background: rgba(248,113,113,0.1); transform: translateY(-1px); }

      /* ── File input ── */
      .file-input-wrapper {
        display: inline-flex; align-items: center; gap: 10px;
        padding: 10px 18px; background: var(--surface);
        border: 1px dashed var(--card-border); border-radius: 10px;
        cursor: pointer; color: var(--muted);
        font-size: 13px; font-weight: 600;
        font-family: 'Nunito', sans-serif;
        transition: border-color 0.2s, color 0.2s; margin-bottom: 20px;
      }
      .file-input-wrapper:hover { border-color: var(--accent); color: var(--accent); }
      .file-input-wrapper input { display: none; }

      /* ── Typography helpers ── */
      .section-label {
        font-size: 10.5px; font-weight: 800;
        letter-spacing: 0.16em; text-transform: uppercase;
        color: var(--muted); margin-bottom: 5px;
        font-family: 'Nunito', sans-serif;
      }
      .page-title {
        font-family: 'Raleway', sans-serif;
        font-size: 28px; font-weight: 900;
        letter-spacing: -0.5px; margin-bottom: 6px;
        background: linear-gradient(135deg, var(--text) 0%, var(--accent) 120%);
        -webkit-background-clip: text; -webkit-text-fill-color: transparent;
        background-clip: text;
      }

      /* ── Scan flash animation ── */
      @keyframes scan-flash {
        0%   { box-shadow: 0 0 0 0   rgba(52,211,153,0.8); }
        100% { box-shadow: 0 0 0 24px rgba(52,211,153,0);  }
      }
      .scan-flash { animation: scan-flash 0.6s ease-out; }

      /* ── Map popup override ── */
      .leaflet-popup-content-wrapper {
        background: rgba(10,18,40,0.95) !important;
        color: #e2e8f0 !important;
        border: 1px solid rgba(56,189,248,0.3) !important;
        border-radius: 12px !important;
        backdrop-filter: blur(12px);
        font-family: 'Nunito', sans-serif !important;
      }
      .leaflet-popup-tip { background: rgba(10,18,40,0.95) !important; }
    `}</style>
  );
};

/* ─── MAP: auto-pan helper ────────────────────────────────────── */
function MapAutoCenter({ position }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(position, map.getZoom(), { duration: 1.2 });
  }, [position]);
  return null;
}

/* ─── TOAST ──────────────────────────────────────────────────── */
function Toast({ message, type = "info" }) {
  const colors = {
    info: "var(--accent)",
    success: "var(--success)",
    danger: "var(--danger)",
  };
  return (
    <motion.div
      initial={{ x: 60, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 60, opacity: 0 }}
      style={{
        position: "fixed",
        bottom: 24,
        right: 24,
        zIndex: 9999,
        background: "var(--card)",
        border: `1px solid ${colors[type]}`,
        borderRadius: 14,
        padding: "13px 20px",
        display: "flex",
        alignItems: "center",
        gap: 10,
        boxShadow: `0 8px 30px var(--accent-glow)`,
        maxWidth: 340,
        backdropFilter: "blur(16px)",
        fontFamily: "'Nunito', sans-serif",
      }}
    >
      <span style={{ color: colors[type], fontSize: 16 }}>
        {type === "success" ? "✦" : type === "danger" ? "✕" : "◈"}
      </span>
      <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}>
        {message}
      </span>
    </motion.div>
  );
}

/* ─── APP ROOT ───────────────────────────────────────────────── */
export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [page, setPage] = useState("dashboard");
  const [dark, setDark] = useState(true);
  const [history, setHistory] = useState([]);
  const [lastScan, setLastScan] = useState(null);
  const [orderList, setOrderList] = useState([]);
  const [scannedList, setScannedList] = useState([]);
  const [toasts, setToasts] = useState([]);

  // Vị trí shipper & lịch sử đường đi
  const [shipperPos, setShipperPos] = useState([21.0285, 105.8542]);
  const [locationHistory, setLocationHistory] = useState([[21.0285, 105.8542]]);
  // Các điểm scan QR kèm toạ độ
  const [scanPoints, setScanPoints] = useState([]);

  const addToast = (msg, type = "info") => {
    const id = Date.now();
    setToasts((p) => [...p, { id, msg, type }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 3500);
  };

  useEffect(() => {
    // ── Nhận scan QR mới ──────────────────────────────────────
    socket.on("new_scan", (data) => {
      setHistory((prev) => [data, ...prev]);
      setLastScan(data);
      setScannedList((prev) =>
        prev.includes(data.code) ? prev : [...prev, data.code],
      );
      addToast(`Quét mã: ${data.code}`, "success");

      // Nếu server gửi kèm lat/lng trong data scan → đánh dấu điểm trên bản đồ
      if (data.lat && data.lng) {
        const lat = Number(data.lat),
          lng = Number(data.lng);
        if (!isNaN(lat) && !isNaN(lng)) {
          setShipperPos([lat, lng]);
          setLocationHistory((prev) => [...prev, [lat, lng]]);
          setScanPoints((prev) => [
            ...prev,
            { code: data.code, time: data.time, lat, lng },
          ]);
        }
      }

      const audio = new Audio("/scan.mp3");
      audio.play().catch(() => {});
    });

    // ── Nhận GPS shipper riêng (nếu có) ──────────────────────
    socket.on("shipper_location", (data) => {
      if (!data?.lat || !data?.lng) return;
      const lat = Number(data.lat),
        lng = Number(data.lng);
      if (isNaN(lat) || isNaN(lng)) return;
      setShipperPos([lat, lng]);
      setLocationHistory((prev) => {
        const last = prev[prev.length - 1];
        if (last && last[0] === lat && last[1] === lng) return prev;
        return [...prev, [lat, lng]];
      });
    });

    return () => {
      socket.off("new_scan");
      socket.off("shipper_location");
    };
  }, []);

  if (!loggedIn) return <Login onLogin={() => setLoggedIn(true)} />;

  return (
    <>
      <GlobalStyle dark={dark} />
      <div
        style={{
          display: "flex",
          minHeight: "100vh",
          backgroundImage: `url(${utcBg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
          position: "relative",
        }}
      >
        {/* Overlay */}
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: dark ? "rgba(5,9,20,0.83)" : "rgba(238,243,255,0.82)",
            backdropFilter: "blur(2px)",
            zIndex: 0,
            pointerEvents: "none",
          }}
        />

        <Sidebar page={page} setPage={setPage} dark={dark} setDark={setDark} />

        <main
          style={{
            flex: 1,
            padding: "38px 46px",
            overflowY: "auto",
            minHeight: "100vh",
            position: "relative",
            zIndex: 1,
          }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={page}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.22 }}
            >
              {page === "dashboard" && (
                <Dashboard history={history} lastScan={lastScan} />
              )}
              {page === "live" && <LiveScan lastScan={lastScan} />}
              {page === "orders" && (
                <Orders
                  orderList={orderList}
                  setOrderList={setOrderList}
                  scannedList={scannedList}
                  addToast={addToast}
                />
              )}
              {page === "map" && (
                <DeliveryMap
                  shipperPos={shipperPos}
                  locationHistory={locationHistory}
                  scanPoints={scanPoints}
                />
              )}
              {page === "scan" && <Scan />}
              {page === "history" && <History history={history} />}
              {page === "settings" && (
                <Settings logout={() => setLoggedIn(false)} />
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <AnimatePresence>
        {toasts.map((t) => (
          <Toast key={t.id} message={t.msg} type={t.type} />
        ))}
      </AnimatePresence>
    </>
  );
}

/* ─── SIDEBAR ────────────────────────────────────────────────── */
const NAV = [
  { id: "dashboard", icon: "⬡", label: "Dashboard" },
  { id: "live", icon: "◉", label: "Live Scan" },
  { id: "orders", icon: "▣", label: "Đơn hàng" },
  { id: "map", icon: "◎", label: "Bản đồ" },
  { id: "scan", icon: "◈", label: "Scan GPS" },
  { id: "history", icon: "▤", label: "Lịch sử" },
  { id: "settings", icon: "⚙", label: "Cài đặt" },
];

function Sidebar({ page, setPage, dark, setDark }) {
  return (
    <aside
      style={{
        width: 224,
        minHeight: "100vh",
        background: dark ? "rgba(5,11,22,0.78)" : "rgba(255,255,255,0.72)",
        backdropFilter: "blur(18px)",
        WebkitBackdropFilter: "blur(18px)",
        borderRight: "1px solid var(--card-border)",
        padding: "30px 14px",
        display: "flex",
        flexDirection: "column",
        position: "sticky",
        top: 0,
        zIndex: 10,
      }}
    >
      <div style={{ padding: "0 10px", marginBottom: 36 }}>
        <div
          style={{
            fontSize: 10,
            letterSpacing: "0.2em",
            color: "var(--muted)",
            textTransform: "uppercase",
            marginBottom: 3,
            fontFamily: "'Nunito', sans-serif",
            fontWeight: 700,
          }}
        >
          Hệ thống
        </div>
        <div
          style={{
            fontFamily: "'Raleway', sans-serif",
            fontSize: 19,
            fontWeight: 900,
            letterSpacing: "-0.5px",
            color: "var(--text)",
          }}
        >
          AI Factory
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            marginTop: 6,
          }}
        >
          <span className="pulse-dot" />
          <span
            style={{
              fontSize: 11,
              color: "var(--success)",
              fontWeight: 700,
              fontFamily: "'Nunito', sans-serif",
            }}
          >
            Trực tuyến
          </span>
        </div>
      </div>

      <nav
        style={{ flex: 1, display: "flex", flexDirection: "column", gap: 2 }}
      >
        {NAV.map((item) => (
          <NavItem
            key={item.id}
            item={item}
            active={page === item.id}
            onClick={() => setPage(item.id)}
          />
        ))}
      </nav>

      <button
        onClick={() => setDark(!dark)}
        style={{
          marginTop: 22,
          padding: "10px 13px",
          background: "var(--surface)",
          border: "1px solid var(--card-border)",
          borderRadius: 10,
          color: "var(--muted)",
          fontSize: 12.5,
          fontWeight: 700,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: 8,
          fontFamily: "'Nunito', sans-serif",
          transition: "color 0.2s, border-color 0.2s",
        }}
      >
        {dark ? "☀" : "🌙"} {dark ? "Giao diện sáng" : "Giao diện tối"}
      </button>
    </aside>
  );
}

function NavItem({ item, active, onClick }) {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      style={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        gap: 11,
        padding: "10px 13px",
        borderRadius: 10,
        border: "none",
        cursor: "pointer",
        background: active ? "var(--menu-active)" : "transparent",
        color: active ? "var(--accent)" : "var(--muted)",
        fontWeight: active ? 800 : 600,
        fontSize: 13.5,
        textAlign: "left",
        fontFamily: "'Nunito', sans-serif",
        transition: "background 0.15s, color 0.15s",
        position: "relative",
      }}
    >
      {active && (
        <motion.div
          layoutId="nav-indicator"
          style={{
            position: "absolute",
            left: 0,
            top: "18%",
            bottom: "18%",
            width: 3,
            borderRadius: 4,
            background: "var(--accent)",
            boxShadow: "0 0 8px var(--accent)",
          }}
        />
      )}
      <span style={{ fontSize: 14 }}>{item.icon}</span>
      {item.label}
    </motion.button>
  );
}

/* ─── STAT CARD ──────────────────────────────────────────────── */
function StatCard({ title, value, sub, color, icon, delay = 0 }) {
  return (
    <motion.div
      className="stat-card"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.32 }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <div>
          <p className="section-label">{title}</p>
          <h2
            style={{
              fontSize: 34,
              fontWeight: 900,
              color: color || "var(--text)",
              letterSpacing: "-1px",
              marginTop: 4,
              fontFamily: "'Raleway', sans-serif",
            }}
          >
            {value}
          </h2>
          {sub && (
            <p
              style={{
                fontSize: 12,
                color: "var(--muted)",
                marginTop: 4,
                fontWeight: 600,
              }}
            >
              {sub}
            </p>
          )}
        </div>
        {icon && (
          <span
            style={{
              fontSize: 20,
              width: 42,
              height: 42,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "var(--surface)",
              borderRadius: 12,
              border: "1px solid var(--card-border)",
            }}
          >
            {icon}
          </span>
        )}
      </div>
    </motion.div>
  );
}

/* ─── DASHBOARD ──────────────────────────────────────────────── */
function Dashboard({ history, lastScan }) {
  const chartData = history
    .slice(0, 20)
    .reverse()
    .map((_, i) => ({ name: i, total: i + 1 }));

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <p className="section-label">Tổng quan</p>
        <h1 className="page-title">Bảng điều khiển</h1>
        <p style={{ color: "var(--muted)", fontSize: 14, fontWeight: 500 }}>
          Giám sát quét mã QR theo thời gian thực
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4,1fr)",
          gap: 14,
          marginBottom: 22,
        }}
      >
        <StatCard title="Tổng quét" value={history.length} icon="⬡" delay={0} />
        <StatCard
          title="Thành công"
          value={history.length}
          icon="✓"
          color="var(--success)"
          sub="100% OK"
          delay={0.05}
        />
        <StatCard
          title="Thất bại"
          value="0"
          icon="✕"
          color="var(--danger)"
          delay={0.1}
        />
        <StatCard title="Tỉ lệ lỗi" value="0.0%" icon="◎" delay={0.15} />
      </div>

      {lastScan && (
        <motion.div
          key={lastScan.code}
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{
            background:
              "linear-gradient(135deg,rgba(52,211,153,0.08),rgba(56,189,248,0.08))",
            border: "1px solid rgba(52,211,153,0.3)",
            borderRadius: 14,
            padding: "14px 20px",
            display: "flex",
            alignItems: "center",
            gap: 14,
            marginBottom: 6,
          }}
        >
          <span className="pulse-dot" />
          <div>
            <span
              style={{
                fontSize: 10.5,
                color: "var(--muted)",
                fontWeight: 800,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                fontFamily: "'Nunito',sans-serif",
              }}
            >
              Quét gần nhất
            </span>
            <div
              style={{
                fontSize: 15,
                fontWeight: 800,
                color: "var(--success)",
                fontFamily: "'JetBrains Mono',monospace",
              }}
            >
              {lastScan.code}
            </div>
          </div>
          {lastScan.time && (
            <span
              style={{
                marginLeft: "auto",
                fontSize: 12,
                color: "var(--muted)",
                fontFamily: "'JetBrains Mono',monospace",
              }}
            >
              {lastScan.time}
            </span>
          )}
        </motion.div>
      )}

      <div className="panel">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 18,
          }}
        >
          <div>
            <p className="section-label">Hoạt động</p>
            <h3
              style={{
                fontWeight: 800,
                fontSize: 15,
                fontFamily: "'Nunito',sans-serif",
              }}
            >
              Biểu đồ quét mã
            </h3>
          </div>
          <span className="badge badge-info">{history.length} sự kiện</span>
        </div>
        <ResponsiveContainer width="100%" height={230}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="grad1" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--accent)"
                  stopOpacity={0.28}
                />
                <stop offset="95%" stopColor="var(--accent)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--card-border)" />
            <XAxis
              dataKey="name"
              tick={{
                fontSize: 11,
                fill: "var(--muted)",
                fontFamily: "Nunito",
              }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{
                fontSize: 11,
                fill: "var(--muted)",
                fontFamily: "Nunito",
              }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                background: "var(--card)",
                border: "1px solid var(--card-border)",
                borderRadius: 10,
                fontSize: 12,
                color: "var(--text)",
                fontFamily: "Nunito",
              }}
            />
            <Area
              type="monotone"
              dataKey="total"
              stroke="var(--accent)"
              strokeWidth={2}
              fill="url(#grad1)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

/* ─── LIVE SCAN ──────────────────────────────────────────────── */
function LiveScan({ lastScan }) {
  const [flash, setFlash] = useState(false);
  const prevCode = useRef(null);

  useEffect(() => {
    if (lastScan && lastScan.code !== prevCode.current) {
      prevCode.current = lastScan.code;
      setFlash(true);
      setTimeout(() => setFlash(false), 700);
    }
  }, [lastScan]);

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <p className="section-label">Thời gian thực</p>
        <h1 className="page-title">Màn hình quét trực tiếp</h1>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
        <div
          className="panel"
          style={{
            minHeight: 280,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {lastScan ? (
            <motion.div
              key={lastScan.code}
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              style={{ textAlign: "center" }}
            >
              <p className="section-label" style={{ marginBottom: 10 }}>
                Mã vừa quét
              </p>
              <div
                className={flash ? "scan-flash" : ""}
                style={{
                  fontSize: 28,
                  fontWeight: 700,
                  color: "var(--accent)",
                  fontFamily: "'JetBrains Mono',monospace",
                  letterSpacing: "0.05em",
                  padding: "18px 28px",
                  background: "var(--surface)",
                  borderRadius: 14,
                  border: "1px solid var(--card-border)",
                  marginBottom: 12,
                  transition: "box-shadow 0.2s",
                }}
              >
                {lastScan.code}
              </div>
              <span className="badge badge-success">◉ Quét OK</span>
              {lastScan.time && (
                <p
                  style={{
                    fontSize: 12,
                    color: "var(--muted)",
                    marginTop: 10,
                    fontWeight: 600,
                  }}
                >
                  {lastScan.time}
                </p>
              )}
              {lastScan.lat && lastScan.lng && (
                <p
                  style={{
                    fontSize: 11,
                    color: "var(--accent)",
                    marginTop: 6,
                    fontFamily: "'JetBrains Mono',monospace",
                  }}
                >
                  📍 {Number(lastScan.lat).toFixed(5)},{" "}
                  {Number(lastScan.lng).toFixed(5)}
                </p>
              )}
            </motion.div>
          ) : (
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 44, marginBottom: 10, opacity: 0.18 }}>
                ◈
              </div>
              <p
                style={{ color: "var(--muted)", fontSize: 14, fontWeight: 600 }}
              >
                Đang chờ máy quét...
              </p>
            </div>
          )}
        </div>

        <div className="panel">
          <p className="section-label" style={{ marginBottom: 14 }}>
            Trạng thái kết nối
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              { label: "WebSocket", status: "Đã kết nối", ok: true },
              { label: "Thiết bị quét", status: "Sẵn sàng", ok: true },
              { label: "Đồng bộ CSDL", status: "Hoạt động", ok: true },
            ].map((item) => (
              <div
                key={item.label}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "11px 15px",
                  background: "var(--surface)",
                  borderRadius: 10,
                }}
              >
                <span style={{ fontSize: 13, fontWeight: 700 }}>
                  {item.label}
                </span>
                <span
                  className={`badge ${item.ok ? "badge-success" : "badge-danger"}`}
                >
                  {item.ok ? "◉" : "◎"} {item.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── ORDERS ─────────────────────────────────────────────────── */
function Orders({ orderList, setOrderList, scannedList, addToast }) {
  const scannedCount = orderList.filter((o) =>
    scannedList.includes(o.QR),
  ).length;

  const uploadExcel = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const data = new Uint8Array(evt.target.result);
      const wb = XLSX.read(data, { type: "array" });
      const json = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
      setOrderList(json);
      addToast(`Đã tải ${json.length} đơn hàng`, "success");
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <p className="section-label">Quản lý</p>
        <h1 className="page-title">Đơn hàng</h1>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3,1fr)",
          gap: 14,
          marginBottom: 22,
        }}
      >
        <StatCard
          title="Tổng đơn"
          value={orderList.length}
          icon="▣"
          delay={0}
        />
        <StatCard
          title="Đã quét"
          value={scannedCount}
          icon="✓"
          color="var(--success)"
          delay={0.05}
        />
        <StatCard
          title="Chờ xử lý"
          value={orderList.length - scannedCount}
          icon="◎"
          color="var(--warning)"
          delay={0.1}
        />
      </div>

      <label className="file-input-wrapper">
        <input type="file" accept=".xlsx,.xls" onChange={uploadExcel} />
        <span>⊕</span> Tải lên file Excel (.xlsx)
      </label>

      <div className="panel">
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Khách hàng</th>
              <th>Mã QR</th>
              <th>Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {orderList.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  style={{
                    textAlign: "center",
                    color: "var(--muted)",
                    padding: "38px 0",
                    fontWeight: 600,
                  }}
                >
                  Chưa có đơn hàng. Tải lên file Excel để bắt đầu.
                </td>
              </tr>
            ) : (
              orderList.map((o, i) => {
                const done = scannedList.includes(o.QR);
                return (
                  <motion.tr
                    key={i}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.018 }}
                  >
                    <td
                      style={{
                        color: "var(--muted)",
                        fontFamily: "'JetBrains Mono',monospace",
                        fontSize: 12,
                      }}
                    >
                      {String(i + 1).padStart(3, "0")}
                    </td>
                    <td style={{ fontWeight: 700 }}>{o.Customer}</td>
                    <td
                      style={{
                        fontFamily: "'JetBrains Mono',monospace",
                        fontSize: 12,
                        color: "var(--accent)",
                      }}
                    >
                      {o.QR}
                    </td>
                    <td>
                      <span
                        className={`badge ${done ? "badge-success" : "badge-warning"}`}
                      >
                        {done ? "✓ Đã quét" : "⏳ Chờ"}
                      </span>
                    </td>
                  </motion.tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ─── DELIVERY MAP ───────────────────────────────────────────── */
function DeliveryMap({ shipperPos, locationHistory, scanPoints }) {
  const totalDist =
    locationHistory.length < 2
      ? 0
      : locationHistory.reduce((acc, cur, i) => {
          if (i === 0) return 0;
          const prev = locationHistory[i - 1];
          const R = 6371000;
          const dLat = ((cur[0] - prev[0]) * Math.PI) / 180;
          const dLng = ((cur[1] - prev[1]) * Math.PI) / 180;
          const a =
            Math.sin(dLat / 2) ** 2 +
            Math.cos((prev[0] * Math.PI) / 180) *
              Math.cos((cur[0] * Math.PI) / 180) *
              Math.sin(dLng / 2) ** 2;
          return acc + R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        }, 0);

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <p className="section-label">Vận chuyển</p>
        <h1 className="page-title">Theo dõi giao hàng</h1>
      </div>

      {/* Info bar */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: 14,
          marginBottom: 18,
        }}
      >
        <div className="panel" style={{ marginTop: 0, padding: "14px 20px" }}>
          <p className="section-label">Toạ độ hiện tại</p>
          <div style={{ display: "flex", gap: 18, marginTop: 6 }}>
            <div>
              <span
                style={{ fontSize: 10, color: "var(--muted)", fontWeight: 700 }}
              >
                VĨ ĐỘ
              </span>
              <div
                style={{
                  fontFamily: "'JetBrains Mono',monospace",
                  fontWeight: 700,
                  color: "var(--accent)",
                  fontSize: 13,
                }}
              >
                {shipperPos[0].toFixed(5)}
              </div>
            </div>
            <div>
              <span
                style={{ fontSize: 10, color: "var(--muted)", fontWeight: 700 }}
              >
                KINH ĐỘ
              </span>
              <div
                style={{
                  fontFamily: "'JetBrains Mono',monospace",
                  fontWeight: 700,
                  color: "var(--accent)",
                  fontSize: 13,
                }}
              >
                {shipperPos[1].toFixed(5)}
              </div>
            </div>
          </div>
        </div>

        <div
          className="panel"
          style={{
            marginTop: 0,
            padding: "14px 20px",
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <span className="pulse-dot" />
          <div>
            <p className="section-label">Trạng thái shipper</p>
            <div
              style={{ fontSize: 13, fontWeight: 800, color: "var(--success)" }}
            >
              Đang theo dõi trực tiếp
            </div>
          </div>
        </div>

        <div className="panel" style={{ marginTop: 0, padding: "14px 20px" }}>
          <p className="section-label">Thống kê hành trình</p>
          <div style={{ display: "flex", gap: 18, marginTop: 6 }}>
            <div>
              <span
                style={{ fontSize: 10, color: "var(--muted)", fontWeight: 700 }}
              >
                ĐIỂM QR
              </span>
              <div
                style={{
                  fontWeight: 800,
                  color: "var(--accent)",
                  fontSize: 18,
                  fontFamily: "'Raleway',sans-serif",
                }}
              >
                {scanPoints.length}
              </div>
            </div>
            <div>
              <span
                style={{ fontSize: 10, color: "var(--muted)", fontWeight: 700 }}
              >
                KHOẢNG CÁCH
              </span>
              <div
                style={{
                  fontWeight: 800,
                  color: "var(--warning)",
                  fontSize: 18,
                  fontFamily: "'Raleway',sans-serif",
                }}
              >
                {totalDist < 1000
                  ? `${totalDist.toFixed(0)}m`
                  : `${(totalDist / 1000).toFixed(2)}km`}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Map */}
      <div
        style={{
          borderRadius: 20,
          overflow: "hidden",
          border: "1px solid var(--card-border)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
        }}
      >
        <MapContainer
          center={shipperPos}
          zoom={14}
          style={{ height: 460, width: "100%" }}
        >
          <TileLayer
            attribution="© OpenStreetMap"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Tự động pan khi có vị trí mới */}
          <MapAutoCenter position={shipperPos} />

          {/* Đường đi (polyline) */}
          {locationHistory.length > 1 && (
            <Polyline
              positions={locationHistory}
              pathOptions={{
                color: "#38bdf8",
                weight: 3,
                opacity: 0.75,
                dashArray: "6 4",
              }}
            />
          )}

          {/* Marker shipper hiện tại */}
          <Marker position={shipperPos} icon={shipperIcon}>
            <Popup>
              <div style={{ fontFamily: "'Nunito',sans-serif", minWidth: 160 }}>
                <div
                  style={{ fontWeight: 800, marginBottom: 6, color: "#34d399" }}
                >
                  📦 Vị trí Shipper
                </div>
                <div style={{ fontSize: 12, color: "#94a3b8" }}>
                  Lat: {shipperPos[0].toFixed(6)}
                </div>
                <div style={{ fontSize: 12, color: "#94a3b8" }}>
                  Lng: {shipperPos[1].toFixed(6)}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: "#38bdf8",
                    marginTop: 5,
                    fontWeight: 700,
                  }}
                >
                  ● Đang hoạt động
                </div>
              </div>
            </Popup>
          </Marker>

          {/* Các điểm quét QR */}
          {scanPoints.map((sp, i) => (
            <Marker key={i} position={[sp.lat, sp.lng]} icon={qrIcon}>
              <Popup>
                <div
                  style={{ fontFamily: "'Nunito',sans-serif", minWidth: 180 }}
                >
                  <div
                    style={{
                      fontWeight: 800,
                      marginBottom: 5,
                      color: "#38bdf8",
                    }}
                  >
                    ◈ Điểm quét #{i + 1}
                  </div>
                  <div
                    style={{
                      fontFamily: "'JetBrains Mono',monospace",
                      fontSize: 12,
                      color: "#7dd3fc",
                      marginBottom: 4,
                    }}
                  >
                    {sp.code}
                  </div>
                  {sp.time && (
                    <div style={{ fontSize: 11, color: "#64748b" }}>
                      🕐 {sp.time}
                    </div>
                  )}
                  <div style={{ fontSize: 11, color: "#64748b", marginTop: 3 }}>
                    📍 {sp.lat.toFixed(5)}, {sp.lng.toFixed(5)}
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* Bảng điểm quét */}
      {scanPoints.length > 0 && (
        <div className="panel">
          <p className="section-label" style={{ marginBottom: 14 }}>
            Lịch sử điểm quét QR
          </p>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Mã QR</th>
                <th>Vĩ độ</th>
                <th>Kinh độ</th>
                <th>Thời gian</th>
              </tr>
            </thead>
            <tbody>
              {scanPoints.map((sp, i) => (
                <tr key={i}>
                  <td
                    style={{
                      color: "var(--muted)",
                      fontFamily: "'JetBrains Mono',monospace",
                      fontSize: 12,
                    }}
                  >
                    {String(i + 1).padStart(3, "0")}
                  </td>
                  <td
                    style={{
                      fontFamily: "'JetBrains Mono',monospace",
                      fontSize: 12,
                      color: "var(--accent)",
                      fontWeight: 700,
                    }}
                  >
                    {sp.code}
                  </td>
                  <td
                    style={{
                      fontFamily: "'JetBrains Mono',monospace",
                      fontSize: 12,
                    }}
                  >
                    {sp.lat.toFixed(6)}
                  </td>
                  <td
                    style={{
                      fontFamily: "'JetBrains Mono',monospace",
                      fontSize: 12,
                    }}
                  >
                    {sp.lng.toFixed(6)}
                  </td>
                  <td
                    style={{
                      fontSize: 12,
                      color: "var(--muted)",
                      fontWeight: 600,
                    }}
                  >
                    {sp.time || "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ─── HISTORY ────────────────────────────────────────────────── */
function History({ history }) {
  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <p className="section-label">Nhật ký</p>
        <h1 className="page-title">Lịch sử quét</h1>
      </div>
      <div className="panel">
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Mã QR</th>
              <th>Thời gian</th>
              <th>Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {history.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  style={{
                    textAlign: "center",
                    color: "var(--muted)",
                    padding: "38px 0",
                    fontWeight: 600,
                  }}
                >
                  Chưa có dữ liệu quét.
                </td>
              </tr>
            ) : (
              history.map((h, i) => (
                <motion.tr
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.013 }}
                >
                  <td
                    style={{
                      color: "var(--muted)",
                      fontFamily: "'JetBrains Mono',monospace",
                      fontSize: 12,
                    }}
                  >
                    {String(i + 1).padStart(3, "0")}
                  </td>
                  <td
                    style={{
                      fontFamily: "'JetBrains Mono',monospace",
                      fontSize: 13,
                      color: "var(--accent)",
                      fontWeight: 700,
                    }}
                  >
                    {h.code}
                  </td>
                  <td
                    style={{
                      fontSize: 12,
                      color: "var(--muted)",
                      fontWeight: 600,
                    }}
                  >
                    {h.time || "—"}
                  </td>
                  <td>
                    <span className="badge badge-success">✓ OK</span>
                  </td>
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ─── SETTINGS ───────────────────────────────────────────────── */
function Settings({ logout }) {
  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <p className="section-label">Hệ thống</p>
        <h1 className="page-title">Cài đặt</h1>
      </div>
      <div className="panel" style={{ maxWidth: 460 }}>
        <p className="section-label" style={{ marginBottom: 14 }}>
          Tài khoản
        </p>
        <div
          style={{
            padding: "14px 18px",
            background: "var(--surface)",
            borderRadius: 12,
            border: "1px solid var(--card-border)",
            marginBottom: 18,
          }}
        >
          <div
            style={{
              fontSize: 12,
              color: "var(--muted)",
              marginBottom: 3,
              fontWeight: 600,
            }}
          >
            Đăng nhập với tư cách
          </div>
          <div style={{ fontWeight: 800, fontSize: 15 }}>Quản trị viên</div>
        </div>
        <button className="btn-danger" onClick={logout}>
          Đăng xuất
        </button>
      </div>
    </div>
  );
}
