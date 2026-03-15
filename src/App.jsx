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

const qrIcon = new L.DivIcon({
  className: "",
  html: `<div style="width:28px;height:28px;background:linear-gradient(135deg,#38bdf8,#6366f1);border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:2px solid white;box-shadow:0 4px 12px rgba(56,189,248,.6)"></div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 28],
  popupAnchor: [0, -32],
});
const shipperIcon = new L.DivIcon({
  className: "",
  html: `<div style="width:36px;height:36px;background:linear-gradient(135deg,#34d399,#059669);border-radius:50%;border:3px solid white;box-shadow:0 0 0 4px rgba(52,211,153,.35),0 4px 16px rgba(52,211,153,.5);display:flex;align-items:center;justify-content:center;font-size:16px">📦</div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 18],
  popupAnchor: [0, -22],
});

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
    realtime: "Thời gian thực",
    liveScreen: "Màn hình quét trực tiếp",
    connStatus: "Trạng thái kết nối",
    recentScans: "Quét gần đây",
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
    transport: "Vận chuyển",
    tracking: "Theo dõi giao hàng",
    currentPos: "Toạ độ hiện tại",
    shipperStatus: "Trạng thái shipper",
    journeyStats: "Thống kê hành trình",
    lat: "VĨ ĐỘ",
    lng: "KINH ĐỘ",
    liveTracking: "Đang theo dõi trực tiếp",
    scanPoints: "Điểm QR",
    distance: "Khoảng cách",
    startGPS: "Bắt đầu GPS",
    stopGPS: "Dừng GPS",
    accuracy: "Độ chính xác",
    browserGPS: "Browser GPS",
    scanHistory: "Lịch sử điểm quét",
    analysisTab: "Phân tích",
    leaderboard_sub: "Xếp hạng hiệu suất nhân viên",
    fullRank: "Bảng xếp hạng đầy đủ",
    days: "ngày liên tiếp",
    points: "điểm",
    analytics_title: "Analytics nâng cao",
    errorTrend: "Xu hướng tỉ lệ lỗi theo giờ",
    overallPerf: "Hiệu suất tổng thể",
    successRate: "Tỉ lệ thành công",
    hourlyStats: "Thống kê theo giờ",
    exportPDF: "Xuất PDF",
    generating: "Đang tạo...",
    reportGenerated: "Đã tạo báo cáo!",
    logTab: "Nhật ký",
    scanLog: "Lịch sử quét",
    records: "bản ghi",
    searchQR: "Tìm kiếm mã QR...",
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
    framework: "Framework",
    mapLib: "Bản đồ",
    lang: "Ngôn ngữ",
    internalChat: "Chat nội bộ",
    teamChat: "Nhắn tin nhóm",
    you: "Bạn",
    msgPlaceholder: "Nhập tin nhắn... (Enter để gửi)",
    send: "Gửi",
    enterName: "Nhập tên của bạn để vào chat",
    nameHint: "Tên sẽ hiển thị với mọi người",
    nameExample: "VD: Nguyễn Văn A",
    joinChat: "Vào chat →",
    hr: "HR",
    staffMgmt: "Quản lý nhân viên",
    addStaff: "Thêm nhân viên",
    staffName: "Họ tên",
    staffRole: "Vai trò",
    staffEmail: "Email",
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
    alertsPage: "Cảnh báo tự động",
    alertRules: "Quy tắc cảnh báo",
    alertHighError: "Tỉ lệ lỗi cao",
    alertNoScan: "Không có hoạt động quét",
    alertOffline: "Thiết bị offline",
    threshold: "Ngưỡng",
    triggered: "Đã kích hoạt",
    times: "lần",
    pushNotif: "Thông báo đẩy",
    pushGranted: "Đã cấp quyền",
    pushDenied: "Bị từ chối",
    requestPush: "Yêu cầu quyền",
    testAlert: "Test",
    noPermission: "Bạn không có quyền truy cập trang này",
    contactAdmin: "Vui lòng liên hệ quản trị viên",
    hrSection: "Nhân sự",
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
    totalScans: "Total Scans",
    success: "Success",
    failed: "Failed",
    errorRate: "Error Rate",
    overview: "Overview",
    dashboard_title: "Dashboard",
    dashboard_sub: "Real-time QR scan monitoring",
    realtime: "Real-time",
    liveScreen: "Live Scan Screen",
    connStatus: "Connection Status",
    recentScans: "Recent Scans",
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
    transport: "Transport",
    tracking: "Delivery Tracking",
    currentPos: "Current Position",
    shipperStatus: "Shipper Status",
    journeyStats: "Journey Stats",
    lat: "LATITUDE",
    lng: "LONGITUDE",
    liveTracking: "Live Tracking",
    scanPoints: "QR Points",
    distance: "Distance",
    startGPS: "Start GPS",
    stopGPS: "Stop GPS",
    accuracy: "Accuracy",
    browserGPS: "Browser GPS",
    scanHistory: "Scan Point History",
    analysisTab: "Analysis",
    leaderboard_sub: "Real-time employee performance ranking",
    fullRank: "Full Ranking",
    days: "day streak",
    points: "pts",
    analytics_title: "Advanced Analytics",
    errorTrend: "Hourly Error Rate Trend",
    overallPerf: "Overall Performance",
    successRate: "Success Rate",
    hourlyStats: "Hourly Statistics",
    exportPDF: "Export PDF",
    generating: "Generating...",
    reportGenerated: "Report generated!",
    logTab: "Log",
    scanLog: "Scan History",
    records: "records",
    searchQR: "Search QR code...",
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
    framework: "Framework",
    mapLib: "Map",
    lang: "Language",
    internalChat: "Internal Chat",
    teamChat: "Team Messaging",
    you: "You",
    msgPlaceholder: "Type a message... (Enter to send)",
    send: "Send",
    enterName: "Enter your name to join chat",
    nameHint: "Name will be visible to everyone",
    nameExample: "e.g. John Doe",
    joinChat: "Join Chat →",
    hr: "HR",
    staffMgmt: "Staff Management",
    addStaff: "Add Staff",
    staffName: "Full Name",
    staffRole: "Role",
    staffEmail: "Email",
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
    noPermission: "You don't have permission to access this page",
    contactAdmin: "Please contact an administrator",
    hrSection: "Human Resources",
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
    totalScans: "总扫描",
    success: "成功",
    failed: "失败",
    errorRate: "错误率",
    overview: "概览",
    dashboard_title: "仪表盘",
    dashboard_sub: "二维码扫描实时监控",
    realtime: "实时",
    liveScreen: "实时扫描屏幕",
    connStatus: "连接状态",
    recentScans: "最近扫描",
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
    transport: "运输",
    tracking: "配送跟踪",
    currentPos: "当前位置",
    shipperStatus: "快递员状态",
    journeyStats: "行程统计",
    lat: "纬度",
    lng: "经度",
    liveTracking: "实时跟踪",
    scanPoints: "扫描点",
    distance: "距离",
    startGPS: "开始GPS",
    stopGPS: "停止GPS",
    accuracy: "精度",
    browserGPS: "浏览器GPS",
    scanHistory: "扫描点历史",
    analysisTab: "分析",
    leaderboard_sub: "员工实时绩效排名",
    fullRank: "完整排名",
    days: "天连续",
    points: "分",
    analytics_title: "高级分析",
    errorTrend: "每小时错误率趋势",
    overallPerf: "整体绩效",
    successRate: "成功率",
    hourlyStats: "每小时统计",
    exportPDF: "导出PDF",
    generating: "生成中...",
    reportGenerated: "报告已生成！",
    logTab: "日志",
    scanLog: "扫描历史",
    records: "条记录",
    searchQR: "搜索QR码...",
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
    framework: "框架",
    mapLib: "地图",
    lang: "语言",
    internalChat: "内部聊天",
    teamChat: "团队消息",
    you: "你",
    msgPlaceholder: "输入消息...（Enter发送）",
    send: "发送",
    enterName: "输入名字加入聊天",
    nameHint: "名字对所有人可见",
    nameExample: "例：张三",
    joinChat: "加入聊天 →",
    hr: "人力资源",
    staffMgmt: "员工管理",
    addStaff: "添加员工",
    staffName: "姓名",
    staffRole: "角色",
    staffEmail: "邮箱",
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
    noPermission: "您没有权限访问此页面",
    contactAdmin: "请联系管理员",
    hrSection: "人力资源",
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
    totalScans: "총 스캔",
    success: "성공",
    failed: "실패",
    errorRate: "오류율",
    overview: "개요",
    dashboard_title: "대시보드",
    dashboard_sub: "QR 스캔 실시간 모니터링",
    realtime: "실시간",
    liveScreen: "라이브 스캔 화면",
    connStatus: "연결 상태",
    recentScans: "최근 스캔",
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
    transport: "운송",
    tracking: "배달 추적",
    currentPos: "현재 위치",
    shipperStatus: "배달원 상태",
    journeyStats: "여정 통계",
    lat: "위도",
    lng: "경도",
    liveTracking: "실시간 추적",
    scanPoints: "QR 포인트",
    distance: "거리",
    startGPS: "GPS 시작",
    stopGPS: "GPS 중지",
    accuracy: "정확도",
    browserGPS: "브라우저 GPS",
    scanHistory: "스캔 포인트 기록",
    analysisTab: "분석",
    leaderboard_sub: "실시간 직원 성과 순위",
    fullRank: "전체 순위",
    days: "일 연속",
    points: "점",
    analytics_title: "고급 분석",
    errorTrend: "시간별 오류율 추세",
    overallPerf: "전체 성과",
    successRate: "성공률",
    hourlyStats: "시간별 통계",
    exportPDF: "PDF 내보내기",
    generating: "생성 중...",
    reportGenerated: "보고서 생성 완료!",
    logTab: "로그",
    scanLog: "스캔 기록",
    records: "건",
    searchQR: "QR 코드 검색...",
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
    framework: "프레임워크",
    mapLib: "지도",
    lang: "언어",
    internalChat: "내부 채팅",
    teamChat: "팀 메시지",
    you: "나",
    msgPlaceholder: "메시지 입력... (Enter로 전송)",
    send: "보내기",
    enterName: "채팅 참여를 위해 이름 입력",
    nameHint: "이름이 모든 사람에게 표시됩니다",
    nameExample: "예: 홍길동",
    joinChat: "채팅 참여 →",
    hr: "HR",
    staffMgmt: "직원 관리",
    addStaff: "직원 추가",
    staffName: "이름",
    staffRole: "역할",
    staffEmail: "이메일",
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
    noPermission: "이 페이지에 접근 권한이 없습니다",
    contactAdmin: "관리자에게 문의하세요",
    hrSection: "인사",
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
    totalScans: "総スキャン",
    success: "成功",
    failed: "失敗",
    errorRate: "エラー率",
    overview: "概要",
    dashboard_title: "ダッシュボード",
    dashboard_sub: "QRスキャンリアルタイム監視",
    realtime: "リアルタイム",
    liveScreen: "ライブスキャン画面",
    connStatus: "接続状態",
    recentScans: "最近のスキャン",
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
    transport: "輸送",
    tracking: "配達追跡",
    currentPos: "現在位置",
    shipperStatus: "配達員状態",
    journeyStats: "旅程統計",
    lat: "緯度",
    lng: "経度",
    liveTracking: "ライブ追跡",
    scanPoints: "スキャンポイント",
    distance: "距離",
    startGPS: "GPS開始",
    stopGPS: "GPS停止",
    accuracy: "精度",
    browserGPS: "ブラウザGPS",
    scanHistory: "スキャンポイント履歴",
    analysisTab: "分析",
    leaderboard_sub: "従業員リアルタイム実績ランキング",
    fullRank: "完全ランキング",
    days: "日連続",
    points: "ポイント",
    analytics_title: "高度な分析",
    errorTrend: "時間別エラー率傾向",
    overallPerf: "総合実績",
    successRate: "成功率",
    hourlyStats: "時間別統計",
    exportPDF: "PDFエクスポート",
    generating: "生成中...",
    reportGenerated: "レポート生成完了！",
    logTab: "ログ",
    scanLog: "スキャン履歴",
    records: "件",
    searchQR: "QRコード検索...",
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
    framework: "フレームワーク",
    mapLib: "地図",
    lang: "言語",
    internalChat: "社内チャット",
    teamChat: "チームメッセージ",
    you: "あなた",
    msgPlaceholder: "メッセージを入力...（Enterで送信）",
    send: "送信",
    enterName: "チャット参加のためお名前を入力",
    nameHint: "名前は全員に表示されます",
    nameExample: "例：田中太郎",
    joinChat: "チャットに参加 →",
    hr: "HR",
    staffMgmt: "スタッフ管理",
    addStaff: "スタッフ追加",
    staffName: "氏名",
    staffRole: "役割",
    staffEmail: "メール",
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
    noPermission: "このページへのアクセス権限がありません",
    contactAdmin: "管理者にお問い合わせください",
    hrSection: "人事",
  },
};

