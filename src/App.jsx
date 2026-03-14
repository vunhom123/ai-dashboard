import React, { useState, useEffect, useRef, useCallback } from "react";
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
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  RadialBarChart,
  RadialBar,
  Legend,
} from "recharts";

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
  Circle,
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

const qrIcon = new L.DivIcon({
  className: "",
  html: `<div style="width:30px;height:30px;background:linear-gradient(135deg,#38bdf8,#6366f1);border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:2px solid white;box-shadow:0 4px 14px rgba(56,189,248,0.6);"></div>`,
  iconSize: [30, 30],
  iconAnchor: [15, 30],
  popupAnchor: [0, -34],
});
const shipperIcon = new L.DivIcon({
  className: "",
  html: `<div style="width:36px;height:36px;background:linear-gradient(135deg,#34d399,#059669);border-radius:50%;border:3px solid white;box-shadow:0 0 0 4px rgba(52,211,153,0.35),0 4px 16px rgba(52,211,153,0.5);display:flex;align-items:center;justify-content:center;font-size:16px;">📦</div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 18],
  popupAnchor: [0, -22],
});

const socket = io("https://qr-server-n6pp.onrender.com", {
  transports: ["websocket"],
  reconnection: true,
});

/* ─── THEMES ──────────────────────────────────────── */
const THEMES = {
  dark: {
    bg: "#070d1a",
    card: "rgba(12,20,42,0.75)",
    cardBorder: "rgba(56,189,248,0.13)",
    panel: "rgba(12,20,42,0.75)",
    text: "#e2e8f0",
    muted: "#475569",
    accent: "#38bdf8",
    accentGlow: "rgba(56,189,248,0.22)",
    success: "#34d399",
    danger: "#f87171",
    warning: "#fbbf24",
    menuActive: "rgba(56,189,248,0.13)",
    surface: "rgba(255,255,255,0.025)",
    sidebar: "rgba(5,10,22,0.82)",
  },
  light: {
    bg: "#eef2ff",
    card: "rgba(255,255,255,0.72)",
    cardBorder: "rgba(99,102,241,0.15)",
    panel: "rgba(255,255,255,0.72)",
    text: "#0f172a",
    muted: "#94a3b8",
    accent: "#6366f1",
    accentGlow: "rgba(99,102,241,0.18)",
    success: "#10b981",
    danger: "#ef4444",
    warning: "#f59e0b",
    menuActive: "rgba(99,102,241,0.1)",
    surface: "rgba(0,0,0,0.025)",
    sidebar: "rgba(255,255,255,0.78)",
  },
};

/* ─── GLOBAL STYLE ────────────────────────────────── */
const GlobalStyle = ({ dark }) => {
  const t = dark ? THEMES.dark : THEMES.light;
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&family=Raleway:wght@700;800;900&family=JetBrains+Mono:wght@400;500;700&display=swap');
      *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
      :root {
        --accent:${t.accent}; --accent-glow:${t.accentGlow};
        --success:${t.success}; --danger:${t.danger}; --warning:${t.warning};
        --text:${t.text}; --muted:${t.muted}; --bg:${t.bg};
        --card:${t.card}; --card-border:${t.cardBorder};
        --panel:${t.panel}; --surface:${t.surface}; --menu-active:${t.menuActive};
        --sidebar:${t.sidebar};
      }
      body{font-family:'Nunito','Segoe UI',sans-serif;background:var(--bg);color:var(--text);overflow-x:hidden;}
      ::-webkit-scrollbar{width:4px;}
      ::-webkit-scrollbar-track{background:transparent;}
      ::-webkit-scrollbar-thumb{background:var(--accent);border-radius:10px;opacity:.5;}
      .mono{font-family:'JetBrains Mono',monospace;}
      .stat-card{
        background:var(--card);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);
        border:1px solid var(--card-border);border-radius:18px;padding:22px 20px;
        position:relative;overflow:hidden;transition:transform .2s,box-shadow .2s;cursor:default;
      }
      .stat-card::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;
        background:linear-gradient(90deg,transparent,var(--accent),transparent);opacity:.5;}
      .stat-card:hover{transform:translateY(-3px);box-shadow:0 14px 44px var(--accent-glow);}
      .panel{background:var(--panel);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);
        border:1px solid var(--card-border);border-radius:20px;padding:24px;margin-top:18px;}
      .panel-0{margin-top:0!important;}
      .badge{display:inline-flex;align-items:center;gap:5px;padding:3px 10px;border-radius:20px;
        font-size:11px;font-weight:800;letter-spacing:.04em;text-transform:uppercase;font-family:'Nunito',sans-serif;}
      .badge-success{background:rgba(52,211,153,.12);color:var(--success);border:1px solid rgba(52,211,153,.28);}
      .badge-danger{background:rgba(248,113,113,.12);color:var(--danger);border:1px solid rgba(248,113,113,.28);}
      .badge-warning{background:rgba(251,191,36,.12);color:var(--warning);border:1px solid rgba(251,191,36,.28);}
      .badge-info{background:rgba(56,189,248,.12);color:var(--accent);border:1px solid rgba(56,189,248,.28);}
      .badge-purple{background:rgba(167,139,250,.12);color:#a78bfa;border:1px solid rgba(167,139,250,.28);}
      .pulse-dot{width:8px;height:8px;border-radius:50%;background:var(--success);
        box-shadow:0 0 0 0 rgba(52,211,153,.4);animation:pulse-anim 1.6s infinite;display:inline-block;}
      @keyframes pulse-anim{0%{box-shadow:0 0 0 0 rgba(52,211,153,.5);}70%{box-shadow:0 0 0 10px rgba(52,211,153,0);}100%{box-shadow:0 0 0 0 rgba(52,211,153,0);}}
      table{width:100%;border-collapse:collapse;}
      thead tr{border-bottom:1px solid var(--card-border);}
      th{text-align:left;padding:10px 14px;font-size:10.5px;font-weight:800;letter-spacing:.1em;
        text-transform:uppercase;color:var(--muted);font-family:'Nunito',sans-serif;}
      td{padding:11px 14px;font-size:13.5px;border-bottom:1px solid var(--surface);}
      tbody tr{transition:background .15s;}
      tbody tr:hover{background:var(--surface);}
      .btn-primary{padding:9px 18px;background:var(--accent);border:none;border-radius:9px;
        color:${dark ? "#070d1a" : "#fff"};font-weight:800;font-family:'Nunito',sans-serif;
        font-size:12.5px;cursor:pointer;transition:opacity .2s,transform .15s;letter-spacing:.02em;}
      .btn-primary:hover{opacity:.88;transform:translateY(-1px);}
      .btn-ghost{padding:8px 16px;background:transparent;border:1px solid var(--card-border);border-radius:9px;
        color:var(--muted);font-weight:700;font-family:'Nunito',sans-serif;font-size:12px;cursor:pointer;
        transition:border-color .2s,color .2s,background .2s;}
      .btn-ghost:hover{border-color:var(--accent);color:var(--accent);background:var(--menu-active);}
      .btn-danger{padding:9px 18px;background:transparent;border:1px solid var(--danger);border-radius:9px;
        color:var(--danger);font-weight:800;font-family:'Nunito',sans-serif;font-size:12.5px;cursor:pointer;
        transition:background .2s,transform .15s;}
      .btn-danger:hover{background:rgba(248,113,113,.1);transform:translateY(-1px);}
      .file-input-wrapper{display:inline-flex;align-items:center;gap:9px;padding:9px 16px;
        background:var(--surface);border:1px dashed var(--card-border);border-radius:10px;
        cursor:pointer;color:var(--muted);font-size:13px;font-weight:600;font-family:'Nunito',sans-serif;
        transition:border-color .2s,color .2s;margin-bottom:18px;}
      .file-input-wrapper:hover{border-color:var(--accent);color:var(--accent);}
      .file-input-wrapper input{display:none;}
      .section-label{font-size:10.5px;font-weight:800;letter-spacing:.16em;text-transform:uppercase;
        color:var(--muted);margin-bottom:5px;font-family:'Nunito',sans-serif;}
      .page-title{font-family:'Raleway',sans-serif;font-size:26px;font-weight:900;letter-spacing:-.5px;
        margin-bottom:5px;background:linear-gradient(135deg,var(--text) 0%,var(--accent) 130%);
        -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;}
      @keyframes scan-flash{0%{box-shadow:0 0 0 0 rgba(52,211,153,.8);}100%{box-shadow:0 0 0 28px rgba(52,211,153,0);}}
      .scan-flash{animation:scan-flash .65s ease-out;}
      @keyframes slide-in{from{transform:translateX(8px);opacity:0;}to{transform:none;opacity:1;}}
      .row-new{animation:slide-in .3s ease-out;}
      .progress-bar-bg{background:var(--surface);border-radius:6px;height:6px;overflow:hidden;}
      .progress-bar{height:100%;border-radius:6px;transition:width .6s ease;}
      .leaflet-popup-content-wrapper{background:rgba(7,13,26,.96)!important;color:#e2e8f0!important;
        border:1px solid rgba(56,189,248,.3)!important;border-radius:12px!important;
        backdrop-filter:blur(12px);font-family:'Nunito',sans-serif!important;}
      .leaflet-popup-tip{background:rgba(7,13,26,.96)!important;}
      .insight-card{border-radius:14px;padding:14px 16px;border:1px solid;transition:transform .18s;}
      .insight-card:hover{transform:translateY(-2px);}
      @keyframes fadeUp{from{opacity:0;transform:translateY(10px);}to{opacity:1;transform:none;}}
      .fade-up{animation:fadeUp .35s ease-out both;}
      .notif-bell{position:relative;cursor:pointer;}
      .notif-bell .dot{position:absolute;top:-2px;right:-2px;width:9px;height:9px;border-radius:50%;
        background:var(--danger);border:2px solid var(--bg);}
      .kpi-trend{display:inline-flex;align-items:center;gap:3px;font-size:11px;font-weight:700;margin-top:4px;}
      .kpi-trend.up{color:var(--success);} .kpi-trend.down{color:var(--danger);}
      .kpi-trend.flat{color:var(--muted);}
    `}</style>
  );
};

