/**
 * AI Factory QR Dashboard v4.0
 * Features: Multi-language, Mobile-first, GPS real-time + on-scan,
 * Staff Management, Push Alerts, Chat, PDF Reports
 */
import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { io } from "socket.io-client";
import * as XLSX from "xlsx";
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

// ─── MAP ICONS ─────────────────────────────────────────────────────────────────
const qrIcon = new L.DivIcon({
  className: "",
  html: `<div style="width:26px;height:26px;background:linear-gradient(135deg,#38bdf8,#6366f1);border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:2px solid white;box-shadow:0 4px 12px rgba(56,189,248,0.6);"></div>`,
  iconSize: [26, 26],
  iconAnchor: [13, 26],
  popupAnchor: [0, -30],
});
const shipperIcon = new L.DivIcon({
  className: "",
  html: `<div style="width:36px;height:36px;background:linear-gradient(135deg,#34d399,#059669);border-radius:50%;border:3px solid white;box-shadow:0 0 0 4px rgba(52,211,153,0.3),0 4px 16px rgba(52,211,153,0.5);display:flex;align-items:center;justify-content:center;font-size:16px;">📦</div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 18],
  popupAnchor: [0, -22],
});

// ─── SOCKET ────────────────────────────────────────────────────────────────────
const socket = io("https://qr-server-n6pp.onrender.com", {
  transports: ["websocket"],
  reconnection: true,
});

// ─── LANGUAGES ─────────────────────────────────────────────────────────────────
const LANGS = {
  vi: {
    flag: "🇻🇳",
    name: "Tiếng Việt",
    t: {
      appName: "AI Factory",
      system: "Hệ thống",
      online: "Trực tuyến",
      offline: "Ngoại tuyến",
      notifications: "Thông báo",
      noNotif: "Không có thông báo mới",
      close: "Đóng",
      lightMode: "Giao diện sáng",
      darkMode: "Giao diện tối",
      dashboard: "Bảng điều khiển",
      liveScan: "Live Scan",
      orders: "Đơn hàng",
      gpsMap: "Bản đồ GPS",
      leaderboard: "Leaderboard",
      analytics: "Analytics",
      history: "Lịch sử",
      settings: "Cài đặt",
      chat: "Chat nội bộ",
      staff: "Nhân viên",
      alerts: "Cảnh báo",
      overview: "Tổng quan",
      realtime: "Thời gian thực",
      management: "Quản lý",
      transport: "Vận chuyển",
      analysis: "Phân tích",
      log: "Nhật ký",
      totalScans: "Tổng quét",
      success: "Thành công",
      failed: "Thất bại",
      errorRate: "Tỉ lệ lỗi",
      today: "Hôm nay",
      liveMonitor: "Màn hình quét trực tiếp",
      waitScanner: "Đang chờ máy quét...",
      lastScan: "Quét gần nhất",
      scanOk: "Quét OK",
      connectionStatus: "Trạng thái kết nối",
      connected: "Đã kết nối",
      ready: "Sẵn sàng",
      active: "Hoạt động",
      tracking: "Đang theo dõi",
      recentScans: "Quét gần đây",
      noData: "Chưa có dữ liệu",
      totalOrders: "Tổng đơn",
      scanned: "Đã quét",
      pending: "Chờ xử lý",
      all: "Tất cả",
      uploadExcel: "Tải lên Excel",
      exportExcel: "Xuất Excel",
      search: "Tìm kiếm...",
      searchQR: "Tìm kiếm mã QR...",
      completion: "Tiến độ hoàn thành",
      customer: "Khách hàng",
      qrCode: "Mã QR",
      status: "Trạng thái",
      noOrders: "Chưa có đơn hàng. Tải file Excel để bắt đầu.",
      noResults: "Không tìm thấy.",
      latitude: "Vĩ độ",
      deliveryTracking: "Theo dõi giao hàng",
      live: "Trực tiếp",
      distance: "Khoảng cách",
      scanHistory: "Lịch sử điểm quét",
      time: "Thời gian",
      gps: "GPS",
      scannerLeaderboard: "Leaderboard Scanner",
      realtimeRank: "Xếp hạng hiệu suất nhân viên",
      fullRank: "Bảng xếp hạng đầy đủ",
      points: "điểm",
      days: "ngày",
      streak: "ngày liên tiếp",
      advancedAnalytics: "Analytics nâng cao",
      errorTrend: "Tỉ lệ lỗi theo giờ",
      overallPerf: "Hiệu suất tổng thể",
      successRate: "Tỉ lệ thành công",
      hourlyStats: "Thống kê theo giờ",
      hour: "Giờ",
      total: "Tổng",
      scanHistory2: "Lịch sử quét",
      account: "Tài khoản",
      loginAs: "Đăng nhập với tư cách",
      admin: "Quản trị viên",
      logout: "Đăng xuất",
      connection: "Kết nối",
      preferences: "Tuỳ chọn",
      info: "Thông tin",
      scanSound: "Âm thanh khi quét",
      autoExport: "Tự động xuất Excel",
      darkTheme: "Giao diện tối",
      version: "Phiên bản",
      framework: "Framework",
      map: "Bản đồ",
      language: "Ngôn ngữ",
      msgPlaceholder: "Nhập tin nhắn...",
      send: "Gửi",
      internalChat: "Chat nội bộ",
      teamChat: "Nhắn tin nhóm",
      you: "Bạn",
      aiInsights: "AI Insights",
      goodPerf: "Hiệu suất tốt",
      loadForecast: "Dự báo tải",
      gpsAccurate: "GPS chính xác",
      hourlyChart: "Biểu đồ quét theo giờ",
      events: "sự kiện",
      resultDist: "Phân bố kết quả",
      activity: "Hoạt động",
      shipperPos: "Vị trí Shipper",
      operating: "Đang hoạt động",
      scanPoint: "Điểm quét",
      records: "bản ghi",
      error: "Lỗi",
      startGPS: "Bắt đầu GPS",
      stopGPS: "Dừng GPS",
      accuracy: "Độ chính xác",
      speed: "Tốc độ",
      heading: "Hướng",
      // Staff
      staffManagement: "Quản lý nhân viên",
      addStaff: "Thêm nhân viên",
      editStaff: "Sửa",
      deleteStaff: "Xoá",
      staffName: "Họ tên",
      staffRole: "Vai trò",
      staffEmail: "Email",
      staffStatus: "Trạng thái",
      roleAdmin: "Quản trị viên",
      roleScanner: "Nhân viên quét",
      roleSupervisor: "Giám sát",
      staffActive: "Đang làm",
      staffInactive: "Nghỉ",
      permissionTitle: "Phân quyền",
      canScan: "Quét mã QR",
      canExport: "Xuất dữ liệu",
      canManageOrders: "Quản lý đơn hàng",
      canViewMap: "Xem bản đồ",
      canManageStaff: "Quản lý nhân viên",
      // Alerts
      alertsPage: "Cảnh báo tự động",
      alertRules: "Quy tắc cảnh báo",
      addRule: "Thêm quy tắc",
      alertType: "Loại cảnh báo",
      alertThreshold: "Ngưỡng",
      alertEnabled: "Bật",
      alertHighError: "Tỉ lệ lỗi cao",
      alertNoScan: "Không quét",
      alertLowBattery: "Pin thấp",
      alertOffline: "Thiết bị offline",
      triggered: "Kích hoạt",
      times: "lần",
      pushEnabled: "Thông báo đẩy",
      pushGranted: "Đã cấp quyền",
      pushDenied: "Bị từ chối",
      requestPush: "Yêu cầu quyền",
      // Reports
      exportPDF: "Xuất báo cáo PDF",
      generating: "Đang tạo...",
      reportTitle: "Báo cáo QR Scan",
      reportGenerated: "Báo cáo đã tạo!",
      login: "Đăng nhập",
    },
  },
  en: {
    flag: "🇺🇸",
    name: "English",
    t: {
      appName: "AI Factory",
      system: "System",
      online: "Online",
      offline: "Offline",
      notifications: "Notifications",
      noNotif: "No new notifications",
      close: "Close",
      lightMode: "Light Mode",
      darkMode: "Dark Mode",
      dashboard: "Dashboard",
      liveScan: "Live Scan",
      orders: "Orders",
      gpsMap: "GPS Map",
      leaderboard: "Leaderboard",
      analytics: "Analytics",
      history: "History",
      settings: "Settings",
      chat: "Internal Chat",
      staff: "Staff",
      alerts: "Alerts",
      overview: "Overview",
      realtime: "Real-time",
      management: "Management",
      transport: "Transport",
      analysis: "Analysis",
      log: "Log",
      totalScans: "Total Scans",
      success: "Success",
      failed: "Failed",
      errorRate: "Error Rate",
      today: "Today",
      liveMonitor: "Live Scan Monitor",
      waitScanner: "Waiting for scanner...",
      lastScan: "Last Scan",
      scanOk: "Scan OK",
      connectionStatus: "Connection Status",
      connected: "Connected",
      ready: "Ready",
      active: "Active",
      tracking: "Tracking",
      recentScans: "Recent Scans",
      noData: "No data yet",
      totalOrders: "Total Orders",
      scanned: "Scanned",
      pending: "Pending",
      all: "All",
      uploadExcel: "Upload Excel",
      exportExcel: "Export Excel",
      search: "Search...",
      searchQR: "Search QR code...",
      completion: "Completion Progress",
      customer: "Customer",
      qrCode: "QR Code",
      status: "Status",
      noOrders: "No orders. Upload an Excel file to start.",
      noResults: "No results.",
      latitude: "Latitude",
      deliveryTracking: "Delivery Tracking",
      live: "Live",
      distance: "Distance",
      scanHistory: "Scan Points History",
      time: "Time",
      gps: "GPS",
      scannerLeaderboard: "Scanner Leaderboard",
      realtimeRank: "Real-time employee performance ranking",
      fullRank: "Full Leaderboard",
      points: "pts",
      days: "days",
      streak: "day streak",
      advancedAnalytics: "Advanced Analytics",
      errorTrend: "Hourly error rate trend",
      overallPerf: "Overall Performance",
      successRate: "Success Rate",
      hourlyStats: "Hourly Statistics",
      hour: "Hour",
      total: "Total",
      scanHistory2: "Scan History",
      account: "Account",
      loginAs: "Logged in as",
      admin: "Administrator",
      logout: "Logout",
      connection: "Connection",
      preferences: "Preferences",
      info: "Info",
      scanSound: "Scan Sound",
      autoExport: "Auto Export Excel",
      darkTheme: "Dark Theme",
      version: "Version",
      framework: "Framework",
      map: "Map",
      language: "Language",
      msgPlaceholder: "Type a message...",
      send: "Send",
      internalChat: "Internal Chat",
      teamChat: "Team Messaging",
      you: "You",
      aiInsights: "AI Insights",
      goodPerf: "Good Performance",
      loadForecast: "Load Forecast",
      gpsAccurate: "GPS Accurate",
      hourlyChart: "Hourly QR Scan Chart",
      events: "events",
      resultDist: "Result Distribution",
      activity: "Activity",
      shipperPos: "Shipper Position",
      operating: "Operating",
      scanPoint: "Scan Point",
      records: "records",
      error: "Error",
      startGPS: "Start GPS",
      stopGPS: "Stop GPS",
      accuracy: "Accuracy",
      speed: "Speed",
      heading: "Heading",
      staffManagement: "Staff Management",
      addStaff: "Add Staff",
      editStaff: "Edit",
      deleteStaff: "Delete",
      staffName: "Full Name",
      staffRole: "Role",
      staffEmail: "Email",
      staffStatus: "Status",
      roleAdmin: "Admin",
      roleScanner: "Scanner",
      roleSupervisor: "Supervisor",
      staffActive: "Active",
      staffInactive: "Inactive",
      permissionTitle: "Permissions",
      canScan: "QR Scanning",
      canExport: "Export Data",
      canManageOrders: "Manage Orders",
      canViewMap: "View Map",
      canManageStaff: "Manage Staff",
      alertsPage: "Automatic Alerts",
      alertRules: "Alert Rules",
      addRule: "Add Rule",
      alertType: "Alert Type",
      alertThreshold: "Threshold",
      alertEnabled: "Enabled",
      alertHighError: "High Error Rate",
      alertNoScan: "No Scan Activity",
      alertLowBattery: "Low Battery",
      alertOffline: "Device Offline",
      triggered: "Triggered",
      times: "times",
      pushEnabled: "Push Notifications",
      pushGranted: "Permission Granted",
      pushDenied: "Permission Denied",
      requestPush: "Request Permission",
      exportPDF: "Export PDF Report",
      generating: "Generating...",
      reportTitle: "QR Scan Report",
      reportGenerated: "Report generated!",
      login: "Login",
    },
  },
  zh: {
    flag: "🇨🇳",
    name: "中文",
    t: {
      appName: "AI工厂",
      system: "系统",
      online: "在线",
      offline: "离线",
      notifications: "通知",
      noNotif: "暂无新通知",
      close: "关闭",
      lightMode: "浅色模式",
      darkMode: "深色模式",
      dashboard: "仪表盘",
      liveScan: "实时扫描",
      orders: "订单",
      gpsMap: "GPS地图",
      leaderboard: "排行榜",
      analytics: "分析",
      history: "历史",
      settings: "设置",
      chat: "内部聊天",
      staff: "员工",
      alerts: "警报",
      overview: "概览",
      realtime: "实时",
      management: "管理",
      transport: "配送",
      analysis: "分析",
      log: "日志",
      totalScans: "总扫描",
      success: "成功",
      failed: "失败",
      errorRate: "错误率",
      today: "今天",
      liveMonitor: "实时扫描监控",
      waitScanner: "等待扫描仪...",
      lastScan: "最近扫描",
      scanOk: "扫描成功",
      connectionStatus: "连接状态",
      connected: "已连接",
      ready: "就绪",
      active: "活跃",
      tracking: "追踪中",
      recentScans: "最近扫描",
      noData: "暂无数据",
      totalOrders: "总订单",
      scanned: "已扫描",
      pending: "待处理",
      all: "全部",
      uploadExcel: "上传Excel",
      exportExcel: "导出Excel",
      search: "搜索...",
      searchQR: "搜索QR码...",
      completion: "完成进度",
      customer: "客户",
      qrCode: "QR码",
      status: "状态",
      noOrders: "暂无订单，请上传Excel文件。",
      noResults: "未找到结果。",
      latitude: "纬度",
      deliveryTracking: "配送追踪",
      live: "实时",
      distance: "距离",
      scanHistory: "扫描点历史",
      time: "时间",
      gps: "GPS",
      scannerLeaderboard: "扫描排行榜",
      realtimeRank: "员工实时绩效排名",
      fullRank: "完整排行",
      points: "分",
      days: "天",
      streak: "天连续",
      advancedAnalytics: "高级分析",
      errorTrend: "每小时错误率",
      overallPerf: "整体表现",
      successRate: "成功率",
      hourlyStats: "每小时统计",
      hour: "小时",
      total: "合计",
      scanHistory2: "扫描历史",
      account: "账户",
      loginAs: "登录身份",
      admin: "管理员",
      logout: "退出",
      connection: "连接",
      preferences: "偏好",
      info: "信息",
      scanSound: "扫描音效",
      autoExport: "自动导出Excel",
      darkTheme: "深色主题",
      version: "版本",
      framework: "框架",
      map: "地图",
      language: "语言",
      msgPlaceholder: "输入消息...",
      send: "发送",
      internalChat: "内部聊天",
      teamChat: "团队消息",
      you: "你",
      aiInsights: "AI洞察",
      goodPerf: "表现优秀",
      loadForecast: "负载预测",
      gpsAccurate: "GPS精确",
      hourlyChart: "每小时扫码图",
      events: "事件",
      resultDist: "结果分布",
      activity: "活动",
      shipperPos: "配送员位置",
      operating: "运营中",
      scanPoint: "扫描点",
      records: "记录",
      error: "错误",
      startGPS: "开始GPS",
      stopGPS: "停止GPS",
      accuracy: "精度",
      speed: "速度",
      heading: "方向",
      staffManagement: "员工管理",
      addStaff: "添加员工",
      editStaff: "编辑",
      deleteStaff: "删除",
      staffName: "姓名",
      staffRole: "角色",
      staffEmail: "邮箱",
      staffStatus: "状态",
      roleAdmin: "管理员",
      roleScanner: "扫描员",
      roleSupervisor: "主管",
      staffActive: "在职",
      staffInactive: "休假",
      permissionTitle: "权限",
      canScan: "QR扫描",
      canExport: "导出数据",
      canManageOrders: "管理订单",
      canViewMap: "查看地图",
      canManageStaff: "管理员工",
      alertsPage: "自动警报",
      alertRules: "警报规则",
      addRule: "添加规则",
      alertType: "警报类型",
      alertThreshold: "阈值",
      alertEnabled: "启用",
      alertHighError: "高错误率",
      alertNoScan: "无扫描活动",
      alertLowBattery: "电量不足",
      alertOffline: "设备离线",
      triggered: "触发",
      times: "次",
      pushEnabled: "推送通知",
      pushGranted: "已授权",
      pushDenied: "已拒绝",
      requestPush: "请求权限",
      exportPDF: "导出PDF报告",
      generating: "生成中...",
      reportTitle: "QR扫描报告",
      reportGenerated: "报告已生成！",
      login: "登录",
    },
  },
  ko: {
    flag: "🇰🇷",
    name: "한국어",
    t: {
      appName: "AI 팩토리",
      system: "시스템",
      online: "온라인",
      offline: "오프라인",
      notifications: "알림",
      noNotif: "새 알림 없음",
      close: "닫기",
      lightMode: "라이트 모드",
      darkMode: "다크 모드",
      dashboard: "대시보드",
      liveScan: "라이브 스캔",
      orders: "주문",
      gpsMap: "GPS 지도",
      leaderboard: "리더보드",
      analytics: "분석",
      history: "기록",
      settings: "설정",
      chat: "내부 채팅",
      staff: "직원",
      alerts: "알림",
      overview: "개요",
      realtime: "실시간",
      management: "관리",
      transport: "배송",
      analysis: "분석",
      log: "로그",
      totalScans: "총 스캔",
      success: "성공",
      failed: "실패",
      errorRate: "오류율",
      today: "오늘",
      liveMonitor: "라이브 스캔 모니터",
      waitScanner: "스캐너 대기 중...",
      lastScan: "최근 스캔",
      scanOk: "스캔 OK",
      connectionStatus: "연결 상태",
      connected: "연결됨",
      ready: "준비됨",
      active: "활성",
      tracking: "추적 중",
      recentScans: "최근 스캔",
      noData: "데이터 없음",
      totalOrders: "총 주문",
      scanned: "스캔됨",
      pending: "대기 중",
      all: "전체",
      uploadExcel: "Excel 업로드",
      exportExcel: "Excel 내보내기",
      search: "검색...",
      searchQR: "QR 코드 검색...",
      completion: "완료 진행률",
      customer: "고객",
      qrCode: "QR 코드",
      status: "상태",
      noOrders: "주문 없음. Excel 파일을 업로드하세요.",
      noResults: "결과 없음.",
      latitude: "위도",
      deliveryTracking: "배송 추적",
      live: "실시간",
      distance: "거리",
      scanHistory: "스캔 포인트 기록",
      time: "시간",
      gps: "GPS",
      scannerLeaderboard: "스캐너 리더보드",
      realtimeRank: "실시간 직원 성과 순위",
      fullRank: "전체 순위",
      points: "점",
      days: "일",
      streak: "일 연속",
      advancedAnalytics: "고급 분석",
      errorTrend: "시간별 오류율",
      overallPerf: "전체 성능",
      successRate: "성공률",
      hourlyStats: "시간별 통계",
      hour: "시간",
      total: "합계",
      scanHistory2: "스캔 기록",
      account: "계정",
      loginAs: "로그인 계정",
      admin: "관리자",
      logout: "로그아웃",
      connection: "연결",
      preferences: "환경설정",
      info: "정보",
      scanSound: "스캔 사운드",
      autoExport: "자동 Excel 내보내기",
      darkTheme: "다크 테마",
      version: "버전",
      framework: "프레임워크",
      map: "지도",
      language: "언어",
      msgPlaceholder: "메시지 입력...",
      send: "보내기",
      internalChat: "내부 채팅",
      teamChat: "팀 메시지",
      you: "나",
      aiInsights: "AI 인사이트",
      goodPerf: "우수한 성능",
      loadForecast: "부하 예측",
      gpsAccurate: "GPS 정확",
      hourlyChart: "시간별 QR 스캔 차트",
      events: "이벤트",
      resultDist: "결과 분포",
      activity: "활동",
      shipperPos: "배송원 위치",
      operating: "운영 중",
      scanPoint: "스캔 포인트",
      records: "레코드",
      error: "오류",
      startGPS: "GPS 시작",
      stopGPS: "GPS 중지",
      accuracy: "정확도",
      speed: "속도",
      heading: "방향",
      staffManagement: "직원 관리",
      addStaff: "직원 추가",
      editStaff: "편집",
      deleteStaff: "삭제",
      staffName: "이름",
      staffRole: "역할",
      staffEmail: "이메일",
      staffStatus: "상태",
      roleAdmin: "관리자",
      roleScanner: "스캐너",
      roleSupervisor: "감독자",
      staffActive: "재직 중",
      staffInactive: "휴직",
      permissionTitle: "권한",
      canScan: "QR 스캔",
      canExport: "데이터 내보내기",
      canManageOrders: "주문 관리",
      canViewMap: "지도 보기",
      canManageStaff: "직원 관리",
      alertsPage: "자동 알림",
      alertRules: "알림 규칙",
      addRule: "규칙 추가",
      alertType: "알림 유형",
      alertThreshold: "임계값",
      alertEnabled: "활성화",
      alertHighError: "높은 오류율",
      alertNoScan: "스캔 없음",
      alertLowBattery: "배터리 부족",
      alertOffline: "장치 오프라인",
      triggered: "발생",
      times: "회",
      pushEnabled: "푸시 알림",
      pushGranted: "권한 부여됨",
      pushDenied: "권한 거부됨",
      requestPush: "권한 요청",
      exportPDF: "PDF 보고서 내보내기",
      generating: "생성 중...",
      reportTitle: "QR 스캔 보고서",
      reportGenerated: "보고서 생성 완료!",
      login: "로그인",
    },
  },
  ja: {
    flag: "🇯🇵",
    name: "日本語",
    t: {
      appName: "AIファクトリー",
      system: "システム",
      online: "オンライン",
      offline: "オフライン",
      notifications: "通知",
      noNotif: "新しい通知なし",
      close: "閉じる",
      lightMode: "ライトモード",
      darkMode: "ダークモード",
      dashboard: "ダッシュボード",
      liveScan: "ライブスキャン",
      orders: "注文",
      gpsMap: "GPS地図",
      leaderboard: "リーダーボード",
      analytics: "分析",
      history: "履歴",
      settings: "設定",
      chat: "社内チャット",
      staff: "スタッフ",
      alerts: "アラート",
      overview: "概要",
      realtime: "リアルタイム",
      management: "管理",
      transport: "配送",
      analysis: "分析",
      log: "ログ",
      totalScans: "総スキャン",
      success: "成功",
      failed: "失敗",
      errorRate: "エラー率",
      today: "今日",
      liveMonitor: "ライブスキャンモニター",
      waitScanner: "スキャナー待機中...",
      lastScan: "最新スキャン",
      scanOk: "スキャンOK",
      connectionStatus: "接続状態",
      connected: "接続済み",
      ready: "準備完了",
      active: "稼働中",
      tracking: "追跡中",
      recentScans: "最近のスキャン",
      noData: "データなし",
      totalOrders: "総注文",
      scanned: "スキャン済み",
      pending: "保留中",
      all: "全て",
      uploadExcel: "Excelアップロード",
      exportExcel: "Excelエクスポート",
      search: "検索...",
      searchQR: "QRコード検索...",
      completion: "完了進捗",
      customer: "顧客",
      qrCode: "QRコード",
      status: "状態",
      noOrders: "注文なし。Excelファイルをアップロードしてください。",
      noResults: "結果なし。",
      latitude: "緯度",
      deliveryTracking: "配送追跡",
      live: "ライブ",
      distance: "距離",
      scanHistory: "スキャンポイント履歴",
      time: "時間",
      gps: "GPS",
      scannerLeaderboard: "スキャナーリーダーボード",
      realtimeRank: "リアルタイム従業員パフォーマンス",
      fullRank: "全ランキング",
      points: "ポイント",
      days: "日",
      streak: "日連続",
      advancedAnalytics: "高度な分析",
      errorTrend: "時間別エラー率",
      overallPerf: "総合性能",
      successRate: "成功率",
      hourlyStats: "時間別統計",
      hour: "時間",
      total: "合計",
      scanHistory2: "スキャン履歴",
      account: "アカウント",
      loginAs: "ログイン中",
      admin: "管理者",
      logout: "ログアウト",
      connection: "接続",
      preferences: "設定",
      info: "情報",
      scanSound: "スキャン音",
      autoExport: "自動Excelエクスポート",
      darkTheme: "ダークテーマ",
      version: "バージョン",
      framework: "フレームワーク",
      map: "地図",
      language: "言語",
      msgPlaceholder: "メッセージを入力...",
      send: "送信",
      internalChat: "社内チャット",
      teamChat: "チームメッセージ",
      you: "あなた",
      aiInsights: "AIインサイト",
      goodPerf: "優秀なパフォーマンス",
      loadForecast: "負荷予測",
      gpsAccurate: "GPS精度良好",
      hourlyChart: "時間別QRスキャン",
      events: "イベント",
      resultDist: "結果分布",
      activity: "アクティビティ",
      shipperPos: "配達員位置",
      operating: "稼働中",
      scanPoint: "スキャンポイント",
      records: "レコード",
      error: "エラー",
      startGPS: "GPS開始",
      stopGPS: "GPS停止",
      accuracy: "精度",
      speed: "速度",
      heading: "方向",
      staffManagement: "スタッフ管理",
      addStaff: "スタッフ追加",
      editStaff: "編集",
      deleteStaff: "削除",
      staffName: "氏名",
      staffRole: "役割",
      staffEmail: "メール",
      staffStatus: "状態",
      roleAdmin: "管理者",
      roleScanner: "スキャナー",
      roleSupervisor: "監督者",
      staffActive: "在職",
      staffInactive: "休職",
      permissionTitle: "権限",
      canScan: "QRスキャン",
      canExport: "データエクスポート",
      canManageOrders: "注文管理",
      canViewMap: "地図表示",
      canManageStaff: "スタッフ管理",
      alertsPage: "自動アラート",
      alertRules: "アラートルール",
      addRule: "ルール追加",
      alertType: "アラートタイプ",
      alertThreshold: "閾値",
      alertEnabled: "有効",
      alertHighError: "高エラー率",
      alertNoScan: "スキャンなし",
      alertLowBattery: "低バッテリー",
      alertOffline: "デバイスオフライン",
      triggered: "発生",
      times: "回",
      pushEnabled: "プッシュ通知",
      pushGranted: "許可済み",
      pushDenied: "拒否済み",
      requestPush: "権限リクエスト",
      exportPDF: "PDFレポート出力",
      generating: "生成中...",
      reportTitle: "QRスキャンレポート",
      reportGenerated: "レポート生成完了！",
      login: "ログイン",
    },
  },
};

// ─── THEMES ────────────────────────────────────────────────────────────────────
const THEMES = {
  dark: {
    bg: "#070d1a",
    card: "rgba(12,20,42,0.88)",
    cardBorder: "rgba(56,189,248,0.13)",
    panel: "rgba(12,20,42,0.88)",
    text: "#e2e8f0",
    muted: "#475569",
    accent: "#38bdf8",
    accentGlow: "rgba(56,189,248,0.2)",
    success: "#34d399",
    danger: "#f87171",
    warning: "#fbbf24",
    menuActive: "rgba(56,189,248,0.12)",
    surface: "rgba(255,255,255,0.03)",
    sidebar: "rgba(5,10,22,0.95)",
  },
  light: {
    bg: "#eef2ff",
    card: "rgba(255,255,255,0.88)",
    cardBorder: "rgba(99,102,241,0.14)",
    panel: "rgba(255,255,255,0.88)",
    text: "#0f172a",
    muted: "#94a3b8",
    accent: "#6366f1",
    accentGlow: "rgba(99,102,241,0.16)",
    success: "#10b981",
    danger: "#ef4444",
    warning: "#f59e0b",
    menuActive: "rgba(99,102,241,0.09)",
    surface: "rgba(0,0,0,0.025)",
    sidebar: "rgba(255,255,255,0.95)",
  },
};

// ─── HELPERS ───────────────────────────────────────────────────────────────────
function MapAutoCenter({ position }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(position, map.getZoom(), { duration: 1.1 });
  }, [position]);
  return null;
}
const fmtNum = (n) =>
  n >= 1e6
    ? (n / 1e6).toFixed(1) + "M"
    : n >= 1000
      ? (n / 1000).toFixed(1) + "K"
      : String(n);
const timeNow = () =>
  new Date().toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

// ─── GLOBAL STYLE ──────────────────────────────────────────────────────────────
function GlobalStyle({ dark }) {
  const th = dark ? THEMES.dark : THEMES.light;
  return (
    <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&family=Raleway:wght@700;800;900&family=JetBrains+Mono:wght@400;500;700&display=swap');
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
    :root{
      --accent:${th.accent};--glow:${th.accentGlow};
      --success:${th.success};--danger:${th.danger};--warning:${th.warning};
      --text:${th.text};--muted:${th.muted};--bg:${th.bg};
      --card:${th.card};--border:${th.cardBorder};
      --panel:${th.panel};--surface:${th.surface};--active:${th.menuActive};
      --sidebar:${th.sidebar};
    }
    html,body{font-family:'Nunito',sans-serif;background:var(--bg);color:var(--text);overflow-x:hidden;}
    ::-webkit-scrollbar{width:3px;height:3px;}
    ::-webkit-scrollbar-thumb{background:var(--accent);border-radius:10px;}
    .mono{font-family:'JetBrains Mono',monospace;}
    /* Cards */
    .card{background:var(--card);backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px);
      border:1px solid var(--border);border-radius:16px;padding:18px;position:relative;overflow:hidden;
      transition:transform .2s,box-shadow .2s;}
    .card::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;
      background:linear-gradient(90deg,transparent,var(--accent),transparent);opacity:.45;}
    .card:hover{transform:translateY(-2px);box-shadow:0 12px 36px var(--glow);}
    .panel{background:var(--panel);backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px);
      border:1px solid var(--border);border-radius:18px;padding:20px;margin-top:14px;}
    .panel-0{margin-top:0!important;}
    /* Badges */
    .badge{display:inline-flex;align-items:center;gap:4px;padding:2px 9px;border-radius:20px;
      font-size:10px;font-weight:800;letter-spacing:.03em;text-transform:uppercase;flex-shrink:0;}
    .b-ok{background:rgba(52,211,153,.11);color:var(--success);border:1px solid rgba(52,211,153,.26);}
    .b-fail{background:rgba(248,113,113,.11);color:var(--danger);border:1px solid rgba(248,113,113,.26);}
    .b-warn{background:rgba(251,191,36,.11);color:var(--warning);border:1px solid rgba(251,191,36,.26);}
    .b-info{background:rgba(56,189,248,.11);color:var(--accent);border:1px solid rgba(56,189,248,.26);}
    .b-purple{background:rgba(167,139,250,.11);color:#a78bfa;border:1px solid rgba(167,139,250,.26);}
    /* Pulse */
    .dot{width:7px;height:7px;border-radius:50%;background:var(--success);flex-shrink:0;
      box-shadow:0 0 0 0 rgba(52,211,153,.4);animation:pulse 1.6s infinite;display:inline-block;}
    @keyframes pulse{0%{box-shadow:0 0 0 0 rgba(52,211,153,.5);}70%{box-shadow:0 0 0 9px rgba(52,211,153,0);}100%{box-shadow:0 0 0 0 rgba(52,211,153,0);}}
    /* Table */
    table{width:100%;border-collapse:collapse;}
    thead tr{border-bottom:1px solid var(--border);}
    th{text-align:left;padding:9px 12px;font-size:9.5px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;color:var(--muted);}
    td{padding:10px 12px;font-size:12.5px;border-bottom:1px solid var(--surface);}
    tbody tr:hover{background:var(--surface);}
    .tbl-wrap{overflow-x:auto;-webkit-overflow-scrolling:touch;}
    /* Buttons */
    .btn{padding:8px 16px;border-radius:9px;font-weight:800;font-size:12px;cursor:pointer;
      font-family:'Nunito',sans-serif;transition:opacity .2s,transform .15s;border:none;letter-spacing:.01em;}
    .btn:hover{transform:translateY(-1px);opacity:.9;}
    .btn-a{background:var(--accent);color:${dark ? "#070d1a" : "#fff"};}
    .btn-g{background:transparent;border:1px solid var(--border)!important;color:var(--muted);}
    .btn-g:hover{border-color:var(--accent)!important;color:var(--accent);background:var(--active);}
    .btn-d{background:transparent;border:1px solid var(--danger)!important;color:var(--danger);}
    .btn-d:hover{background:rgba(248,113,113,.09);}
    .btn-s{background:transparent;border:1px solid var(--success)!important;color:var(--success);}
    .btn-s:hover{background:rgba(52,211,153,.09);}
    /* Upload */
    .upload{display:inline-flex;align-items:center;gap:7px;padding:8px 14px;
      background:var(--surface);border:1px dashed var(--border);border-radius:9px;
      cursor:pointer;color:var(--muted);font-size:12.5px;font-weight:600;font-family:'Nunito',sans-serif;
      transition:border-color .2s,color .2s;}
    .upload:hover{border-color:var(--accent);color:var(--accent);}
    .upload input{display:none;}
    /* Typography */
    .slabel{font-size:9.5px;font-weight:800;letter-spacing:.16em;text-transform:uppercase;color:var(--muted);margin-bottom:3px;}
    .ptitle{font-family:'Raleway',sans-serif;font-size:24px;font-weight:900;letter-spacing:-.5px;margin-bottom:4px;
      background:linear-gradient(135deg,var(--text) 0%,var(--accent) 130%);
      -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;}
    /* Progress */
    .bar-bg{background:var(--surface);border-radius:6px;height:5px;overflow:hidden;}
    .bar{height:100%;border-radius:6px;transition:width .6s ease;}
    /* KPI trend */
    .trend{display:inline-flex;align-items:center;gap:3px;font-size:10px;font-weight:700;margin-top:2px;}
    .trend-up{color:var(--success);}.trend-dn{color:var(--danger);}.trend-fl{color:var(--muted);}
    /* Animations */
    @keyframes fadeUp{from{opacity:0;transform:translateY(10px);}to{opacity:1;transform:none;}}
    .fu{animation:fadeUp .35s ease-out both;}
    @keyframes slideIn{from{transform:translateX(8px);opacity:0;}to{transform:none;opacity:1;}}
    .si{animation:slideIn .3s ease-out;}
    @keyframes scanFlash{0%{box-shadow:0 0 0 0 rgba(52,211,153,.8);}100%{box-shadow:0 0 0 24px rgba(52,211,153,0);}}
    .sf{animation:scanFlash .6s ease-out;}
    /* Insight card */
    .ins-card{border-radius:13px;padding:13px;border:1px solid;transition:transform .18s;}
    .ins-card:hover{transform:translateY(-2px);}
    /* Layout */
    .layout{display:flex;min-height:100vh;}
    .content{flex:1;padding:28px 32px;overflow-y:auto;min-height:100vh;position:relative;z-index:1;min-width:0;}
    /* Grids */
    .g4{display:grid;grid-template-columns:repeat(4,1fr);gap:11px;}
    .g3{display:grid;grid-template-columns:repeat(3,1fr);gap:11px;}
    .g2{display:grid;grid-template-columns:1fr 1fr;gap:13px;}
    .g2r{display:grid;grid-template-columns:1fr 300px;gap:13px;}
    .g2s{display:grid;grid-template-columns:1fr 1fr;gap:13px;max-width:680px;}
    /* Toggle */
    .toggle{width:40px;height:22px;border-radius:11px;cursor:pointer;
      position:relative;transition:background .2s;flex-shrink:0;}
    .toggle-knob{width:16px;height:16px;border-radius:50%;background:#fff;position:absolute;
      top:3px;transition:left .2s;}
    /* Chat */
    .bubble-me{background:var(--accent);color:${dark ? "#070d1a" : "#fff"};border-radius:14px 14px 3px 14px;}
    .bubble-other{background:var(--surface);color:var(--text);border:1px solid var(--border);border-radius:14px 14px 14px 3px;}
    .chat-in{flex:1;padding:10px 13px;background:var(--surface);border:1px solid var(--border);
      border-radius:10px;color:var(--text);font-size:13px;font-family:'Nunito',sans-serif;outline:none;resize:none;}
    .chat-in:focus{border-color:var(--accent);}
    /* Top mobile bar */
    .topbar{display:none;position:fixed;top:0;left:0;right:0;height:54px;z-index:30;
      background:var(--sidebar);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);
      border-bottom:1px solid var(--border);align-items:center;padding:0 14px;gap:10px;}
    /* Input */
    .inp{padding:8px 12px;background:var(--surface);border:1px solid var(--border);border-radius:8px;
      color:var(--text);font-size:12.5px;font-family:'Nunito',sans-serif;outline:none;}
    .inp:focus{border-color:var(--accent);}
    /* Lang btn */
    .lang-opt{padding:7px 12px;background:transparent;border:1px solid var(--border);border-radius:8px;
      cursor:pointer;font-size:12.5px;font-family:'Nunito',sans-serif;color:var(--muted);
      transition:all .2s;display:flex;align-items:center;gap:6px;width:100%;}
    .lang-opt:hover,.lang-opt.active{border-color:var(--accent);color:var(--accent);background:var(--active);}
    /* Staff */
    .staff-card{background:var(--surface);border:1px solid var(--border);border-radius:12px;
      padding:14px;transition:border-color .2s;}
    .staff-card:hover{border-color:var(--accent);}
    .avatar{width:42px;height:42px;border-radius:50%;display:flex;align-items:center;justify-content:center;
      font-size:17px;font-weight:900;flex-shrink:0;}
    /* Alert */
    .alert-card{background:var(--surface);border:1px solid var(--border);border-radius:11px;padding:13px;
      display:flex;align-items:center;gap:12px;transition:border-color .2s;}
    .alert-card:hover{border-color:var(--accent);}
    /* Leaflet overrides */
    .leaflet-popup-content-wrapper{background:rgba(7,13,26,.96)!important;color:#e2e8f0!important;
      border:1px solid rgba(56,189,248,.3)!important;border-radius:12px!important;
      backdrop-filter:blur(12px);font-family:'Nunito',sans-serif!important;}
    .leaflet-popup-tip{background:rgba(7,13,26,.96)!important;}

    /* ── RESPONSIVE ── */
    @media(max-width:900px){
      .g4{grid-template-columns:repeat(2,1fr);}
      .g3{grid-template-columns:repeat(2,1fr);}
      .g2{grid-template-columns:1fr;}
      .g2r{grid-template-columns:1fr;}
      .g2s{grid-template-columns:1fr;}
    }
    @media(max-width:600px){
      .g4{grid-template-columns:1fr 1fr;}
      .g3{grid-template-columns:1fr 1fr;}
      .content{padding:62px 13px 22px;}
      .ptitle{font-size:20px;}
      .topbar{display:flex;}
      aside.sidebar{display:none;}
    }
    @media(min-width:601px){
      .topbar{display:none!important;}
    }
  `}</style>
  );
}

