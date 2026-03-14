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

/* ─── LANGUAGES (NEW) ─────────────────────────────── */
const LANGS = {
  vi: { flag: "🇻🇳", name: "Tiếng Việt" },
  en: { flag: "🇺🇸", name: "English" },
  zh: { flag: "🇨🇳", name: "中文" },
  ko: { flag: "🇰🇷", name: "한국어" },
  ja: { flag: "🇯🇵", name: "日本語" },
};

const I18N = {
  vi: {
    dashboard: "Bảng điều khiển",
    liveScan: "Live Scan",
    orders: "Đơn hàng",
    gpsMap: "Bản đồ GPS",
    scanGPS: "Scan GPS",
    leaderboard: "Leaderboard",
    analytics: "Analytics",
    history: "Lịch sử",
    settings: "Cài đặt",
    chat: "Chat nội bộ",
    staff: "Nhân viên",
    alerts: "Cảnh báo",
    online: "Trực tuyến",
    notifications: "Thông báo",
    noNotif: "Không có thông báo mới",
    close: "Đóng",
    lightMode: "Giao diện sáng",
    darkMode: "Giao diện tối",
    language: "Ngôn ngữ",
    logout: "Đăng xuất",
    admin: "Quản trị viên",
    loginAs: "Đăng nhập với tư cách",
    login: "Đăng nhập",
    // Staff
    staffMgmt: "Quản lý nhân viên",
    addStaff: "Thêm nhân viên",
    staffName: "Họ tên",
    staffRole: "Vai trò",
    staffEmail: "Email",
    staffStatus: "Trạng thái",
    staffActive: "Đang làm",
    staffInactive: "Nghỉ",
    roleAdmin: "Quản trị viên",
    roleSupervisor: "Giám sát",
    roleScanner: "Nhân viên quét",
    permissions: "Phân quyền",
    canScan: "Quét mã QR",
    canExport: "Xuất dữ liệu",
    canManageOrders: "Quản lý đơn hàng",
    canViewMap: "Xem bản đồ",
    canManageStaff: "Quản lý nhân viên",
    clickToEdit: "Bấm vào nhân viên để chỉnh quyền",
    // Alerts
    alertsPage: "Cảnh báo tự động",
    alertRules: "Quy tắc cảnh báo",
    alertHighError: "Tỉ lệ lỗi cao",
    alertNoScan: "Không quét",
    alertOffline: "Thiết bị offline",
    threshold: "Ngưỡng",
    triggered: "Kích hoạt",
    times: "lần",
    pushNotif: "Thông báo đẩy",
    pushGranted: "Đã cấp quyền",
    pushDenied: "Bị từ chối",
    requestPush: "Yêu cầu quyền",
    testAlert: "Test",
    // Chat
    internalChat: "Chat nội bộ",
    teamChat: "Nhắn tin nhóm",
    you: "Bạn",
    msgPlaceholder: "Nhập tin nhắn...",
    send: "Gửi",
    // GPS
    startGPS: "Bắt đầu GPS",
    stopGPS: "Dừng GPS",
    accuracy: "Độ chính xác",
    // PDF
    exportPDF: "Xuất PDF",
    generating: "Đang tạo...",
    reportGenerated: "Đã tạo báo cáo!",
  },
  en: {
    dashboard: "Dashboard",
    liveScan: "Live Scan",
    orders: "Orders",
    gpsMap: "GPS Map",
    scanGPS: "Scan GPS",
    leaderboard: "Leaderboard",
    analytics: "Analytics",
    history: "History",
    settings: "Settings",
    chat: "Internal Chat",
    staff: "Staff",
    alerts: "Alerts",
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
    login: "Login",
    staffMgmt: "Staff Management",
    addStaff: "Add Staff",
    staffName: "Full Name",
    staffRole: "Role",
    staffEmail: "Email",
    staffStatus: "Status",
    staffActive: "Active",
    staffInactive: "Inactive",
    roleAdmin: "Admin",
    roleSupervisor: "Supervisor",
    roleScanner: "Scanner",
    permissions: "Permissions",
    canScan: "QR Scanning",
    canExport: "Export Data",
    canManageOrders: "Manage Orders",
    canViewMap: "View Map",
    canManageStaff: "Manage Staff",
    clickToEdit: "Click a staff member to edit permissions",
    alertsPage: "Automatic Alerts",
    alertRules: "Alert Rules",
    alertHighError: "High Error Rate",
    alertNoScan: "No Scan Activity",
    alertOffline: "Device Offline",
    threshold: "Threshold",
    triggered: "Triggered",
    times: "times",
    pushNotif: "Push Notifications",
    pushGranted: "Permission Granted",
    pushDenied: "Permission Denied",
    requestPush: "Request Permission",
    testAlert: "Test",
    internalChat: "Internal Chat",
    teamChat: "Team Messaging",
    you: "You",
    msgPlaceholder: "Type a message...",
    send: "Send",
    startGPS: "Start GPS",
    stopGPS: "Stop GPS",
    accuracy: "Accuracy",
    exportPDF: "Export PDF",
    generating: "Generating...",
    reportGenerated: "Report generated!",
  },
  zh: {
    dashboard: "仪表盘",
    liveScan: "实时扫描",
    orders: "订单",
    gpsMap: "GPS地图",
    scanGPS: "GPS扫描",
    leaderboard: "排行榜",
    analytics: "分析",
    history: "历史",
    settings: "设置",
    chat: "内部聊天",
    staff: "员工",
    alerts: "警报",
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
    login: "登录",
    staffMgmt: "员工管理",
    addStaff: "添加员工",
    staffName: "姓名",
    staffRole: "角色",
    staffEmail: "邮箱",
    staffStatus: "状态",
    staffActive: "在职",
    staffInactive: "休假",
    roleAdmin: "管理员",
    roleSupervisor: "主管",
    roleScanner: "扫描员",
    permissions: "权限",
    canScan: "QR扫描",
    canExport: "导出数据",
    canManageOrders: "管理订单",
    canViewMap: "查看地图",
    canManageStaff: "管理员工",
    clickToEdit: "点击员工编辑权限",
    alertsPage: "自动警报",
    alertRules: "警报规则",
    alertHighError: "高错误率",
    alertNoScan: "无扫描活动",
    alertOffline: "设备离线",
    threshold: "阈值",
    triggered: "触发",
    times: "次",
    pushNotif: "推送通知",
    pushGranted: "已授权",
    pushDenied: "已拒绝",
    requestPush: "请求权限",
    testAlert: "测试",
    internalChat: "内部聊天",
    teamChat: "团队消息",
    you: "你",
    msgPlaceholder: "输入消息...",
    send: "发送",
    startGPS: "开始GPS",
    stopGPS: "停止GPS",
    accuracy: "精度",
    exportPDF: "导出PDF",
    generating: "生成中...",
    reportGenerated: "报告已生成！",
  },
  ko: {
    dashboard: "대시보드",
    liveScan: "라이브 스캔",
    orders: "주문",
    gpsMap: "GPS 지도",
    scanGPS: "GPS 스캔",
    leaderboard: "리더보드",
    analytics: "분석",
    history: "기록",
    settings: "설정",
    chat: "내부 채팅",
    staff: "직원",
    alerts: "알림",
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
    login: "로그인",
    staffMgmt: "직원 관리",
    addStaff: "직원 추가",
    staffName: "이름",
    staffRole: "역할",
    staffEmail: "이메일",
    staffStatus: "상태",
    staffActive: "재직 중",
    staffInactive: "휴직",
    roleAdmin: "관리자",
    roleSupervisor: "감독자",
    roleScanner: "스캐너",
    permissions: "권한",
    canScan: "QR 스캔",
    canExport: "데이터 내보내기",
    canManageOrders: "주문 관리",
    canViewMap: "지도 보기",
    canManageStaff: "직원 관리",
    clickToEdit: "직원을 클릭하여 권한 편집",
    alertsPage: "자동 알림",
    alertRules: "알림 규칙",
    alertHighError: "높은 오류율",
    alertNoScan: "스캔 없음",
    alertOffline: "장치 오프라인",
    threshold: "임계값",
    triggered: "발생",
    times: "회",
    pushNotif: "푸시 알림",
    pushGranted: "권한 부여됨",
    pushDenied: "권한 거부됨",
    requestPush: "권한 요청",
    testAlert: "테스트",
    internalChat: "내부 채팅",
    teamChat: "팀 메시지",
    you: "나",
    msgPlaceholder: "메시지 입력...",
    send: "보내기",
    startGPS: "GPS 시작",
    stopGPS: "GPS 중지",
    accuracy: "정확도",
    exportPDF: "PDF 내보내기",
    generating: "생성 중...",
    reportGenerated: "보고서 생성 완료!",
  },
  ja: {
    dashboard: "ダッシュボード",
    liveScan: "ライブスキャン",
    orders: "注文",
    gpsMap: "GPS地図",
    scanGPS: "GPSスキャン",
    leaderboard: "リーダーボード",
    analytics: "分析",
    history: "履歴",
    settings: "設定",
    chat: "社内チャット",
    staff: "スタッフ",
    alerts: "アラート",
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
    login: "ログイン",
    staffMgmt: "スタッフ管理",
    addStaff: "スタッフ追加",
    staffName: "氏名",
    staffRole: "役割",
    staffEmail: "メール",
    staffStatus: "状態",
    staffActive: "在職",
    staffInactive: "休職",
    roleAdmin: "管理者",
    roleSupervisor: "監督者",
    roleScanner: "スキャナー",
    permissions: "権限",
    canScan: "QRスキャン",
    canExport: "データエクスポート",
    canManageOrders: "注文管理",
    canViewMap: "地図表示",
    canManageStaff: "スタッフ管理",
    clickToEdit: "スタッフをクリックして権限編集",
    alertsPage: "自動アラート",
    alertRules: "アラートルール",
    alertHighError: "高エラー率",
    alertNoScan: "スキャンなし",
    alertOffline: "デバイスオフライン",
    threshold: "閾値",
    triggered: "発生",
    times: "回",
    pushNotif: "プッシュ通知",
    pushGranted: "許可済み",
    pushDenied: "拒否済み",
    requestPush: "権限リクエスト",
    testAlert: "テスト",
    internalChat: "社内チャット",
    teamChat: "チームメッセージ",
    you: "あなた",
    msgPlaceholder: "メッセージを入力...",
    send: "送信",
    startGPS: "GPS開始",
    stopGPS: "GPS停止",
    accuracy: "精度",
    exportPDF: "PDFエクスポート",
    generating: "生成中...",
    reportGenerated: "レポート生成完了！",
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
      .btn-success{padding:9px 18px;background:transparent;border:1px solid var(--success);border-radius:9px;
        color:var(--success);font-weight:800;font-family:'Nunito',sans-serif;font-size:12.5px;cursor:pointer;
        transition:background .2s,transform .15s;}
      .btn-success:hover{background:rgba(52,211,153,.1);transform:translateY(-1px);}
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
      /* ── MOBILE RESPONSIVE (nâng cấp) ── */
      .mobile-topbar{display:none;position:fixed;top:0;left:0;right:0;height:54px;z-index:50;
        background:var(--sidebar);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);
        border-bottom:1px solid var(--card-border);align-items:center;padding:0 14px;gap:10px;}
      .tbl-scroll{overflow-x:auto;-webkit-overflow-scrolling:touch;max-width:100%;}
      /* Chat bubbles */
      .bubble-me{background:var(--accent);color:${dark ? "#070d1a" : "#fff"};border-radius:14px 14px 3px 14px;}
      .bubble-other{background:var(--surface);color:var(--text);border:1px solid var(--card-border);border-radius:14px 14px 14px 3px;}
      .chat-textarea{flex:1;padding:10px 13px;background:var(--surface);border:1px solid var(--card-border);
        border-radius:10px;color:var(--text);font-size:13px;font-family:'Nunito',sans-serif;outline:none;resize:none;}
      .chat-textarea:focus{border-color:var(--accent);}
      /* Staff */
      .staff-card{background:var(--surface);border:1px solid var(--card-border);border-radius:12px;
        padding:14px;cursor:pointer;transition:border-color .2s;}
      .staff-card:hover,.staff-card.active{border-color:var(--accent);}
      /* Toggle */
      .toggle-wrap{width:42px;height:23px;border-radius:12px;cursor:pointer;position:relative;
        transition:background .2s;flex-shrink:0;}
      .toggle-knob{width:17px;height:17px;border-radius:50%;background:#fff;position:absolute;
        top:3px;transition:left .2s;}
      /* Lang button */
      .lang-btn{padding:7px 13px;background:transparent;border:1px solid var(--card-border);border-radius:9px;
        cursor:pointer;font-size:13px;font-family:'Nunito',sans-serif;color:var(--muted);
        transition:all .2s;display:flex;align-items:center;gap:7px;width:100%;}
      .lang-btn:hover,.lang-btn.active{border-color:var(--accent);color:var(--accent);background:var(--menu-active);}
      /* Alert card */
      .alert-rule-card{background:var(--surface);border:1px solid var(--card-border);border-radius:11px;
        padding:13px 16px;display:flex;align-items:center;gap:12px;transition:border-color .2s;}
      .alert-rule-card:hover{border-color:var(--accent);}

      /* ── TABLET ── */
      @media(max-width:1024px){
        .grid-4-col{grid-template-columns:repeat(2,1fr)!important;}
        .grid-chart-col{grid-template-columns:1fr!important;}
      }
      @media(max-width:900px){
        .grid-4-col{grid-template-columns:repeat(2,1fr)!important;}
        .grid-3-col{grid-template-columns:repeat(2,1fr)!important;}
        .grid-2-col{grid-template-columns:1fr!important;}
        .grid-chart-col{grid-template-columns:1fr!important;}
      }
      /* ── MOBILE ── */
      @media(max-width:600px){
        aside.main-sidebar{display:none!important;}
        .mobile-topbar{display:flex!important;}
        .main-content-area{padding:62px 12px 24px!important;}
        .page-title{font-size:19px!important;}
        .grid-4-col{grid-template-columns:1fr 1fr!important;gap:8px!important;}
        .grid-3-col{grid-template-columns:1fr 1fr!important;gap:8px!important;}
        .grid-2-col{grid-template-columns:1fr!important;gap:10px!important;}
        .grid-chart-col{grid-template-columns:1fr!important;}
        .panel{padding:14px!important;border-radius:14px!important;}
        .stat-card{padding:14px 12px!important;border-radius:14px!important;}
        .stat-card h2{font-size:24px!important;}
        table th{padding:7px 8px!important;font-size:9px!important;}
        table td{padding:8px!important;font-size:12px!important;}
        .btn-primary,.btn-ghost,.btn-danger,.btn-success{padding:7px 12px!important;font-size:11.5px!important;}
        .badge{font-size:9.5px!important;padding:2px 7px!important;}
        .section-label{font-size:9.5px!important;}
        /* Map full width on mobile */
        .leaflet-container{height:300px!important;}
        /* Hide long text on small screens */
        .hide-mobile{display:none!important;}
        /* Stack toolbar items */
        .toolbar-wrap{flex-direction:column!important;align-items:stretch!important;}
        .toolbar-wrap>*{width:100%!important;}
        /* Chat full height */
        .chat-box{height:55vh!important;}
      }
      @media(max-width:400px){
        .grid-4-col{grid-template-columns:1fr 1fr!important;}
        .main-content-area{padding:60px 10px 20px!important;}
        .stat-card h2{font-size:20px!important;}
      }
    `}</style>
  );
};

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

/* ─── TOGGLE (NEW) ────────────────────────────────── */
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

/* ─── GPS HOOK (NEW) ──────────────────────────────── */
function useGPS(setPos, setHistory, addToast) {
  const wid = useRef(null);
  const [active, setActive] = useState(false);
  const [gpsErr, setGpsErr] = useState(null);
  const [accuracy, setAccuracy] = useState(null);

  const start = useCallback(() => {
    if (!navigator.geolocation) {
      setGpsErr("GPS N/A");
      return;
    }
    setActive(true);
    setGpsErr(null);
    wid.current = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude: lat, longitude: lng, accuracy: acc } = pos.coords;
        setPos([lat, lng]);
        setHistory((prev) => {
          const last = prev[prev.length - 1];
          if (
            last &&
            Math.abs(last[0] - lat) < 0.000008 &&
            Math.abs(last[1] - lng) < 0.000008
          )
            return prev;
          return [...prev, [lat, lng]];
        });
        setAccuracy(acc ? acc.toFixed(1) : null);
        socket.emit("shipper_location", { lat, lng, accuracy: acc });
      },
      (e) => {
        setGpsErr(e.message);
        setActive(false);
        addToast("GPS: " + e.message, "danger");
      },
      { enableHighAccuracy: true, maximumAge: 2000, timeout: 8000 },
    );
  }, []);

  const stop = useCallback(() => {
    if (wid.current !== null) {
      navigator.geolocation.clearWatch(wid.current);
      wid.current = null;
    }
    setActive(false);
  }, []);

  useEffect(
    () => () => {
      if (wid.current !== null) navigator.geolocation.clearWatch(wid.current);
    },
    [],
  );
  return { active, gpsErr, accuracy, start, stop };
}

/* ─── PUSH HOOK (NEW) ────────────────────────────── */
function usePush() {
  const [perm, setPerm] = useState(
    typeof Notification !== "undefined" ? Notification.permission : "default",
  );
  const request = async () => {
    if (typeof Notification === "undefined") return;
    const r = await Notification.requestPermission();
    setPerm(r);
  };
  const push = (title, body) => {
    if (perm === "granted") new Notification(title, { body });
  };
  return { perm, request, push };
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
  const [langCode, setLangCode] = useState("vi"); // NEW
  const [history, setHistory] = useState([]);
  const [lastScan, setLastScan] = useState(null);
  const [orderList, setOrderList] = useState([]);
  const [scannedList, setScannedList] = useState([]);
  const [toasts, setToasts] = useState([]);
  const [notifs, setNotifs] = useState([]);
  const [showNotif, setShowNotif] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false); // NEW

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

  // Staff state — bắt đầu rỗng, user tự thêm
  const [staff, setStaff] = useState([]);

  // NEW: Alert rules
  const [alertRules, setAlertRules] = useState([
    { id: 1, type: "highError", threshold: 10, enabled: true, triggered: 0 },
    { id: 2, type: "noScan", threshold: 30, enabled: true, triggered: 0 },
    { id: 3, type: "offline", threshold: 5, enabled: false, triggered: 0 },
  ]);

  // Leaderboard — rỗng, dùng data thật từ staff
  const [leaderboard] = useState([]);

  const i18n = I18N[langCode];
  const addToast = (msg, type = "info") => {
    const id = Date.now();
    setToasts((p) => [...p, { id, msg, type }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 4000);
  };
  const addNotif = (msg, type = "info") => {
    setNotifs((p) => [{ msg, type, time: timeNow() }, ...p].slice(0, 30));
  };

  // NEW: GPS hook
  const gps = useGPS(setShipperPos, setLocationHistory, addToast);
  // NEW: Push hook
  const pushN = usePush();

  useEffect(() => {
    socket.on("new_scan", (data) => {
      setHistory((prev) => [{ ...data, ts: Date.now() }, ...prev]);
      setLastScan(data);
      setScannedList((prev) =>
        prev.includes(data.code) ? prev : [...prev, data.code],
      );
      addToast(`Quét mã: ${data.code}`, "success");
      addNotif(`Quét thành công: ${data.code}`, "success");
      pushN.push("✓ Scan OK", data.code); // NEW
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
          setShipperPos([lat, lng]); // NEW: also update on scan
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

  useEffect(() => {
    const total = history.length;
    setErrorRate(total > 0 ? ((failCount / total) * 100).toFixed(1) : "0.0");
  }, [history.length, failCount]);

  if (!loggedIn) return <Login onLogin={() => setLoggedIn(true)} />;

  const okCount = history.length - failCount;

  return (
    <>
      <GlobalStyle dark={dark} />
      {/* NEW: Mobile topbar */}
      <div className="mobile-topbar" style={{ display: "flex" }}>
        <button
          onClick={() => setMobileOpen(true)}
          style={{
            background: "transparent",
            border: "none",
            cursor: "pointer",
            color: "var(--text)",
            fontSize: 20,
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
          }}
        >
          AI Factory
        </span>
        <div
          style={{
            marginLeft: "auto",
            display: "flex",
            alignItems: "center",
            gap: 5,
          }}
        >
          <span className="pulse-dot" />
          <span
            style={{ fontSize: 11, color: "var(--success)", fontWeight: 700 }}
          >
            {i18n.online}
          </span>
        </div>
      </div>

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

        {/* NEW: Mobile sidebar drawer */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                position: "fixed",
                inset: 0,
                zIndex: 60,
                display: "flex",
              }}
            >
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{ flex: 1, background: "rgba(0,0,0,.6)" }}
                onClick={() => setMobileOpen(false)}
              />
              <motion.div
                initial={{ x: 240 }}
                animate={{ x: 0 }}
                exit={{ x: 240 }}
                transition={{ type: "spring", damping: 28, stiffness: 240 }}
                style={{
                  width: 230,
                  background: "var(--sidebar)",
                  backdropFilter: "blur(22px)",
                  borderLeft: "1px solid var(--card-border)",
                  overflow: "auto",
                  zIndex: 61,
                }}
              >
                <SidebarInner
                  page={page}
                  setPage={(p) => {
                    setPage(p);
                    setMobileOpen(false);
                  }}
                  dark={dark}
                  setDark={setDark}
                  notifCount={notifs.filter((n) => n.type !== "info").length}
                  showNotif={showNotif}
                  setShowNotif={setShowNotif}
                  notifs={notifs}
                  i18n={i18n}
                  langCode={langCode}
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <Sidebar
          page={page}
          setPage={setPage}
          dark={dark}
          setDark={setDark}
          notifCount={notifs.filter((n) => n.type !== "info").length}
          showNotif={showNotif}
          setShowNotif={setShowNotif}
          notifs={notifs}
          i18n={i18n}
          langCode={langCode}
        />

        <main
          className="main-content-area"
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
                  gps={gps}
                  i18n={i18n}
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
                  okCount={okCount}
                  errorRate={errorRate}
                  addToast={addToast}
                  i18n={i18n}
                />
              )}
              {page === "history" && <History history={history} />}
              {/* NEW pages */}
              {page === "chat" && <ChatPage i18n={i18n} />}
              {page === "staff" && (
                <StaffPage
                  staff={staff}
                  setStaff={setStaff}
                  i18n={i18n}
                  addToast={addToast}
                />
              )}
              {page === "alerts" && (
                <AlertsPage
                  alertRules={alertRules}
                  setAlertRules={setAlertRules}
                  i18n={i18n}
                  pushN={pushN}
                  addToast={addToast}
                  history={history}
                  failCount={failCount}
                />
              )}
              {page === "settings" && (
                <Settings
                  logout={() => setLoggedIn(false)}
                  dark={dark}
                  setDark={setDark}
                  langCode={langCode}
                  setLangCode={setLangCode}
                  i18n={i18n}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

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

/* ─── SIDEBAR INNER (extracted for reuse in drawer) ── */
function SidebarInner({
  page,
  setPage,
  dark,
  setDark,
  notifCount,
  showNotif,
  setShowNotif,
  notifs,
  i18n,
  langCode,
}) {
  const NAV = [
    { id: "dashboard", icon: "⬡", label: i18n.dashboard, section: "Điều hành" },
    { id: "live", icon: "◉", label: i18n.liveScan },
    { id: "orders", icon: "▣", label: i18n.orders },
    { id: "map", icon: "◎", label: i18n.gpsMap },
    { id: "scan", icon: "◈", label: i18n.scanGPS },
    {
      id: "leaderboard",
      icon: "⊛",
      label: i18n.leaderboard,
      section: "Phân tích",
    },
    { id: "analytics", icon: "▦", label: i18n.analytics },
    { id: "history", icon: "▤", label: i18n.history },
    { id: "chat", icon: "💬", label: i18n.chat }, // NEW
    { id: "staff", icon: "👥", label: i18n.staff, section: "HR" }, // NEW
    { id: "alerts", icon: "🔔", label: i18n.alerts }, // NEW
    { id: "settings", icon: "⚙", label: i18n.settings, section: "Hệ thống" },
  ];
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        padding: "28px 12px",
      }}
    >
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
            {i18n.online}
          </span>
        </div>
      </div>
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
            <span>🔔</span> {i18n.notifications}
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
            <NotifPanel
              notifs={notifs}
              onClose={() => setShowNotif(false)}
              i18n={i18n}
            />
          )}
        </AnimatePresence>
      </div>
      <nav
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: 1,
          overflowY: "auto",
        }}
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
                cursor: "pointer",
                background:
                  page === item.id ? "var(--menu-active)" : "transparent",
                color: page === item.id ? "var(--accent)" : "var(--muted)",
                fontWeight: page === item.id ? 800 : 600,
                fontSize: 13,
                textAlign: "left",
                fontFamily: "'Nunito',sans-serif",
                transition: "background .15s,color .15s",
                position: "relative",
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
              {item.label}
            </motion.button>
          </React.Fragment>
        ))}
      </nav>
      <div
        style={{
          fontSize: 10,
          color: "var(--muted)",
          textAlign: "center",
          marginBottom: 8,
          fontWeight: 600,
        }}
      >
        {LANGS[langCode]?.flag} {LANGS[langCode]?.name}
      </div>
      <button
        onClick={() => setDark(!dark)}
        style={{
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
        {dark ? "☀" : "🌙"} {dark ? i18n.lightMode : i18n.darkMode}
      </button>
    </div>
  );
}

/* ─── SIDEBAR (original structure, now uses SidebarInner) ── */
function Sidebar({
  page,
  setPage,
  dark,
  setDark,
  notifCount,
  showNotif,
  setShowNotif,
  notifs,
  i18n,
  langCode,
}) {
  return (
    <aside
      className="main-sidebar"
      style={{
        width: 220,
        minHeight: "100vh",
        background: "var(--sidebar)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderRight: "1px solid var(--card-border)",
        display: "flex",
        flexDirection: "column",
        position: "sticky",
        top: 0,
        zIndex: 10,
        flexShrink: 0,
      }}
    >
      <SidebarInner
        page={page}
        setPage={setPage}
        dark={dark}
        setDark={setDark}
        notifCount={notifCount}
        showNotif={showNotif}
        setShowNotif={setShowNotif}
        notifs={notifs}
        i18n={i18n}
        langCode={langCode}
      />
    </aside>
  );
}

/* ─── DASHBOARD (original – untouched) ───────────────── */
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
      <div
        className="grid-4-col"
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
              flexWrap: "wrap",
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
      <div
        className="grid-chart-col"
        style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 14 }}
      >
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
      <div className="panel">
        <p className="section-label" style={{ marginBottom: 14 }}>
          🧠 AI Insights
        </p>
        <div
          className="grid-3-col"
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

/* ─── LIVE SCAN (original – untouched) ───────────────── */
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
      <div
        className="grid-2-col"
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}
      >
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

/* ─── ORDERS (original – untouched) ──────────────────── */
function Orders({ orderList, setOrderList, scannedList, addToast }) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
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
        className="grid-3-col"
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
                background:
                  "linear-gradient(90deg,var(--success),var(--accent))",
              }}
            />
          </div>
        </div>
      )}
      <div
        className="toolbar-wrap"
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
        <div className="tbl-scroll">
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
    </div>
  );
}

/* ─── DELIVERY MAP (original + GPS controls added) ───── */
function DeliveryMap({ shipperPos, locationHistory, scanPoints, gps, i18n }) {
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

      {/* NEW: GPS browser controls */}
      <div
        className="panel panel-0"
        style={{
          marginBottom: 14,
          display: "flex",
          alignItems: "center",
          gap: 14,
          flexWrap: "wrap",
        }}
      >
        <div style={{ flex: 1, minWidth: 200 }}>
          <p className="section-label" style={{ marginBottom: 6 }}>
            Browser GPS
          </p>
          <div
            style={{
              display: "flex",
              gap: 8,
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            {!gps.active ? (
              <button className="btn-success" onClick={gps.start}>
                📍 {i18n.startGPS}
              </button>
            ) : (
              <button className="btn-danger" onClick={gps.stop}>
                ⏹ {i18n.stopGPS}
              </button>
            )}
            {gps.active && (
              <span className="badge badge-success">
                <span className="pulse-dot" style={{ width: 6, height: 6 }} />{" "}
                Live
              </span>
            )}
            {gps.gpsErr && (
              <span className="badge badge-danger">⚠ {gps.gpsErr}</span>
            )}
          </div>
        </div>
        {gps.accuracy && (
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                fontSize: 9,
                color: "var(--muted)",
                fontWeight: 700,
                textTransform: "uppercase",
              }}
            >
              {i18n.accuracy}
            </div>
            <div
              style={{
                fontSize: 16,
                fontWeight: 900,
                color: "var(--success)",
                fontFamily: "'JetBrains Mono',monospace",
              }}
            >
              ±{gps.accuracy}m
            </div>
          </div>
        )}
      </div>

      <div
        className="grid-3-col"
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
            val: gps.active ? "Live GPS" : "Trực tiếp",
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
                {gps.accuracy && (
                  <div style={{ fontSize: 11, color: "#38bdf8", marginTop: 3 }}>
                    ±{gps.accuracy}m
                  </div>
                )}
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
          <div className="tbl-scroll">
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
        </div>
      )}
    </div>
  );
}

/* ─── LEADERBOARD (original – untouched) ─────────────── */
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
          return (
            <motion.div
              key={p.name}
              className="stat-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.06 }}
              style={{ textAlign: "center" }}
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

/* ─── ANALYTICS (original + PDF export added) ─────────── */
function Analytics({
  history,
  hourlyData,
  failCount,
  okCount,
  errorRate,
  addToast,
  i18n,
}) {
  const [genPDF, setGenPDF] = useState(false);
  const rateData = hourlyData.map((h) => ({
    h: h.h,
    rate: h.ok + h.fail > 0 ? ((h.fail / (h.ok + h.fail)) * 100).toFixed(1) : 0,
  }));

  const exportPDF = () => {
    setGenPDF(true);
    const now = new Date().toLocaleString();
    const rows = hourlyData
      .map((h) => {
        const tot = h.ok + h.fail;
        const r = tot > 0 ? ((h.fail / tot) * 100).toFixed(1) : "0.0";
        return `<tr><td>${h.h}</td><td style="color:#34d399">${h.ok}</td><td style="color:#f87171">${h.fail}</td><td>${tot}</td><td>${r}%</td></tr>`;
      })
      .join("");
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>QR Scan Report</title>
    <style>body{font-family:Arial,sans-serif;padding:30px;color:#0f172a;}h1{color:#6366f1;}
    .kpis{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin:20px 0;}
    .kpi{background:#f1f5f9;border-radius:10px;padding:14px;text-align:center;}
    .kpi .v{font-size:28px;font-weight:900;color:#6366f1;}.kpi .l{font-size:11px;color:#94a3b8;font-weight:700;text-transform:uppercase;}
    table{width:100%;border-collapse:collapse;margin-top:16px;}th,td{padding:9px 12px;border:1px solid #e2e8f0;font-size:13px;}
    th{background:#f1f5f9;font-weight:800;}tr:nth-child(even){background:#f8fafc;}
    .footer{margin-top:20px;font-size:11px;color:#94a3b8;}@media print{body{padding:15px;}}</style></head>
    <body><h1>🏭 QR Scan Report — AI Factory</h1><p style="color:#94a3b8;font-size:13px">${now}</p>
    <div class="kpis">
      <div class="kpi"><div class="v">${history.length}</div><div class="l">Tổng quét</div></div>
      <div class="kpi"><div class="v" style="color:#10b981">${okCount}</div><div class="l">Thành công</div></div>
      <div class="kpi"><div class="v" style="color:#ef4444">${failCount}</div><div class="l">Thất bại</div></div>
      <div class="kpi"><div class="v" style="color:${parseFloat(errorRate) > 5 ? "#ef4444" : "#10b981"}">${errorRate}%</div><div class="l">Tỉ lệ lỗi</div></div>
    </div>
    <h3>Thống kê theo giờ</h3>
    <table><thead><tr><th>Giờ</th><th>Thành công</th><th>Thất bại</th><th>Tổng</th><th>Tỉ lệ lỗi</th></tr></thead>
    <tbody>${rows}</tbody></table>
    <div class="footer">Generated by AI Factory QR Dashboard · ${now}</div></body></html>`;
    const w = window.open("", "_blank", "width=900,height=700");
    if (w) {
      w.document.write(html);
      w.document.close();
      setTimeout(() => w.print(), 400);
    }
    setGenPDF(false);
    addToast(i18n.reportGenerated, "success");
  };

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 26,
          flexWrap: "wrap",
          gap: 10,
        }}
      >
        <div>
          <p className="section-label">Phân tích</p>
          <h1 className="page-title">Analytics nâng cao</h1>
        </div>
        {/* NEW: PDF export button */}
        <button
          className="btn-primary"
          onClick={exportPDF}
          disabled={genPDF}
          style={{ display: "flex", alignItems: "center", gap: 6 }}
        >
          {genPDF ? `⏳ ${i18n.generating}` : `📄 ${i18n.exportPDF}`}
        </button>
      </div>
      <div
        className="grid-2-col"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 14,
          marginBottom: 14,
        }}
      >
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
      <div className="panel panel-0">
        <p className="section-label" style={{ marginBottom: 14 }}>
          Thống kê theo giờ
        </p>
        <div className="tbl-scroll">
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
    </div>
  );
}