// ── Role permissions map ────────────────────────────────────
const ROLE_PERMS = {
  admin: {
    canScan: true,
    canExport: true,
    canManageOrders: true,
    canViewMap: true,
    canManageStaff: true,
  },
  supervisor: {
    canScan: true,
    canExport: true,
    canManageOrders: true,
    canViewMap: true,
    canManageStaff: false,
  },
  scanner: {
    canScan: true,
    canExport: false,
    canManageOrders: false,
    canViewMap: true,
    canManageStaff: false,
  },
};

// Admin username — only this account has full admin rights

// ── Pages each role can access ──────────────────────────────
const PAGE_ACCESS = {
  dashboard: ["admin", "supervisor", "scanner"],
  live: ["admin", "supervisor", "scanner"],
  orders: ["admin", "supervisor"],
  map: ["admin", "supervisor", "scanner"],
  scan: ["admin", "supervisor", "scanner"],
  leaderboard: ["admin", "supervisor"],
  analytics: ["admin", "supervisor"],
  history: ["admin", "supervisor", "scanner"],
  chat: ["admin", "supervisor", "scanner"],
  staff: ["admin"],
  alerts: ["admin", "supervisor"],
  settings: ["admin", "supervisor", "scanner"],
};

// ── GlobalStyle ─────────────────────────────────────────────
const GlobalStyle = ({ dark }) => {
  const t = dark ? THEMES.dark : THEMES.light;
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&family=Raleway:wght@700;800;900&family=JetBrains+Mono:wght@400;500;700&display=swap');
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
      .badge-purple{background:rgba(167,139,250,.12);color:#a78bfa;border:1px solid rgba(167,139,250,.28)}
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
      .btn-success{padding:9px 18px;background:transparent;border:1px solid var(--success);border-radius:9px;
        color:var(--success);font-weight:800;font-family:'Nunito',sans-serif;font-size:12.5px;cursor:pointer;
        transition:background .2s}
      .btn-success:hover{background:rgba(52,211,153,.1)}
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
      @keyframes scan-flash{0%{box-shadow:0 0 0 0 rgba(52,211,153,.8)}100%{box-shadow:0 0 0 28px rgba(52,211,153,0)}}
      .scan-flash{animation:scan-flash .65s ease-out}
      @keyframes slide-in{from{transform:translateX(8px);opacity:0}to{transform:none;opacity:1}}
      .row-new{animation:slide-in .3s ease-out}
      @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
      .fade-up{animation:fadeUp .35s ease-out both}
      .progress-bar-bg{background:var(--surface);border-radius:6px;height:6px;overflow:hidden}
      .progress-bar{height:100%;border-radius:6px;transition:width .6s ease}
      .kpi-trend{display:inline-flex;align-items:center;gap:3px;font-size:11px;font-weight:700;margin-top:3px}
      .kpi-trend.up{color:var(--success)}.kpi-trend.down{color:var(--danger)}.kpi-trend.flat{color:var(--muted)}
      .insight-card{border-radius:14px;padding:13px 15px;border:1px solid;transition:transform .18s}
      .insight-card:hover{transform:translateY(-2px)}
      .tbl-scroll{overflow-x:auto;-webkit-overflow-scrolling:touch}
      .tbl-scroll table{min-width:460px}
      /* Staff */
      .staff-card{background:var(--surface);border:1px solid var(--card-border);border-radius:12px;
        padding:13px;cursor:pointer;transition:border-color .2s}
      .staff-card:hover,.staff-card.active{border-color:var(--accent)}
      /* Toggle */
      .toggle-wrap{width:42px;height:23px;border-radius:12px;cursor:pointer;position:relative;
        transition:background .2s;flex-shrink:0}
      .toggle-knob{width:17px;height:17px;border-radius:50%;background:#fff;position:absolute;
        top:3px;transition:left .2s}
      /* lang btn */
      .lang-btn{padding:7px 12px;background:transparent;border:1px solid var(--card-border);border-radius:9px;
        cursor:pointer;font-size:13px;font-family:'Nunito',sans-serif;color:var(--muted);
        transition:all .2s;display:flex;align-items:center;gap:7px;width:100%;font-weight:700}
      .lang-btn:hover,.lang-btn.active{border-color:var(--accent);color:var(--accent);background:var(--menu-active)}
      /* Alert */
      .alert-rule-card{background:var(--surface);border:1px solid var(--card-border);border-radius:11px;
        padding:13px 16px;display:flex;align-items:center;gap:12px;transition:border-color .2s}
      /* Chat */
      .bubble-me{background:var(--accent);color:${dark ? "#070d1a" : "#fff"};border-radius:14px 14px 3px 14px}
      .bubble-other{background:var(--surface);color:var(--text);border:1px solid var(--card-border);border-radius:14px 14px 14px 3px}
      .chat-textarea{flex:1;padding:10px 13px;background:var(--surface);border:1px solid var(--card-border);
        border-radius:10px;color:var(--text);font-size:13px;font-family:'Nunito',sans-serif;outline:none;resize:none}
      .chat-textarea:focus{border-color:var(--accent)}
      /* Leaflet */
      .leaflet-popup-content-wrapper{background:rgba(7,13,26,.96)!important;color:#e2e8f0!important;
        border:1px solid rgba(56,189,248,.3)!important;border-radius:12px!important;
        backdrop-filter:blur(12px);font-family:'Nunito',sans-serif!important}
      .leaflet-popup-tip{background:rgba(7,13,26,.96)!important}

      /* ── LAYOUT ── */
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

      /* Grid helpers */
      .g4{display:grid;grid-template-columns:repeat(4,1fr);gap:12px}
      .g3{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}
      .g2{display:grid;grid-template-columns:1fr 1fr;gap:14px}
      .g2r{display:grid;grid-template-columns:1fr 300px;gap:14px}

      /* ── TABLET ≤1024px ── */
      @media(max-width:1024px){
        .g4{grid-template-columns:repeat(2,1fr)!important}
        .g2r{grid-template-columns:1fr!important}
        .main-content{padding:24px 20px}
      }
      /* ── MOBILE ≤680px ── */
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
        .hide-mobile{display:none!important}
        .leaflet-container{height:280px!important}
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
function MapAutoCenter({ position }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(position, map.getZoom(), { duration: 1.2 });
  }, [position]);
  return null;
}
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