// ─── TOAST ─────────────────────────────────────────────────────────────────────
function Toast({ msg, type, onClose }) {
  const c =
    {
      info: "var(--accent)",
      success: "var(--success)",
      danger: "var(--danger)",
      warning: "var(--warning)",
    }[type] || "var(--accent)";
  return (
    <motion.div
      initial={{ x: 64, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 64, opacity: 0 }}
      onClick={onClose}
      style={{
        background: "var(--card)",
        border: `1px solid ${c}`,
        borderRadius: 12,
        padding: "10px 15px",
        display: "flex",
        alignItems: "center",
        gap: 8,
        boxShadow: "0 8px 28px rgba(0,0,0,.3)",
        maxWidth: 300,
        backdropFilter: "blur(18px)",
        cursor: "pointer",
        fontFamily: "'Nunito',sans-serif",
      }}
    >
      <span style={{ color: c, fontSize: 13 }}>●</span>
      <span
        style={{
          fontSize: 12.5,
          fontWeight: 700,
          color: "var(--text)",
          flex: 1,
        }}
      >
        {msg}
      </span>
    </motion.div>
  );
}

// ─── NOTIF PANEL ───────────────────────────────────────────────────────────────
function NotifPanel({ notifs, onClose, t }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8 }}
      style={{
        position: "absolute",
        top: 42,
        right: 0,
        width: 290,
        zIndex: 200,
        background: "var(--card)",
        border: "1px solid var(--border)",
        borderRadius: 14,
        boxShadow: "0 16px 48px rgba(0,0,0,.4)",
        backdropFilter: "blur(20px)",
        padding: 14,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 9,
        }}
      >
        <span style={{ fontWeight: 800, fontSize: 12.5 }}>
          {t.notifications}
        </span>
        <button
          className="btn btn-g"
          style={{ padding: "2px 8px", fontSize: 10 }}
          onClick={onClose}
        >
          {t.close}
        </button>
      </div>
      {notifs.length === 0 && (
        <p
          style={{
            color: "var(--muted)",
            fontSize: 12.5,
            textAlign: "center",
            padding: "14px 0",
          }}
        >
          {t.noNotif}
        </p>
      )}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 6,
          maxHeight: 300,
          overflowY: "auto",
        }}
      >
        {notifs.map((n, i) => (
          <div
            key={i}
            style={{
              padding: "8px 10px",
              borderRadius: 8,
              background: "var(--surface)",
              borderLeft: `3px solid ${n.type === "success" ? "var(--success)" : n.type === "danger" ? "var(--danger)" : "var(--accent)"}`,
            }}
          >
            <div
              style={{
                fontSize: 11.5,
                fontWeight: 800,
                color: "var(--text)",
                marginBottom: 1,
              }}
            >
              {n.msg}
            </div>
            <div style={{ fontSize: 9.5, color: "var(--muted)" }}>{n.time}</div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

// ─── STAT CARD ─────────────────────────────────────────────────────────────────
function KPI({ title, value, sub, color, icon, delay = 0, trend, spark }) {
  return (
    <motion.div
      className="card"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.28 }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <p className="slabel">{title}</p>
          <h2
            style={{
              fontSize: 27,
              fontWeight: 900,
              color: color || "var(--text)",
              letterSpacing: "-1px",
              marginTop: 1,
              fontFamily: "'Raleway',sans-serif",
              lineHeight: 1,
            }}
          >
            {value}
          </h2>
          {sub && (
            <p
              style={{
                fontSize: 10.5,
                color: "var(--muted)",
                marginTop: 2,
                fontWeight: 600,
              }}
            >
              {sub}
            </p>
          )}
          {trend !== undefined && (
            <span
              className={`trend ${trend > 0 ? "trend-up" : trend < 0 ? "trend-dn" : "trend-fl"}`}
            >
              {trend > 0 ? "▲" : trend < 0 ? "▼" : "→"} {Math.abs(trend)}%
            </span>
          )}
        </div>
        {icon && (
          <span
            style={{
              fontSize: 15,
              width: 34,
              height: 34,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "var(--surface)",
              borderRadius: 9,
              border: "1px solid var(--border)",
              flexShrink: 0,
            }}
          >
            {icon}
          </span>
        )}
      </div>
      {spark && spark.length > 1 && (
        <div style={{ marginTop: 7, height: 30 }}>
          <ResponsiveContainer width="100%" height={30}>
            <AreaChart
              data={spark}
              margin={{ top: 2, right: 0, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id={`sg${title}`} x1="0" y1="0" x2="0" y2="1">
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
                fill={`url(#sg${title})`}
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </motion.div>
  );
}

// ─── TOGGLE ────────────────────────────────────────────────────────────────────
function Toggle({ on, set }) {
  return (
    <div
      className="toggle"
      onClick={() => set(!on)}
      style={{
        background: on ? "var(--success)" : "var(--surface)",
        border: "1px solid var(--border)",
      }}
    >
      <div className="toggle-knob" style={{ left: on ? 21 : 3 }} />
    </div>
  );
}

// ─── SIDEBAR ───────────────────────────────────────────────────────────────────
function Sidebar({
  page,
  setPage,
  dark,
  setDark,
  notifCount,
  showNotif,
  setShowNotif,
  notifs,
  t,
  lang,
  mobileOpen,
  setMobileOpen,
}) {
  const NAV = [
    { id: "dashboard", icon: "⬡", label: t.dashboard, sec: t.overview },
    { id: "live", icon: "◉", label: t.liveScan },
    { id: "orders", icon: "▣", label: t.orders },
    { id: "map", icon: "◎", label: t.gpsMap },
    { id: "leaderboard", icon: "⊛", label: t.leaderboard, sec: t.analysis },
    { id: "analytics", icon: "▦", label: t.analytics },
    { id: "history", icon: "▤", label: t.history },
    { id: "chat", icon: "💬", label: t.chat },
    { id: "staff", icon: "👥", label: t.staff, sec: "HR" },
    { id: "alerts", icon: "🔔", label: t.alerts },
    { id: "settings", icon: "⚙", label: t.settings, sec: t.system },
  ];
  const Inner = () => (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        padding: "22px 10px",
      }}
    >
      <div style={{ padding: "0 10px", marginBottom: 22 }}>
        <div
          style={{
            fontSize: 9,
            letterSpacing: ".2em",
            color: "var(--muted)",
            textTransform: "uppercase",
            marginBottom: 1,
            fontWeight: 700,
          }}
        >
          {t.system}
        </div>
        <div
          style={{
            fontFamily: "'Raleway',sans-serif",
            fontSize: 17,
            fontWeight: 900,
            color: "var(--text)",
          }}
        >
          {t.appName}
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 5,
            marginTop: 4,
          }}
        >
          <span className="dot" />
          <span
            style={{ fontSize: 10, color: "var(--success)", fontWeight: 700 }}
          >
            {t.online}
          </span>
        </div>
      </div>
      <div
        style={{ padding: "0 10px", marginBottom: 10, position: "relative" }}
      >
        <button
          className="btn btn-g"
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            gap: 7,
            justifyContent: "space-between",
            padding: "7px 11px",
          }}
          onClick={() => setShowNotif((p) => !p)}
        >
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span>🔔</span>
            {t.notifications}
          </span>
          {notifCount > 0 && (
            <span
              style={{
                background: "var(--danger)",
                color: "#fff",
                borderRadius: 10,
                fontSize: 9,
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
              t={t}
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
            {item.sec && (
              <div
                style={{
                  fontSize: 8.5,
                  letterSpacing: ".18em",
                  color: "var(--muted)",
                  textTransform: "uppercase",
                  fontWeight: 700,
                  padding: "7px 12px 2px",
                  marginTop: 2,
                }}
              >
                {item.sec}
              </div>
            )}
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                setPage(item.id);
                setMobileOpen(false);
              }}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "8px 11px",
                borderRadius: 8,
                border: "none",
                cursor: "pointer",
                background: page === item.id ? "var(--active)" : "transparent",
                color: page === item.id ? "var(--accent)" : "var(--muted)",
                fontWeight: page === item.id ? 800 : 600,
                fontSize: 12,
                textAlign: "left",
                fontFamily: "'Nunito',sans-serif",
                transition: "background .15s,color .15s",
                position: "relative",
              }}
            >
              {page === item.id && (
                <motion.div
                  layoutId="nav-ind"
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
              <span style={{ fontSize: 11 }}>{item.icon}</span>
              {item.label}
            </motion.button>
          </React.Fragment>
        ))}
      </nav>
      <button
        onClick={() => setDark(!dark)}
        style={{
          marginTop: 12,
          padding: "7px 11px",
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: 8,
          color: "var(--muted)",
          fontSize: 11,
          fontWeight: 700,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: 6,
          fontFamily: "'Nunito',sans-serif",
        }}
      >
        {dark ? "☀" : "🌙"} {dark ? t.lightMode : t.darkMode}
      </button>
      <div
        style={{
          marginTop: 6,
          fontSize: 9,
          color: "var(--muted)",
          textAlign: "center",
          fontWeight: 600,
        }}
      >
        {lang.flag} {lang.name}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop */}
      <aside
        className="sidebar"
        style={{
          width: 206,
          minHeight: "100vh",
          background: "var(--sidebar)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderRight: "1px solid var(--border)",
          position: "sticky",
          top: 0,
          zIndex: 10,
          flexShrink: 0,
        }}
      >
        <Inner />
      </aside>
      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ position: "fixed", inset: 0, zIndex: 40, display: "flex" }}
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ flex: 1, background: "rgba(0,0,0,.6)" }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: 220 }}
              animate={{ x: 0 }}
              exit={{ x: 220 }}
              transition={{ type: "spring", damping: 28, stiffness: 240 }}
              style={{
                width: 220,
                background: "var(--sidebar)",
                backdropFilter: "blur(22px)",
                borderLeft: "1px solid var(--border)",
                overflow: "auto",
              }}
            >
              <Inner />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// ─── GPS HOOK ──────────────────────────────────────────────────────────────────