/* ─── HISTORY (original – untouched) ─────────────────── */
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
        <div className="tbl-scroll">
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
    </div>
  );
}

/* ─── SETTINGS (original + language section added) ────── */
function Settings({ logout, dark, setDark, langCode, setLangCode, i18n }) {
  const [serverUrl, setServerUrl] = useState(
    "https://qr-server-n6pp.onrender.com",
  );
  const [sound, setSound] = useState(true);
  const [autoExport, setAutoExport] = useState(false);

  // Keep original Toggle component
  const ToggleOld = ({ value, onChange }) => (
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
        className="grid-2-col"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 14,
          maxWidth: 700,
        }}
      >
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
              {i18n.loginAs}
            </div>
            <div style={{ fontWeight: 800, fontSize: 15, marginTop: 2 }}>
              {i18n.admin}
            </div>
          </div>
          <button className="btn-danger" onClick={logout}>
            {i18n.logout}
          </button>
        </div>
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
              <ToggleOld value={value} onChange={set} />
            </div>
          ))}
        </div>
        {/* NEW: Language section */}
        <div className="panel panel-0">
          <p className="section-label" style={{ marginBottom: 12 }}>
            {i18n.language}
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
            {Object.entries(LANGS).map(([code, lang]) => (
              <button
                key={code}
                className={`lang-btn ${langCode === code ? "active" : ""}`}
                onClick={() => setLangCode(code)}
              >
                <span>{lang.flag}</span>
                <span style={{ fontWeight: 700 }}>{lang.name}</span>
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
        <div className="panel panel-0">
          <p className="section-label" style={{ marginBottom: 12 }}>
            Thông tin
          </p>
          {[
            { k: "Phiên bản", v: "3.0.0" },
            { k: "Framework", v: "React 18" },
            { k: "Socket", v: "Socket.IO" },
            { k: "Bản đồ", v: "Leaflet.js" },
            { k: "Ngôn ngữ", v: LANGS[langCode]?.name },
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

/* ══════════════════════════════════════════════════════
   NEW PAGES BELOW — added without touching originals
═══════════════════════════════════════════════════════ */

/* ─── CHAT PAGE — socket thật ─────────────────────────── */
function ChatPage({ i18n }) {
  const [msgs, setMsgs] = useState([
    {
      id: "sys-1",
      from: "sys",
      name: "System",
      text: "👋 Chat nội bộ sẵn sàng! Mọi người trong cùng mạng đều thấy tin nhắn này.",
      time: timeNow(),
    },
  ]);
  const [input, setInput] = useState("");
  const [myName, setMyName] = useState("");
  const [nameSet, setNameSet] = useState(false);
  const [online, setOnline] = useState(1);
  const endRef = useRef(null);
  const myNameRef = useRef("");

  useEffect(
    () => endRef.current?.scrollIntoView({ behavior: "smooth" }),
    [msgs],
  );

  // Lắng nghe tin nhắn từ server
  useEffect(() => {
    socket.on("chat_message", (data) => {
      // Chỉ thêm nếu không phải tin mình vừa gửi (tránh duplicate)
      setMsgs((p) => {
        if (p.find((m) => m.id === data.id)) return p;
        return [...p, { ...data, from: "other" }];
      });
    });
    socket.on("chat_online", (count) => setOnline(count));
    return () => {
      socket.off("chat_message");
      socket.off("chat_online");
    };
  }, []);

  const confirmName = () => {
    if (!myName.trim()) return;
    myNameRef.current = myName.trim();
    setNameSet(true);
    // Thông báo online
    socket.emit("chat_join", { name: myNameRef.current });
    setMsgs((p) => [
      ...p,
      {
        id: "join-" + Date.now(),
        from: "sys",
        name: "System",
        text: `✅ Bạn đã tham gia với tên "${myNameRef.current}"`,
        time: timeNow(),
      },
    ]);
  };

  const send = () => {
    if (!input.trim() || !nameSet) return;
    const msg = {
      id: Date.now() + "-" + Math.random(),
      from: "me",
      name: myNameRef.current,
      text: input.trim(),
      time: timeNow(),
    };
    // Hiện ngay trên UI của mình
    setMsgs((p) => [...p, msg]);
    // Gửi lên server để broadcast cho người khác
    socket.emit("chat_message", msg);
    setInput("");
  };

  // Chưa đặt tên — hiển thị form nhập tên
  if (!nameSet) {
    return (
      <div>
        <div style={{ marginBottom: 26 }}>
          <p className="section-label">Hệ thống</p>
          <h1 className="page-title">{i18n.internalChat}</h1>
        </div>
        <div
          className="panel panel-0"
          style={{
            maxWidth: 400,
            margin: "0 auto",
            textAlign: "center",
            padding: 32,
          }}
        >
          <div style={{ fontSize: 40, marginBottom: 14 }}>💬</div>
          <p style={{ fontWeight: 800, fontSize: 15, marginBottom: 6 }}>
            Nhập tên của bạn để vào chat
          </p>
          <p
            style={{ color: "var(--muted)", fontSize: 12.5, marginBottom: 20 }}
          >
            Tên này sẽ hiển thị với mọi người trong nhóm
          </p>
          <input
            value={myName}
            onChange={(e) => setMyName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && confirmName()}
            placeholder="VD: Nguyễn Văn A"
            style={{
              width: "100%",
              padding: "11px 14px",
              background: "var(--surface)",
              border: "1px solid var(--card-border)",
              borderRadius: 10,
              color: "var(--text)",
              fontSize: 14,
              fontFamily: "'Nunito',sans-serif",
              outline: "none",
              marginBottom: 12,
              boxSizing: "border-box",
            }}
            autoFocus
          />
          <button
            className="btn-primary"
            onClick={confirmName}
            style={{ width: "100%", padding: "11px" }}
          >
            Vào chat →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 22,
          flexWrap: "wrap",
          gap: 8,
        }}
      >
        <div>
          <p className="section-label">Hệ thống</p>
          <h1 className="page-title">{i18n.internalChat}</h1>
          <p style={{ color: "var(--muted)", fontSize: 13, fontWeight: 500 }}>
            {i18n.teamChat}
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span className="badge badge-success">
            <span className="pulse-dot" style={{ width: 6, height: 6 }} />{" "}
            {myNameRef.current}
          </span>
          <span className="badge badge-info">👥 {online} online</span>
        </div>
      </div>

      <div
        className="panel panel-0 chat-box"
        style={{
          display: "flex",
          flexDirection: "column",
          height: "60vh",
          minHeight: 380,
        }}
      >
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "6px 2px",
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          {msgs.map((m) => (
            <div
              key={m.id}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: m.from === "me" ? "flex-end" : "flex-start",
              }}
            >
              {m.from === "sys" ? (
                <div
                  style={{
                    alignSelf: "center",
                    fontSize: 11,
                    color: "var(--muted)",
                    background: "var(--surface)",
                    padding: "4px 12px",
                    borderRadius: 20,
                    fontWeight: 600,
                  }}
                >
                  {m.text}
                </div>
              ) : (
                <>
                  {m.from !== "me" && (
                    <span
                      style={{
                        fontSize: 10.5,
                        color: "var(--muted)",
                        fontWeight: 700,
                        marginBottom: 3,
                        paddingLeft: 4,
                      }}
                    >
                      {m.name}
                    </span>
                  )}
                  <div
                    className={m.from === "me" ? "bubble-me" : "bubble-other"}
                    style={{
                      padding: "10px 14px",
                      maxWidth: "75%",
                      fontSize: 13.5,
                      fontWeight: 600,
                      lineHeight: 1.5,
                      wordBreak: "break-word",
                    }}
                  >
                    {m.text}
                  </div>
                  <span
                    style={{
                      fontSize: 9.5,
                      color: "var(--muted)",
                      marginTop: 3,
                      paddingLeft: 4,
                      paddingRight: 4,
                    }}
                  >
                    {m.time}
                  </span>
                </>
              )}
            </div>
          ))}
          <div ref={endRef} />
        </div>
        <div
          style={{
            borderTop: "1px solid var(--card-border)",
            paddingTop: 11,
            display: "flex",
            gap: 8,
            marginTop: 4,
          }}
        >
          <textarea
            className="chat-textarea"
            rows={1}
            placeholder={i18n.msgPlaceholder}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
          />
          <button
            className="btn-primary"
            onClick={send}
            style={{ flexShrink: 0 }}
          >
            {i18n.send}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── STAFF PAGE (NEW) ────────────────────────────────── */
function StaffPage({ staff, setStaff, i18n, addToast }) {
  const [selected, setSelected] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "",
    role: "scanner",
    email: "",
    active: true,
  });
  const COLORS = [
    "#38bdf8",
    "#34d399",
    "#fbbf24",
    "#a78bfa",
    "#f87171",
    "#fb923c",
  ];
  const ROLE_BADGE = {
    admin: "badge-info",
    supervisor: "badge-success",
    scanner: "badge-warning",
  };
  const ROLE_LABELS = {
    admin: i18n.roleAdmin,
    supervisor: i18n.roleSupervisor,
    scanner: i18n.roleScanner,
  };
  const PERMS = [
    { k: "canScan", l: i18n.canScan },
    { k: "canExport", l: i18n.canExport },
    { k: "canManageOrders", l: i18n.canManageOrders },
    { k: "canViewMap", l: i18n.canViewMap },
    { k: "canManageStaff", l: i18n.canManageStaff },
  ];

  const addMember = () => {
    if (!form.name.trim()) return;
    setStaff((p) => [
      ...p,
      {
        ...form,
        id: Date.now(),
        avatar: form.name[0].toUpperCase(),
        color: COLORS[p.length % COLORS.length],
        scans: 0,
        streak: 0,
        perms: {
          canScan: true,
          canExport: false,
          canManageOrders: false,
          canViewMap: true,
          canManageStaff: false,
        },
      },
    ]);
    setForm({ name: "", role: "scanner", email: "", active: true });
    setShowForm(false);
    addToast(`✓ ${i18n.addStaff}: ${form.name}`, "success");
  };
  const del = (id) => {
    setStaff((p) => p.filter((s) => s.id !== id));
    if (selected?.id === id) setSelected(null);
  };
  const togglePerm = (id, perm) => {
    setStaff((p) =>
      p.map((s) =>
        s.id === id
          ? { ...s, perms: { ...s.perms, [perm]: !s.perms[perm] } }
          : s,
      ),
    );
    setSelected((s) =>
      s && s.id === id
        ? { ...s, perms: { ...s.perms, [perm]: !s.perms[perm] } }
        : s,
    );
  };
  const toggleActive = (id) => {
    setStaff((p) =>
      p.map((s) => (s.id === id ? { ...s, active: !s.active } : s)),
    );
    setSelected((s) => (s && s.id === id ? { ...s, active: !s.active } : s));
  };

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 26,
          flexWrap: "wrap",
          gap: 10,
        }}
      >
        <div>
          <p className="section-label">HR</p>
          <h1 className="page-title">{i18n.staffMgmt}</h1>
        </div>
        <button className="btn-primary" onClick={() => setShowForm((p) => !p)}>
          ⊕ {i18n.addStaff}
        </button>
      </div>
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="panel panel-0"
            style={{ marginBottom: 14, overflow: "hidden" }}
          >
            <p className="section-label" style={{ marginBottom: 12 }}>
              {i18n.addStaff}
            </p>
            <div
              className="grid-2-col"
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 10,
              }}
            >
              <input
                placeholder={i18n.staffName}
                value={form.name}
                onChange={(e) =>
                  setForm((p) => ({ ...p, name: e.target.value }))
                }
                style={{
                  padding: "8px 12px",
                  background: "var(--surface)",
                  border: "1px solid var(--card-border)",
                  borderRadius: 8,
                  color: "var(--text)",
                  fontSize: 12.5,
                  fontFamily: "'Nunito',sans-serif",
                  outline: "none",
                  width: "100%",
                }}
              />
              <input
                placeholder={i18n.staffEmail}
                value={form.email}
                onChange={(e) =>
                  setForm((p) => ({ ...p, email: e.target.value }))
                }
                style={{
                  padding: "8px 12px",
                  background: "var(--surface)",
                  border: "1px solid var(--card-border)",
                  borderRadius: 8,
                  color: "var(--text)",
                  fontSize: 12.5,
                  fontFamily: "'Nunito',sans-serif",
                  outline: "none",
                  width: "100%",
                }}
              />
              <select
                value={form.role}
                onChange={(e) =>
                  setForm((p) => ({ ...p, role: e.target.value }))
                }
                style={{
                  padding: "8px 12px",
                  background: "var(--surface)",
                  border: "1px solid var(--card-border)",
                  borderRadius: 8,
                  color: "var(--text)",
                  fontSize: 12.5,
                  fontFamily: "'Nunito',sans-serif",
                  outline: "none",
                  cursor: "pointer",
                  width: "100%",
                }}
              >
                <option value="scanner">{i18n.roleScanner}</option>
                <option value="supervisor">{i18n.roleSupervisor}</option>
                <option value="admin">{i18n.roleAdmin}</option>
              </select>
              <div style={{ display: "flex", gap: 8 }}>
                <button className="btn-primary" onClick={addMember}>
                  ✓ {i18n.addStaff}
                </button>
                <button
                  className="btn-ghost"
                  onClick={() => setShowForm(false)}
                >
                  {i18n.close}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <div
        className="grid-2-col"
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
          {staff.map((s) => (
            <motion.div
              key={s.id}
              className={`staff-card ${selected?.id === s.id ? "active" : ""}`}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              onClick={() => setSelected(selected?.id === s.id ? null : s)}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
                <div
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: "50%",
                    background: s.color + "22",
                    border: `2px solid ${s.color}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 17,
                    fontWeight: 900,
                    color: s.color,
                    flexShrink: 0,
                    position: "relative",
                  }}
                >
                  {s.avatar}
                  {s.active && (
                    <span
                      style={{
                        position: "absolute",
                        bottom: -1,
                        right: -1,
                        width: 10,
                        height: 10,
                        borderRadius: "50%",
                        background: "var(--success)",
                        border: "2px solid var(--card)",
                      }}
                    />
                  )}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 800 }}>{s.name}</div>
                  <div
                    style={{
                      fontSize: 10.5,
                      color: "var(--muted)",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {s.email}
                  </div>
                </div>
                <div
                  style={{
                    display: "flex",
                    gap: 5,
                    alignItems: "center",
                    flexWrap: "wrap",
                  }}
                >
                  <span className={`badge ${ROLE_BADGE[s.role]}`}>
                    {ROLE_LABELS[s.role]}
                  </span>
                  <span
                    className={`badge ${s.active ? "badge-success" : "badge-danger"}`}
                  >
                    {s.active ? i18n.staffActive : i18n.staffInactive}
                  </span>
                  <button
                    className="btn-danger"
                    style={{ padding: "2px 8px", fontSize: 10 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      del(s.id);
                    }}
                  >
                    ✕
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        <div>
          <AnimatePresence mode="wait">
            {selected ? (
              <motion.div
                key={selected.id}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className="panel panel-0"
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 11,
                    marginBottom: 16,
                  }}
                >
                  <div
                    style={{
                      width: 46,
                      height: 46,
                      borderRadius: "50%",
                      background: selected.color + "22",
                      border: `2px solid ${selected.color}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 18,
                      fontWeight: 900,
                      color: selected.color,
                    }}
                  >
                    {selected.avatar}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 800 }}>
                      {selected.name}
                    </div>
                    <span className={`badge ${ROLE_BADGE[selected.role]}`}>
                      {ROLE_LABELS[selected.role]}
                    </span>
                  </div>
                  <Toggle
                    on={selected.active}
                    set={() => toggleActive(selected.id)}
                  />
                </div>
                <p className="section-label" style={{ marginBottom: 10 }}>
                  {i18n.permissions}
                </p>
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 8 }}
                >
                  {PERMS.map(({ k, l }) => (
                    <div
                      key={k}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "9px 12px",
                        background: "var(--surface)",
                        borderRadius: 9,
                      }}
                    >
                      <span style={{ fontSize: 12.5, fontWeight: 600 }}>
                        {l}
                      </span>
                      <Toggle
                        on={!!selected.perms?.[k]}
                        set={() => togglePerm(selected.id, k)}
                      />
                    </div>
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="panel panel-0"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  minHeight: 220,
                  color: "var(--muted)",
                  flexDirection: "column",
                  gap: 10,
                }}
              >
                <span style={{ fontSize: 36, opacity: 0.15 }}>👥</span>
                <span style={{ fontSize: 13, fontWeight: 600 }}>
                  {i18n.clickToEdit}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

