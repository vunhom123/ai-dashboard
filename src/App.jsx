import React, { useState, useEffect, useRef } from "react";
import Login from "./Login";
import { motion, AnimatePresence } from "framer-motion";
import { io } from "socket.io-client";
import * as XLSX from "xlsx";
import utcBg from "./assets/utc.jpg";

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
  PieChart,
  Pie,
  Cell,
} from "recharts";

// ── Socket ──────────────────────────────────────────────────
const socket = io("https://qr-server-n6pp.onrender.com", {
  transports: ["websocket"],
  reconnection: true,
});

// ── Themes ──────────────────────────────────────────────────
const THEMES = {
  dark: {
    bg: "#070d1a",
    card: "rgba(12,20,42,.78)",
    cardBorder: "rgba(56,189,248,.13)",
    panel: "rgba(12,20,42,.78)",
    text: "#e2e8f0",
    muted: "#475569",
    accent: "#38bdf8",
    accentGlow: "rgba(56,189,248,.22)",
    success: "#34d399",
    danger: "#f87171",
    warning: "#fbbf24",
    menuActive: "rgba(56,189,248,.13)",
    surface: "rgba(255,255,255,.025)",
    sidebar: "rgba(5,10,22,.88)",
  },
  light: {
    bg: "#eef2ff",
    card: "rgba(255,255,255,.72)",
    cardBorder: "rgba(99,102,241,.15)",
    panel: "rgba(255,255,255,.72)",
    text: "#0f172a",
    muted: "#94a3b8",
    accent: "#6366f1",
    accentGlow: "rgba(99,102,241,.18)",
    success: "#10b981",
    danger: "#ef4444",
    warning: "#f59e0b",
    menuActive: "rgba(99,102,241,.1)",
    surface: "rgba(0,0,0,.025)",
    sidebar: "rgba(255,255,255,.82)",
  },
};

// ── i18n ────────────────────────────────────────────────────
const LANGS = {
  vi: "🇻🇳 Tiếng Việt",
  en: "🇺🇸 English",
  zh: "🇨🇳 中文",
  ko: "🇰🇷 한국어",
  ja: "🇯🇵 日本語",
};