function useGPS(setPos, setHistory, addToast) {
  const wid = useRef(null);
  const [active, setActive] = useState(false);
  const [err, setErr] = useState(null);
  const [info, setInfo] = useState({
    accuracy: null,
    speed: null,
    heading: null,
  });

  const start = useCallback(() => {
    if (!navigator.geolocation) {
      setErr("GPS N/A");
      return;
    }
    setActive(true);
    setErr(null);
    wid.current = navigator.geolocation.watchPosition(
      (pos) => {
        const {
          latitude: lat,
          longitude: lng,
          accuracy: acc,
          heading: hdg,
          speed: spd,
        } = pos.coords;
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
        setInfo({
          accuracy: acc ? acc.toFixed(1) : null,
          speed: spd ? (spd * 3.6).toFixed(1) : null,
          heading: hdg ? hdg.toFixed(0) : null,
        });
        socket.emit("shipper_location", {
          lat,
          lng,
          accuracy: acc,
          heading: hdg,
          speed: spd,
        });
      },
      (e) => {
        setErr(e.message);
        setActive(false);
        addToast("GPS: " + e.message, "danger");
      },
      { enableHighAccuracy: true, maximumAge: 1500, timeout: 8000 },
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
  return { active, err, info, start, stop };
}

// ─── PUSH NOTIFICATIONS HOOK ────────────────────────────────────────────────
function usePush() {
  const [perm, setPerm] = useState(
    typeof Notification !== "undefined" ? Notification.permission : "default",
  );
  const request = async () => {
    if (typeof Notification === "undefined") return;
    const r = await Notification.requestPermission();
    setPerm(r);
  };
  const push = (title, body, icon = "📦") => {
    if (perm === "granted")
      new Notification(title, { body, icon: "/favicon.ico" });
  };
  return { perm, request, push };
}

// ─── MAIN APP ──────────────────────────────────────────────────────────────────
export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);
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
  const [shipperPos, setShipperPos] = useState([21.0285, 105.8542]);
  const [locHistory, setLocHistory] = useState([[21.0285, 105.8542]]);
  const [scanPoints, setScanPoints] = useState([]);
  const [hourly, setHourly] = useState(() =>
    Array.from({ length: 12 }, (_, i) => ({
      h: `${(new Date().getHours() - 11 + i + 24) % 24}h`,
      ok: 0,
      fail: 0,
    })),
  );
  const [failCnt, setFailCnt] = useState(0);
  const [alerts, setAlerts] = useState([
    { id: 1, type: "highError", threshold: 10, enabled: true, triggered: 0 },
    { id: 2, type: "noScan", threshold: 30, enabled: true, triggered: 0 },
    { id: 3, type: "offline", threshold: 5, enabled: false, triggered: 0 },
  ]);
  const [staff, setStaff] = useState([
    {
      id: 1,
      name: "Nguyễn Văn A",
      role: "admin",
      email: "a@factory.vn",
      active: true,
      scans: 0,
      avatar: "A",
      color: "#38bdf8",
      perms: {
        canScan: true,
        canExport: true,
        canManageOrders: true,
        canViewMap: true,
        canManageStaff: true,
      },
    },
    {
      id: 2,
      name: "Trần Thị B",
      role: "supervisor",
      email: "b@factory.vn",
      active: true,
      scans: 0,
      avatar: "B",
      color: "#34d399",
      perms: {
        canScan: true,
        canExport: true,
        canManageOrders: true,
        canViewMap: true,
        canManageStaff: false,
      },
    },
    {
      id: 3,
      name: "Lê Minh C",
      role: "scanner",
      email: "c@factory.vn",
      active: true,
      scans: 0,
      avatar: "C",
      color: "#fbbf24",
      perms: {
        canScan: true,
        canExport: false,
        canManageOrders: false,
        canViewMap: true,
        canManageStaff: false,
      },
    },
    {
      id: 4,
      name: "Phạm Thị D",
      role: "scanner",
      email: "d@factory.vn",
      active: false,
      scans: 0,
      avatar: "D",
      color: "#a78bfa",
      perms: {
        canScan: true,
        canExport: false,
        canManageOrders: false,
        canViewMap: false,
        canManageStaff: false,
      },
    },
  ]);

  const lang = LANGS[langCode];
  const t = lang.t;

  const addToast = (msg, type = "info") => {
    const id = Date.now();
    setToasts((p) => [...p, { id, msg, type }]);
    setTimeout(() => setToasts((p) => p.filter((x) => x.id !== id)), 4200);
  };
  const addNotif = (msg, type = "info") =>
    setNotifs((p) => [{ msg, type, time: timeNow() }, ...p].slice(0, 40));

  const gps = useGPS(setShipperPos, setLocHistory, addToast);
  const push = usePush();

  // Check alert rules
  const checkAlerts = useCallback(
    (totalScans, errCnt) => {
      setAlerts((prev) =>
        prev.map((rule) => {
          if (!rule.enabled) return rule;
          const errPct = totalScans > 0 ? (errCnt / totalScans) * 100 : 0;
          if (rule.type === "highError" && errPct >= rule.threshold) {
            addNotif(`⚠ ${t.alertHighError}: ${errPct.toFixed(1)}%`, "danger");
            push.push("⚠ Alert", `${t.alertHighError}: ${errPct.toFixed(1)}%`);
            return { ...rule, triggered: rule.triggered + 1 };
          }
          return rule;
        }),
      );
    },
    [t, push],
  );

  useEffect(() => {
    socket.on("new_scan", (data) => {
      setHistory((prev) => {
        const next = [{ ...data, ts: Date.now() }, ...prev];
        setTimeout(() => checkAlerts(next.length, failCnt), 0);
        return next;
      });
      setLastScan(data);
      setScannedList((prev) =>
        prev.includes(data.code) ? prev : [...prev, data.code],
      );
      addToast(`${t.scanOk}: ${data.code}`, "success");
      addNotif(`${t.success}: ${data.code}`, "success");
      push.push("✓ Scan OK", data.code);
      setHourly((p) => {
        const c = [...p];
        c[c.length - 1] = { ...c[c.length - 1], ok: c[c.length - 1].ok + 1 };
        return c;
      });
      setStaff((p) =>
        p.map((s, i) => (i === 0 ? { ...s, scans: s.scans + 1 } : s)),
      );
      if (data.lat && data.lng) {
        const lat = Number(data.lat),
          lng = Number(data.lng);
        if (!isNaN(lat) && !isNaN(lng)) {
          // Update GPS on scan too
          setShipperPos([lat, lng]);
          setLocHistory((prev) => [...prev, [lat, lng]]);
          setScanPoints((prev) => [
            ...prev,
            { code: data.code, time: data.time, lat, lng },
          ]);
        }
      }
      try {
        new Audio("/scan.mp3").play().catch(() => {});
      } catch (_) {}
    });
    socket.on("scan_error", (data) => {
      setFailCnt((p) => p + 1);
      setHistory((prev) => [{ ...data, ts: Date.now(), error: true }, ...prev]);
      addToast(`${t.error}: ${data.code}`, "danger");
      addNotif(`${t.error}: ${data.code}`, "danger");
      setHourly((p) => {
        const c = [...p];
        c[c.length - 1] = {
          ...c[c.length - 1],
          fail: c[c.length - 1].fail + 1,
        };
        return c;
      });
    });
    socket.on("shipper_location", (data) => {
      if (!data?.lat || !data?.lng) return;
      const lat = Number(data.lat),
        lng = Number(data.lng);
      if (isNaN(lat) || isNaN(lng)) return;
      setShipperPos([lat, lng]);
      setLocHistory((prev) => {
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
  }, [t, failCnt, checkAlerts]);

  const okCnt = history.length - failCnt;
  const errRate =
    history.length > 0 ? ((failCnt / history.length) * 100).toFixed(1) : "0.0";

  if (!loggedIn)
    return (
      <LoginPage
        onLogin={() => setLoggedIn(true)}
        t={t}
        langCode={langCode}
        setLangCode={setLangCode}
      />
    );

  const pages = {
    dashboard: (
      <Dashboard
        history={history}
        lastScan={lastScan}
        okCnt={okCnt}
        failCnt={failCnt}
        errRate={errRate}
        hourly={hourly}
        dark={dark}
        t={t}
      />
    ),
    live: <LiveScan lastScan={lastScan} history={history} t={t} />,
    orders: (
      <Orders
        orderList={orderList}
        setOrderList={setOrderList}
        scannedList={scannedList}
        addToast={addToast}
        t={t}
      />
    ),
    map: (
      <MapPage
        pos={shipperPos}
        locHistory={locHistory}
        scanPoints={scanPoints}
        gps={gps}
        t={t}
      />
    ),
    leaderboard: <Leaderboard history={history} staff={staff} t={t} />,
    analytics: (
      <Analytics
        history={history}
        hourly={hourly}
        failCnt={failCnt}
        okCnt={okCnt}
        errRate={errRate}
        t={t}
        addToast={addToast}
      />
    ),
    history: <HistoryPage history={history} t={t} />,
    chat: <ChatPage t={t} />,
    staff: (
      <StaffPage staff={staff} setStaff={setStaff} t={t} addToast={addToast} />
    ),
    alerts: (
      <AlertsPage
        alerts={alerts}
        setAlerts={setAlerts}
        t={t}
        push={push}
        addToast={addToast}
        history={history}
        failCnt={failCnt}
      />
    ),
    settings: (
      <SettingsPage
        logout={() => setLoggedIn(false)}
        dark={dark}
        setDark={setDark}
        langCode={langCode}
        setLangCode={setLangCode}
        t={t}
      />
    ),
  };

  return (
    <>
      <GlobalStyle dark={dark} />
      {/* Mobile topbar */}
      <div className="topbar">
        <button
          onClick={() => setMobileOpen(true)}
          style={{
            background: "transparent",
            border: "none",
            cursor: "pointer",
            color: "var(--text)",
            fontSize: 19,
            display: "flex",
            alignItems: "center",
          }}
        >
          ☰
        </button>
        <span
          style={{
            fontFamily: "'Raleway',sans-serif",
            fontSize: 15,
            fontWeight: 900,
            color: "var(--text)",
          }}
        >
          {t.appName}
        </span>
        <div
          style={{
            marginLeft: "auto",
            display: "flex",
            alignItems: "center",
            gap: 5,
          }}
        >
          <span className="dot" />
          <span
            style={{ fontSize: 10, color: "var(--success)", fontWeight: 700 }}
          >
            {t.online}
          </span>
        </div>
      </div>
      <div className="layout" style={{ background: "var(--bg)" }}>
        <Sidebar
          page={page}
          setPage={setPage}
          dark={dark}
          setDark={setDark}
          notifCount={notifs.filter((n) => n.type === "danger").length}
          showNotif={showNotif}
          setShowNotif={setShowNotif}
          notifs={notifs}
          t={t}
          lang={lang}
          mobileOpen={mobileOpen}
          setMobileOpen={setMobileOpen}
        />
        <main className="content">
          <AnimatePresence mode="wait">
            <motion.div
              key={page}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.16 }}
            >
              {pages[page] || pages.dashboard}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
      {/* Toasts */}
      <div
        style={{
          position: "fixed",
          bottom: 18,
          right: 18,
          zIndex: 9999,
          display: "flex",
          flexDirection: "column",
          gap: 6,
        }}
      >
        <AnimatePresence>
          {toasts.map((t) => (
            <Toast
              key={t.id}
              msg={t.msg}
              type={t.type}
              onClose={() => setToasts((p) => p.filter((x) => x.id !== t.id))}
            />
          ))}
        </AnimatePresence>
      </div>
    </>
  );
}

// ─── LOGIN ─────────────────────────────────────────────────────────────────────
function LoginPage({ onLogin, t, langCode, setLangCode }) {
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [err, setErr] = useState("");
  const go = () => {
    if (user === "admin" && pass === "admin") onLogin();
    else setErr("❌ admin / admin");
  };
  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Raleway:wght@900&family=Nunito:wght@600;700;800&display=swap');body{background:#070d1a;font-family:'Nunito',sans-serif;}`}</style>
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg,#070d1a 0%,#0d1b3e 100%)",
          padding: 16,
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: "rgba(12,20,42,.92)",
            border: "1px solid rgba(56,189,248,.18)",
            borderRadius: 20,
            padding: "34px 30px",
            width: "100%",
            maxWidth: 360,
            backdropFilter: "blur(20px)",
          }}
        >
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <div
              style={{
                fontSize: 9,
                letterSpacing: ".2em",
                color: "#475569",
                textTransform: "uppercase",
                fontWeight: 700,
                marginBottom: 3,
              }}
            >
              v4.0
            </div>
            <div
              style={{
                fontFamily: "'Raleway',sans-serif",
                fontSize: 24,
                fontWeight: 900,
                color: "#e2e8f0",
                marginBottom: 10,
              }}
            >
              AI Factory QR
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: 5,
                flexWrap: "wrap",
              }}
            >
              {Object.values(LANGS).map((l) => (
                <button
                  key={l.code}
                  onClick={() => setLangCode(l.code)}
                  style={{
                    padding: "3px 9px",
                    borderRadius: 7,
                    border: `1px solid ${langCode === l.code ? "#38bdf8" : "rgba(255,255,255,.1)"}`,
                    background:
                      langCode === l.code
                        ? "rgba(56,189,248,.14)"
                        : "transparent",
                    cursor: "pointer",
                    fontSize: 13,
                    color: langCode === l.code ? "#38bdf8" : "#475569",
                  }}
                >
                  {l.flag}
                </button>
              ))}
            </div>
          </div>
          {[
            { ph: "admin", val: user, set: setUser, type: "text" },
            { ph: "••••••", val: pass, set: setPass, type: "password" },
          ].map((f, i) => (
            <input
              key={i}
              value={f.val}
              onChange={(e) => f.set(e.target.value)}
              type={f.type}
              placeholder={f.ph}
              onKeyDown={(e) => e.key === "Enter" && go()}
              style={{
                width: "100%",
                padding: "11px 13px",
                background: "rgba(255,255,255,.04)",
                border: "1px solid rgba(56,189,248,.2)",
                borderRadius: 10,
                color: "#e2e8f0",
                fontSize: 14,
                fontFamily: "'Nunito',sans-serif",
                outline: "none",
                marginBottom: 10,
                display: "block",
                boxSizing: "border-box",
              }}
            />
          ))}
          {err && (
            <div
              style={{
                color: "#f87171",
                fontSize: 12,
                fontWeight: 600,
                marginBottom: 9,
                textAlign: "center",
              }}
            >
              {err}
            </div>
          )}
          <button
            onClick={go}
            style={{
              width: "100%",
              padding: "12px",
              background: "#38bdf8",
              border: "none",
              borderRadius: 10,
              color: "#070d1a",
              fontWeight: 900,
              fontSize: 14,
              cursor: "pointer",
              fontFamily: "'Nunito',sans-serif",
            }}
          >
            {t.login}
          </button>
          <div
            style={{
              textAlign: "center",
              marginTop: 12,
              fontSize: 10.5,
              color: "#475569",
            }}
          >
            admin / admin
          </div>
        </motion.div>
      </div>
    </>
  );
}