/* ─── ALERTS PAGE (NEW) ───────────────────────────────── */
function AlertsPage({
  alertRules,
  setAlertRules,
  i18n,
  pushN,
  addToast,
  history,
  failCount,
}) {
  const errRate =
    history.length > 0
      ? ((failCount / history.length) * 100).toFixed(1)
      : "0.0";
  const TYPES = [
    {
      v: "highError",
      l: i18n.alertHighError,
      icon: "📉",
      color: "var(--danger)",
    },
    { v: "noScan", l: i18n.alertNoScan, icon: "⏸", color: "var(--warning)" },
    { v: "offline", l: i18n.alertOffline, icon: "📡", color: "var(--muted)" },
  ];
  const toggle = (id) =>
    setAlertRules((p) =>
      p.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r)),
    );
  const test = (rule) => {
    const typeInfo = TYPES.find((x) => x.v === rule.type);
    addToast(`🔔 Test: ${typeInfo?.l}`, "warning");
    pushN.push("🔔 Test Alert", typeInfo?.l || "Test");
    setAlertRules((p) =>
      p.map((r) =>
        r.id === rule.id ? { ...r, triggered: r.triggered + 1 } : r,
      ),
    );
  };

  return (
    <div>
      <div style={{ marginBottom: 26 }}>
        <p className="section-label">Hệ thống</p>
        <h1 className="page-title">{i18n.alertsPage}</h1>
      </div>

      {/* Push permission */}
      <div
        className="panel panel-0"
        style={{
          marginBottom: 14,
          display: "flex",
          alignItems: "center",
          gap: 14,
          flexWrap: "wrap",
        }}
      >
        <div style={{ flex: 1 }}>
          <p className="section-label" style={{ marginBottom: 6 }}>
            {i18n.pushNotif}
          </p>
          <div
            style={{
              display: "flex",
              gap: 8,
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <span
              className={`badge ${pushN.perm === "granted" ? "badge-success" : pushN.perm === "denied" ? "badge-danger" : "badge-warning"}`}
            >
              {pushN.perm === "granted"
                ? `✓ ${i18n.pushGranted}`
                : pushN.perm === "denied"
                  ? `✕ ${i18n.pushDenied}`
                  : "◎ Default"}
            </span>
            {pushN.perm !== "granted" && (
              <button
                className="btn-primary"
                onClick={() => {
                  pushN.request();
                  addToast(i18n.pushNotif, "info");
                }}
              >
                {i18n.requestPush}
              </button>
            )}
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <p className="section-label">Tỉ lệ lỗi hiện tại</p>
          <div
            style={{
              fontSize: 24,
              fontWeight: 900,
              color:
                parseFloat(errRate) > 5 ? "var(--danger)" : "var(--success)",
              fontFamily: "'Raleway',sans-serif",
            }}
          >
            {errRate}%
          </div>
        </div>
      </div>

      {/* Alert rules */}
      <div className="panel panel-0">
        <p className="section-label" style={{ marginBottom: 14 }}>
          {i18n.alertRules}
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {alertRules.map((rule) => {
            const typeInfo = TYPES.find((x) => x.v === rule.type);
            return (
              <motion.div
                key={rule.id}
                className="alert-rule-card"
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                style={{
                  borderColor: rule.enabled
                    ? typeInfo?.color + "55"
                    : "var(--card-border)",
                }}
              >
                <span style={{ fontSize: 22, flexShrink: 0 }}>
                  {typeInfo?.icon}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{ fontSize: 13, fontWeight: 800, marginBottom: 2 }}
                  >
                    {typeInfo?.l}
                  </div>
                  <div style={{ fontSize: 10.5, color: "var(--muted)" }}>
                    {i18n.threshold}: {rule.threshold} · {i18n.triggered}:{" "}
                    {rule.triggered} {i18n.times}
                  </div>
                </div>
                <div
                  style={{
                    display: "flex",
                    gap: 8,
                    alignItems: "center",
                    flexShrink: 0,
                  }}
                >
                  <button
                    className="btn-ghost"
                    style={{ padding: "4px 11px", fontSize: 11 }}
                    onClick={() => test(rule)}
                  >
                    🔔 {i18n.testAlert}
                  </button>
                  <Toggle on={rule.enabled} set={() => toggle(rule.id)} />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {alertRules.some((r) => r.triggered > 0) && (
        <div className="panel">
          <p className="section-label" style={{ marginBottom: 12 }}>
            {i18n.triggered} History
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
            {alertRules
              .filter((r) => r.triggered > 0)
              .map((r) => {
                const typeInfo = TYPES.find((x) => x.v === r.type);
                return (
                  <div
                    key={r.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "9px 13px",
                      background: "var(--surface)",
                      borderRadius: 9,
                      borderLeft: `3px solid ${typeInfo?.color}`,
                    }}
                  >
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 9 }}
                    >
                      <span>{typeInfo?.icon}</span>
                      <span style={{ fontSize: 12.5, fontWeight: 700 }}>
                        {typeInfo?.l}
                      </span>
                    </div>
                    <span className="badge badge-warning">
                      {r.triggered} {i18n.times}
                    </span>
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
}