const I18N = {
  vi: {
    dashboard: "Bảng điều khiển",
    orders: "Đơn hàng",
    settings: "Cài đặt",
    online: "Trực tuyến",
    notifications: "Thông báo",
    noNotif: "Không có thông báo",
    close: "Đóng",
    lightMode: "Giao diện sáng",
    darkMode: "Giao diện tối",
    language: "Ngôn ngữ",
    logout: "Đăng xuất",
    admin: "Quản trị viên",
    loginAs: "Đăng nhập với tư cách",
    totalScans: "Tổng quét",
    success: "Thành công",
    failed: "Thất bại",
    errorRate: "Tỉ lệ lỗi",
    overview: "Tổng quan",
    dashboard_title: "Bảng điều khiển",
    dashboard_sub: "Giám sát quét mã QR theo thời gian thực",
    analytics: "Analytics",
    manage: "Quản lý",
    totalOrders: "Tổng đơn",
    scanned: "Đã quét",
    pending: "Chờ xử lý",
    progress: "Tiến độ hoàn thành",
    uploadExcel: "Tải lên Excel",
    exportExcel: "Xuất Excel",
    searchPlaceholder: "Tìm kiếm...",
    all: "Tất cả",
    customer: "Khách hàng",
    qrCode: "Mã QR",
    status: "Trạng thái",
    system: "Hệ thống",
    settingsTitle: "Cài đặt",
    account: "Tài khoản",
    connection: "Kết nối",
    preferences: "Tuỳ chọn",
    soundScan: "Âm thanh khi quét",
    autoExport: "Tự động xuất Excel",
    darkInterface: "Giao diện tối",
    info: "Thông tin",
    version: "Phiên bản",
    lang: "Ngôn ngữ",
    roleAdmin: "Quản trị viên",
    roleSupervisor: "Giám sát",
    roleScanner: "Nhân viên quét",
    noPermission: "Bạn không có quyền truy cập trang này",
    contactAdmin: "Vui lòng liên hệ quản trị viên",
    hrSection: "Nhân sự",
  },
  en: {
    dashboard: "Dashboard",
    orders: "Orders",
    settings: "Settings",
    online: "Online",
    notifications: "Notifications",
    noNotif: "No new notifications",
    close: "Close",
    lightMode: "Light Mode",
    darkMode: "Dark Mode",
    language: "Language",
    logout: "Logout",
    admin: "Administrator",
    loginAs: "Logged in as",
    totalScans: "Total Scans",
    success: "Success",
    failed: "Failed",
    errorRate: "Error Rate",
    overview: "Overview",
    dashboard_title: "Dashboard",
    dashboard_sub: "Real-time QR scan monitoring",
    analytics: "Analytics",
    manage: "Manage",
    totalOrders: "Total Orders",
    scanned: "Scanned",
    pending: "Pending",
    progress: "Completion Progress",
    uploadExcel: "Upload Excel",
    exportExcel: "Export Excel",
    searchPlaceholder: "Search...",
    all: "All",
    customer: "Customer",
    qrCode: "QR Code",
    status: "Status",
    system: "System",
    settingsTitle: "Settings",
    account: "Account",
    connection: "Connection",
    preferences: "Preferences",
    soundScan: "Sound on scan",
    autoExport: "Auto export Excel",
    darkInterface: "Dark Mode",
    info: "Info",
    version: "Version",
    lang: "Language",
    roleAdmin: "Admin",
    roleSupervisor: "Supervisor",
    roleScanner: "Scanner",
    noPermission: "You don't have permission to access this page",
    contactAdmin: "Please contact an administrator",
    hrSection: "Human Resources",
  },
  zh: {
    dashboard: "仪表盘",
    orders: "订单",
    settings: "设置",
    online: "在线",
    notifications: "通知",
    noNotif: "暂无新通知",
    close: "关闭",
    lightMode: "浅色模式",
    darkMode: "深色模式",
    language: "语言",
    logout: "退出",
    admin: "管理员",
    loginAs: "登录身份",
    totalScans: "总扫描",
    success: "成功",
    failed: "失败",
    errorRate: "错误率",
    overview: "概览",
    dashboard_title: "仪表盘",
    dashboard_sub: "二维码扫描实时监控",
    analytics: "分析",
    manage: "管理",
    totalOrders: "总订单",
    scanned: "已扫描",
    pending: "待处理",
    progress: "完成进度",
    uploadExcel: "上传Excel",
    exportExcel: "导出Excel",
    searchPlaceholder: "搜索...",
    all: "全部",
    customer: "客户",
    qrCode: "QR码",
    status: "状态",
    system: "系统",
    settingsTitle: "设置",
    account: "账户",
    connection: "连接",
    preferences: "偏好设置",
    soundScan: "扫描声音",
    autoExport: "自动导出Excel",
    darkInterface: "深色模式",
    info: "信息",
    version: "版本",
    lang: "语言",
    roleAdmin: "管理员",
    roleSupervisor: "主管",
    roleScanner: "扫描员",
    noPermission: "您没有权限访问此页面",
    contactAdmin: "请联系管理员",
    hrSection: "人力资源",
  },
  ko: {
    dashboard: "대시보드",
    orders: "주문",
    settings: "설정",
    online: "온라인",
    notifications: "알림",
    noNotif: "새 알림 없음",
    close: "닫기",
    lightMode: "라이트 모드",
    darkMode: "다크 모드",
    language: "언어",
    logout: "로그아웃",
    admin: "관리자",
    loginAs: "로그인 계정",
    totalScans: "총 스캔",
    success: "성공",
    failed: "실패",
    errorRate: "오류율",
    overview: "개요",
    dashboard_title: "대시보드",
    dashboard_sub: "QR 스캔 실시간 모니터링",
    analytics: "분석",
    manage: "관리",
    totalOrders: "총 주문",
    scanned: "스캔됨",
    pending: "대기 중",
    progress: "완료 진행률",
    uploadExcel: "Excel 업로드",
    exportExcel: "Excel 내보내기",
    searchPlaceholder: "검색...",
    all: "전체",
    customer: "고객",
    qrCode: "QR 코드",
    status: "상태",
    system: "시스템",
    settingsTitle: "설정",
    account: "계정",
    connection: "연결",
    preferences: "환경설정",
    soundScan: "스캔 소리",
    autoExport: "Excel 자동 내보내기",
    darkInterface: "다크 모드",
    info: "정보",
    version: "버전",
    lang: "언어",
    roleAdmin: "관리자",
    roleSupervisor: "감독자",
    roleScanner: "스캐너",
    noPermission: "이 페이지에 접근 권한이 없습니다",
    contactAdmin: "관리자에게 문의하세요",
    hrSection: "인사",
  },
  ja: {
    dashboard: "ダッシュボード",
    orders: "注文",
    settings: "設定",
    online: "オンライン",
    notifications: "通知",
    noNotif: "新しい通知なし",
    close: "閉じる",
    lightMode: "ライトモード",
    darkMode: "ダークモード",
    language: "言語",
    logout: "ログアウト",
    admin: "管理者",
    loginAs: "ログイン中",
    totalScans: "総スキャン",
    success: "成功",
    failed: "失敗",
    errorRate: "エラー率",
    overview: "概要",
    dashboard_title: "ダッシュボード",
    dashboard_sub: "QRスキャンリアルタイム監視",
    analytics: "分析",
    manage: "管理",
    totalOrders: "総注文",
    scanned: "スキャン済み",
    pending: "保留中",
    progress: "完了進捗",
    uploadExcel: "Excelアップロード",
    exportExcel: "Excelエクスポート",
    searchPlaceholder: "検索...",
    all: "全て",
    customer: "顧客",
    qrCode: "QRコード",
    status: "状態",
    system: "システム",
    settingsTitle: "設定",
    account: "アカウント",
    connection: "接続",
    preferences: "環境設定",
    soundScan: "スキャン音",
    autoExport: "Excel自動エクスポート",
    darkInterface: "ダークモード",
    info: "情報",
    version: "バージョン",
    lang: "言語",
    roleAdmin: "管理者",
    roleSupervisor: "監督者",
    roleScanner: "スキャナー",
    noPermission: "このページへのアクセス権限がありません",
    contactAdmin: "管理者にお問い合わせください",
    hrSection: "人事",
  },
};

// ── Role permissions ────────────────────────────────────────
const PAGE_ACCESS = {
  dashboard: ["admin", "supervisor", "scanner"],
  orders: ["admin", "supervisor"],
  settings: ["admin", "supervisor", "scanner"],
};