// ─── DASHBOARD ─────────────────────────────────────────────────────────────────
function Dashboard({
  history,
  lastScan,
  okCnt,
  failCnt,
  errRate,
  hourly,
  dark,
  t,
}) {
  const spark = history
    .slice(0, 12)
    .reverse()
    .map((_, i) => ({ v: i + 1 }));
  const pie = [
    { name: t.success, value: okCnt, color: "#34d399" },
    { name: t.failed, value: failCnt, color: "#f87171" },
  ];
  const insights = [
    {
      type: "success",
      icon: "🧠",
      title: t.goodPerf,
      desc: `${okCnt} ${t.success}`,
    },
    { type: "warning", icon: "⚡", title: t.loadForecast, desc: "500+ @17:00" },
    {
      type: "info",
      icon: "📍",
      title: t.gpsAccurate,
      desc: `${history.filter((h) => h.lat).length} GPS pts`,
    },
  ];
  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 20,
        }}
      >
        <div>
          <p className="slabel">{t.overview}</p>
          <h1 className="ptitle">{t.dashboard}</h1>
          <p style={{ color: "var(--muted)", fontSize: 12.5, fontWeight: 500 }}>
            QR Scan Monitor — Real-time
          </p>
        </div>
        <span className="badge b-ok">
          <span className="dot" style={{ width: 6, height: 6 }} /> Live
        </span>
      </div>
      <div className="g4" style={{ marginBottom: 12 }}>
        <KPI
          title={t.totalScans}
          value={fmtNum(history.length)}
          icon="⬡"
          delay={0}
          trend={12}
          spark={spark}
        />
        <KPI
          title={t.success}
          value={fmtNum(okCnt)}
          icon="✓"
          color="var(--success)"
          sub={t.today}
          delay={0.05}
          trend={5}
        />
        <KPI
          title={t.failed}
          value={fmtNum(failCnt)}
          icon="✕"
          color="var(--danger)"
          delay={0.1}
          trend={-2}
        />
        <KPI
          title={t.errorRate}
          value={`${errRate}%`}
          icon="◎"
          color={parseFloat(errRate) > 5 ? "var(--danger)" : "var(--success)"}
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
              border: "1px solid rgba(52,211,153,.22)",
              borderRadius: 12,
              padding: "10px 16px",
              display: "flex",
              alignItems: "center",
              gap: 11,
              marginBottom: 4,
              flexWrap: "wrap",
            }}
          >
            <span className="dot" />
            <div>
              <span
                style={{
                  fontSize: 9,
                  color: "var(--muted)",
                  fontWeight: 800,
                  letterSpacing: ".1em",
                  textTransform: "uppercase",
                }}
              >
                {t.lastScan}
              </span>
              <div
                style={{
                  fontSize: 14,
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
                  fontSize: 10,
                  color: "var(--accent)",
                  fontFamily: "'JetBrains Mono',monospace",
                }}
              >
                📍 {Number(lastScan.lat).toFixed(5)},{" "}
                {Number(lastScan.lng).toFixed(5)}
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
              marginBottom: 12,
            }}
          >
            <div>
              <p className="slabel">{t.activity}</p>
              <h3 style={{ fontWeight: 800, fontSize: 13 }}>{t.hourlyChart}</h3>
            </div>
            <span className="badge b-info">
              {history.length} {t.events}
            </span>
          </div>
          <ResponsiveContainer width="100%" height={185}>
            <BarChart data={hourly} barGap={2}>
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
                stroke="var(--border)"
                vertical={false}
              />
              <XAxis
                dataKey="h"
                tick={{ fontSize: 9, fill: "var(--muted)" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 9, fill: "var(--muted)" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  background: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: 9,
                  fontSize: 12,
                  fontFamily: "Nunito",
                  color: "var(--text)",
                }}
              />
              <Bar
                dataKey="ok"
                name={t.success}
                fill="url(#gOk)"
                radius={[3, 3, 0, 0]}
              />
              <Bar
                dataKey="fail"
                name={t.failed}
                fill="url(#gFail)"
                radius={[3, 3, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div
          className="panel"
          style={{ display: "flex", flexDirection: "column" }}
        >
          <p className="slabel" style={{ marginBottom: 6 }}>
            {t.resultDist}
          </p>
          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <PieChart width={170} height={150}>
              <Pie
                data={pie}
                cx={85}
                cy={75}
                innerRadius={44}
                outerRadius={70}
                paddingAngle={3}
                dataKey="value"
              >
                {pie.map((e, i) => (
                  <Cell key={i} fill={e.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: 9,
                  fontSize: 11,
                  fontFamily: "Nunito",
                  color: "var(--text)",
                }}
              />
            </PieChart>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {pie.map((d, i) => (
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
                      fontSize: 11.5,
                      color: "var(--muted)",
                      fontWeight: 600,
                    }}
                  >
                    {d.name}
                  </span>
                </div>
                <span
                  style={{ fontSize: 12.5, fontWeight: 800, color: d.color }}
                >
                  {d.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="panel">
        <p className="slabel" style={{ marginBottom: 11 }}>
          🧠 {t.aiInsights}
        </p>
        <div className="g3">
          {insights.map((ins, i) => (
            <motion.div
              key={i}
              className="ins-card fu"
              style={{
                borderColor:
                  ins.type === "success"
                    ? "rgba(52,211,153,.28)"
                    : ins.type === "warning"
                      ? "rgba(251,191,36,.28)"
                      : "rgba(56,189,248,.28)",
                background:
                  ins.type === "success"
                    ? "rgba(52,211,153,.04)"
                    : ins.type === "warning"
                      ? "rgba(251,191,36,.04)"
                      : "rgba(56,189,248,.04)",
                animationDelay: `${i * 0.08}s`,
              }}
            >
              <div style={{ fontSize: 16, marginBottom: 5 }}>{ins.icon}</div>
              <div style={{ fontSize: 11.5, fontWeight: 800, marginBottom: 3 }}>
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

// ─── LIVE SCAN ──────────────────────────────────────────────────────────────────
function LiveScan({ lastScan, history, t }) {
  const [flash, setFlash] = useState(false);
  const prev = useRef(null);
  useEffect(() => {
    if (lastScan && lastScan.code !== prev.current) {
      prev.current = lastScan.code;
      setFlash(true);
      setTimeout(() => setFlash(false), 700);
    }
  }, [lastScan]);
  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <p className="slabel">{t.realtime}</p>
        <h1 className="ptitle">{t.liveMonitor}</h1>
      </div>
      <div className="g2">
        <div
          className="panel panel-0"
          style={{
            minHeight: 270,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {lastScan ? (
            <motion.div
              key={lastScan.code}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              style={{ textAlign: "center" }}
            >
              <p className="slabel" style={{ marginBottom: 8 }}>
                {t.lastScan}
              </p>
              <div
                className={flash ? "sf" : ""}
                style={{
                  fontSize: 21,
                  fontWeight: 700,
                  color: "var(--accent)",
                  fontFamily: "'JetBrains Mono',monospace",
                  padding: "15px 20px",
                  background: "var(--surface)",
                  borderRadius: 12,
                  border: "1px solid var(--border)",
                  marginBottom: 11,
                }}
              >
                {lastScan.code}
              </div>
              <span className="badge b-ok" style={{ marginBottom: 8 }}>
                ◉ {t.scanOk}
              </span>
              {lastScan.time && (
                <p
                  style={{
                    fontSize: 11,
                    color: "var(--muted)",
                    marginTop: 6,
                    fontWeight: 600,
                  }}
                >
                  {lastScan.time}
                </p>
              )}
              {lastScan.lat && (
                <p
                  style={{
                    fontSize: 10,
                    color: "var(--accent)",
                    marginTop: 4,
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
              <div style={{ fontSize: 38, marginBottom: 8, opacity: 0.1 }}>
                ◈
              </div>
              <p
                style={{ color: "var(--muted)", fontSize: 13, fontWeight: 600 }}
              >
                {t.waitScanner}
              </p>
            </div>
          )}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div className="panel panel-0">
            <p className="slabel" style={{ marginBottom: 9 }}>
              {t.connectionStatus}
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {[
                { l: "WebSocket", s: t.connected, ok: true },
                { l: "GPS", s: t.tracking, ok: true },
                { l: "Database", s: t.active, ok: true },
                { l: "Scanner", s: t.ready, ok: true },
              ].map((item) => (
                <div
                  key={item.l}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "8px 11px",
                    background: "var(--surface)",
                    borderRadius: 8,
                  }}
                >
                  <span style={{ fontSize: 12, fontWeight: 700 }}>
                    {item.l}
                  </span>
                  <span className={`badge ${item.ok ? "b-ok" : "b-fail"}`}>
                    {item.ok ? "◉" : "◎"} {item.s}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className="panel panel-0" style={{ flex: 1 }}>
            <p className="slabel" style={{ marginBottom: 9 }}>
              {t.recentScans}
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              {history.length === 0 && (
                <p
                  style={{
                    color: "var(--muted)",
                    fontSize: 12.5,
                    textAlign: "center",
                    padding: "10px 0",
                  }}
                >
                  {t.noData}
                </p>
              )}
              {history.slice(0, 8).map((s, i) => (
                <div
                  key={i}
                  className="si"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "6px 9px",
                    background: "var(--surface)",
                    borderRadius: 7,
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
                    className={`badge ${s.error ? "b-fail" : "b-ok"}`}
                    style={{ fontSize: 8 }}
                  >
                    {s.error ? `✕ ${t.error}` : "✓ OK"}
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

// ─── ORDERS ────────────────────────────────────────────────────────────────────
function Orders({ orderList, setOrderList, scannedList, addToast, t }) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const done = orderList.filter((o) => scannedList.includes(o.QR)).length;
  const prog = orderList.length > 0 ? (done / orderList.length) * 100 : 0;
  const upload = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = (ev) => {
      const wb = XLSX.read(new Uint8Array(ev.target.result), { type: "array" });
      const json = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
      setOrderList(json);
      addToast(`✓ ${json.length} ${t.totalOrders}`, "success");
    };
    r.readAsArrayBuffer(f);
  };
  const exp = () => {
    const data = orderList.map((o) => ({
      ...o,
      [t.status]: scannedList.includes(o.QR) ? t.scanned : t.pending,
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, t.orders);
    XLSX.writeFile(wb, `orders_${Date.now()}.xlsx`);
    addToast(t.exportExcel + " ✓", "success");
  };
  const rows = orderList.filter((o) => {
    const ms =
      !search ||
      (o.Customer || "").toLowerCase().includes(search.toLowerCase()) ||
      (o.QR || "").toLowerCase().includes(search.toLowerCase());
    const isDone = scannedList.includes(o.QR);
    const mf =
      filter === "all" ||
      (filter === "scanned" && isDone) ||
      (filter === "pending" && !isDone);
    return ms && mf;
  });
  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <p className="slabel">{t.management}</p>
        <h1 className="ptitle">{t.orders}</h1>
      </div>
      <div className="g3" style={{ marginBottom: 12 }}>
        <KPI
          title={t.totalOrders}
          value={orderList.length}
          icon="▣"
          delay={0}
        />
        <KPI
          title={t.scanned}
          value={done}
          icon="✓"
          color="var(--success)"
          delay={0.05}
        />
        <KPI
          title={t.pending}
          value={orderList.length - done}
          icon="◎"
          color="var(--warning)"
          delay={0.1}
        />
      </div>
      {orderList.length > 0 && (
        <div className="panel panel-0">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 6,
            }}
          >
            <span style={{ fontSize: 12, fontWeight: 700 }}>
              {t.completion}
            </span>
            <span
              style={{ fontSize: 12, fontWeight: 900, color: "var(--success)" }}
            >
              {prog.toFixed(1)}%
            </span>
          </div>
          <div className="bar-bg">
            <div
              className="bar"
              style={{
                width: `${prog}%`,
                background:
                  "linear-gradient(90deg,var(--success),var(--accent))",
              }}
            />
          </div>
        </div>
      )}
      <div
        style={{
          display: "flex",
          gap: 8,
          alignItems: "center",
          marginTop: 14,
          marginBottom: 4,
          flexWrap: "wrap",
        }}
      >
        <label className="upload">
          <input type="file" accept=".xlsx,.xls" onChange={upload} />⊕{" "}
          {t.uploadExcel}
        </label>
        {orderList.length > 0 && (
          <button className="btn btn-g" onClick={exp}>
            ⬇ {t.exportExcel}
          </button>
        )}
        <input
          className="inp"
          placeholder={t.search}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: 170 }}
        />
        {["all", "scanned", "pending"].map((f) => (
          <button
            key={f}
            className={`btn ${filter === f ? "btn-a" : "btn-g"}`}
            style={{ padding: "6px 12px", fontSize: 11 }}
            onClick={() => setFilter(f)}
          >
            {f === "all" ? t.all : f === "scanned" ? t.scanned : t.pending}
          </button>
        ))}
      </div>
      <div className="panel">
        <div className="tbl-wrap">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>{t.customer}</th>
                <th>{t.qrCode}</th>
                <th>{t.status}</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    style={{
                      textAlign: "center",
                      color: "var(--muted)",
                      padding: "28px 0",
                      fontWeight: 600,
                    }}
                  >
                    {orderList.length === 0 ? t.noOrders : t.noResults}
                  </td>
                </tr>
              ) : (
                rows.map((o, i) => {
                  const isDone = scannedList.includes(o.QR);
                  return (
                    <motion.tr
                      key={i}
                      initial={{ opacity: 0, x: -4 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.01 }}
                    >
                      <td
                        style={{
                          color: "var(--muted)",
                          fontFamily: "'JetBrains Mono',monospace",
                          fontSize: 10,
                        }}
                      >
                        {String(i + 1).padStart(3, "0")}
                      </td>
                      <td style={{ fontWeight: 700 }}>{o.Customer}</td>
                      <td
                        style={{
                          fontFamily: "'JetBrains Mono',monospace",
                          fontSize: 11,
                          color: "var(--accent)",
                          fontWeight: 700,
                        }}
                      >
                        {o.QR}
                      </td>
                      <td>
                        <span className={`badge ${isDone ? "b-ok" : "b-warn"}`}>
                          {isDone ? `✓ ${t.scanned}` : `⏳ ${t.pending}`}
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

// ─── MAP PAGE ──────────────────────────────────────────────────────────────────
function MapPage({ pos, locHistory, scanPoints, gps, t }) {
  const dist =
    locHistory.length < 2
      ? 0
      : locHistory.reduce((acc, cur, i) => {
          if (i === 0) return 0;
          const p = locHistory[i - 1],
            R = 6371000,
            dLat = ((cur[0] - p[0]) * Math.PI) / 180,
            dLng = ((cur[1] - p[1]) * Math.PI) / 180;
          const a =
            Math.sin(dLat / 2) ** 2 +
            Math.cos((p[0] * Math.PI) / 180) *
              Math.cos((cur[0] * Math.PI) / 180) *
              Math.sin(dLng / 2) ** 2;
          return acc + R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        }, 0);
  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <p className="slabel">{t.transport}</p>
        <h1 className="ptitle">{t.deliveryTracking}</h1>
      </div>
      {/* GPS controls */}
      <div
        className="panel panel-0"
        style={{
          marginBottom: 12,
          display: "flex",
          alignItems: "center",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <div style={{ flex: 1, minWidth: 200 }}>
          <p className="slabel" style={{ marginBottom: 5 }}>
            GPS Browser Tracking
          </p>
          <div
            style={{
              display: "flex",
              gap: 7,
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            {!gps.active ? (
              <button className="btn btn-s" onClick={gps.start}>
                📍 {t.startGPS}
              </button>
            ) : (
              <button className="btn btn-d" onClick={gps.stop}>
                ⏹ {t.stopGPS}
              </button>
            )}
            {gps.active && (
              <span className="badge b-ok">
                <span className="dot" style={{ width: 6, height: 6 }} />{" "}
                {t.live}
              </span>
            )}
            {gps.err && <span className="badge b-fail">⚠ GPS Error</span>}
          </div>
        </div>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          {gps.info.accuracy && (
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  fontSize: 8.5,
                  color: "var(--muted)",
                  fontWeight: 700,
                  textTransform: "uppercase",
                }}
              >
                {t.accuracy}
              </div>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 900,
                  color: "var(--success)",
                  fontFamily: "'JetBrains Mono',monospace",
                }}
              >
                {gps.info.accuracy}m
              </div>
            </div>
          )}
          {gps.info.speed && (
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  fontSize: 8.5,
                  color: "var(--muted)",
                  fontWeight: 700,
                  textTransform: "uppercase",
                }}
              >
                {t.speed}
              </div>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 900,
                  color: "var(--accent)",
                  fontFamily: "'JetBrains Mono',monospace",
                }}
              >
                {gps.info.speed} km/h
              </div>
            </div>
          )}
          {gps.info.heading && (
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  fontSize: 8.5,
                  color: "var(--muted)",
                  fontWeight: 700,
                  textTransform: "uppercase",
                }}
              >
                {t.heading}
              </div>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 900,
                  color: "var(--warning)",
                  fontFamily: "'JetBrains Mono',monospace",
                }}
              >
                {gps.info.heading}°
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="g3" style={{ marginBottom: 12 }}>
        <KPI
          title={t.latitude}
          value={pos[0].toFixed(5)}
          sub={`Lng: ${pos[1].toFixed(5)}`}
          color="var(--accent)"
          icon="📍"
          delay={0}
        />
        <KPI
          title={t.status}
          value={gps.active ? t.live : t.ready}
          sub={t.tracking}
          color="var(--success)"
          icon="◉"
          delay={0.05}
        />
        <KPI
          title={t.distance}
          value={
            dist < 1000
              ? `${dist.toFixed(0)}m`
              : `${(dist / 1000).toFixed(2)}km`
          }
          sub={`${scanPoints.length} pts`}
          color="var(--warning)"
          icon="⊛"
          delay={0.1}
        />
      </div>
      <div
        style={{
          borderRadius: 16,
          overflow: "hidden",
          border: "1px solid var(--border)",
          boxShadow: "0 8px 28px rgba(0,0,0,.25)",
        }}
      >
        <MapContainer
          center={pos}
          zoom={14}
          style={{ height: 400, width: "100%" }}
        >
          <TileLayer
            attribution="© OpenStreetMap"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapAutoCenter position={pos} />
          {locHistory.length > 1 && (
            <Polyline
              positions={locHistory}
              pathOptions={{
                color: "#38bdf8",
                weight: 3,
                opacity: 0.8,
                dashArray: "6 4",
              }}
            />
          )}
          <Marker position={pos} icon={shipperIcon}>
            <Popup>
              <div style={{ fontFamily: "'Nunito',sans-serif", minWidth: 150 }}>
                <div
                  style={{ fontWeight: 800, marginBottom: 4, color: "#34d399" }}
                >
                  📦 {t.shipperPos}
                </div>
                <div style={{ fontSize: 11, color: "#94a3b8" }}>
                  Lat: {pos[0].toFixed(6)}
                </div>
                <div style={{ fontSize: 11, color: "#94a3b8" }}>
                  Lng: {pos[1].toFixed(6)}
                </div>
                {gps.info.accuracy && (
                  <div
                    style={{ fontSize: 10.5, color: "#38bdf8", marginTop: 3 }}
                  >
                    ±{gps.info.accuracy}m
                  </div>
                )}
              </div>
            </Popup>
          </Marker>
          {scanPoints.map((sp, i) => (
            <Marker key={i} position={[sp.lat, sp.lng]} icon={qrIcon}>
              <Popup>
                <div
                  style={{ fontFamily: "'Nunito',sans-serif", minWidth: 150 }}
                >
                  <div
                    style={{
                      fontWeight: 800,
                      marginBottom: 3,
                      color: "#38bdf8",
                    }}
                  >
                    ◈ {t.scanPoint} #{i + 1}
                  </div>
                  <div
                    style={{
                      fontFamily: "'JetBrains Mono',monospace",
                      fontSize: 11,
                      color: "#7dd3fc",
                      marginBottom: 3,
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
          <p className="slabel" style={{ marginBottom: 9 }}>
            {t.scanHistory}
          </p>
          <div className="tbl-wrap">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>{t.qrCode}</th>
                  <th>Lat</th>
                  <th>Lng</th>
                  <th>{t.time}</th>
                </tr>
              </thead>
              <tbody>
                {scanPoints.map((sp, i) => (
                  <tr key={i}>
                    <td
                      style={{
                        color: "var(--muted)",
                        fontFamily: "'JetBrains Mono',monospace",
                        fontSize: 10,
                      }}
                    >
                      {String(i + 1).padStart(3, "0")}
                    </td>
                    <td
                      style={{
                        fontFamily: "'JetBrains Mono',monospace",
                        fontSize: 10.5,
                        color: "var(--accent)",
                        fontWeight: 700,
                      }}
                    >
                      {sp.code}
                    </td>
                    <td
                      style={{
                        fontFamily: "'JetBrains Mono',monospace",
                        fontSize: 10,
                      }}
                    >
                      {sp.lat.toFixed(6)}
                    </td>
                    <td
                      style={{
                        fontFamily: "'JetBrains Mono',monospace",
                        fontSize: 10,
                      }}
                    >
                      {sp.lng.toFixed(6)}
                    </td>
                    <td
                      style={{
                        fontSize: 11,
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

// ─── LEADERBOARD ───────────────────────────────────────────────────────────────
function Leaderboard({ history, staff, t }) {
  const boards = staff
    .map((s, i) => ({
      ...s,
      pts: history.length > 0 ? Math.floor((history.length / (i + 1)) * 10) : 0,
      ok: history.length > 0 ? Math.floor(history.length / (i + 1)) : 0,
    }))
    .sort((a, b) => b.pts - a.pts);
  const max = Math.max(1, ...boards.map((b) => b.pts));
  const medals = ["🥇", "🥈", "🥉"];
  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <p className="slabel">{t.analysis}</p>
        <h1 className="ptitle">{t.scannerLeaderboard}</h1>
        <p style={{ color: "var(--muted)", fontSize: 12.5, fontWeight: 500 }}>
          {t.realtimeRank}
        </p>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1.1fr 1fr",
          gap: 10,
          marginBottom: 14,
        }}
      >
        {[1, 0, 2].map((idx) => {
          const p = boards[idx];
          if (!p) return <div key={idx} />;
          return (
            <motion.div
              key={p.name}
              className="card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.06 }}
              style={{ textAlign: "center" }}
            >
              <div style={{ fontSize: 24, marginBottom: 5 }}>{medals[idx]}</div>
              <div
                style={{
                  width: 46,
                  height: 46,
                  borderRadius: "50%",
                  margin: "0 auto 8px",
                  background: p.color + "22",
                  border: `2px solid ${p.color}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 17,
                  fontWeight: 900,
                  color: p.color,
                }}
              >
                {p.avatar}
              </div>
              <div style={{ fontSize: 12.5, fontWeight: 800 }}>{p.name}</div>
              <div
                style={{ fontSize: 10.5, color: "var(--muted)", marginTop: 2 }}
              >
                {p.ok} scans
              </div>
              <div
                style={{
                  fontSize: 19,
                  fontWeight: 900,
                  color: "var(--warning)",
                  marginTop: 5,
                  fontFamily: "'Raleway',sans-serif",
                }}
              >
                {p.pts}
              </div>
              <div style={{ fontSize: 9, color: "var(--muted)" }}>
                {t.points}
              </div>
              {p.streak > 0 && (
                <span
                  className="badge b-ok"
                  style={{ marginTop: 7, fontSize: 9 }}
                >
                  🔥 {p.streak} {t.streak}
                </span>
              )}
            </motion.div>
          );
        })}
      </div>
      <div className="panel">
        <p className="slabel" style={{ marginBottom: 11 }}>
          {t.fullRank}
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {boards.map((p, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 11,
                padding: "11px 14px",
                background: "var(--surface)",
                borderRadius: 10,
                border: `1px solid ${i === 0 ? "rgba(251,191,36,.22)" : "transparent"}`,
              }}
            >
              <span style={{ fontSize: 16, width: 24, textAlign: "center" }}>
                {medals[i] || i + 1}
              </span>
              <div
                className="avatar"
                style={{
                  background: p.color + "22",
                  border: `2px solid ${p.color}`,
                  color: p.color,
                }}
              >
                {p.avatar}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12.5, fontWeight: 800 }}>{p.name}</div>
                <div
                  style={{ fontSize: 10, color: "var(--muted)", marginTop: 1 }}
                >
                  {p.ok} OK · {p.streak || 0} {t.days}
                </div>
                <div className="bar-bg" style={{ marginTop: 4, height: 3 }}>
                  <div
                    className="bar"
                    style={{
                      width: `${(p.pts / max) * 100}%`,
                      background:
                        "linear-gradient(90deg,var(--success),var(--accent))",
                    }}
                  />
                </div>
              </div>
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <div
                  style={{
                    fontSize: 18,
                    fontWeight: 900,
                    color: "var(--warning)",
                    fontFamily: "'Raleway',sans-serif",
                  }}
                >
                  {p.pts}
                </div>
                <div style={{ fontSize: 9, color: "var(--muted)" }}>
                  {t.points}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── ANALYTICS + PDF EXPORT ─────────────────────────────────────────────────────
function Analytics({ history, hourly, failCnt, okCnt, errRate, t, addToast }) {
  const [genPDF, setGenPDF] = useState(false);
  const rateData = hourly.map((h) => ({
    h: h.h,
    rate: h.ok + h.fail > 0 ? ((h.fail / (h.ok + h.fail)) * 100).toFixed(1) : 0,
  }));

  const exportPDF = async () => {
    setGenPDF(true);
    // Build HTML report and open print dialog
    const now = new Date().toLocaleString();
    const rows = hourly
      .map((h) => {
        const tot = h.ok + h.fail;
        const r = tot > 0 ? ((h.fail / tot) * 100).toFixed(1) : "0.0";
        return `<tr><td>${h.h}</td><td style="color:#34d399">${h.ok}</td><td style="color:#f87171">${h.fail}</td><td>${tot}</td><td>${r}%</td></tr>`;
      })
      .join("");
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${t.reportTitle}</title>
    <style>body{font-family:Arial,sans-serif;padding:30px;color:#0f172a;}h1{color:#6366f1;margin-bottom:4px;}
    .meta{color:#94a3b8;font-size:13px;margin-bottom:24px;}
    .kpis{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:24px;}
    .kpi{background:#f1f5f9;border-radius:10px;padding:14px;text-align:center;}
    .kpi .v{font-size:28px;font-weight:900;color:#6366f1;}
    .kpi .l{font-size:11px;color:#94a3b8;font-weight:700;text-transform:uppercase;}
    table{width:100%;border-collapse:collapse;}th,td{padding:9px 12px;border:1px solid #e2e8f0;font-size:13px;}
    th{background:#f1f5f9;font-weight:800;}tr:nth-child(even){background:#f8fafc;}
    .footer{margin-top:20px;font-size:11px;color:#94a3b8;}
    @media print{body{padding:15px;}}</style></head><body>
    <h1>🏭 ${t.reportTitle}</h1><div class="meta">AI Factory QR Dashboard — ${now}</div>
    <div class="kpis">
      <div class="kpi"><div class="v">${history.length}</div><div class="l">${t.totalScans}</div></div>
      <div class="kpi"><div class="v" style="color:#10b981">${okCnt}</div><div class="l">${t.success}</div></div>
      <div class="kpi"><div class="v" style="color:#ef4444">${failCnt}</div><div class="l">${t.failed}</div></div>
      <div class="kpi"><div class="v" style="color:${parseFloat(errRate) > 5 ? "#ef4444" : "#10b981"}">${errRate}%</div><div class="l">${t.errorRate}</div></div>
    </div>
    <h3>${t.hourlyStats}</h3>
    <table><thead><tr><th>${t.hour}</th><th>${t.success}</th><th>${t.failed}</th><th>${t.total}</th><th>${t.errorRate}</th></tr></thead>
    <tbody>${rows}</tbody></table>
    <div class="footer">Generated by AI Factory QR Dashboard v4.0 · ${now}</div>
    </body></html>`;
    const w = window.open("", "_blank", "width=900,height=700");
    if (w) {
      w.document.write(html);
      w.document.close();
      setTimeout(() => {
        w.print();
      }, 400);
    }
    setGenPDF(false);
    addToast(t.reportGenerated, "success");
  };

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 20,
          flexWrap: "wrap",
          gap: 10,
        }}
      >
        <div>
          <p className="slabel">{t.analysis}</p>
          <h1 className="ptitle">{t.advancedAnalytics}</h1>
        </div>
        <button
          className="btn btn-a"
          onClick={exportPDF}
          disabled={genPDF}
          style={{ display: "flex", alignItems: "center", gap: 6 }}
        >
          {genPDF ? `⏳ ${t.generating}` : `📄 ${t.exportPDF}`}
        </button>
      </div>
      <div className="g4" style={{ marginBottom: 12 }}>
        <KPI
          title={t.totalScans}
          value={fmtNum(history.length)}
          icon="⬡"
          delay={0}
        />
        <KPI
          title={t.success}
          value={fmtNum(okCnt)}
          icon="✓"
          color="var(--success)"
          delay={0.05}
        />
        <KPI
          title={t.failed}
          value={fmtNum(failCnt)}
          icon="✕"
          color="var(--danger)"
          delay={0.1}
        />
        <KPI
          title={t.errorRate}
          value={`${errRate}%`}
          icon="◎"
          color={parseFloat(errRate) > 5 ? "var(--danger)" : "var(--success)"}
          delay={0.15}
        />
      </div>
      <div className="g2" style={{ marginBottom: 12 }}>
        <div className="panel panel-0">
          <p className="slabel" style={{ marginBottom: 10 }}>
            {t.errorTrend}
          </p>
          <ResponsiveContainer width="100%" height={165}>
            <LineChart data={rateData}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--border)"
                vertical={false}
              />
              <XAxis
                dataKey="h"
                tick={{ fontSize: 9, fill: "var(--muted)" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 9, fill: "var(--muted)" }}
                axisLine={false}
                tickLine={false}
                unit="%"
              />
              <Tooltip
                contentStyle={{
                  background: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: 9,
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
                name={t.errorRate}
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
          <p className="slabel" style={{ marginBottom: 7 }}>
            {t.overallPerf}
          </p>
          <RadialBarChart
            width={180}
            height={145}
            innerRadius={46}
            outerRadius={74}
            data={[
              {
                name: "OK",
                value:
                  history.length > 0
                    ? Math.round((okCnt / history.length) * 100)
                    : 100,
                fill: "#34d399",
              },
            ]}
            startAngle={180}
            endAngle={0}
          >
            <RadialBar dataKey="value" cornerRadius={7} />
          </RadialBarChart>
          <div style={{ textAlign: "center", marginTop: -6 }}>
            <div
              style={{
                fontSize: 24,
                fontWeight: 900,
                color: "var(--success)",
                fontFamily: "'Raleway',sans-serif",
              }}
            >
              {history.length > 0
                ? Math.round((okCnt / history.length) * 100)
                : 100}
              %
            </div>
            <div
              style={{ fontSize: 11, color: "var(--muted)", fontWeight: 600 }}
            >
              {t.successRate}
            </div>
          </div>
        </div>
      </div>
      <div className="panel panel-0">
        <p className="slabel" style={{ marginBottom: 10 }}>
          {t.hourlyStats}
        </p>
        <div className="tbl-wrap">
          <table>
            <thead>
              <tr>
                <th>{t.hour}</th>
                <th>{t.success}</th>
                <th>{t.failed}</th>
                <th>{t.total}</th>
                <th>{t.errorRate}</th>
              </tr>
            </thead>
            <tbody>
              {hourly.map((h, i) => {
                const tot = h.ok + h.fail;
                const r = tot > 0 ? ((h.fail / tot) * 100).toFixed(1) : "0.0";
                return (
                  <tr key={i}>
                    <td
                      style={{
                        fontFamily: "'JetBrains Mono',monospace",
                        fontSize: 11,
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
                        className={`badge ${parseFloat(r) > 5 ? "b-fail" : parseFloat(r) > 0 ? "b-warn" : "b-ok"}`}
                      >
                        {r}%
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

// ─── HISTORY ───────────────────────────────────────────────────────────────────
function HistoryPage({ history, t }) {
  const [search, setSearch] = useState("");
  const rows = history.filter(
    (h) =>
      !search || (h.code || "").toLowerCase().includes(search.toLowerCase()),
  );
  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <p className="slabel">{t.log}</p>
        <h1 className="ptitle">{t.scanHistory2}</h1>
      </div>
      <div
        style={{
          display: "flex",
          gap: 8,
          marginBottom: 4,
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <input
          className="inp"
          placeholder={t.searchQR}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: 210 }}
        />
        <span className="badge b-info">
          {rows.length} {t.records}
        </span>
      </div>
      <div className="panel">
        <div className="tbl-wrap">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>{t.qrCode}</th>
                <th>{t.time}</th>
                <th>{t.gps}</th>
                <th>{t.status}</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    style={{
                      textAlign: "center",
                      color: "var(--muted)",
                      padding: "28px 0",
                      fontWeight: 600,
                    }}
                  >
                    {t.noData}
                  </td>
                </tr>
              ) : (
                rows.map((h, i) => (
                  <motion.tr
                    key={i}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.007 }}
                  >
                    <td
                      style={{
                        color: "var(--muted)",
                        fontFamily: "'JetBrains Mono',monospace",
                        fontSize: 10,
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
                      {h.code}
                    </td>
                    <td
                      style={{
                        fontSize: 11,
                        color: "var(--muted)",
                        fontWeight: 600,
                      }}
                    >
                      {h.time || "—"}
                    </td>
                    <td
                      style={{
                        fontSize: 10,
                        fontFamily: "'JetBrains Mono',monospace",
                        color: h.lat ? "var(--success)" : "var(--muted)",
                      }}
                    >
                      {h.lat
                        ? `${Number(h.lat).toFixed(4)},${Number(h.lng).toFixed(4)}`
                        : "—"}
                    </td>
                    <td>
                      <span className={`badge ${h.error ? "b-fail" : "b-ok"}`}>
                        {h.error ? `✕ ${t.error}` : "✓ OK"}
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

// ─── CHAT ──────────────────────────────────────────────────────────────────────
function ChatPage({ t }) {
  const [msgs, setMsgs] = useState([
    {
      id: 1,
      from: "sys",
      name: "System",
      text: "👋 Welcome to internal chat!",
      time: timeNow(),
    },
    {
      id: 2,
      from: "other",
      name: "Nguyễn Văn A",
      text: "Xin chào mọi người!",
      time: timeNow(),
    },
    {
      id: 3,
      from: "other",
      name: "Trần Thị B",
      text: "Đã sẵn sàng ca làm việc hôm nay 💪",
      time: timeNow(),
    },
  ]);
  const [input, setInput] = useState("");
  const end = useRef(null);
  useEffect(() => end.current?.scrollIntoView({ behavior: "smooth" }), [msgs]);
  const send = () => {
    if (!input.trim()) return;
    setMsgs((p) => [
      ...p,
      {
        id: Date.now(),
        from: "me",
        name: t.you,
        text: input.trim(),
        time: timeNow(),
      },
    ]);
    setInput("");
    setTimeout(
      () => {
        const replies = [
          "👍 Đã nhận!",
          "OK!",
          "Tôi sẽ kiểm tra ngay.",
          "Cảm ơn!",
          "Hiểu rồi!",
          "Roger that ✓",
        ];
        const names = ["Nguyễn Văn A", "Trần Thị B", "Lê Minh C"];
        setMsgs((p) => [
          ...p,
          {
            id: Date.now() + 1,
            from: "other",
            name: names[Math.floor(Math.random() * 3)],
            text: replies[Math.floor(Math.random() * replies.length)],
            time: timeNow(),
          },
        ]);
      },
      900 + Math.random() * 600,
    );
  };
  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <p className="slabel">{t.system}</p>
        <h1 className="ptitle">{t.internalChat}</h1>
        <p style={{ color: "var(--muted)", fontSize: 12.5, fontWeight: 500 }}>
          {t.teamChat}
        </p>
      </div>
      <div
        className="panel panel-0"
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
            padding: "4px 0",
            display: "flex",
            flexDirection: "column",
            gap: 9,
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
              {m.from !== "me" && (
                <span
                  style={{
                    fontSize: 10,
                    color: "var(--muted)",
                    fontWeight: 700,
                    marginBottom: 2,
                    paddingLeft: 3,
                  }}
                >
                  {m.name}
                </span>
              )}
              <div
                className={m.from === "me" ? "bubble-me" : "bubble-other"}
                style={{
                  padding: "9px 13px",
                  maxWidth: "70%",
                  fontSize: 13,
                  fontWeight: 600,
                  lineHeight: 1.5,
                }}
              >
                {m.text}
              </div>
              <span
                style={{
                  fontSize: 9,
                  color: "var(--muted)",
                  marginTop: 2,
                  paddingLeft: 3,
                  paddingRight: 3,
                }}
              >
                {m.time}
              </span>
            </div>
          ))}
          <div ref={end} />
        </div>
        <div
          style={{
            borderTop: "1px solid var(--border)",
            paddingTop: 11,
            display: "flex",
            gap: 8,
            marginTop: 4,
          }}
        >
          <textarea
            className="chat-in"
            rows={1}
            placeholder={t.msgPlaceholder}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            style={{ resize: "none" }}
          />
          <button
            className="btn btn-a"
            onClick={send}
            style={{ flexShrink: 0 }}
          >
            {t.send}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── STAFF MANAGEMENT ──────────────────────────────────────────────────────────
function StaffPage({ staff, setStaff, t, addToast }) {
  const [selected, setSelected] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "",
    role: "scanner",
    email: "",
    active: true,
  });
  const roleColor = {
    admin: "var(--accent)",
    supervisor: "var(--success)",
    scanner: "var(--warning)",
  };
  const roleBadge = { admin: "b-info", supervisor: "b-ok", scanner: "b-warn" };
  const ROLES = [
    { v: "admin", l: t.roleAdmin },
    { v: "supervisor", l: t.roleSupervisor },
    { v: "scanner", l: t.roleScanner },
  ];
  const PERMS = [
    { k: "canScan", l: t.canScan },
    { k: "canExport", l: t.canExport },
    { k: "canManageOrders", l: t.canManageOrders },
    { k: "canViewMap", l: t.canViewMap },
    { k: "canManageStaff", l: t.canManageStaff },
  ];
  const COLORS = [
    "#38bdf8",
    "#34d399",
    "#fbbf24",
    "#a78bfa",
    "#f87171",
    "#fb923c",
  ];

  const addMember = () => {
    if (!form.name.trim()) return;
    const id = Date.now();
    setStaff((p) => [
      ...p,
      {
        ...form,
        id,
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
    addToast(`✓ ${t.addStaff}: ${form.name}`, "success");
  };
  const del = (id) => {
    setStaff((p) => p.filter((s) => s.id !== id));
    if (selected?.id === id) setSelected(null);
    addToast(t.deleteStaff, "danger");
  };
  const togglePerm = (id, perm) =>
    setStaff((p) =>
      p.map((s) =>
        s.id === id
          ? { ...s, perms: { ...s.perms, [perm]: !s.perms[perm] } }
          : s,
      ),
    );
  const toggleActive = (id) =>
    setStaff((p) =>
      p.map((s) => (s.id === id ? { ...s, active: !s.active } : s)),
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
          gap: 10,
        }}
      >
        <div>
          <p className="slabel">HR</p>
          <h1 className="ptitle">{t.staffManagement}</h1>
        </div>
        <button className="btn btn-a" onClick={() => setShowForm((p) => !p)}>
          ⊕ {t.addStaff}
        </button>
      </div>

      {/* Add form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="panel panel-0"
            style={{ marginBottom: 12, overflow: "hidden" }}
          >
            <p className="slabel" style={{ marginBottom: 10 }}>
              {t.addStaff}
            </p>
            <div className="g2" style={{ gap: 10 }}>
              <input
                className="inp"
                placeholder={t.staffName}
                value={form.name}
                onChange={(e) =>
                  setForm((p) => ({ ...p, name: e.target.value }))
                }
                style={{ width: "100%" }}
              />
              <input
                className="inp"
                placeholder={t.staffEmail}
                value={form.email}
                onChange={(e) =>
                  setForm((p) => ({ ...p, email: e.target.value }))
                }
                style={{ width: "100%" }}
              />
              <select
                className="inp"
                value={form.role}
                onChange={(e) =>
                  setForm((p) => ({ ...p, role: e.target.value }))
                }
                style={{ width: "100%", cursor: "pointer" }}
              >
                {ROLES.map((r) => (
                  <option key={r.v} value={r.v}>
                    {r.l}
                  </option>
                ))}
              </select>
              <div style={{ display: "flex", gap: 8 }}>
                <button className="btn btn-a" onClick={addMember}>
                  ✓ {t.addStaff}
                </button>
                <button
                  className="btn btn-g"
                  onClick={() => setShowForm(false)}
                >
                  {t.close}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="g2">
        {/* Staff list */}
        <div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {staff.map((s) => (
              <motion.div
                key={s.id}
                className="staff-card"
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                onClick={() => setSelected(s.id === selected?.id ? null : s)}
                style={{
                  cursor: "pointer",
                  borderColor:
                    selected?.id === s.id ? "var(--accent)" : "var(--border)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
                  <div
                    className="avatar"
                    style={{
                      background: s.color + "22",
                      border: `2px solid ${s.color}`,
                      color: s.color,
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
                    <div style={{ fontSize: 13, fontWeight: 800 }}>
                      {s.name}
                    </div>
                    <div style={{ fontSize: 10.5, color: "var(--muted)" }}>
                      {s.email}
                    </div>
                  </div>
                  <div
                    style={{ display: "flex", gap: 6, alignItems: "center" }}
                  >
                    <span className={`badge ${roleBadge[s.role]}`}>
                      {ROLES.find((r) => r.v === s.role)?.l}
                    </span>
                    <span className={`badge ${s.active ? "b-ok" : "b-fail"}`}>
                      {s.active ? t.staffActive : t.staffInactive}
                    </span>
                    <button
                      className="btn btn-d"
                      style={{ padding: "3px 8px", fontSize: 10 }}
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
        </div>
        {/* Permission panel */}
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
                    gap: 10,
                    marginBottom: 14,
                  }}
                >
                  <div
                    className="avatar"
                    style={{
                      background: selected.color + "22",
                      border: `2px solid ${selected.color}`,
                      color: selected.color,
                      width: 46,
                      height: 46,
                      fontSize: 18,
                    }}
                  >
                    {selected.avatar}
                  </div>
                  <div>
                    <div style={{ fontSize: 13.5, fontWeight: 800 }}>
                      {selected.name}
                    </div>
                    <span className={`badge ${roleBadge[selected.role]}`}>
                      {ROLES.find((r) => r.v === selected.role)?.l}
                    </span>
                  </div>
                  <div style={{ marginLeft: "auto" }}>
                    <Toggle
                      on={selected.active}
                      set={() => {
                        toggleActive(selected.id);
                        setSelected((p) => ({ ...p, active: !p.active }));
                      }}
                    />
                  </div>
                </div>
                <p className="slabel" style={{ marginBottom: 9 }}>
                  {t.permissionTitle}
                </p>
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 7 }}
                >
                  {PERMS.map(({ k, l }) => (
                    <div
                      key={k}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "8px 11px",
                        background: "var(--surface)",
                        borderRadius: 8,
                      }}
                    >
                      <span style={{ fontSize: 12.5, fontWeight: 600 }}>
                        {l}
                      </span>
                      <Toggle
                        on={!!selected.perms?.[k]}
                        set={() => {
                          togglePerm(selected.id, k);
                          setSelected((p) => ({
                            ...p,
                            perms: { ...p.perms, [k]: !p.perms?.[k] },
                          }));
                        }}
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
                  gap: 8,
                }}
              >
                <span style={{ fontSize: 32, opacity: 0.2 }}>👥</span>
                <span style={{ fontSize: 13, fontWeight: 600 }}>
                  {t.editStaff}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

// ─── ALERTS PAGE ───────────────────────────────────────────────────────────────
function AlertsPage({
  alerts,
  setAlerts,
  t,
  push,
  addToast,
  history,
  failCnt,
}) {
  const errRate =
    history.length > 0 ? ((failCnt / history.length) * 100).toFixed(1) : "0.0";
  const TYPES = [
    { v: "highError", l: t.alertHighError, icon: "📉", color: "var(--danger)" },
    { v: "noScan", l: t.alertNoScan, icon: "⏸", color: "var(--warning)" },
    { v: "offline", l: t.alertOffline, icon: "📡", color: "var(--muted)" },
  ];
  const toggle = (id) =>
    setAlerts((p) =>
      p.map((a) => (a.id === id ? { ...a, enabled: !a.enabled } : a)),
    );
  const testAlert = (rule) => {
    const typeInfo = TYPES.find((x) => x.v === rule.type);
    addToast(`🔔 Test: ${typeInfo?.l}`, "warning");
    push.push("🔔 Test Alert", typeInfo?.l || "Test");
    setAlerts((p) =>
      p.map((a) =>
        a.id === rule.id ? { ...a, triggered: a.triggered + 1 } : a,
      ),
    );
  };

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <p className="slabel">{t.system}</p>
        <h1 className="ptitle">{t.alertsPage}</h1>
      </div>

      {/* Push permission */}
      <div
        className="panel panel-0"
        style={{
          marginBottom: 12,
          display: "flex",
          alignItems: "center",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <div style={{ flex: 1 }}>
          <p className="slabel" style={{ marginBottom: 4 }}>
            {t.pushEnabled}
          </p>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 9,
              flexWrap: "wrap",
            }}
          >
            <span
              className={`badge ${push.perm === "granted" ? "b-ok" : push.perm === "denied" ? "b-fail" : "b-warn"}`}
            >
              {push.perm === "granted"
                ? `✓ ${t.pushGranted}`
                : push.perm === "denied"
                  ? `✕ ${t.pushDenied}`
                  : "◎ Default"}
            </span>
            {push.perm !== "granted" && (
              <button
                className="btn btn-a"
                onClick={() => {
                  push.request();
                  addToast(t.pushEnabled, "info");
                }}
              >
                {t.requestPush}
              </button>
            )}
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <p className="slabel">{t.errorRate}</p>
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

      {/* Alert rules */}
      <div className="panel panel-0">
        <p className="slabel" style={{ marginBottom: 11 }}>
          {t.alertRules}
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
          {alerts.map((rule) => {
            const typeInfo = TYPES.find((x) => x.v === rule.type);
            return (
              <motion.div
                key={rule.id}
                className="alert-card"
                initial={{ opacity: 0, x: -5 }}
                animate={{ opacity: 1, x: 0 }}
                style={{
                  borderColor: rule.enabled
                    ? typeInfo?.color + "44"
                    : "var(--border)",
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
                    {t.alertThreshold}: {rule.threshold} · {t.triggered}:{" "}
                    {rule.triggered} {t.times}
                  </div>
                </div>
                <div
                  style={{
                    display: "flex",
                    gap: 8,
                    alignItems: "center",
                    flexShrink: 0,
                    flexWrap: "wrap",
                  }}
                >
                  <button
                    className="btn btn-g"
                    style={{ padding: "4px 10px", fontSize: 10.5 }}
                    onClick={() => testAlert(rule)}
                  >
                    🔔 Test
                  </button>
                  <Toggle on={rule.enabled} set={() => toggle(rule.id)} />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Triggered history */}
      {alerts.some((a) => a.triggered > 0) && (
        <div className="panel">
          <p className="slabel" style={{ marginBottom: 10 }}>
            {t.triggered} {t.history}
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {alerts
              .filter((a) => a.triggered > 0)
              .map((a) => {
                const typeInfo = TYPES.find((x) => x.v === a.type);
                return (
                  <div
                    key={a.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "9px 12px",
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
                    <span className="badge b-warn">
                      {a.triggered} {t.times}
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

// ─── SETTINGS ──────────────────────────────────────────────────────────────────
function SettingsPage({ logout, dark, setDark, langCode, setLangCode, t }) {
  const [sound, setSound] = useState(true);
  const [autoExp, setAutoExp] = useState(false);
  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <p className="slabel">{t.system}</p>
        <h1 className="ptitle">{t.settings}</h1>
      </div>
      <div className="g2s">
        <div className="panel panel-0">
          <p className="slabel" style={{ marginBottom: 9 }}>
            {t.account}
          </p>
          <div
            style={{
              padding: "11px 13px",
              background: "var(--surface)",
              borderRadius: 9,
              border: "1px solid var(--border)",
              marginBottom: 11,
            }}
          >
            <div
              style={{ fontSize: 10, color: "var(--muted)", fontWeight: 600 }}
            >
              {t.loginAs}
            </div>
            <div style={{ fontWeight: 800, fontSize: 14, marginTop: 2 }}>
              {t.admin}
            </div>
          </div>
          <button className="btn btn-d" onClick={logout}>
            {t.logout}
          </button>
        </div>
        <div className="panel panel-0">
          <p className="slabel" style={{ marginBottom: 9 }}>
            {t.language}
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {Object.values(LANGS).map((l) => (
              <button
                key={l.code}
                className={`lang-opt ${langCode === l.code ? "active" : ""}`}
                onClick={() => setLangCode(l.code)}
              >
                <span>{l.flag}</span>
                <span style={{ fontWeight: 700 }}>{l.name}</span>
                {langCode === l.code && (
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
          <p className="slabel" style={{ marginBottom: 9 }}>
            {t.preferences}
          </p>
          {[
            { l: t.scanSound, v: sound, s: setSound },
            { l: t.autoExport, v: autoExp, s: setAutoExp },
            { l: t.darkTheme, v: dark, s: setDark },
          ].map(({ l, v, s }) => (
            <div
              key={l}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "9px 0",
                borderBottom: "1px solid var(--surface)",
              }}
            >
              <span style={{ fontSize: 12.5, fontWeight: 600 }}>{l}</span>
              <Toggle on={v} set={s} />
            </div>
          ))}
        </div>
        <div className="panel panel-0">
          <p className="slabel" style={{ marginBottom: 9 }}>
            {t.info}
          </p>
          {[
            { k: t.version, v: "4.0.0" },
            { k: t.framework, v: "React 18" },
            { k: "Socket", v: "Socket.IO" },
            { k: t.map, v: "Leaflet.js" },
            { k: t.language, v: LANGS[langCode].name },
          ].map(({ k, v }) => (
            <div
              key={k}
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "6px 0",
                borderBottom: "1px solid var(--surface)",
                fontSize: 12,
              }}
            >
              <span style={{ color: "var(--muted)", fontWeight: 600 }}>
                {k}
              </span>
              <span
                style={{
                  fontWeight: 700,
                  fontFamily: "'JetBrains Mono',monospace",
                  fontSize: 11.5,
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