// ── GPS Hook ─────────────────────────────────────────────────
function useGPS(setPos, setHistory, addToast) {
  const wid = useRef(null);
  const [active, setActive] = useState(false);
  const [gpsErr, setGpsErr] = useState(null);
  const [accuracy, setAccuracy] = useState(null);
  const [gpsSource, setGpsSource] = useState(null);

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
        if (acc <= 20) setGpsSource("gps");
        else if (acc <= 500) setGpsSource("wifi");
        else setGpsSource("ip");
        if (acc > 2000) {
          setAccuracy(acc?.toFixed(0));
          return;
        }
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
        setAccuracy(acc?.toFixed(0));
        // FIX 1: emit đúng event để server broadcast cho shipper
        socket.emit("gps_update", {
          lat,
          lng,
          accuracy: acc,
          timestamp: Date.now(),
        });
      },
      (e) => {
        setGpsErr(e.message);
        setActive(false);
        addToast("GPS: " + e.message, "danger");
      },
      { enableHighAccuracy: true, maximumAge: 0, timeout: 15000 },
    );
  }, []);

  const stop = useCallback(() => {
    if (wid.current !== null) {
      navigator.geolocation.clearWatch(wid.current);
      wid.current = null;
    }
    setActive(false);
    setAccuracy(null);
    setGpsSource(null);
  }, []);

  useEffect(
    () => () => {
      if (wid.current !== null) navigator.geolocation.clearWatch(wid.current);
    },
    [],
  );
  return { active, gpsErr, accuracy, gpsSource, start, stop };
}