/* ─── SOCKET ──────────────────────────────────────── */

/* ─── HELPERS ─────────────────────────────────────── */
function MapAutoCenter({ position }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(position, map.getZoom(), { duration: 1.2 });
  }, [position]);
  return null;
}

function fmtNum(n) {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
  if (n >= 1000) return (n / 1000).toFixed(1) + "K";
  return String(n);
}

function timeNow() {
  return new Date().toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

/* ─── TOAST ───────────────────────────────────────── */
function Toast({ message, type = "info", onClose }) {
  const colors = {
    info: "var(--accent)",
    success: "var(--success)",
    danger: "var(--danger)",
    warning: "var(--warning)",
  };
  const icons = { info: "◈", success: "✦", danger: "✕", warning: "⚠" };
  return (
    <motion.div
      initial={{ x: 64, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 64, opacity: 0 }}
      style={{
        background: "var(--card)",
        border: `1px solid ${colors[type]}`,
        borderRadius: 14,
        padding: "12px 18px",
        display: "flex",
        alignItems: "center",
        gap: 10,
        boxShadow: "0 8px 32px rgba(0,0,0,.35)",
        maxWidth: 340,
        backdropFilter: "blur(18px)",
        fontFamily: "'Nunito',sans-serif",
        cursor: "pointer",
      }}
      onClick={onClose}
    >
      <span style={{ color: colors[type], fontSize: 15 }}>{icons[type]}</span>
      <span
        style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", flex: 1 }}
      >
        {message}
      </span>
    </motion.div>
  );
}

/* ─── NOTIFICATION PANEL ──────────────────────────── */
function NotifPanel({ notifs, onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10 }}
      style={{
        position: "absolute",
        top: 44,
        right: 0,
        width: 320,
        zIndex: 200,
        background: "var(--card)",
        border: "1px solid var(--card-border)",
        borderRadius: 16,
        boxShadow: "0 16px 48px rgba(0,0,0,.45)",
        backdropFilter: "blur(20px)",
        padding: "16px",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 12,
        }}
      >
        <span style={{ fontWeight: 800, fontSize: 13 }}>Thông báo</span>
        <button
          className="btn-ghost"
          style={{ padding: "3px 8px", fontSize: 11 }}
          onClick={onClose}
        >
          Đóng
        </button>
      </div>
      {notifs.length === 0 && (
        <p
          style={{
            color: "var(--muted)",
            fontSize: 13,
            textAlign: "center",
            padding: "18px 0",
          }}
        >
          Không có thông báo mới
        </p>
      )}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 8,
          maxHeight: 340,
          overflowY: "auto",
        }}
      >
        {notifs.map((n, i) => (
          <div
            key={i}
            style={{
              padding: "9px 12px",
              borderRadius: 10,
              background: "var(--surface)",
              borderLeft: `3px solid ${n.type === "success" ? "var(--success)" : n.type === "danger" ? "var(--danger)" : "var(--accent)"}`,
            }}
          >
            <div
              style={{
                fontSize: 12,
                fontWeight: 800,
                color: "var(--text)",
                marginBottom: 2,
              }}
            >
              {n.msg}
            </div>
            <div style={{ fontSize: 10, color: "var(--muted)" }}>{n.time}</div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

/* ─── STAT CARD ───────────────────────────────────── */
function StatCard({
  title,
  value,
  sub,
  color,
  icon,
  delay = 0,
  trend,
  sparkData,
}) {
  return (
    <motion.div
      className="stat-card"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <div style={{ flex: 1 }}>
          <p className="section-label">{title}</p>
          <h2
            style={{
              fontSize: 32,
              fontWeight: 900,
              color: color || "var(--text)",
              letterSpacing: "-1px",
              marginTop: 3,
              fontFamily: "'Raleway',sans-serif",
            }}
          >
            {value}
          </h2>
          {sub && (
            <p
              style={{
                fontSize: 11.5,
                color: "var(--muted)",
                marginTop: 3,
                fontWeight: 600,
              }}
            >
              {sub}
            </p>
          )}
          {trend !== undefined && (
            <span
              className={`kpi-trend ${trend > 0 ? "up" : trend < 0 ? "down" : "flat"}`}
            >
              {trend > 0 ? "▲" : trend < 0 ? "▼" : "→"} {Math.abs(trend)}% so
              hôm qua
            </span>
          )}
        </div>
        {icon && (
          <span
            style={{
              fontSize: 18,
              width: 40,
              height: 40,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "var(--surface)",
              borderRadius: 11,
              border: "1px solid var(--card-border)",
              flexShrink: 0,
            }}
          >
            {icon}
          </span>
        )}
      </div>
      {sparkData && sparkData.length > 1 && (
        <div style={{ marginTop: 10, height: 36 }}>
          <ResponsiveContainer width="100%" height={36}>
            <AreaChart
              data={sparkData}
              margin={{ top: 2, right: 0, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id={`sg-${title}`} x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="0%"
                    stopColor={color || "var(--accent)"}
                    stopOpacity={0.35}
                  />
                  <stop
                    offset="100%"
                    stopColor={color || "var(--accent)"}
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="v"
                stroke={color || "var(--accent)"}
                strokeWidth={1.5}
                fill={`url(#sg-${title})`}
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </motion.div>
  );
}

/* ─── MAIN APP ────────────────────────────────────── */
export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [page, setPage] = useState("dashboard");
  const [dark, setDark] = useState(true);
  const [history, setHistory] = useState([]);
  const [lastScan, setLastScan] = useState(null);
  const [orderList, setOrderList] = useState([]);
  const [scannedList, setScannedList] = useState([]);
  const [toasts, setToasts] = useState([]);
  const [notifs, setNotifs] = useState([]);
  const [showNotif, setShowNotif] = useState(false);

  // GPS / map
  const [shipperPos, setShipperPos] = useState([21.0285, 105.8542]);
  const [locationHistory, setLocationHistory] = useState([[21.0285, 105.8542]]);
  const [scanPoints, setScanPoints] = useState([]);

  // Stats for charts
  const [hourlyData, setHourlyData] = useState(() =>
    Array.from({ length: 12 }, (_, i) => ({
      h: `${(new Date().getHours() - 11 + i + 24) % 24}h`,
      ok: 0,
      fail: 0,
    })),
  );
  const [errorRate, setErrorRate] = useState(0);
  const [failCount, setFailCount] = useState(0);

  // Leaderboard mock
  const [leaderboard] = useState([
    { name: "Nguyễn Văn A", avatar: "A", scans: 0, streak: 12, badge: "🥇" },
    { name: "Trần Thị B", avatar: "B", scans: 0, streak: 7, badge: "🥈" },
    { name: "Lê Minh C", avatar: "C", scans: 0, streak: 3, badge: "🥉" },
  ]);

  const addToast = (msg, type = "info") => {
    const id = Date.now();
    setToasts((p) => [...p, { id, msg, type }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 4000);
  };
  const addNotif = (msg, type = "info") => {
    setNotifs((p) => [{ msg, type, time: timeNow() }, ...p].slice(0, 30));
  };

  useEffect(() => {
    socket.on("new_scan", (data) => {
      setHistory((prev) => [{ ...data, ts: Date.now() }, ...prev]);
      setLastScan(data);
      setScannedList((prev) =>
        prev.includes(data.code) ? prev : [...prev, data.code],
      );
      addToast(`Quét mã: ${data.code}`, "success");
      addNotif(`Quét thành công: ${data.code}`, "success");

      // update hourly
      setHourlyData((prev) => {
        const copy = [...prev];
        copy[copy.length - 1] = {
          ...copy[copy.length - 1],
          ok: copy[copy.length - 1].ok + 1,
        };
        return copy;
      });

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

    socket.on("scan_error", (data) => {
      setFailCount((p) => p + 1);
      setHistory((prev) => [{ ...data, ts: Date.now(), error: true }, ...prev]);
      addToast(`Lỗi quét: ${data.code}`, "danger");
      addNotif(`Lỗi quét: ${data.code}`, "danger");
      setHourlyData((prev) => {
        const copy = [...prev];
        copy[copy.length - 1] = {
          ...copy[copy.length - 1],
          fail: copy[copy.length - 1].fail + 1,
        };
        return copy;
      });
    });

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
      socket.off("scan_error");
      socket.off("shipper_location");
    };
  }, []);

  // Compute error rate
  useEffect(() => {
    const total = history.length;
    setErrorRate(total > 0 ? ((failCount / total) * 100).toFixed(1) : "0.0");
  }, [history.length, failCount]);

  if (!loggedIn) return <Login onLogin={() => setLoggedIn(true)} />;

  const okCount = history.length - failCount;

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
            background: dark ? "rgba(4,8,18,0.86)" : "rgba(234,240,255,0.84)",
            backdropFilter: "blur(2px)",
            zIndex: 0,
            pointerEvents: "none",
          }}
        />

        <Sidebar
          page={page}
          setPage={setPage}
          dark={dark}
          setDark={setDark}
          notifCount={notifs.filter((n) => n.type !== "info").length}
          showNotif={showNotif}
          setShowNotif={setShowNotif}
          notifs={notifs}
        />

        <main
          style={{
            flex: 1,
            padding: "36px 42px",
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
              transition={{ duration: 0.2 }}
            >
              {page === "dashboard" && (
                <Dashboard
                  history={history}
                  lastScan={lastScan}
                  okCount={okCount}
                  failCount={failCount}
                  errorRate={errorRate}
                  hourlyData={hourlyData}
                  dark={dark}
                />
              )}
              {page === "live" && (
                <LiveScan lastScan={lastScan} history={history} />
              )}
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
              {page === "leaderboard" && (
                <Leaderboard leaderboard={leaderboard} history={history} />
              )}
              {page === "analytics" && (
                <Analytics
                  history={history}
                  hourlyData={hourlyData}
                  failCount={failCount}
                />
              )}
              {page === "history" && <History history={history} />}
              {page === "settings" && (
                <Settings
                  logout={() => setLoggedIn(false)}
                  dark={dark}
                  setDark={setDark}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Toasts */}
      <div
        style={{
          position: "fixed",
          bottom: 22,
          right: 22,
          zIndex: 9999,
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}
      >
        <AnimatePresence>
          {toasts.map((t) => (
            <Toast
              key={t.id}
              message={t.msg}
              type={t.type}
              onClose={() => setToasts((p) => p.filter((x) => x.id !== t.id))}
            />
          ))}
        </AnimatePresence>
      </div>
    </>
  );
}

/* ─── SIDEBAR ─────────────────────────────────────── */
const NAV = [
  { id: "dashboard", icon: "⬡", label: "Dashboard", section: "Điều hành" },
  { id: "live", icon: "◉", label: "Live Scan" },
  { id: "orders", icon: "▣", label: "Đơn hàng" },
  { id: "map", icon: "◎", label: "Bản đồ GPS" },
  { id: "scan", icon: "◈", label: "Scan GPS" },
  { id: "leaderboard", icon: "⊛", label: "Leaderboard", section: "Phân tích" },
  { id: "analytics", icon: "▦", label: "Analytics" },
  { id: "history", icon: "▤", label: "Lịch sử" },
  { id: "settings", icon: "⚙", label: "Cài đặt", section: "Hệ thống" },
];

function Sidebar({
  page,
  setPage,
  dark,
  setDark,
  notifCount,
  showNotif,
  setShowNotif,
  notifs,
}) {
  return (
    <aside
      style={{
        width: 220,
        minHeight: "100vh",
        background: "var(--sidebar)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderRight: "1px solid var(--card-border)",
        padding: "28px 12px",
        display: "flex",
        flexDirection: "column",
        position: "sticky",
        top: 0,
        zIndex: 10,
      }}
    >
      {/* Logo */}
      <div style={{ padding: "0 10px", marginBottom: 32 }}>
        <div
          style={{
            fontSize: 10,
            letterSpacing: ".2em",
            color: "var(--muted)",
            textTransform: "uppercase",
            marginBottom: 2,
            fontWeight: 700,
          }}
        >
          Hệ thống
        </div>
        <div
          style={{
            fontFamily: "'Raleway',sans-serif",
            fontSize: 19,
            fontWeight: 900,
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
            marginTop: 5,
          }}
        >
          <span className="pulse-dot" />
          <span
            style={{ fontSize: 11, color: "var(--success)", fontWeight: 700 }}
          >
            Trực tuyến
          </span>
        </div>
      </div>

      {/* Notif button */}
      <div
        style={{ padding: "0 10px", marginBottom: 14, position: "relative" }}
      >
        <button
          className="btn-ghost"
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            gap: 8,
            justifyContent: "space-between",
          }}
          onClick={() => setShowNotif((p) => !p)}
        >
          <span style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <span>🔔</span> Thông báo
          </span>
          {notifCount > 0 && (
            <span
              style={{
                background: "var(--danger)",
                color: "#fff",
                borderRadius: 10,
                fontSize: 10,
                fontWeight: 800,
                padding: "1px 7px",
              }}
            >
              {notifCount}
            </span>
          )}
        </button>
        <AnimatePresence>
          {showNotif && (
            <NotifPanel notifs={notifs} onClose={() => setShowNotif(false)} />
          )}
        </AnimatePresence>
      </div>

      {/* Nav */}
      <nav
        style={{ flex: 1, display: "flex", flexDirection: "column", gap: 1 }}
      >
        {NAV.map((item) => (
          <React.Fragment key={item.id}>
            {item.section && (
              <div
                style={{
                  fontSize: 9.5,
                  letterSpacing: ".18em",
                  color: "var(--muted)",
                  textTransform: "uppercase",
                  fontWeight: 700,
                  padding: "10px 13px 3px",
                  marginTop: 4,
                }}
              >
                {item.section}
              </div>
            )}
            <NavItem
              item={item}
              active={page === item.id}
              onClick={() => setPage(item.id)}
            />
          </React.Fragment>
        ))}
      </nav>

      <button
        onClick={() => setDark(!dark)}
        style={{
          marginTop: 18,
          padding: "9px 12px",
          background: "var(--surface)",
          border: "1px solid var(--card-border)",
          borderRadius: 10,
          color: "var(--muted)",
          fontSize: 12,
          fontWeight: 700,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: 7,
          fontFamily: "'Nunito',sans-serif",
          transition: "color .2s",
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
        gap: 10,
        padding: "9px 12px",
        borderRadius: 9,
        border: "none",
        cursor: "pointer",
        background: active ? "var(--menu-active)" : "transparent",
        color: active ? "var(--accent)" : "var(--muted)",
        fontWeight: active ? 800 : 600,
        fontSize: 13,
        textAlign: "left",
        fontFamily: "'Nunito',sans-serif",
        transition: "background .15s,color .15s",
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
      <span style={{ fontSize: 13 }}>{item.icon}</span>
      {item.label}
    </motion.button>
  );
}

/* ─── DASHBOARD ───────────────────────────────────── */
function Dashboard({
  history,
  lastScan,
  okCount,
  failCount,
  errorRate,
  hourlyData,
  dark,
}) {
  const sparkData = history
    .slice(0, 12)
    .reverse()
    .map((_, i) => ({ v: i + 1 }));

  const pieData = [
    { name: "Thành công", value: okCount, color: "#34d399" },
    { name: "Thất bại", value: failCount || 0, color: "#f87171" },
  ];

  const aiInsights = [
    {
      type: "success",
      icon: "🧠",
      title: "Hiệu suất tốt",
      desc: `${okCount} lần quét không lỗi liên tiếp. Thiết bị hoạt động ổn định.`,
    },
    {
      type: "warning",
      icon: "⚡",
      title: "Dự báo tải",
      desc: "Dự kiến đạt 500 lần quét trước 17:00 dựa trên xu hướng hiện tại.",
    },
    {
      type: "info",
      icon: "📍",
      title: "GPS chính xác",
      desc: `${history.filter((h) => h.lat).length} điểm quét có tọa độ GPS đầy đủ.`,
    },
  ];

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 26,
        }}
      >
        <div>
          <p className="section-label">Tổng quan</p>
          <h1 className="page-title">Bảng điều khiển</h1>
          <p style={{ color: "var(--muted)", fontSize: 13.5, fontWeight: 500 }}>
            Giám sát quét mã QR theo thời gian thực
          </p>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span className="badge badge-success">
            <span className="pulse-dot" style={{ width: 6, height: 6 }} /> Live
          </span>
        </div>
      </div>

      {/* KPIs */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4,1fr)",
          gap: 12,
          marginBottom: 18,
        }}
      >
        <StatCard
          title="Tổng quét"
          value={fmtNum(history.length)}
          icon="⬡"
          delay={0}
          trend={12}
          sparkData={sparkData}
        />
        <StatCard
          title="Thành công"
          value={fmtNum(okCount)}
          icon="✓"
          color="var(--success)"
          sub="Hôm nay"
          delay={0.05}
          trend={5}
        />
        <StatCard
          title="Thất bại"
          value={fmtNum(failCount)}
          icon="✕"
          color="var(--danger)"
          delay={0.1}
          trend={-2}
        />
        <StatCard
          title="Tỉ lệ lỗi"
          value={`${errorRate}%`}
          icon="◎"
          color={parseFloat(errorRate) > 5 ? "var(--danger)" : "var(--success)"}
          delay={0.15}
        />
      </div>

      {/* Last scan banner */}
      <AnimatePresence>
        {lastScan && (
          <motion.div
            key={lastScan.code}
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
              background:
                "linear-gradient(135deg,rgba(52,211,153,.07),rgba(56,189,248,.07))",
              border: "1px solid rgba(52,211,153,.25)",
              borderRadius: 13,
              padding: "12px 18px",
              display: "flex",
              alignItems: "center",
              gap: 14,
              marginBottom: 4,
            }}
          >
            <span className="pulse-dot" />
            <div>
              <span
                style={{
                  fontSize: 10,
                  color: "var(--muted)",
                  fontWeight: 800,
                  letterSpacing: ".12em",
                  textTransform: "uppercase",
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
            {lastScan.lat && (
              <span
                style={{
                  marginLeft: "auto",
                  fontSize: 11,
                  color: "var(--accent)",
                  fontFamily: "'JetBrains Mono',monospace",
                }}
              >
                📍 {Number(lastScan.lat).toFixed(5)},{" "}
                {Number(lastScan.lng).toFixed(5)}
              </span>
            )}
            {lastScan.time && (
              <span
                style={{
                  fontSize: 11,
                  color: "var(--muted)",
                  fontFamily: "'JetBrains Mono',monospace",
                }}
              >
                {lastScan.time}
              </span>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Charts row */}
      <div
        style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 14 }}
      >
        {/* Area chart */}
        <div className="panel">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <div>
              <p className="section-label">Hoạt động</p>
              <h3 style={{ fontWeight: 800, fontSize: 14 }}>
                Biểu đồ quét mã theo giờ
              </h3>
            </div>
            <span className="badge badge-info">{history.length} sự kiện</span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={hourlyData} barGap={2}>
              <defs>
                <linearGradient id="gOk" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#34d399" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="#34d399" stopOpacity={0.4} />
                </linearGradient>
                <linearGradient id="gFail" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f87171" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="#f87171" stopOpacity={0.4} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--card-border)"
                vertical={false}
              />
              <XAxis
                dataKey="h"
                tick={{
                  fontSize: 10,
                  fill: "var(--muted)",
                  fontFamily: "Nunito",
                }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: "var(--muted)" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  background: "var(--card)",
                  border: "1px solid var(--card-border)",
                  borderRadius: 10,
                  fontSize: 12,
                  fontFamily: "Nunito",
                  color: "var(--text)",
                }}
              />
              <Bar
                dataKey="ok"
                name="Thành công"
                fill="url(#gOk)"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="fail"
                name="Thất bại"
                fill="url(#gFail)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie */}
        <div
          className="panel"
          style={{ display: "flex", flexDirection: "column" }}
        >
          <p className="section-label" style={{ marginBottom: 8 }}>
            Phân bố kết quả
          </p>
          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <PieChart width={200} height={180}>
              <Pie
                data={pieData}
                cx={100}
                cy={90}
                innerRadius={50}
                outerRadius={80}
                paddingAngle={3}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: "var(--card)",
                  border: "1px solid var(--card-border)",
                  borderRadius: 10,
                  fontSize: 12,
                  fontFamily: "Nunito",
                  color: "var(--text)",
                }}
              />
            </PieChart>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {pieData.map((d, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div
                    style={{
                      width: 9,
                      height: 9,
                      borderRadius: 2,
                      background: d.color,
                    }}
                  />
                  <span
                    style={{
                      fontSize: 12,
                      color: "var(--muted)",
                      fontWeight: 600,
                    }}
                  >
                    {d.name}
                  </span>
                </div>
                <span style={{ fontSize: 13, fontWeight: 800, color: d.color }}>
                  {d.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AI Insights */}
      <div className="panel">
        <p className="section-label" style={{ marginBottom: 14 }}>
          🧠 AI Insights
        </p>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3,1fr)",
            gap: 12,
          }}
        >
          {aiInsights.map((ins, i) => (
            <motion.div
              key={i}
              className="insight-card fade-up"
              style={{
                borderColor:
                  ins.type === "success"
                    ? "rgba(52,211,153,.3)"
                    : ins.type === "warning"
                      ? "rgba(251,191,36,.3)"
                      : "rgba(56,189,248,.3)",
                background:
                  ins.type === "success"
                    ? "rgba(52,211,153,.05)"
                    : ins.type === "warning"
                      ? "rgba(251,191,36,.05)"
                      : "rgba(56,189,248,.05)",
                animationDelay: `${i * 0.08}s`,
              }}
            >
              <div style={{ fontSize: 18, marginBottom: 7 }}>{ins.icon}</div>
              <div style={{ fontSize: 12.5, fontWeight: 800, marginBottom: 4 }}>
                {ins.title}
              </div>
              <div
                style={{
                  fontSize: 11.5,
                  color: "var(--muted)",
                  lineHeight: 1.5,
                }}
              >
                {ins.desc}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── LIVE SCAN ───────────────────────────────────── */
function LiveScan({ lastScan, history }) {
  const [flash, setFlash] = useState(false);
  const prevCode = useRef(null);
  const recent = history.slice(0, 8);

  useEffect(() => {
    if (lastScan && lastScan.code !== prevCode.current) {
      prevCode.current = lastScan.code;
      setFlash(true);
      setTimeout(() => setFlash(false), 750);
    }
  }, [lastScan]);

  return (
    <div>
      <div style={{ marginBottom: 26 }}>
        <p className="section-label">Thời gian thực</p>
        <h1 className="page-title">Màn hình quét trực tiếp</h1>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {/* Scanner display */}
        <div
          className="panel"
          style={{
            minHeight: 300,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {lastScan ? (
            <motion.div
              key={lastScan.code}
              initial={{ scale: 0.75, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              style={{ textAlign: "center" }}
            >
              <p className="section-label" style={{ marginBottom: 10 }}>
                Mã vừa quét
              </p>
              <div
                className={flash ? "scan-flash" : ""}
                style={{
                  fontSize: 26,
                  fontWeight: 700,
                  color: "var(--accent)",
                  fontFamily: "'JetBrains Mono',monospace",
                  letterSpacing: ".05em",
                  padding: "18px 26px",
                  background: "var(--surface)",
                  borderRadius: 14,
                  border: "1px solid var(--card-border)",
                  marginBottom: 14,
                  transition: "box-shadow .2s",
                }}
              >
                {lastScan.code}
              </div>
              <span
                className="badge badge-success"
                style={{ marginBottom: 10 }}
              >
                ◉ Quét OK
              </span>
              {lastScan.time && (
                <p
                  style={{
                    fontSize: 12,
                    color: "var(--muted)",
                    marginTop: 8,
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
              <div style={{ fontSize: 46, marginBottom: 10, opacity: 0.15 }}>
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

        {/* Status + recent */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div className="panel panel-0">
            <p className="section-label" style={{ marginBottom: 12 }}>
              Trạng thái kết nối
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                { label: "WebSocket Server", status: "Đã kết nối", ok: true },
                { label: "Thiết bị quét", status: "Sẵn sàng", ok: true },
                { label: "Đồng bộ CSDL", status: "Hoạt động", ok: true },
                { label: "GPS Module", status: "Đang theo dõi", ok: true },
              ].map((item) => (
                <div
                  key={item.label}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "9px 13px",
                    background: "var(--surface)",
                    borderRadius: 9,
                  }}
                >
                  <span style={{ fontSize: 12.5, fontWeight: 700 }}>
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

          <div className="panel panel-0" style={{ flex: 1 }}>
            <p className="section-label" style={{ marginBottom: 12 }}>
              Quét gần đây
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {recent.length === 0 && (
                <p
                  style={{
                    color: "var(--muted)",
                    fontSize: 13,
                    textAlign: "center",
                    padding: "12px 0",
                  }}
                >
                  Chưa có dữ liệu
                </p>
              )}
              {recent.map((s, i) => (
                <div
                  key={i}
                  className="row-new"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "7px 10px",
                    background: "var(--surface)",
                    borderRadius: 8,
                    borderLeft: `3px solid ${s.error ? "var(--danger)" : "var(--success)"}`,
                  }}
                >
                  <span
                    style={{
                      fontSize: 10,
                      fontFamily: "'JetBrains Mono',monospace",
                      color: "var(--accent)",
                      flex: 1,
                    }}
                  >
                    {s.code}
                  </span>
                  <span
                    className={`badge ${s.error ? "badge-danger" : "badge-success"}`}
                    style={{ fontSize: 9 }}
                  >
                    {s.error ? "✕ Lỗi" : "✓ OK"}
                  </span>
                  <span style={{ fontSize: 10, color: "var(--muted)" }}>
                    {s.time || "—"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── ORDERS ──────────────────────────────────────── */
function Orders({ orderList, setOrderList, scannedList, addToast }) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all"); // all | scanned | pending
  const scannedCount = orderList.filter((o) =>
    scannedList.includes(o.QR),
  ).length;

  const uploadExcel = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const wb = XLSX.read(new Uint8Array(evt.target.result), {
        type: "array",
      });
      const json = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
      setOrderList(json);
      addToast(`Đã tải ${json.length} đơn hàng`, "success");
    };
    reader.readAsArrayBuffer(file);
  };

  const exportExcel = () => {
    const data = orderList.map((o) => ({
      ...o,
      Trạng_thái: scannedList.includes(o.QR) ? "Đã quét" : "Chờ xử lý",
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Đơn hàng");
    XLSX.writeFile(
      wb,
      `don_hang_${new Date().toLocaleDateString("vi-VN").replace(/\//g, "-")}.xlsx`,
    );
    addToast("Đã xuất file Excel!", "success");
  };

  const filtered = orderList.filter((o) => {
    const matchSearch =
      !search ||
      (o.Customer || "").toLowerCase().includes(search.toLowerCase()) ||
      (o.QR || "").toLowerCase().includes(search.toLowerCase());
    const done = scannedList.includes(o.QR);
    const matchFilter =
      filter === "all" ||
      (filter === "scanned" && done) ||
      (filter === "pending" && !done);
    return matchSearch && matchFilter;
  });

  const progress =
    orderList.length > 0 ? (scannedCount / orderList.length) * 100 : 0;

  return (
    <div>
      <div style={{ marginBottom: 26 }}>
        <p className="section-label">Quản lý</p>
        <h1 className="page-title">Đơn hàng</h1>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3,1fr)",
          gap: 12,
          marginBottom: 18,
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

      {/* Progress bar */}
      {orderList.length > 0 && (
        <div className="panel" style={{ marginBottom: 0 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 8,
            }}
          >
            <span style={{ fontSize: 12.5, fontWeight: 700 }}>
              Tiến độ hoàn thành
            </span>
            <span
              style={{ fontSize: 13, fontWeight: 900, color: "var(--success)" }}
            >
              {progress.toFixed(1)}%
            </span>
          </div>
          <div className="progress-bar-bg">
            <div
              className="progress-bar"
              style={{
                width: `${progress}%`,
                background: `linear-gradient(90deg,var(--success),var(--accent))`,
              }}
            />
          </div>
        </div>
      )}

      {/* Toolbar */}
      <div
        style={{
          display: "flex",
          gap: 10,
          alignItems: "center",
          marginTop: 18,
          marginBottom: 4,
          flexWrap: "wrap",
        }}
      >
        <label className="file-input-wrapper" style={{ marginBottom: 0 }}>
          <input type="file" accept=".xlsx,.xls" onChange={uploadExcel} />
          <span>⊕</span> Tải lên Excel
        </label>
        {orderList.length > 0 && (
          <button className="btn-ghost" onClick={exportExcel}>
            ⬇ Xuất Excel
          </button>
        )}
        <input
          placeholder="Tìm kiếm..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            padding: "8px 13px",
            background: "var(--surface)",
            border: "1px solid var(--card-border)",
            borderRadius: 9,
            color: "var(--text)",
            fontSize: 12.5,
            fontFamily: "'Nunito',sans-serif",
            outline: "none",
            width: 200,
          }}
        />
        {["all", "scanned", "pending"].map((f) => (
          <button
            key={f}
            className={filter === f ? "btn-primary" : "btn-ghost"}
            style={{ padding: "7px 14px", fontSize: 11.5 }}
            onClick={() => setFilter(f)}
          >
            {f === "all" ? "Tất cả" : f === "scanned" ? "Đã quét" : "Chờ xử lý"}
          </button>
        ))}
      </div>

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
            {filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  style={{
                    textAlign: "center",
                    color: "var(--muted)",
                    padding: "36px 0",
                    fontWeight: 600,
                  }}
                >
                  {orderList.length === 0
                    ? "Chưa có đơn hàng. Tải lên file Excel để bắt đầu."
                    : "Không tìm thấy kết quả."}
                </td>
              </tr>
            ) : (
              filtered.map((o, i) => {
                const done = scannedList.includes(o.QR);
                return (
                  <motion.tr
                    key={i}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.015 }}
                  >
                    <td
                      style={{
                        color: "var(--muted)",
                        fontFamily: "'JetBrains Mono',monospace",
                        fontSize: 11,
                      }}
                    >
                      {String(i + 1).padStart(3, "0")}
                    </td>
                    <td style={{ fontWeight: 700 }}>{o.Customer}</td>
                    <td
                      style={{
                        fontFamily: "'JetBrains Mono',monospace",
                        fontSize: 11.5,
                        color: "var(--accent)",
                        fontWeight: 700,
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

/* ─── DELIVERY MAP ────────────────────────────────── */
function DeliveryMap({ shipperPos, locationHistory, scanPoints }) {
  const totalDist =
    locationHistory.length < 2
      ? 0
      : locationHistory.reduce((acc, cur, i) => {
          if (i === 0) return 0;
          const prev = locationHistory[i - 1];
          const R = 6371000,
            dLat = ((cur[0] - prev[0]) * Math.PI) / 180,
            dLng = ((cur[1] - prev[1]) * Math.PI) / 180;
          const a =
            Math.sin(dLat / 2) ** 2 +
            Math.cos((prev[0] * Math.PI) / 180) *
              Math.cos((cur[0] * Math.PI) / 180) *
              Math.sin(dLng / 2) ** 2;
          return acc + R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        }, 0);

  return (
    <div>
      <div style={{ marginBottom: 26 }}>
        <p className="section-label">Vận chuyển</p>
        <h1 className="page-title">Theo dõi giao hàng</h1>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3,1fr)",
          gap: 12,
          marginBottom: 16,
        }}
      >
        {[
          {
            label: "Vĩ độ",
            val: shipperPos[0].toFixed(5),
            sub: "Kinh độ: " + shipperPos[1].toFixed(5),
            color: "var(--accent)",
            icon: "📍",
          },
          {
            label: "Trạng thái",
            val: "Trực tiếp",
            sub: "Đang theo dõi",
            color: "var(--success)",
            icon: "◉",
          },
          {
            label: "Khoảng cách",
            val:
              totalDist < 1000
                ? `${totalDist.toFixed(0)}m`
                : `${(totalDist / 1000).toFixed(2)}km`,
            sub: `${scanPoints.length} điểm quét`,
            color: "var(--warning)",
            icon: "⊛",
          },
        ].map((item, i) => (
          <StatCard
            key={i}
            title={item.label}
            value={item.val}
            sub={item.sub}
            color={item.color}
            icon={item.icon}
            delay={i * 0.05}
          />
        ))}
      </div>

      <div
        style={{
          borderRadius: 18,
          overflow: "hidden",
          border: "1px solid var(--card-border)",
          boxShadow: "0 8px 32px rgba(0,0,0,.3)",
        }}
      >
        <MapContainer
          center={shipperPos}
          zoom={14}
          style={{ height: 440, width: "100%" }}
        >
          <TileLayer
            attribution="© OpenStreetMap"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapAutoCenter position={shipperPos} />
          {locationHistory.length > 1 && (
            <Polyline
              positions={locationHistory}
              pathOptions={{
                color: "#38bdf8",
                weight: 3,
                opacity: 0.8,
                dashArray: "6 4",
              }}
            />
          )}
          <Marker position={shipperPos} icon={shipperIcon}>
            <Popup>
              <div style={{ fontFamily: "'Nunito',sans-serif", minWidth: 160 }}>
                <div
                  style={{ fontWeight: 800, marginBottom: 5, color: "#34d399" }}
                >
                  📦 Vị trí Shipper
                </div>
                <div style={{ fontSize: 11.5, color: "#94a3b8" }}>
                  Lat: {shipperPos[0].toFixed(6)}
                </div>
                <div style={{ fontSize: 11.5, color: "#94a3b8" }}>
                  Lng: {shipperPos[1].toFixed(6)}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: "#38bdf8",
                    marginTop: 4,
                    fontWeight: 700,
                  }}
                >
                  ● Đang hoạt động
                </div>
              </div>
            </Popup>
          </Marker>
          {scanPoints.map((sp, i) => (
            <Marker key={i} position={[sp.lat, sp.lng]} icon={qrIcon}>
              <Popup>
                <div
                  style={{ fontFamily: "'Nunito',sans-serif", minWidth: 170 }}
                >
                  <div
                    style={{
                      fontWeight: 800,
                      marginBottom: 4,
                      color: "#38bdf8",
                    }}
                  >
                    ◈ Điểm quét #{i + 1}
                  </div>
                  <div
                    style={{
                      fontFamily: "'JetBrains Mono',monospace",
                      fontSize: 11.5,
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
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {scanPoints.length > 0 && (
        <div className="panel">
          <p className="section-label" style={{ marginBottom: 12 }}>
            Lịch sử điểm quét
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
                      fontSize: 11,
                    }}
                  >
                    {String(i + 1).padStart(3, "0")}
                  </td>
                  <td
                    style={{
                      fontFamily: "'JetBrains Mono',monospace",
                      fontSize: 11.5,
                      color: "var(--accent)",
                      fontWeight: 700,
                    }}
                  >
                    {sp.code}
                  </td>
                  <td
                    style={{
                      fontFamily: "'JetBrains Mono',monospace",
                      fontSize: 11,
                    }}
                  >
                    {sp.lat.toFixed(6)}
                  </td>
                  <td
                    style={{
                      fontFamily: "'JetBrains Mono',monospace",
                      fontSize: 11,
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

/* ─── LEADERBOARD ─────────────────────────────────── */
function Leaderboard({ leaderboard, history }) {
  const boards = leaderboard
    .map((p, i) => ({
      ...p,
      scans: history.length > 0 ? Math.floor(history.length / (i + 1)) : 0,
      ok:
        history.length > 0 ? Math.floor((history.length / (i + 1)) * 0.96) : 0,
      points:
        history.length > 0 ? Math.floor((history.length / (i + 1)) * 10) : 0,
    }))
    .sort((a, b) => b.points - a.points);
  const maxPts = Math.max(1, ...boards.map((b) => b.points));

  return (
    <div>
      <div style={{ marginBottom: 26 }}>
        <p className="section-label">Phân tích</p>
        <h1 className="page-title">Leaderboard Scanner</h1>
        <p style={{ color: "var(--muted)", fontSize: 13.5, fontWeight: 500 }}>
          Xếp hạng hiệu suất nhân viên theo thời gian thực
        </p>
      </div>

      {/* Top 3 podium */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1.15fr 1fr",
          gap: 12,
          marginBottom: 18,
        }}
      >
        {[1, 0, 2].map((idx) => {
          const p = boards[idx];
          if (!p) return <div key={idx} />;
          const isFirst = idx === 0;
          return (
            <motion.div
              key={p.name}
              className="stat-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.06 }}
              style={{
                textAlign: "center",
                borderColor: isFirst
                  ? "rgba(251,191,36,.35)"
                  : "var(--card-border)",
              }}
            >
              <div style={{ fontSize: 28, marginBottom: 8 }}>{p.badge}</div>
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: "50%",
                  margin: "0 auto 10px",
                  background: "var(--menu-active)",
                  border: "2px solid var(--accent)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 20,
                  fontWeight: 900,
                  color: "var(--accent)",
                }}
              >
                {p.avatar}
              </div>
              <div style={{ fontSize: 13.5, fontWeight: 800 }}>{p.name}</div>
              <div
                style={{ fontSize: 11, color: "var(--muted)", marginTop: 3 }}
              >
                {p.scans} scans
              </div>
              <div
                style={{
                  fontSize: 22,
                  fontWeight: 900,
                  color: "var(--warning)",
                  marginTop: 6,
                  fontFamily: "'Raleway',sans-serif",
                }}
              >
                {p.points}
              </div>
              <div style={{ fontSize: 10, color: "var(--muted)" }}>điểm</div>
              {p.streak > 0 && (
                <span
                  className="badge badge-success"
                  style={{ marginTop: 8, fontSize: 10 }}
                >
                  🔥 {p.streak} ngày liên tiếp
                </span>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Full table */}
      <div className="panel">
        <p className="section-label" style={{ marginBottom: 14 }}>
          Bảng xếp hạng đầy đủ
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {boards.map((p, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                padding: "12px 16px",
                background: "var(--surface)",
                borderRadius: 11,
                border: `1px solid ${i === 0 ? "rgba(251,191,36,.25)" : "transparent"}`,
              }}
            >
              <span style={{ fontSize: 18, width: 28, textAlign: "center" }}>
                {p.badge || i + 1}
              </span>
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: "50%",
                  background: "var(--menu-active)",
                  border: "2px solid var(--card-border)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 16,
                  fontWeight: 900,
                  color: "var(--accent)",
                }}
              >
                {p.avatar}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13.5, fontWeight: 800 }}>{p.name}</div>
                <div
                  style={{ fontSize: 11, color: "var(--muted)", marginTop: 1 }}
                >
                  {p.ok}/{p.scans} OK · Streak {p.streak} ngày
                </div>
                <div
                  className="progress-bar-bg"
                  style={{ marginTop: 5, height: 4 }}
                >
                  <div
                    className="progress-bar"
                    style={{
                      width: `${(p.points / maxPts) * 100}%`,
                      background:
                        "linear-gradient(90deg,var(--success),var(--accent))",
                    }}
                  />
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div
                  style={{
                    fontSize: 20,
                    fontWeight: 900,
                    color: "var(--warning)",
                    fontFamily: "'Raleway',sans-serif",
                  }}
                >
                  {p.points}
                </div>
                <div style={{ fontSize: 10, color: "var(--muted)" }}>điểm</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── ANALYTICS ───────────────────────────────────── */
function Analytics({ history, hourlyData, failCount }) {
  const okCount = history.length - failCount;
  const rateData = hourlyData.map((h) => ({
    h: h.h,
    rate: h.ok + h.fail > 0 ? ((h.fail / (h.ok + h.fail)) * 100).toFixed(1) : 0,
  }));

  return (
    <div>
      <div style={{ marginBottom: 26 }}>
        <p className="section-label">Phân tích</p>
        <h1 className="page-title">Analytics nâng cao</h1>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 14,
          marginBottom: 14,
        }}
      >
        {/* Error rate trend */}
        <div className="panel panel-0">
          <div style={{ marginBottom: 14 }}>
            <p className="section-label">Xu hướng tỉ lệ lỗi theo giờ</p>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={rateData}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--card-border)"
                vertical={false}
              />
              <XAxis
                dataKey="h"
                tick={{ fontSize: 10, fill: "var(--muted)" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: "var(--muted)" }}
                axisLine={false}
                tickLine={false}
                unit="%"
              />
              <Tooltip
                contentStyle={{
                  background: "var(--card)",
                  border: "1px solid var(--card-border)",
                  borderRadius: 10,
                  fontSize: 12,
                  fontFamily: "Nunito",
                  color: "var(--text)",
                }}
              />
              <Line
                type="monotone"
                dataKey="rate"
                stroke="var(--danger)"
                strokeWidth={2}
                dot={{ fill: "var(--danger)", r: 3 }}
                name="Tỉ lệ lỗi %"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Radial gauge */}
        <div
          className="panel panel-0"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <p className="section-label" style={{ marginBottom: 10 }}>
            Hiệu suất tổng thể
          </p>
          <RadialBarChart
            width={200}
            height={160}
            innerRadius={50}
            outerRadius={80}
            data={[
              {
                name: "OK",
                value:
                  history.length > 0
                    ? Math.round((okCount / history.length) * 100)
                    : 100,
                fill: "#34d399",
              },
            ]}
            startAngle={180}
            endAngle={0}
          >
            <RadialBar dataKey="value" cornerRadius={8} />
          </RadialBarChart>
          <div style={{ textAlign: "center", marginTop: -10 }}>
            <div
              style={{
                fontSize: 28,
                fontWeight: 900,
                color: "var(--success)",
                fontFamily: "'Raleway',sans-serif",
              }}
            >
              {history.length > 0
                ? Math.round((okCount / history.length) * 100)
                : 100}
              %
            </div>
            <div
              style={{ fontSize: 12, color: "var(--muted)", fontWeight: 600 }}
            >
              Tỉ lệ thành công
            </div>
          </div>
        </div>
      </div>

      {/* Summary table */}
      <div className="panel panel-0">
        <p className="section-label" style={{ marginBottom: 14 }}>
          Thống kê theo giờ
        </p>
        <table>
          <thead>
            <tr>
              <th>Giờ</th>
              <th>Thành công</th>
              <th>Thất bại</th>
              <th>Tổng</th>
              <th>Tỉ lệ lỗi</th>
            </tr>
          </thead>
          <tbody>
            {hourlyData.map((h, i) => {
              const total = h.ok + h.fail;
              const rate =
                total > 0 ? ((h.fail / total) * 100).toFixed(1) : "0.0";
              return (
                <tr key={i}>
                  <td
                    style={{
                      fontFamily: "'JetBrains Mono',monospace",
                      fontSize: 12,
                      color: "var(--muted)",
                    }}
                  >
                    {h.h}
                  </td>
                  <td style={{ color: "var(--success)", fontWeight: 700 }}>
                    {h.ok}
                  </td>
                  <td
                    style={{
                      color: h.fail > 0 ? "var(--danger)" : "var(--muted)",
                      fontWeight: 700,
                    }}
                  >
                    {h.fail}
                  </td>
                  <td style={{ fontWeight: 700 }}>{total}</td>
                  <td>
                    <span
                      className={`badge ${parseFloat(rate) > 5 ? "badge-danger" : parseFloat(rate) > 0 ? "badge-warning" : "badge-success"}`}
                    >
                      {rate}%
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ─── HISTORY ─────────────────────────────────────── */
function History({ history }) {
  const [search, setSearch] = useState("");
  const filtered = history.filter(
    (h) =>
      !search || (h.code || "").toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div>
      <div style={{ marginBottom: 26 }}>
        <p className="section-label">Nhật ký</p>
        <h1 className="page-title">Lịch sử quét</h1>
      </div>
      <div
        style={{
          display: "flex",
          gap: 10,
          marginBottom: 4,
          alignItems: "center",
        }}
      >
        <input
          placeholder="Tìm kiếm mã QR..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            padding: "8px 13px",
            background: "var(--surface)",
            border: "1px solid var(--card-border)",
            borderRadius: 9,
            color: "var(--text)",
            fontSize: 12.5,
            fontFamily: "'Nunito',sans-serif",
            outline: "none",
            width: 240,
          }}
        />
        <span className="badge badge-info">{filtered.length} bản ghi</span>
      </div>
      <div className="panel">
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Mã QR</th>
              <th>Thời gian</th>
              <th>GPS</th>
              <th>Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  style={{
                    textAlign: "center",
                    color: "var(--muted)",
                    padding: "36px 0",
                    fontWeight: 600,
                  }}
                >
                  Chưa có dữ liệu quét.
                </td>
              </tr>
            ) : (
              filtered.map((h, i) => (
                <motion.tr
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.01 }}
                >
                  <td
                    style={{
                      color: "var(--muted)",
                      fontFamily: "'JetBrains Mono',monospace",
                      fontSize: 11,
                    }}
                  >
                    {String(i + 1).padStart(3, "0")}
                  </td>
                  <td
                    style={{
                      fontFamily: "'JetBrains Mono',monospace",
                      fontSize: 12.5,
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
                  <td
                    style={{
                      fontSize: 11,
                      fontFamily: "'JetBrains Mono',monospace",
                      color: h.lat ? "var(--success)" : "var(--muted)",
                    }}
                  >
                    {h.lat
                      ? `${Number(h.lat).toFixed(4)}, ${Number(h.lng).toFixed(4)}`
                      : "—"}
                  </td>
                  <td>
                    <span
                      className={`badge ${h.error ? "badge-danger" : "badge-success"}`}
                    >
                      {h.error ? "✕ Lỗi" : "✓ OK"}
                    </span>
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

/* ─── SETTINGS ────────────────────────────────────── */
function Settings({ logout, dark, setDark }) {
  const [serverUrl, setServerUrl] = useState(
    "https://qr-server-n6pp.onrender.com",
  );
  const [sound, setSound] = useState(true);
  const [autoExport, setAutoExport] = useState(false);

  const Toggle = ({ value, onChange }) => (
    <div
      onClick={() => onChange(!value)}
      style={{
        width: 44,
        height: 24,
        borderRadius: 12,
        cursor: "pointer",
        background: value ? "var(--success)" : "var(--surface)",
        border: "1px solid var(--card-border)",
        position: "relative",
        transition: "background .2s",
      }}
    >
      <div
        style={{
          width: 18,
          height: 18,
          borderRadius: "50%",
          background: "#fff",
          position: "absolute",
          top: 2,
          left: value ? 22 : 2,
          transition: "left .2s",
        }}
      />
    </div>
  );

  return (
    <div>
      <div style={{ marginBottom: 26 }}>
        <p className="section-label">Hệ thống</p>
        <h1 className="page-title">Cài đặt</h1>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 14,
          maxWidth: 700,
        }}
      >
        {/* Account */}
        <div className="panel panel-0">
          <p className="section-label" style={{ marginBottom: 12 }}>
            Tài khoản
          </p>
          <div
            style={{
              padding: "13px 16px",
              background: "var(--surface)",
              borderRadius: 11,
              border: "1px solid var(--card-border)",
              marginBottom: 14,
            }}
          >
            <div
              style={{ fontSize: 11, color: "var(--muted)", fontWeight: 600 }}
            >
              Đăng nhập với tư cách
            </div>
            <div style={{ fontWeight: 800, fontSize: 15, marginTop: 2 }}>
              Quản trị viên
            </div>
          </div>
          <button className="btn-danger" onClick={logout}>
            Đăng xuất
          </button>
        </div>

        {/* Connection */}
        <div className="panel panel-0">
          <p className="section-label" style={{ marginBottom: 12 }}>
            Kết nối
          </p>
          <div style={{ marginBottom: 10 }}>
            <div
              style={{
                fontSize: 11,
                color: "var(--muted)",
                fontWeight: 700,
                marginBottom: 5,
              }}
            >
              Socket Server URL
            </div>
            <input
              value={serverUrl}
              onChange={(e) => setServerUrl(e.target.value)}
              style={{
                width: "100%",
                padding: "8px 11px",
                background: "var(--surface)",
                border: "1px solid var(--card-border)",
                borderRadius: 8,
                color: "var(--text)",
                fontSize: 11.5,
                fontFamily: "'JetBrains Mono',monospace",
                outline: "none",
              }}
            />
          </div>
          <span className="badge badge-success">● Đang kết nối</span>
        </div>

        {/* Preferences */}
        <div className="panel panel-0">
          <p className="section-label" style={{ marginBottom: 12 }}>
            Tuỳ chọn
          </p>
          {[
            { label: "Âm thanh khi quét", value: sound, set: setSound },
            {
              label: "Tự động xuất Excel",
              value: autoExport,
              set: setAutoExport,
            },
            { label: "Giao diện tối", value: dark, set: setDark },
          ].map(({ label, value, set }) => (
            <div
              key={label}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "10px 0",
                borderBottom: "1px solid var(--surface)",
              }}
            >
              <span style={{ fontSize: 13, fontWeight: 600 }}>{label}</span>
              <Toggle value={value} onChange={set} />
            </div>
          ))}
        </div>

        {/* About */}
        <div className="panel panel-0">
          <p className="section-label" style={{ marginBottom: 12 }}>
            Thông tin
          </p>
          {[
            { k: "Phiên bản", v: "2.0.0" },
            { k: "Framework", v: "React 18" },
            { k: "Socket", v: "Socket.IO" },
            { k: "Bản đồ", v: "Leaflet.js" },
          ].map(({ k, v }) => (
            <div
              key={k}
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "7px 0",
                borderBottom: "1px solid var(--surface)",
                fontSize: 12.5,
              }}
            >
              <span style={{ color: "var(--muted)", fontWeight: 600 }}>
                {k}
              </span>
              <span
                style={{
                  fontWeight: 700,
                  fontFamily: "'JetBrains Mono',monospace",
                  fontSize: 12,
                }}
              >
                {v}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