// ── GlobalStyle ─────────────────────────────────────────────
const GlobalStyle = ({ dark }) => {
  const t = dark ? THEMES.dark : THEMES.light;
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;50…0;900&family=JetBrains+Mono:wght@400;500;700&display=swap');
      *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
      :root{
        --accent:${t.accent};--accent-glow:${t.accentGlow};
        --success:${t.success};--danger:${t.danger};--warning:${t.warning};
        --text:${t.text};--muted:${t.muted};--bg:${t.bg};
        --card:${t.card};--card-border:${t.cardBorder};
--panel:${t.panel};--surface:${t.surface};--menu-active:${t.menuActive};
        --sidebar:${t.sidebar};
      }
      html{-webkit-text-size-adjust:100%}
      body{font-family:'Nunito','Segoe UI',sans-serif;background:var(--bg);color:var(--text);overflow-x:hidden}
      ::-webkit-scrollbar{width:4px;height:4px}
      ::-webkit-scrollbar-track{background:transparent}
      ::-webkit-scrollbar-thumb{background:var(--accent);border-radius:10px}
      .mono{font-family:'JetBrains Mono',monospace}
      .stat-card{
        background:var(--card);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);
        border:1px solid var(--card-border);border-radius:18px;padding:20px 18px;
        position:relative;overflow:hidden;transition:transform .2s,box-shadow .2s;cursor:default
      }
      .stat-card::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;
        background:linear-gradient(90deg,transparent,var(--accent),transparent);opacity:.5}
      .stat-card:hover{transform:translateY(-3px);box-shadow:0 14px 44px var(--accent-glow)}
      .panel{background:var(--panel);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);
        border:1px solid var(--card-border);border-radius:18px;padding:20px;margin-top:16px}
      .panel-0{margin-top:0!important}
      .badge{display:inline-flex;align-items:center;gap:5px;padding:3px 10px;border-radius:20px;
        font-size:11px;font-weight:800;letter-spacing:.04em;text-transform:uppercase;font-family:'Nunito',sans-serif}
      .badge-success{background:rgba(52,211,153,.12);color:var(--success);border:1px solid rgba(52,211,153,.28)}
      .badge-danger{background:rgba(248,113,113,.12);color:var(--danger);border:1px solid rgba(248,113,113,.28)}
      .badge-warning{background:rgba(251,191,36,.12);color:var(--warning);border:1px solid rgba(251,191,36,.28)}
      .badge-info{background:rgba(56,189,248,.12);color:var(--accent);border:1px solid rgba(56,189,248,.28)}
      .pulse-dot{width:8px;height:8px;border-radius:50%;background:var(--success);
        box-shadow:0 0 0 0 rgba(52,211,153,.4);animation:pulse-anim 1.6s infinite;display:inline-block}
      @keyframes pulse-anim{0%{box-shadow:0 0 0 0 rgba(52,211,153,.5)}70%{box-shadow:0 0 0 10px rgba(52,211,153,0)}100%{box-shadow:0 0 0 0 rgba(52,211,153,0)}}
      table{width:100%;border-collapse:collapse}
      thead tr{border-bottom:1px solid var(--card-border)}
      th{text-align:left;padding:9px 12px;font-size:10px;font-weight:800;letter-spacing:.1em;
        text-transform:uppercase;color:var(--muted);font-family:'Nunito',sans-serif;white-space:nowrap}
      td{padding:10px 12px;font-size:13px;border-bottom:1px solid var(--surface)}
      tbody tr{transition:background .15s}
      tbody tr:hover{background:var(--surface)}
      .btn-primary{padding:9px 18px;background:var(--accent);border:none;border-radius:9px;
color:${dark ? "#070d1a" : "#fff"};font-weight:800;font-family:'Nunito',sans-serif;
        font-size:12.5px;cursor:pointer;transition:opacity .2s,transform .15s;
        -webkit-tap-highlight-color:transparent}
      .btn-primary:hover{opacity:.88;transform:translateY(-1px)}
      .btn-ghost{padding:8px 14px;background:transparent;border:1px solid var(--card-border);border-radius:9px;
        color:var(--muted);font-weight:700;font-family:'Nunito',sans-serif;font-size:12px;cursor:pointer;
        transition:border-color .2s,color .2s,background .2s;-webkit-tap-highlight-color:transparent}
      .btn-ghost:hover{border-color:var(--accent);color:var(--accent);background:var(--menu-active)}
      .btn-danger{padding:9px 18px;background:transparent;border:1px solid var(--danger);border-radius:9px;
        color:var(--danger);font-weight:800;font-family:'Nunito',sans-serif;font-size:12.5px;cursor:pointer;
        transition:background .2s;-webkit-tap-highlight-color:transparent}
      .btn-danger:hover{background:rgba(248,113,113,.1)}
      .file-input-wrapper{display:inline-flex;align-items:center;gap:8px;padding:8px 14px;
        background:var(--surface);border:1px dashed var(--card-border);border-radius:10px;
        cursor:pointer;color:var(--muted);font-size:13px;font-weight:600;font-family:'Nunito',sans-serif;
        transition:border-color .2s,color .2s}
      .file-input-wrapper:hover{border-color:var(--accent);color:var(--accent)}
      .file-input-wrapper input{display:none}
      .section-label{font-size:10px;font-weight:800;letter-spacing:.16em;text-transform:uppercase;
        color:var(--muted);margin-bottom:4px;font-family:'Nunito',sans-serif}
      .page-title{font-family:'Raleway',sans-serif;font-size:clamp(20px,4vw,26px);font-weight:900;
        letter-spacing:-.5px;margin-bottom:4px;
        background:linear-gradient(135deg,var(--text) 0%,var(--accent) 130%);
        -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
      .progress-bar-bg{background:var(--surface);border-radius:6px;height:6px;overflow:hidden}
      .progress-bar{height:100%;border-radius:6px;transition:width .6s ease}
      .kpi-trend{display:inline-flex;align-items:center;gap:3px;font-size:11px;font-weight:700;margin-top:3px}
      .kpi-trend.up{color:var(--success)}.kpi-trend.down{color:var(--danger)}.kpi-trend.flat{color:var(--muted)}
      .insight-card{border-radius:14px;padding:13px 15px;border:1px solid;transition:transform .18s}
      .insight-card:hover{transform:translateY(-2px)}
      .tbl-scroll{overflow-x:auto;-webkit-overflow-scrolling:touch}
      .tbl-scroll table{min-width:460px}
      .toggle-wrap{width:42px;height:23px;border-radius:12px;cursor:pointer;position:relative;
        transition:background .2s;flex-shrink:0}
.toggle-knob{width:17px;height:17px;border-radius:50%;background:#fff;position:absolute;
        top:3px;transition:left .2s}
      .lang-btn{padding:7px 12px;background:transparent;border:1px solid var(--card-border);border-radius:9px;
        cursor:pointer;font-size:13px;font-family:'Nunito',sans-serif;color:var(--muted);
        transition:all .2s;display:flex;align-items:center;gap:7px;width:100%;font-weight:700}
      .lang-btn:hover,.lang-btn.active{border-color:var(--accent);color:var(--accent);background:var(--menu-active)}
      @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
      .fade-up{animation:fadeUp .35s ease-out both}
      /* LAYOUT */
      .layout-root{display:flex;min-height:100vh}
      .desktop-sidebar{display:flex}
      .main-column{flex:1;display:flex;flex-direction:column;min-width:0}
      .mobile-header{
        display:none;position:sticky;top:0;z-index:50;
        background:var(--sidebar);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);
        border-bottom:1px solid var(--card-border);
        padding:0 14px;height:54px;align-items:center;justify-content:space-between;gap:10px
      }
      .main-content{flex:1;padding:32px 40px;overflow-y:auto;position:relative;z-index:1}
      .g4{display:grid;grid-template-columns:repeat(4,1fr);gap:12px}
      .g3{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}
      .g2{display:grid;grid-template-columns:1fr 1fr;gap:14px}
      .g2r{display:grid;grid-template-columns:1fr 300px;gap:14px}
      @media(max-width:1024px){
        .g4{grid-template-columns:repeat(2,1fr)!important}
        .g2r{grid-template-columns:1fr!important}
        .main-content{padding:24px 20px}
      }
      @media(max-width:680px){
        .desktop-sidebar{display:none!important}
        .mobile-header{display:flex!important}
        .main-content{padding:14px 13px 80px}
        .g4{grid-template-columns:1fr 1fr!important;gap:8px!important}
        .g3{grid-template-columns:1fr 1fr!important;gap:8px!important}
        .g2,.g2r{grid-template-columns:1fr!important;gap:10px!important}
        .panel{padding:14px 12px;border-radius:14px}
        .stat-card{padding:13px 11px;border-radius:14px}
        .stat-card h2{font-size:22px!important}
        .toolbar-row{flex-wrap:wrap!important}
        .toolbar-row input{width:100%!important}
        .insight-grid{grid-template-columns:1fr!important}
      }
      @media(max-width:400px){
        .g4{grid-template-columns:1fr 1fr!important}
        .stat-card h2{font-size:18px!important}
      }
    `}</style>
  );
};

// ── Helpers ─────────────────────────────────────────────────
function fmtNum(n) {
  if (n >= 1e6) return (n / 1e6).toFixed(1) + "M";
  if (n >= 1e3) return (n / 1e3).toFixed(1) + "K";
  return String(n);
}
function timeNow() {
  return new Date().toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

// ── Toggle ──────────────────────────────────────────────────
function Toggle({ on, set }) {
  return (
    <div
      className="toggle-wrap"
      onClick={() => set(!on)}
      style={{
        background: on ? "var(--success)" : "var(--surface)",
        border: "1px solid var(--card-border)",
      }}
    >
      <div className="toggle-knob" style={{ left: on ? 22 : 3 }} />
    </div>
  );
}

// ── Toast ────────────────────────────────────────────────────
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
        maxWidth: 320,
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

// ── Notif Panel ──────────────────────────────────────────────
function NotifPanel({ notifs, onClose, i18n }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10 }}
      style={{
        position: "absolute",
        top: 44,
        right: 0,
        width: 300,
        zIndex: 200,
        background: "var(--card)",
        border: "1px solid var(--card-border)",
        borderRadius: 16,
        boxShadow: "0 16px 48px rgba(0,0,0,.45)",
        backdropFilter: "blur(20px)",
        padding: 16,
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
        <span style={{ fontWeight: 800, fontSize: 13 }}>
          {i18n.notifications}
        </span>
        <button
          className="btn-ghost"
          style={{ padding: "3px 8px", fontSize: 11 }}
          onClick={onClose}
        >
          {i18n.close}
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
          {i18n.noNotif}
        </p>
      )}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 8,
          maxHeight: 320,
          overflowY: "auto",
        }}
      >
        {notifs.map((n, i) => (
          <div
            key={i}
            style={{
              padding: "8px 11px",
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

// ── Stat Card ────────────────────────────────────────────────
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
              fontSize: 30,
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
                fontSize: 11,
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
              {trend > 0 ? "▲" : trend < 0 ? "▼" : "→"} {Math.abs(trend)}%
            </span>
          )}
        </div>
        {icon && (
          <span
            style={{
              fontSize: 17,
              width: 38,
              height: 38,
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
        <div style={{ marginTop: 10, height: 32 }}>
          <ResponsiveContainer width="100%" height={32}>
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

// ══════════════════════════════════════════════════════════════
// MAIN APP
// ══════════════════════════════════════════════════════════════
export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [page, setPage] = useState("dashboard");
  const [dark, setDark] = useState(true);
  const [langCode, setLangCode] = useState("vi");
  const [history, setHistory] = useState([]);
  const [lastScan, setLastScan] = useState(null);
  const [orderList, setOrderList] = useState([]);
  const [scannedList, setScannedList] = useState([]);
  const [toasts, setToasts] = useState([]);
  const [notifs, setNotifs] = useState([]);
  const [showNotif, setShowNotif] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [hourlyData, setHourlyData] = useState(() =>
    Array.from({ length: 12 }, (_, i) => ({
      h: `${(new Date().getHours() - 11 + i + 24) % 24}h`,
      ok: 0,
      fail: 0,
    })),
  );
  const [failCount, setFailCount] = useState(0);
  const [errorRate, setErrorRate] = useState("0.0");

  const i18n = I18N[langCode] || I18N.vi;

  const addToast = (msg, type = "info") => {
    const id = Date.now();
    setToasts((p) => [...p, { id, msg, type }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 4000);
  };
  const addNotif = (msg, type = "info") =>
    setNotifs((p) => [{ msg, type, time: timeNow() }, ...p].slice(0, 30));

  useEffect(() => {
    socket.on("new_scan", (data) => {
      setHistory((p) => [{ ...data, ts: Date.now() }, ...p]);
      setLastScan(data);
      setScannedList((p) => (p.includes(data.code) ? p : [...p, data.code]));
      addToast(`✓ ${data.code}`, "success");
      addNotif(`Quét thành công: ${data.code}`, "success");
      setHourlyData((p) => {
        const c = [...p];
        c[c.length - 1] = { ...c[c.length - 1], ok: c[c.length - 1].ok + 1 };
        return c;
      });
      new Audio("/scan.mp3").play().catch(() => {});
    });
    socket.on("scan_error", (data) => {
      setFailCount((p) => p + 1);
      setHistory((p) => [{ ...data, ts: Date.now(), error: true }, ...p]);
      addToast(`✕ Lỗi: ${data.code}`, "danger");
      addNotif(`Lỗi quét: ${data.code}`, "danger");
      setHourlyData((p) => {
        const c = [...p];
        c[c.length - 1] = {
          ...c[c.length - 1],
          fail: c[c.length - 1].fail + 1,
        };
        return c;
      });
    });
    return () => {
      socket.off("new_scan");
      socket.off("scan_error");
    };
  }, []);

  useEffect(() => {
    const tot = history.length;
    setErrorRate(tot > 0 ? ((failCount / tot) * 100).toFixed(1) : "0.0");
  }, [history.length, failCount]);

  const ACCOUNTS = {
    admin: { password: "123", role: "admin" },
    supervisor: { password: "123", role: "supervisor" },
  };

  const handleLogin = (username, password) => {
    const uname = (username || "").trim().toLowerCase();
    const acc = ACCOUNTS[uname];
    let role = "scanner";
    if (acc && acc.password === password) role = acc.role;
    setCurrentUser({ username: uname, role });
    setLoggedIn(true);
  };

  if (!loggedIn) return <Login onLogin={handleLogin} />;

  const okCount = history.length - failCount;
  const notifCount = notifs.filter((n) => n.type !== "info").length;

  const canAccess = (pg) => {
    const role = currentUser?.role || "scanner";
    return (PAGE_ACCESS[pg] || ["admin"]).includes(role);
  };

  const navigateTo = (pg) => {
    if (!canAccess(pg)) {
      addToast(i18n.noPermission, "danger");
      return;
    }
    setPage(pg);
  };

  const renderPage = () => {
    if (!canAccess(page)) {
      return (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "50vh",
            gap: 16,
          }}
        >
          <div style={{ fontSize: 48, opacity: 0.15 }}>🔒</div>
          <div style={{ fontSize: 18, fontWeight: 800 }}>
            {i18n.noPermission}
          </div>
          <div style={{ color: "var(--muted)" }}>{i18n.contactAdmin}</div>
          <button className="btn-primary" onClick={() => setPage("dashboard")}>
            ← Dashboard
          </button>
        </div>
      );
    }
    const props = {
      history,
      lastScan,
      okCount,
      failCount,
      errorRate,
      hourlyData,
      dark,
      i18n,
      orderList,
      setOrderList,
      scannedList,
      addToast,
      currentUser,
      langCode,
      setLangCode,
      logout: () => setLoggedIn(false),
      setDark,
    };
    switch (page) {
      case "dashboard":
        return <Dashboard {...props} />;
      case "orders":
        return <Orders {...props} />;
      case "settings":
        return <Settings {...props} />;
      default:
        return <Dashboard {...props} />;
    }
  };

  return (
    <>
      <GlobalStyle dark={dark} />
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: -1,
          backgroundImage: `url(${utcBg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: dark ? "rgba(4,8,18,.87)" : "rgba(234,240,255,.85)",
            backdropFilter: "blur(2px)",
          }}
        />
      </div>

      <div className="layout-root">
        <div className="desktop-sidebar">
          <SidebarComp
            page={page}
            setPage={navigateTo}
            dark={dark}
            setDark={setDark}
            notifCount={notifCount}
            showNotif={showNotif}
            setShowNotif={setShowNotif}
            notifs={notifs}
            i18n={i18n}
            currentUser={currentUser}
            canAccess={canAccess}
          />
        </div>

        <div className="main-column">
          <div className="mobile-header">
            <button
              onClick={() => setMobileOpen(true)}
              style={{
                background: "transparent",
                border: "none",
                cursor: "pointer",
                color: "var(--text)",
                fontSize: 22,
                padding: "4px 8px",
                flexShrink: 0,
              }}
            >
              ☰
            </button>
            <span
              style={{
                fontFamily: "'Raleway',sans-serif",
                fontSize: 16,
                fontWeight: 900,
                color: "var(--text)",
                flex: 1,
                textAlign: "center",
              }}
            >
              AI Factory
            </span>
            <div style={{ position: "relative", flexShrink: 0 }}>
              <button
                onClick={() => setShowNotif((p) => !p)}
                className="btn-ghost"
                style={{
                  padding: "5px 10px",
                  fontSize: 13,
                  position: "relative",
                }}
              >
                🔔
                {notifCount > 0 && (
                  <span
                    style={{
                      position: "absolute",
                      top: -4,
                      right: -4,
                      background: "var(--danger)",
                      color: "#fff",
                      borderRadius: "50%",
                      width: 16,
                      height: 16,
                      fontSize: 9,
                      fontWeight: 900,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {notifCount > 9 ? "9+" : notifCount}
                  </span>
                )}
              </button>
              <AnimatePresence>
                {showNotif && (
                  <div
                    style={{
                      position: "fixed",
                      top: 58,
                      right: 10,
                      left: 10,
                      zIndex: 300,
                    }}
                  >
                    <NotifPanel
                      notifs={notifs}
                      onClose={() => setShowNotif(false)}
                      i18n={i18n}
                    />
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <main className="main-content">
            <AnimatePresence mode="wait">
              <motion.div
                key={page}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.18 }}
              >
                {renderPage()}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 200,
              display: "flex",
            }}
          >
            <motion.div
              initial={{ x: -250 }}
              animate={{ x: 0 }}
              exit={{ x: -250 }}
              transition={{ type: "spring", damping: 28, stiffness: 240 }}
              style={{
                width: 234,
                background: "var(--sidebar)",
                backdropFilter: "blur(22px)",
                borderRight: "1px solid var(--card-border)",
                overflow: "auto",
                zIndex: 201,
                flexShrink: 0,
              }}
            >
              <SidebarComp
                page={page}
                setPage={(pg) => {
                  navigateTo(pg);
                  setMobileOpen(false);
                }}
                dark={dark}
                setDark={setDark}
                notifCount={notifCount}
                showNotif={false}
                setShowNotif={() => {}}
                notifs={notifs}
                i18n={i18n}
                currentUser={currentUser}
                canAccess={canAccess}
                onClose={() => setMobileOpen(false)}
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ flex: 1, background: "rgba(0,0,0,.6)" }}
              onClick={() => setMobileOpen(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toasts */}
      <div
        style={{
          position: "fixed",
          bottom: 22,
          right: 18,
          zIndex: 9999,
          display: "flex",
          flexDirection: "column",
          gap: 8,
          maxWidth: "calc(100vw - 36px)",
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

// ── Sidebar ──────────────────────────────────────────────────
function SidebarComp({
  page,
  setPage,
  dark,
  setDark,
  notifCount,
  showNotif,
  setShowNotif,
  notifs,
  i18n,
  currentUser,
  canAccess,
  onClose,
}) {
  const NAV = [
    {
      id: "dashboard",
      icon: "⬡",
      label: i18n.dashboard,
      section: i18n.overview,
    },
    { id: "orders", icon: "▣", label: i18n.orders },
    { id: "settings", icon: "⚙", label: i18n.settings, section: i18n.system },
  ];

  return (
    <aside
      style={{
        width: 220,
        minHeight: "100vh",
        background: "var(--sidebar)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderRight: "1px solid var(--card-border)",
        padding: "26px 12px",
        display: "flex",
        flexDirection: "column",
        position: "sticky",
        top: 0,
        zIndex: 10,
        flexShrink: 0,
      }}
    >
      {/* Logo */}
      <div
        style={{
          padding: "0 10px",
          marginBottom: 26,
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
        }}
      >
        <div>
          <div
            style={{
              fontSize: 9.5,
              letterSpacing: ".2em",
              color: "var(--muted)",
              textTransform: "uppercase",
              marginBottom: 2,
              fontWeight: 700,
            }}
          >
            {i18n.system}
          </div>
          <div
            style={{
              fontFamily: "'Raleway',sans-serif",
              fontSize: 18,
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
              marginTop: 4,
            }}
          >
            <span className="pulse-dot" />
            <span
              style={{ fontSize: 11, color: "var(--success)", fontWeight: 700 }}
            >
              {i18n.online}
            </span>
          </div>
          {currentUser && (
            <div
              style={{
                marginTop: 6,
                fontSize: 10,
                color: "var(--muted)",
                fontWeight: 600,
              }}
            >
              👤 {currentUser.username}
              <span
                className={`badge ${currentUser.role === "admin" ? "badge-info" : currentUser.role === "supervisor" ? "badge-success" : "badge-warning"}`}
                style={{ marginLeft: 4, fontSize: 9 }}
              >
                {currentUser.role === "admin"
                  ? i18n.roleAdmin
                  : currentUser.role === "supervisor"
                    ? i18n.roleSupervisor
                    : i18n.roleScanner}
              </span>
            </div>
          )}
        </div>
        {onClose && (
          <button
            onClick={onClose}
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              color: "var(--muted)",
              fontSize: 18,
              padding: "2px 4px",
            }}
          >
            ✕
          </button>
        )}
      </div>

      {/* Notif */}
      <div
        style={{ padding: "0 10px", marginBottom: 12, position: "relative" }}
      >
        <button
          className="btn-ghost"
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            gap: 8,
            justifyContent: "space-between",
            padding: "7px 12px",
          }}
          onClick={() => setShowNotif((p) => !p)}
        >
          <span style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <span>🔔</span>
            {i18n.notifications}
          </span>
          {notifCount > 0 && (
            <span
              style={{
                background: "var(--danger)",
                color: "#fff",
                borderRadius: 10,
                fontSize: 10,
                fontWeight: 800,
                padding: "1px 6px",
              }}
            >
              {notifCount}
            </span>
          )}
        </button>
        <AnimatePresence>
          {showNotif && (
            <NotifPanel
              notifs={notifs}
              onClose={() => setShowNotif(false)}
              i18n={i18n}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Nav */}
      <nav
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: 1,
          overflowY: "auto",
        }}
      >
        {NAV.map((item) => {
          const accessible = canAccess(item.id);
          return (
            <React.Fragment key={item.id}>
              {item.section && (
                <div
                  style={{
                    fontSize: 9.5,
                    letterSpacing: ".18em",
                    color: "var(--muted)",
                    textTransform: "uppercase",
                    fontWeight: 700,
                    padding: "9px 12px 3px",
                    marginTop: 4,
                  }}
                >
                  {item.section}
                </div>
              )}
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => setPage(item.id)}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "9px 12px",
                  borderRadius: 9,
                  border: "none",
                  cursor: accessible ? "pointer" : "not-allowed",
                  background:
                    page === item.id ? "var(--menu-active)" : "transparent",
                  color:
                    page === item.id
                      ? "var(--accent)"
                      : accessible
                        ? "var(--muted)"
                        : "rgba(100,116,139,.35)",
                  fontWeight: page === item.id ? 800 : 600,
                  fontSize: 13,
                  textAlign: "left",
                  fontFamily: "'Nunito',sans-serif",
                  transition: "background .15s,color .15s",
                  position: "relative",
                  opacity: accessible ? 1 : 0.5,
                }}
              >
                {page === item.id && (
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
                <span style={{ flex: 1 }}>{item.label}</span>
                {!accessible && <span style={{ fontSize: 10 }}>🔒</span>}
              </motion.button>
            </React.Fragment>
          );
        })}
      </nav>

      <button
        onClick={() => setDark(!dark)}
        style={{
          marginTop: 14,
          padding: "8px 12px",
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
        }}
      >
        {dark ? "☀" : "🌙"} {dark ? i18n.lightMode : i18n.darkMode}
      </button>
    </aside>
  );
}