// ── Push Hook ────────────────────────────────────────────────
function usePush() {
  const [perm, setPerm] = useState(
    typeof Notification !== "undefined" ? Notification.permission : "default",
  );
  const request = async () => {
    if (typeof Notification !== "undefined")
      setPerm(await Notification.requestPermission());
  };
  const push = (title, body) => {
    if (perm === "granted") new Notification(title, { body });
  };
  return { perm, request, push };
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
  const [currentUser, setCurrentUser] = useState(null); // { username, role }
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

  // GPS / map
  const [shipperPos, setShipperPos] = useState([21.0285, 105.8542]);
  const [locationHistory, setLocationHistory] = useState([[21.0285, 105.8542]]);
  const [scanPoints, setScanPoints] = useState([]);
  const [allShippers, setAllShippers] = useState({}); // { id: {id,name,lat,lng,time} }

  // Charts
  const [hourlyData, setHourlyData] = useState(() =>
    Array.from({ length: 12 }, (_, i) => ({
      h: `${(new Date().getHours() - 11 + i + 24) % 24}h`,
      ok: 0,
      fail: 0,
    })),
  );
  const [failCount, setFailCount] = useState(0);
  const [errorRate, setErrorRate] = useState("0.0");

  // Staff — starts empty
  const [staff, setStaff] = useState([]);
  const [alertRules, setAlertRules] = useState([
    { id: 1, type: "highError", threshold: 10, enabled: true, triggered: 0 },
    { id: 2, type: "noScan", threshold: 30, enabled: true, triggered: 0 },
    { id: 3, type: "offline", threshold: 5, enabled: false, triggered: 0 },
  ]);

  const i18n = I18N[langCode] || I18N.vi;
  const isAdmin = currentUser?.role === "admin";

  const addToast = (msg, type = "info") => {
    const id = Date.now();
    setToasts((p) => [...p, { id, msg, type }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 4000);
  };
  const addNotif = (msg, type = "info") =>
    setNotifs((p) => [{ msg, type, time: timeNow() }, ...p].slice(0, 30));

  const gps = useGPS(setShipperPos, setLocationHistory, addToast);
  const pushN = usePush();

  // FIX 1 — listen for gps_update too
  useEffect(() => {
    socket.on("new_scan", (data) => {
      setHistory((p) => [{ ...data, ts: Date.now() }, ...p]);
      setLastScan(data);
      setScannedList((p) => (p.includes(data.code) ? p : [...p, data.code]));
      addToast(`✓ ${data.code}`, "success");
      addNotif(`Quét thành công: ${data.code}`, "success");
      pushN.push("✓ Scan OK", data.code);
      setHourlyData((p) => {
        const c = [...p];
        c[c.length - 1] = { ...c[c.length - 1], ok: c[c.length - 1].ok + 1 };
        return c;
      });
      if (data.lat && data.lng) {
        const lat = Number(data.lat),
          lng = Number(data.lng);
        if (!isNaN(lat) && !isNaN(lng)) {
          setShipperPos([lat, lng]);
          setLocationHistory((p) => [...p, [lat, lng]]);
          setScanPoints((p) => [
            ...p,
            { code: data.code, time: data.time, lat, lng },
          ]);
        }
      }
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

    // FIX 1 — listen gps_update from other devices
    socket.on("gps_update", (data) => {
      if (!data?.lat || !data?.lng) return;
      const lat = Number(data.lat),
        lng = Number(data.lng);
      if (isNaN(lat) || isNaN(lng)) return;
      setShipperPos([lat, lng]);
      setLocationHistory((p) => {
        const l = p[p.length - 1];
        if (l && l[0] === lat && l[1] === lng) return p;
        return [...p, [lat, lng]];
      });
    });

    socket.on("shipper_location", (data) => {
      if (!data?.lat || !data?.lng) return;
      const lat = Number(data.lat),
        lng = Number(data.lng);
      if (isNaN(lat) || isNaN(lng)) return;
      setShipperPos([lat, lng]);
      setLocationHistory((p) => {
        const l = p[p.length - 1];
        if (l && l[0] === lat && l[1] === lng) return p;
        return [...p, [lat, lng]];
      });
    });

    // Nhận danh sách tất cả shippers đang online
    socket.on("all_shippers", (list) => {
      const map = {};
      list.forEach((s) => {
        map[s.id] = s;
      });
      setAllShippers(map);
    });

    return () => {
      socket.off("new_scan");
      socket.off("scan_error");
      socket.off("gps_update");
      socket.off("shipper_location");
      socket.off("all_shippers");
    };
  }, []);

  useEffect(() => {
    const tot = history.length;
    setErrorRate(tot > 0 ? ((failCount / tot) * 100).toFixed(1) : "0.0");
  }, [history.length, failCount]);

  // Tài khoản mặc định — có thể mở rộng thêm user vào đây
  const ACCOUNTS = {
    admin: { password: "123", role: "admin" },
    supervisor: { password: "123", role: "supervisor" },
    // Mọi username khác đăng nhập được với pass bất kỳ → scanner
  };

  // FIX 2 — Login handler: xác định role đúng từ username + password
  const handleLogin = (username, password) => {
    const uname = (username || "").trim().toLowerCase();
    const acc = ACCOUNTS[uname];
    let role = "scanner";
    if (acc && acc.password === password) {
      role = acc.role;
    }
    // Nếu username là "admin" dù pass sai thì vẫn cho vào nhưng là scanner
    setCurrentUser({ username: uname, role });
    setLoggedIn(true);
  };

  if (!loggedIn) return <Login onLogin={handleLogin} />;

  const okCount = history.length - failCount;
  const notifCount = notifs.filter((n) => n.type !== "info").length;

  // FIX 7 — Check if current user can access page
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
      shipperPos,
      locationHistory,
      scanPoints,
      gps,
      allShippers,
      staff,
      setStaff,
      alertRules,
      setAlertRules,
      pushN,
      currentUser,
      isAdmin,
      langCode,
      setLangCode,
      logout: () => setLoggedIn(false),
      setDark,
    };
    switch (page) {
      case "dashboard":
        return <Dashboard {...props} />;
      case "live":
        return <LiveScan {...props} />;
      case "orders":
        return <Orders {...props} />;
      case "map":
        return <DeliveryMap {...props} />;
      case "scan":
        return <Scan />;
      case "leaderboard":
        return <Leaderboard {...props} />;
      case "analytics":
        return <Analytics {...props} />;
      case "history":
        return <History {...props} />;
      case "chat":
        return <ChatPage {...props} />;
      case "staff":
        return <StaffPage {...props} />;
      case "alerts":
        return <AlertsPage {...props} />;
      case "settings":
        return <Settings {...props} />;
      default:
        return <Dashboard {...props} />;
    }
  };

  return (
    <>
      <GlobalStyle dark={dark} />

      {/* Fixed BG */}
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
        {/* Desktop sidebar */}
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
          {/* FIX 4 — Mobile header sticks at top, content below */}
          <div className="mobile-header">
            {/* FIX 3 — Drawer opens LEFT (hamburger on left) */}
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
            {/* FIX 5 — notifications moved right, not overlapping */}
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

      {/* FIX 3 — Mobile drawer opens from LEFT ─── */}
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
            {/* FIX 3 — Drawer on LEFT, overlay on RIGHT */}
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
            {/* Tap overlay to close */}
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

      {/* FIX 5 — Toasts: bottom right, proper spacing */}
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

// ── Sidebar Nav ──────────────────────────────────────────────
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
  // FIX 7 — labels from i18n, always up-to-date
  const NAV = [
    {
      id: "dashboard",
      icon: "⬡",
      label: i18n.dashboard,
      section: i18n.overview,
    },
    { id: "live", icon: "◉", label: i18n.liveScan },
    { id: "orders", icon: "▣", label: i18n.orders },
    { id: "map", icon: "◎", label: i18n.gpsMap },
    { id: "scan", icon: "◈", label: i18n.scanGPS },
    {
      id: "leaderboard",
      icon: "⊛",
      label: i18n.leaderboard,
      section: i18n.analysisTab,
    },
    { id: "analytics", icon: "▦", label: i18n.analytics },
    { id: "history", icon: "▤", label: i18n.history },
    { id: "chat", icon: "💬", label: i18n.chat },
    { id: "staff", icon: "👥", label: i18n.staff, section: i18n.hrSection },
    { id: "alerts", icon: "🔔", label: i18n.alerts },
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
      {/* Logo + close button on mobile */}
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

      {/* Nav items */}
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
// PAGES
// ══════════════════════════════════════════════════════════════

// ── Dashboard ────────────────────────────────────────────────
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

// ── Live Scan ────────────────────────────────────────────────
function LiveScan({ lastScan, history, i18n }) {
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
      <div style={{ marginBottom: 24 }}>
        <p className="section-label">{i18n.realtime}</p>
        <h1 className="page-title">{i18n.liveScreen}</h1>
      </div>
      <div className="g2">
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
                  fontSize: 24,
                  fontWeight: 700,
                  color: "var(--accent)",
                  fontFamily: "'JetBrains Mono',monospace",
                  letterSpacing: ".05em",
                  padding: "16px 24px",
                  background: "var(--surface)",
                  borderRadius: 13,
                  border: "1px solid var(--card-border)",
                  marginBottom: 12,
                }}
              >
                {lastScan.code}
              </div>
              <span
                className="badge badge-success"
                style={{ marginBottom: 10 }}
              >
                ◉ {i18n.success}
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
                    marginTop: 5,
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
              <div style={{ fontSize: 44, marginBottom: 10, opacity: 0.14 }}>
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
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div className="panel panel-0">
            <p className="section-label" style={{ marginBottom: 11 }}>
              {i18n.connStatus}
            </p>
            {[
              ["WebSocket Server", "Đã kết nối", true],
              ["Thiết bị quét", "Sẵn sàng", true],
              ["Đồng bộ CSDL", "Hoạt động", true],
              ["GPS Module", "Theo dõi", true],
            ].map(([l, s, ok]) => (
              <div
                key={l}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "8px 12px",
                  background: "var(--surface)",
                  borderRadius: 9,
                  marginBottom: 6,
                }}
              >
                <span style={{ fontSize: 12, fontWeight: 700 }}>{l}</span>
                <span
                  className={`badge ${ok ? "badge-success" : "badge-danger"}`}
                >
                  {ok ? "◉" : "◎"} {s}
                </span>
              </div>
            ))}
          </div>
          <div className="panel panel-0" style={{ flex: 1 }}>
            <p className="section-label" style={{ marginBottom: 11 }}>
              {i18n.recentScans}
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              {recent.length === 0 && (
                <p
                  style={{
                    color: "var(--muted)",
                    fontSize: 13,
                    textAlign: "center",
                    padding: "10px 0",
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
                    gap: 9,
                    padding: "6px 9px",
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
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {s.code}
                  </span>
                  <span
                    className={`badge ${s.error ? "badge-danger" : "badge-success"}`}
                    style={{ fontSize: 9 }}
                  >
                    {s.error ? "✕" : "✓"}
                  </span>
                  <span
                    style={{
                      fontSize: 10,
                      color: "var(--muted)",
                      flexShrink: 0,
                    }}
                  >
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

// ── Orders ───────────────────────────────────────────────────
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

// ── Delivery Map ─────────────────────────────────────────────
function DeliveryMap({
  shipperPos,
  locationHistory,
  scanPoints,
  gps,
  i18n,
  allShippers,
}) {
  const totalDist =
    locationHistory.length < 2
      ? 0
      : locationHistory.reduce((acc, cur, i) => {
          if (i === 0) return 0;
          const prev = locationHistory[i - 1],
            R = 6371000;
          const dLat = ((cur[0] - prev[0]) * Math.PI) / 180,
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
      <div style={{ marginBottom: 22 }}>
        <p className="section-label">{i18n.transport}</p>
        <h1 className="page-title">{i18n.tracking}</h1>
      </div>

      {/* GPS Controls */}
      <div
        className="panel panel-0"
        style={{
          marginBottom: 12,
          display: "flex",
          alignItems: "center",
          gap: 14,
          flexWrap: "wrap",
        }}
      >
        <div style={{ flex: 1, minWidth: 200 }}>
          <p className="section-label" style={{ marginBottom: 6 }}>
            {i18n.browserGPS}
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
            {gps.gpsSource === "gps" && (
              <span className="badge badge-success">
                📡 GPS chip — chính xác
              </span>
            )}
            {gps.gpsSource === "wifi" && (
              <span className="badge badge-warning">📶 WiFi — tương đối</span>
            )}
            {gps.gpsSource === "ip" && (
              <span className="badge badge-danger">
                🌐 IP — không chính xác
              </span>
            )}
          </div>
          {gps.gpsSource === "ip" && (
            <div
              style={{
                fontSize: 11,
                color: "var(--warning)",
                background: "rgba(251,191,36,.07)",
                border: "1px solid rgba(251,191,36,.2)",
                borderRadius: 9,
                padding: "7px 11px",
                marginTop: 8,
              }}
            >
              💡 Để chính xác: dùng <b>điện thoại</b>, bật GPS, mở bằng{" "}
              <b>HTTPS</b>, ra <b>ngoài trời</b>
            </div>
          )}
        </div>
        {gps.accuracy && (
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                fontSize: 9,
                color: "var(--muted)",
                fontWeight: 700,
                textTransform: "uppercase",
                marginBottom: 2,
              }}
            >
              {i18n.accuracy}
            </div>
            <div
              style={{
                fontSize: 18,
                fontWeight: 900,
                fontFamily: "'JetBrains Mono',monospace",
                color:
                  Number(gps.accuracy) <= 20
                    ? "var(--success)"
                    : Number(gps.accuracy) <= 500
                      ? "var(--warning)"
                      : "var(--danger)",
              }}
            >
              ±
              {Number(gps.accuracy) >= 1000
                ? (Number(gps.accuracy) / 1000).toFixed(1) + "km"
                : gps.accuracy + "m"}
            </div>
          </div>
        )}
      </div>

      <div className="g3" style={{ marginBottom: 14 }}>
        <StatCard
          title={i18n.lat}
          value={shipperPos[0].toFixed(5)}
          sub={`${i18n.lng}: ${shipperPos[1].toFixed(5)}`}
          color="var(--accent)"
          icon="📍"
          delay={0}
        />
        <StatCard
          title={i18n.shipperStatus}
          value={gps.active ? "Live GPS" : "Trực tiếp"}
          sub={i18n.liveTracking}
          color="var(--success)"
          icon="◉"
          delay={0.05}
        />
        <StatCard
          title={i18n.distance}
          value={
            totalDist < 1000
              ? `${totalDist.toFixed(0)}m`
              : `${(totalDist / 1000).toFixed(2)}km`
          }
          sub={`${scanPoints.length} ${i18n.scanPoints}`}
          color="var(--warning)"
          icon="⊛"
          delay={0.1}
        />
      </div>

      <div
        style={{
          borderRadius: 16,
          overflow: "hidden",
          border: "1px solid var(--card-border)",
          boxShadow: "0 8px 32px rgba(0,0,0,.3)",
        }}
      >
        <MapContainer
          center={shipperPos}
          zoom={14}
          style={{ height: 420, width: "100%" }}
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
              <div style={{ fontFamily: "'Nunito',sans-serif", minWidth: 155 }}>
                <div
                  style={{ fontWeight: 800, marginBottom: 4, color: "#34d399" }}
                >
                  📦 Vị trí Shipper
                </div>
                <div style={{ fontSize: 11, color: "#94a3b8" }}>
                  Lat: {shipperPos[0].toFixed(6)}
                </div>
                <div style={{ fontSize: 11, color: "#94a3b8" }}>
                  Lng: {shipperPos[1].toFixed(6)}
                </div>
                {gps.accuracy && (
                  <div style={{ fontSize: 11, color: "#38bdf8", marginTop: 2 }}>
                    ±{gps.accuracy}m
                  </div>
                )}
              </div>
            </Popup>
          </Marker>
          {/* Markers cho tất cả shippers đang online */}
          {Object.values(allShippers || {}).map(
            (s) =>
              s.lat &&
              s.lng &&
              !(
                Math.abs(s.lat - shipperPos[0]) < 0.0001 &&
                Math.abs(s.lng - shipperPos[1]) < 0.0001
              ) && (
                <Marker key={s.id} position={[s.lat, s.lng]} icon={shipperIcon}>
                  <Popup>
                    <div
                      style={{
                        fontFamily: "'Nunito',sans-serif",
                        minWidth: 150,
                      }}
                    >
                      <div
                        style={{
                          fontWeight: 800,
                          marginBottom: 4,
                          color: "#34d399",
                        }}
                      >
                        📦 {s.name}
                      </div>
                      <div style={{ fontSize: 11, color: "#94a3b8" }}>
                        Lat: {s.lat.toFixed(6)}
                      </div>
                      <div style={{ fontSize: 11, color: "#94a3b8" }}>
                        Lng: {s.lng.toFixed(6)}
                      </div>
                      <div
                        style={{ fontSize: 11, color: "#38bdf8", marginTop: 2 }}
                      >
                        🕐 {s.time}
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ),
          )}

          {scanPoints.map((sp, i) => (
            <Marker key={i} position={[sp.lat, sp.lng]} icon={qrIcon}>
              <Popup>
                <div style={{ fontFamily: "'Nunito',sans-serif" }}>
                  <div
                    style={{
                      fontWeight: 800,
                      marginBottom: 3,
                      color: "#38bdf8",
                    }}
                  >
                    ◈ #{i + 1}
                  </div>
                  <div
                    style={{
                      fontFamily: "'JetBrains Mono',monospace",
                      fontSize: 11,
                      color: "#7dd3fc",
                    }}
                  >
                    {sp.code}
                  </div>
                  {sp.time && (
                    <div style={{ fontSize: 10, color: "#64748b" }}>
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
          <p className="section-label" style={{ marginBottom: 11 }}>
            {i18n.scanHistory}
          </p>
          <div className="tbl-scroll">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>{i18n.qrCode}</th>
                  <th>{i18n.lat}</th>
                  <th>{i18n.lng}</th>
                  <th>Time</th>
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
                        fontSize: 11,
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
                    <td style={{ fontSize: 11, color: "var(--muted)" }}>
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

// ── Leaderboard ──────────────────────────────────────────────
function Leaderboard({ history, staff, i18n }) {
  // Build from real staff if available, else show empty
  const boards =
    staff.length > 0
      ? staff
          .map((s, i) => ({
            ...s,
            scans: Math.max(0, history.length - i * 3),
            ok: Math.max(0, history.length - i * 3 - i),
            points: Math.max(0, (history.length - i * 3) * 10),
            streak: s.streak || 0,
            badge: ["🥇", "🥈", "🥉"][i] || String(i + 1),
          }))
          .sort((a, b) => b.points - a.points)
      : [];
  const maxPts = Math.max(1, ...boards.map((b) => b.points));

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <p className="section-label">{i18n.analysisTab}</p>
        <h1 className="page-title">{i18n.leaderboard}</h1>
        <p style={{ color: "var(--muted)", fontSize: 13, fontWeight: 500 }}>
          {i18n.leaderboard_sub}
        </p>
      </div>
      {boards.length === 0 ? (
        <div
          className="panel"
          style={{ textAlign: "center", padding: "48px 0" }}
        >
          <div style={{ fontSize: 42, opacity: 0.12 }}>⊛</div>
          <p style={{ color: "var(--muted)", marginTop: 12, fontWeight: 600 }}>
            Thêm nhân viên trong trang {i18n.staff} để xem leaderboard
          </p>
        </div>
      ) : (
        <>
          <div className="g3" style={{ marginBottom: 16 }}>
            {[1, 0, 2].map((idx) => {
              const p = boards[idx];
              if (!p) return <div key={idx} />;
              return (
                <motion.div
                  key={p.id || p.name}
                  className="stat-card"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.06 }}
                  style={{
                    textAlign: "center",
                    borderColor:
                      idx === 0 ? "rgba(251,191,36,.35)" : "var(--card-border)",
                  }}
                >
                  <div style={{ fontSize: 26, marginBottom: 7 }}>{p.badge}</div>
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: "50%",
                      margin: "0 auto 9px",
                      background: "var(--menu-active)",
                      border: "2px solid var(--accent)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 18,
                      fontWeight: 900,
                      color: "var(--accent)",
                    }}
                  >
                    {p.avatar}
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 800 }}>{p.name}</div>
                  <div
                    style={{
                      fontSize: 11,
                      color: "var(--muted)",
                      marginTop: 3,
                    }}
                  >
                    {p.scans} scans
                  </div>
                  <div
                    style={{
                      fontSize: 20,
                      fontWeight: 900,
                      color: "var(--warning)",
                      marginTop: 5,
                      fontFamily: "'Raleway',sans-serif",
                    }}
                  >
                    {p.points}
                  </div>
                  <div style={{ fontSize: 10, color: "var(--muted)" }}>
                    {i18n.points}
                  </div>
                  {p.streak > 0 && (
                    <span
                      className="badge badge-success"
                      style={{ marginTop: 7, fontSize: 10 }}
                    >
                      🔥 {p.streak} {i18n.days}
                    </span>
                  )}
                </motion.div>
              );
            })}
          </div>
          <div className="panel">
            <p className="section-label" style={{ marginBottom: 12 }}>
              {i18n.fullRank}
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
              {boards.map((p, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 13,
                    padding: "11px 14px",
                    background: "var(--surface)",
                    borderRadius: 10,
                    border: `1px solid ${i === 0 ? "rgba(251,191,36,.25)" : "transparent"}`,
                  }}
                >
                  <span
                    style={{ fontSize: 17, width: 26, textAlign: "center" }}
                  >
                    {p.badge}
                  </span>
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: "50%",
                      background: "var(--menu-active)",
                      border: "2px solid var(--card-border)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 15,
                      fontWeight: 900,
                      color: "var(--accent)",
                    }}
                  >
                    {p.avatar}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 800 }}>
                      {p.name}
                    </div>
                    <div style={{ fontSize: 11, color: "var(--muted)" }}>
                      {p.ok}/{p.scans} OK
                    </div>
                    <div
                      className="progress-bar-bg"
                      style={{ marginTop: 4, height: 3 }}
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
                        fontSize: 19,
                        fontWeight: 900,
                        color: "var(--warning)",
                        fontFamily: "'Raleway',sans-serif",
                      }}
                    >
                      {p.points}
                    </div>
                    <div style={{ fontSize: 9.5, color: "var(--muted)" }}>
                      {i18n.points}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ── Analytics ────────────────────────────────────────────────
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
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>QR Report</title>
    <style>body{font-family:Arial;padding:28px;color:#0f172a}h1{color:#6366f1}
    .kpis{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin:16px 0}
    .kpi{background:#f1f5f9;border-radius:9px;padding:12px;text-align:center}
    .kpi .v{font-size:26px;font-weight:900;color:#6366f1}.kpi .l{font-size:10px;color:#94a3b8;font-weight:700;text-transform:uppercase}
    table{width:100%;border-collapse:collapse;margin-top:14px}th,td{padding:8px 11px;border:1px solid #e2e8f0;font-size:12px}
    th{background:#f1f5f9;font-weight:800}tr:nth-child(even){background:#f8fafc}
    .footer{margin-top:18px;font-size:10px;color:#94a3b8}</style></head>
    <body><h1>🏭 QR Scan Report — AI Factory</h1><p style="color:#94a3b8;font-size:12px">${now}</p>
    <div class="kpis">
      <div class="kpi"><div class="v">${history.length}</div><div class="l">${i18n.totalScans}</div></div>
      <div class="kpi"><div class="v" style="color:#10b981">${okCount}</div><div class="l">${i18n.success}</div></div>
      <div class="kpi"><div class="v" style="color:#ef4444">${failCount}</div><div class="l">${i18n.failed}</div></div>
      <div class="kpi"><div class="v" style="color:${parseFloat(errorRate) > 5 ? "#ef4444" : "#10b981"}">${errorRate}%</div><div class="l">${i18n.errorRate}</div></div>
    </div>
    <h3>${i18n.hourlyStats}</h3>
    <table><thead><tr><th>Giờ</th><th>${i18n.success}</th><th>${i18n.failed}</th><th>Tổng</th><th>${i18n.errorRate}</th></tr></thead>
    <tbody>${rows}</tbody></table>
    <div class="footer">AI Factory · ${now}</div></body></html>`;
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
          marginBottom: 24,
          flexWrap: "wrap",
          gap: 10,
        }}
      >
        <div>
          <p className="section-label">{i18n.analysisTab}</p>
          <h1 className="page-title">{i18n.analytics_title}</h1>
        </div>
        <button className="btn-primary" onClick={exportPDF} disabled={genPDF}>
          {genPDF ? `⏳ ${i18n.generating}` : `📄 ${i18n.exportPDF}`}
        </button>
      </div>
      <div className="g2" style={{ marginBottom: 12 }}>
        <div className="panel panel-0">
          <p className="section-label" style={{ marginBottom: 12 }}>
            {i18n.errorTrend}
          </p>
          <ResponsiveContainer width="100%" height={170}>
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
            {i18n.overallPerf}
          </p>
          <RadialBarChart
            width={190}
            height={150}
            innerRadius={48}
            outerRadius={76}
            data={[
              {
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
            <RadialBar dataKey="value" cornerRadius={7} />
          </RadialBarChart>
          <div style={{ textAlign: "center", marginTop: -8 }}>
            <div
              style={{
                fontSize: 26,
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
              style={{ fontSize: 11.5, color: "var(--muted)", fontWeight: 600 }}
            >
              {i18n.successRate}
            </div>
          </div>
        </div>
      </div>
      <div className="panel panel-0">
        <p className="section-label" style={{ marginBottom: 12 }}>
          {i18n.hourlyStats}
        </p>
        <div className="tbl-scroll">
          <table>
            <thead>
              <tr>
                <th>Giờ</th>
                <th>{i18n.success}</th>
                <th>{i18n.failed}</th>
                <th>Tổng</th>
                <th>{i18n.errorRate}</th>
              </tr>
            </thead>
            <tbody>
              {hourlyData.map((h, i) => {
                const tot = h.ok + h.fail;
                const rate =
                  tot > 0 ? ((h.fail / tot) * 100).toFixed(1) : "0.0";
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
                    <td style={{ fontWeight: 700 }}>{tot}</td>
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

// ── History ──────────────────────────────────────────────────
function History({ history, i18n }) {
  const [search, setSearch] = useState("");
  const filtered = history.filter(
    (h) =>
      !search || (h.code || "").toLowerCase().includes(search.toLowerCase()),
  );
  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <p className="section-label">{i18n.logTab}</p>
        <h1 className="page-title">{i18n.scanLog}</h1>
      </div>
      <div
        style={{
          display: "flex",
          gap: 10,
          marginBottom: 4,
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <input
          placeholder={i18n.searchQR}
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
            width: 230,
          }}
        />
        <span className="badge badge-info">
          {filtered.length} {i18n.records}
        </span>
      </div>
      <div className="panel">
        <div className="tbl-scroll">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>{i18n.qrCode}</th>
                <th>Time</th>
                <th>GPS</th>
                <th>{i18n.status}</th>
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
                      padding: "34px 0",
                      fontWeight: 600,
                    }}
                  >
                    Chưa có dữ liệu.
                  </td>
                </tr>
              ) : (
                filtered.map((h, i) => (
                  <motion.tr
                    key={i}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.009 }}
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
                        fontSize: 12,
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
                        ? `${Number(h.lat).toFixed(4)},${Number(h.lng).toFixed(4)}`
                        : "—"}
                    </td>
                    <td>
                      <span
                        className={`badge ${h.error ? "badge-danger" : "badge-success"}`}
                      >
                        {h.error ? "✕" : "✓ OK"}
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

// ── FIX 6 — Chat Page (socket working) ──────────────────────
function ChatPage({ i18n }) {
  const [msgs, setMsgs] = useState([
    {
      id: "sys-0",
      from: "sys",
      text: "👋 Chat nội bộ sẵn sàng!",
      time: timeNow(),
    },
  ]);
  const [input, setInput] = useState("");
  const [myName, setMyName] = useState("");
  const [nameSet, setNameSet] = useState(false);
  const [online, setOnline] = useState(1);
  const endRef = useRef(null);
  const nameRef = useRef("");

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs]);

  useEffect(() => {
    // FIX 6 — listen to correct socket events
    const onMsg = (data) => {
      setMsgs((p) => {
        if (p.find((m) => m.id === data.id)) return p; // dedup
        // Xác định from: nếu là tin mình gửi thì giữ "me", không thì "other"
        const from = data.name === nameRef.current ? "me" : "other";
        return [...p, { ...data, from }];
      });
    };
    const onOnline = (n) => setOnline(n);
    socket.on("chat_message", onMsg); // corrected event name
    socket.on("chat_online", onOnline);
    return () => {
      socket.off("chat_message", onMsg);
      socket.off("chat_online", onOnline);
    };
  }, []);

  const confirmName = () => {
    if (!myName.trim()) return;
    nameRef.current = myName.trim();
    setNameSet(true);
    socket.emit("chat_join", { name: nameRef.current });
    setMsgs((p) => [
      ...p,
      {
        id: "join-" + Date.now(),
        from: "sys",
        text: `✅ Tham gia: "${nameRef.current}"`,
        time: timeNow(),
      },
    ]);
  };

  const send = () => {
    if (!input.trim() || !nameSet) return;
    const msg = {
      id: Date.now() + "-" + Math.random().toString(36).slice(2),
      from: "me",
      name: nameRef.current,
      text: input.trim(),
      time: timeNow(),
    };
    // Hiện ngay trên UI của người gửi
    setMsgs((p) => [...p, msg]);
    // Gửi lên server → server broadcast cho người khác
    // Server dùng io.emit nên sẽ gửi lại cho mình, nhưng dedup sẽ bỏ qua
    socket.emit("chat_message", msg);
    setInput("");
  };

  if (!nameSet)
    return (
      <div>
        <div style={{ marginBottom: 24 }}>
          <p className="section-label">{i18n.system}</p>
          <h1 className="page-title">{i18n.internalChat}</h1>
        </div>
        <div
          className="panel panel-0"
          style={{
            maxWidth: 380,
            margin: "0 auto",
            textAlign: "center",
            padding: 32,
          }}
        >
          <div style={{ fontSize: 40, marginBottom: 12 }}>💬</div>
          <p style={{ fontWeight: 800, fontSize: 15, marginBottom: 5 }}>
            {i18n.enterName}
          </p>
          <p style={{ color: "var(--muted)", fontSize: 12, marginBottom: 18 }}>
            {i18n.nameHint}
          </p>
          <input
            value={myName}
            onChange={(e) => setMyName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && confirmName()}
            placeholder={i18n.nameExample}
            autoFocus
            style={{
              width: "100%",
              padding: "10px 13px",
              background: "var(--surface)",
              border: "1px solid var(--card-border)",
              borderRadius: 10,
              color: "var(--text)",
              fontSize: 14,
              fontFamily: "'Nunito',sans-serif",
              outline: "none",
              marginBottom: 10,
            }}
          />
          <button
            className="btn-primary"
            onClick={confirmName}
            style={{ width: "100%", padding: "11px" }}
          >
            {i18n.joinChat}
          </button>
        </div>
      </div>
    );

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 20,
          flexWrap: "wrap",
          gap: 8,
        }}
      >
        <div>
          <p className="section-label">{i18n.system}</p>
          <h1 className="page-title">{i18n.internalChat}</h1>
          <p style={{ color: "var(--muted)", fontSize: 13 }}>{i18n.teamChat}</p>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span className="badge badge-success">
            <span className="pulse-dot" style={{ width: 6, height: 6 }} />{" "}
            {nameRef.current}
          </span>
          <span className="badge badge-info">👥 {online} online</span>
        </div>
      </div>
      <div
        className="panel panel-0"
        style={{
          display: "flex",
          flexDirection: "column",
          height: "60vh",
          minHeight: 360,
        }}
      >
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: 9,
            padding: "4px 2px",
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
                    padding: "3px 11px",
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
                        fontSize: 10,
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
                      padding: "9px 14px",
                      maxWidth: "78%",
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
                      fontSize: 9,
                      color: "var(--muted)",
                      marginTop: 2,
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
            paddingTop: 10,
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

// ── FIX 2 — Staff Page (permission-aware) ──────────────────
function StaffPage({ staff, setStaff, i18n, addToast, currentUser }) {
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
    // FIX 2: new members always get role they chose, never admin unless username matches
    const safeRole = form.role === "admin" ? "supervisor" : form.role; // non-admin users can't create admins
    setStaff((p) => [
      ...p,
      {
        ...form,
        role: safeRole,
        id: Date.now(),
        avatar: form.name[0].toUpperCase(),
        color: COLORS[p.length % COLORS.length],
        scans: 0,
        streak: 0,
        perms: { ...ROLE_PERMS[safeRole] },
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
          marginBottom: 24,
          flexWrap: "wrap",
          gap: 10,
        }}
      >
        <div>
          <p className="section-label">{i18n.hr}</p>
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
            style={{ marginBottom: 12, overflow: "hidden" }}
          >
            <p className="section-label" style={{ marginBottom: 11 }}>
              {i18n.addStaff}
            </p>
            <div className="g2" style={{ gap: 9 }}>
              <input
                placeholder={i18n.staffName}
                value={form.name}
                onChange={(e) =>
                  setForm((p) => ({ ...p, name: e.target.value }))
                }
                style={{
                  padding: "8px 11px",
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
                  padding: "8px 11px",
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
              {/* FIX 2 — only admin can assign supervisor role, scanner is default */}
              <select
                value={form.role}
                onChange={(e) =>
                  setForm((p) => ({ ...p, role: e.target.value }))
                }
                style={{
                  padding: "8px 11px",
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
                {/* Only show admin option for existing admins */}
                {currentUser?.role === "admin" && (
                  <option value="admin" disabled>
                    {i18n.roleAdmin} (chỉ 1)
                  </option>
                )}
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

      <div className="g2">
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {staff.length === 0 && (
            <div
              className="panel panel-0"
              style={{ textAlign: "center", padding: "36px 0" }}
            >
              <div style={{ fontSize: 36, opacity: 0.12 }}>👥</div>
              <p
                style={{
                  color: "var(--muted)",
                  marginTop: 10,
                  fontWeight: 600,
                }}
              >
                Chưa có nhân viên
              </p>
            </div>
          )}
          {staff.map((s) => (
            <motion.div
              key={s.id}
              className={`staff-card ${selected?.id === s.id ? "active" : ""}`}
              initial={{ opacity: 0, x: -7 }}
              animate={{ opacity: 1, x: 0 }}
              onClick={() => setSelected(selected?.id === s.id ? null : s)}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    background: s.color + "22",
                    border: `2px solid ${s.color}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 16,
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
                        width: 9,
                        height: 9,
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
                      fontSize: 10,
                      color: "var(--muted)",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {s.email || "—"}
                  </div>
                </div>
                <div
                  style={{
                    display: "flex",
                    gap: 4,
                    alignItems: "center",
                    flexWrap: "wrap",
                  }}
                >
                  <span
                    className={`badge ${ROLE_BADGE[s.role]}`}
                    style={{ fontSize: 9.5 }}
                  >
                    {ROLE_LABELS[s.role]}
                  </span>
                  <span
                    className={`badge ${s.active ? "badge-success" : "badge-danger"}`}
                    style={{ fontSize: 9.5 }}
                  >
                    {s.active ? i18n.staffActive : i18n.staffInactive}
                  </span>
                  <button
                    className="btn-danger"
                    style={{ padding: "1px 7px", fontSize: 10 }}
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

        <AnimatePresence mode="wait">
          {selected ? (
            <motion.div
              key={selected.id}
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              className="panel panel-0"
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  marginBottom: 14,
                }}
              >
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: "50%",
                    background: selected.color + "22",
                    border: `2px solid ${selected.color}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 17,
                    fontWeight: 900,
                    color: selected.color,
                  }}
                >
                  {selected.avatar}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 800 }}>
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
              <p className="section-label" style={{ marginBottom: 9 }}>
                {i18n.permissions}
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                {PERMS.map(({ k, l }) => (
                  <div
                    key={k}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "8px 11px",
                      background: "var(--surface)",
                      borderRadius: 9,
                    }}
                  >
                    <span style={{ fontSize: 12.5, fontWeight: 600 }}>{l}</span>
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
                minHeight: 200,
                color: "var(--muted)",
                flexDirection: "column",
                gap: 9,
              }}
            >
              <span style={{ fontSize: 34, opacity: 0.13 }}>👥</span>
              <span style={{ fontSize: 13, fontWeight: 600 }}>
                {i18n.clickToEdit}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ── Alerts Page ──────────────────────────────────────────────
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
    const ti = TYPES.find((x) => x.v === rule.type);
    addToast(`🔔 Test: ${ti?.l}`, "warning");
    pushN.push("🔔 Test Alert", ti?.l || "Test");
    setAlertRules((p) =>
      p.map((r) =>
        r.id === rule.id ? { ...r, triggered: r.triggered + 1 } : r,
      ),
    );
  };
  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <p className="section-label">{i18n.system}</p>
        <h1 className="page-title">{i18n.alertsPage}</h1>
      </div>
      <div
        className="panel panel-0"
        style={{
          marginBottom: 12,
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
          <p className="section-label">{i18n.errorRate}</p>
          <div
            style={{
              fontSize: 22,
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
      <div className="panel panel-0">
        <p className="section-label" style={{ marginBottom: 12 }}>
          {i18n.alertRules}
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
          {alertRules.map((rule) => {
            const ti = TYPES.find((x) => x.v === rule.type);
            return (
              <motion.div
                key={rule.id}
                className="alert-rule-card"
                initial={{ opacity: 0, x: -5 }}
                animate={{ opacity: 1, x: 0 }}
                style={{
                  borderColor: rule.enabled
                    ? ti?.color + "55"
                    : "var(--card-border)",
                }}
              >
                <span style={{ fontSize: 20, flexShrink: 0 }}>{ti?.icon}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{ fontSize: 13, fontWeight: 800, marginBottom: 2 }}
                  >
                    {ti?.l}
                  </div>
                  <div style={{ fontSize: 10, color: "var(--muted)" }}>
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
                    style={{ padding: "4px 10px", fontSize: 11 }}
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
    </div>
  );
}

// ── Settings ─────────────────────────────────────────────────
function Settings({ logout, dark, setDark, langCode, setLangCode, i18n }) {
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
              {i18n.admin}
            </div>
          </div>
          <button className="btn-danger" onClick={logout}>
            {i18n.logout}
          </button>
        </div>
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
        {/* FIX 7 — Language selector here changes i18n for all pages */}
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
        <div className="panel panel-0">
          <p className="section-label" style={{ marginBottom: 11 }}>
            {i18n.info}
          </p>
          {[
            ["Version", "3.1.0"],
            ["Framework", "React 18"],
            ["Socket", "Socket.IO"],
            ["Map", "Leaflet.js"],
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