// ══════════════════════════════════════════════════════════════
// PAGE: DASHBOARD
// ══════════════════════════════════════════════════════════════
function Dashboard({
  history,
  lastScan,
  okCount,
  failCount,
  errorRate,
  hourlyData,
  i18n,
}) {
  const sparkData = history
    .slice(0, 12)
    .reverse()
    .map((_, i) => ({ v: i + 1 }));
  const pieData = [
    { name: i18n.success, value: okCount, color: "#34d399" },
    { name: i18n.failed, value: failCount || 0, color: "#f87171" },
  ];
  const aiInsights = [
    {
      type: "success",
      icon: "🧠",
      title: i18n.success,
      desc: `${okCount} ${i18n.totalScans.toLowerCase()}`,
    },
    {
      type: "warning",
      icon: "⚡",
      title: "Dự báo tải",
      desc: "Dự kiến đạt 500 lần quét trước 17:00",
    },
    {
      type: "info",
      icon: "📍",
      title: "GPS",
      desc: `${history.filter((h) => h.lat).length} điểm GPS`,
    },
  ];

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 24,
          flexWrap: "wrap",
          gap: 8,
        }}
      >
        <div>
          <p className="section-label">{i18n.overview}</p>
          <h1 className="page-title">{i18n.dashboard_title}</h1>
          <p style={{ color: "var(--muted)", fontSize: 13, fontWeight: 500 }}>
            {i18n.dashboard_sub}
          </p>
        </div>
        <span className="badge badge-success">
          <span className="pulse-dot" style={{ width: 6, height: 6 }} /> Live
        </span>
      </div>

      <div className="g4" style={{ marginBottom: 16 }}>
        <StatCard
          title={i18n.totalScans}
          value={fmtNum(history.length)}
          icon="⬡"
          delay={0}
          trend={12}
          sparkData={sparkData}
        />
        <StatCard
          title={i18n.success}
          value={fmtNum(okCount)}
          icon="✓"
          color="var(--success)"
          sub="Hôm nay"
          delay={0.05}
          trend={5}
        />
        <StatCard
          title={i18n.failed}
          value={fmtNum(failCount)}
          icon="✕"
          color="var(--danger)"
          delay={0.1}
          trend={-2}
        />
        <StatCard
          title={i18n.errorRate}
          value={`${errorRate}%`}
          icon="◎"
          color={parseFloat(errorRate) > 5 ? "var(--danger)" : "var(--success)"}
          delay={0.15}
        />
      </div>

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
              padding: "11px 16px",
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginBottom: 4,
              flexWrap: "wrap",
            }}
          >
            <span className="pulse-dot" />
            <div>
              <span
                style={{
                  fontSize: 9.5,
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

      <div className="g2r">
        <div className="panel">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 14,
            }}
          >
            <div>
              <p className="section-label">Hoạt động</p>
              <h3 style={{ fontWeight: 800, fontSize: 13 }}>
                {i18n.analytics} theo giờ
              </h3>
            </div>
            <span className="badge badge-info">{history.length} sự kiện</span>
          </div>
          <ResponsiveContainer width="100%" height={190}>
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
                tick={{ fontSize: 10, fill: "var(--muted)" }}
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
                name={i18n.success}
                fill="url(#gOk)"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="fail"
                name={i18n.failed}
                fill="url(#gFail)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
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
            <PieChart width={180} height={160}>
              <Pie
                data={pieData}
                cx={90}
                cy={80}
                innerRadius={46}
                outerRadius={72}
                paddingAngle={3}
                dataKey="value"
              >
                {pieData.map((e, i) => (
                  <Cell key={i} fill={e.color} />
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
          {pieData.map((d, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                <div
                  style={{
                    width: 8,
                    height: 8,
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

      <div className="panel">
        <p className="section-label" style={{ marginBottom: 12 }}>
          🧠 AI Insights
        </p>
        <div
          className="insight-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3,1fr)",
            gap: 11,
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
              <div style={{ fontSize: 17, marginBottom: 6 }}>{ins.icon}</div>
              <div style={{ fontSize: 12, fontWeight: 800, marginBottom: 3 }}>
                {ins.title}
              </div>
              <div
                style={{ fontSize: 11, color: "var(--muted)", lineHeight: 1.5 }}
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

// ══════════════════════════════════════════════════════════════
// PAGE: ORDERS
// ══════════════════════════════════════════════════════════════
function Orders({ orderList, setOrderList, scannedList, addToast, i18n }) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const scannedCount = orderList.filter((o) =>
    scannedList.includes(o.QR),
  ).length;
  const progress =
    orderList.length > 0 ? (scannedCount / orderList.length) * 100 : 0;

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
    addToast(i18n.exportExcel + " ✓", "success");
  };

  const filtered = orderList.filter((o) => {
    const m =
      !search ||
      (o.Customer || "").toLowerCase().includes(search.toLowerCase()) ||
      (o.QR || "").toLowerCase().includes(search.toLowerCase());
    const done = scannedList.includes(o.QR);
    return (
      m &&
      (filter === "all" ||
        (filter === "scanned" && done) ||
        (filter === "pending" && !done))
    );
  });

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <p className="section-label">{i18n.manage}</p>
        <h1 className="page-title">{i18n.orders}</h1>
      </div>

      <div className="g3" style={{ marginBottom: 14 }}>
        <StatCard
          title={i18n.totalOrders}
          value={orderList.length}
          icon="▣"
          delay={0}
        />
        <StatCard
          title={i18n.scanned}
          value={scannedCount}
          icon="✓"
          color="var(--success)"
          delay={0.05}
        />
        <StatCard
          title={i18n.pending}
          value={orderList.length - scannedCount}
          icon="◎"
          color="var(--warning)"
          delay={0.1}
        />
      </div>

      {orderList.length > 0 && (
        <div className="panel" style={{ marginBottom: 0 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 7,
            }}
          >
            <span style={{ fontSize: 12, fontWeight: 700 }}>
              {i18n.progress}
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
                background:
                  "linear-gradient(90deg,var(--success),var(--accent))",
              }}
            />
          </div>
        </div>
      )}

      <div
        className="toolbar-row"
        style={{
          display: "flex",
          gap: 8,
          alignItems: "center",
          marginTop: 14,
          marginBottom: 4,
          flexWrap: "wrap",
        }}
      >
        <label className="file-input-wrapper">
          <input type="file" accept=".xlsx,.xls" onChange={uploadExcel} />
          <span>⊕</span>
          {i18n.uploadExcel}
        </label>
        {orderList.length > 0 && (
          <button className="btn-ghost" onClick={exportExcel}>
            ⬇ {i18n.exportExcel}
          </button>
        )}
        <input
          placeholder={i18n.searchPlaceholder}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            padding: "8px 12px",
            background: "var(--surface)",
            border: "1px solid var(--card-border)",
            borderRadius: 9,
            color: "var(--text)",
            fontSize: 12.5,
            fontFamily: "'Nunito',sans-serif",
            outline: "none",
            width: 190,
          }}
        />
        {["all", "scanned", "pending"].map((f) => (
          <button
            key={f}
            className={filter === f ? "btn-primary" : "btn-ghost"}
            style={{ padding: "7px 12px", fontSize: 11.5 }}
            onClick={() => setFilter(f)}
          >
            {f === "all"
              ? i18n.all
              : f === "scanned"
                ? i18n.scanned
                : i18n.pending}
          </button>
        ))}
      </div>

      <div className="panel">
        <div className="tbl-scroll">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>{i18n.customer}</th>
                <th>{i18n.qrCode}</th>
                <th>{i18n.status}</th>
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
                      padding: "34px 0",
                      fontWeight: 600,
                    }}
                  >
                    {orderList.length === 0
                      ? "Chưa có đơn hàng. Tải lên file Excel."
                      : "Không tìm thấy kết quả."}
                  </td>
                </tr>
              ) : (
                filtered.map((o, i) => {
                  const done = scannedList.includes(o.QR);
                  return (
                    <motion.tr
                      key={i}
                      initial={{ opacity: 0, x: -5 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.012 }}
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
                          {done ? `✓ ${i18n.scanned}` : `⏳ ${i18n.pending}`}
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
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// PAGE: SETTINGS
// ══════════════════════════════════════════════════════════════
function Settings({
  logout,
  dark,
  setDark,
  langCode,
  setLangCode,
  i18n,
  currentUser,
}) {
  const [serverUrl, setServerUrl] = useState(
    "https://qr-server-n6pp.onrender.com",
  );
  const [sound, setSound] = useState(true);
  const [autoExport, setAutoExport] = useState(false);

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <p className="section-label">{i18n.system}</p>
        <h1 className="page-title">{i18n.settingsTitle}</h1>
      </div>

      <div className="g2" style={{ maxWidth: 680 }}>
        {/* Account */}
        <div className="panel panel-0">
          <p className="section-label" style={{ marginBottom: 11 }}>
            {i18n.account}
          </p>
          <div
            style={{
              padding: "12px 14px",
              background: "var(--surface)",
              borderRadius: 10,
              border: "1px solid var(--card-border)",
              marginBottom: 13,
            }}
          >
            <div
              style={{ fontSize: 11, color: "var(--muted)", fontWeight: 600 }}
            >
              {i18n.loginAs}
            </div>
            <div style={{ fontWeight: 800, fontSize: 15, marginTop: 1 }}>
              {currentUser?.username || i18n.admin}
            </div>
          </div>
          <button className="btn-danger" onClick={logout}>
            {i18n.logout}
          </button>
        </div>

        {/* Connection */}
        <div className="panel panel-0">
          <p className="section-label" style={{ marginBottom: 11 }}>
            {i18n.connection}
          </p>
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
              padding: "8px 10px",
              background: "var(--surface)",
              border: "1px solid var(--card-border)",
              borderRadius: 8,
              color: "var(--text)",
              fontSize: 11.5,
              fontFamily: "'JetBrains Mono',monospace",
              outline: "none",
              marginBottom: 10,
            }}
          />
          <span className="badge badge-success">● Đang kết nối</span>
        </div>

        {/* Preferences */}
        <div className="panel panel-0">
          <p className="section-label" style={{ marginBottom: 11 }}>
            {i18n.preferences}
          </p>
          {[
            { label: i18n.soundScan, value: sound, set: setSound },
            { label: i18n.autoExport, value: autoExport, set: setAutoExport },
            { label: i18n.darkInterface, value: dark, set: setDark },
          ].map(({ label, value, set }) => (
            <div
              key={label}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "9px 0",
                borderBottom: "1px solid var(--surface)",
              }}
            >
              <span style={{ fontSize: 13, fontWeight: 600 }}>{label}</span>
              <Toggle on={value} set={set} />
            </div>
          ))}
        </div>

        {/* Language */}
        <div className="panel panel-0">
          <p className="section-label" style={{ marginBottom: 11 }}>
            {i18n.language}
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {Object.entries(LANGS).map(([code, label]) => (
              <button
                key={code}
                className={`lang-btn ${langCode === code ? "active" : ""}`}
                onClick={() => setLangCode(code)}
              >
                <span>{label}</span>
                {langCode === code && (
                  <span
                    style={{
                      marginLeft: "auto",
                      fontSize: 10,
                      color: "var(--accent)",
                    }}
                  >
                    ✓
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Info */}
        <div className="panel panel-0">
          <p className="section-label" style={{ marginBottom: 11 }}>
            {i18n.info}
          </p>
          {[
            [i18n.version, "3.1.0"],
            ["Framework", "React 18"],
            ["Socket", "Socket.IO"],
            [
              i18n.lang,
              Object.entries(LANGS).find(([k]) => k === langCode)?.[1] || "—",
            ],
          ].map(([k, v]) => (
            <div
              key={k}
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "6px 0",
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
