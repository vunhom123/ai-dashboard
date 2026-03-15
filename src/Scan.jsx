import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Html5Qrcode } from "html5-qrcode";
import { io } from "socket.io-client";

const socket = io("https://qr-server-n6pp.onrender.com", {
  transports: ["websocket"],
  reconnection: true,
});

// ─── GPS ─────────────────────────────────────────────────────
function useGPS() {
  const [pos, setPos] = useState(null);
  const [status, setStatus] = useState("idle");
  const watchId = useRef(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setStatus("error");
      return;
    }
    setStatus("getting");
    // Lấy ngay 1 lần
    navigator.geolocation.getCurrentPosition(
      (p) => {
        setPos({
          lat: p.coords.latitude,
          lng: p.coords.longitude,
          acc: p.coords.accuracy,
        });
        setStatus("ok");
      },
      () => setStatus("error"),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
    );
    // Theo dõi liên tục
    watchId.current = navigator.geolocation.watchPosition(
      (p) => {
        setPos({
          lat: p.coords.latitude,
          lng: p.coords.longitude,
          acc: p.coords.accuracy,
        });
        setStatus("ok");
      },
      () => {},
      { enableHighAccuracy: true, maximumAge: 0, timeout: 20000 },
    );
    return () => {
      if (watchId.current) navigator.geolocation.clearWatch(watchId.current);
    };
  }, []);

  return { pos, status };
}

// ═════════════════════════════════════════════════════════════

// ─── Load jsQR từ CDN (cho upload ảnh) ─────────────────────
function useJsQR() {
  const [ready, setReady] = useState(!!window.jsQR);
  useEffect(() => {
    if (window.jsQR) {
      setReady(true);
      return;
    }
    const s = document.createElement("script");
    s.src = "https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.min.js";
    s.onload = () => setReady(true);
    document.head.appendChild(s);
  }, []);
  return ready;
}

// ─── Upload ảnh QR — dùng jsQR qua canvas ───────────────────
function UploadQR({ onResult }) {
  const jsQRReady = useJsQR();
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [preview, setPreview] = useState(null);

  const handleFile = (file) => {
    if (!file) return;
    if (!jsQRReady) {
      setErr("Thư viện chưa sẵn, thử lại sau giây lát.");
      return;
    }
    setErr("");
    setLoading(true);

    // Dùng FileReader thay vì createObjectURL để tránh lỗi CORS/tainting canvas
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataURL = ev.target.result;
      setPreview(dataURL);

      const img = new Image();
      img.onload = () => {
        // Hàm threshold: chuyển ảnh thành đen/trắng thuần để jsQR dễ đọc hơn
        // Xử lý lưới kẻ, nhiễu, ảnh chụp màn hình
        const applyThreshold = (ctx, w, h, thresh) => {
          const d = ctx.getImageData(0, 0, w, h);
          for (let i = 0; i < d.data.length; i += 4) {
            const gray =
              0.299 * d.data[i] + 0.587 * d.data[i + 1] + 0.114 * d.data[i + 2];
            const v = gray < thresh ? 0 : 255;
            d.data[i] = d.data[i + 1] = d.data[i + 2] = v;
          }
          ctx.putImageData(d, 0, 0);
          return ctx.getImageData(0, 0, w, h);
        };

        // Thử nhiều cách: kích thước khác nhau + có/không threshold
        const sizes = [img.width, 1024, 800, 512];
        const thresholds = [128, 100, 160, 80, 200]; // nhiều ngưỡng khác nhau
        let found = null;

        outer: for (const size of sizes) {
          const scale = size / Math.max(img.width, img.height);
          const w = Math.round(img.width * scale);
          const h = Math.round(img.height * scale);

          // Thử KHÔNG threshold trước
          const c0 = document.createElement("canvas");
          c0.width = w;
          c0.height = h;
          const ctx0 = c0.getContext("2d");
          ctx0.drawImage(img, 0, 0, w, h);
          for (const inv of ["dontInvert", "onlyInvert", "attemptBoth"]) {
            const id = ctx0.getImageData(0, 0, w, h);
            const r = window.jsQR(id.data, w, h, { inversionAttempts: inv });
            if (r?.data) {
              found = r.data;
              break outer;
            }
          }

          // Thử CÓ threshold (xử lý lưới kẻ & nhiễu)
          for (const thresh of thresholds) {
            const c = document.createElement("canvas");
            c.width = w;
            c.height = h;
            const ctx = c.getContext("2d");
            ctx.drawImage(img, 0, 0, w, h);
            for (const inv of ["dontInvert", "onlyInvert", "attemptBoth"]) {
              const id = applyThreshold(ctx, w, h, thresh);
              const r = window.jsQR(id.data, w, h, { inversionAttempts: inv });
              if (r?.data) {
                found = r.data;
                break outer;
              }
            }
          }
        }

        if (found) {
          onResult(found);
          setErr("");
        } else
          setErr(
            "Không tìm thấy mã QR. Đảm bảo QR đầy đủ, rõ nét, không bị cắt.",
          );
        setLoading(false);
      };
      img.onerror = () => {
        setErr("Không đọc được ảnh.");
        setLoading(false);
      };
      img.src = dataURL;
    };
    reader.onerror = () => {
      setErr("Không đọc được file.");
      setLoading(false);
    };
    reader.readAsDataURL(file); // đọc thành base64
  };

  return (
    <div
      style={{
        background: "var(--card)",
        border: "1px solid var(--card-border)",
        borderRadius: 16,
        padding: "16px",
        backdropFilter: "blur(16px)",
        marginBottom: 12,
      }}
    >
      <div
        style={{
          fontSize: 10,
          fontWeight: 800,
          letterSpacing: ".14em",
          textTransform: "uppercase",
          color: "var(--muted)",
          marginBottom: 10,
        }}
      >
        🖼️ Quét QR từ ảnh
      </div>
      <label
        onDragOver={(e) => {
          e.preventDefault();
          e.currentTarget.style.borderColor = "var(--accent)";
          e.currentTarget.style.background = "rgba(56,189,248,.06)";
        }}
        onDragLeave={(e) => {
          e.currentTarget.style.borderColor = "var(--card-border)";
          e.currentTarget.style.background = "var(--surface)";
        }}
        onDrop={(e) => {
          e.preventDefault();
          e.currentTarget.style.borderColor = "var(--card-border)";
          e.currentTarget.style.background = "var(--surface)";
          handleFile(e.dataTransfer.files[0]);
        }}
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          padding: "20px 16px",
          background: "var(--surface)",
          border: "2px dashed var(--card-border)",
          borderRadius: 12,
          cursor: "pointer",
          transition: "border-color .2s, background .2s",
          minHeight: 90,
        }}
      >
        <input
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          onChange={(e) => {
            handleFile(e.target.files[0]);
            e.target.value = "";
          }}
        />
        {loading ? (
          <>
            <span style={{ fontSize: 26 }}>⏳</span>
            <span
              style={{ fontSize: 13, fontWeight: 700, color: "var(--accent)" }}
            >
              Đang đọc mã QR...
            </span>
          </>
        ) : preview ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              width: "100%",
            }}
          >
            <img
              src={preview}
              alt=""
              style={{
                width: 56,
                height: 56,
                objectFit: "cover",
                borderRadius: 8,
                border: "1px solid var(--card-border)",
                flexShrink: 0,
              }}
            />
            <div>
              <div
                style={{ fontSize: 12, fontWeight: 700, color: "var(--text)" }}
              >
                Ảnh đã chọn
              </div>
              <div
                style={{ fontSize: 11, color: "var(--accent)", marginTop: 2 }}
              >
                Bấm để chọn ảnh khác
              </div>
            </div>
          </div>
        ) : (
          <>
            <span style={{ fontSize: 30 }}>📁</span>
            <span
              style={{ fontSize: 13, fontWeight: 700, color: "var(--muted)" }}
            >
              Bấm hoặc kéo thả ảnh vào đây
            </span>
            <span style={{ fontSize: 11, color: "var(--muted)" }}>
              JPG · PNG · GIF · WebP · Chụp màn hình
            </span>
          </>
        )}
      </label>
      {err && (
        <div
          style={{
            marginTop: 9,
            padding: "9px 12px",
            background: "rgba(248,113,113,.08)",
            border: "1px solid rgba(248,113,113,.3)",
            borderRadius: 9,
          }}
        >
          <div
            style={{
              fontSize: 12,
              color: "var(--danger)",
              fontWeight: 800,
              marginBottom: 3,
            }}
          >
            ⚠ {err}
          </div>
          <div style={{ fontSize: 11, color: "var(--muted)", lineHeight: 1.6 }}>
            • QR phải{" "}
            <b style={{ color: "var(--text)" }}>đầy đủ, không bị cắt</b>
            <br />• Ảnh <b style={{ color: "var(--text)" }}>rõ nét</b>, không
            mờ, không quá tối
            <br />• Nền trắng tương phản với mã đen
          </div>
        </div>
      )}
      {!jsQRReady && (
        <div
          style={{
            marginTop: 8,
            fontSize: 11,
            color: "var(--muted)",
            textAlign: "center",
          }}
        >
          ⏳ Đang tải thư viện...
        </div>
      )}
      <p
        style={{
          fontSize: 11,
          color: "var(--muted)",
          marginTop: 8,
          lineHeight: 1.6,
        }}
      >
        💡 Ảnh từ Zalo, Messenger, chụp màn hình đều được
      </p>
    </div>
  );
}

export default function Scan() {
  const gps = useGPS();
  const scannerRef = useRef(null); // Html5Qrcode instance
  const gpsPosRef = useRef(null);
  const lastCodeRef = useRef("");
  const lastTimeRef = useRef(0);

  const [scanning, setScanning] = useState(false);
  const [camErr, setCamErr] = useState("");
  const [history, setHistory] = useState([]);
  const [lastScan, setLastScan] = useState(null);
  const [flash, setFlash] = useState(false);
  const [socketOk, setSocketOk] = useState(socket.connected);
  const [cameras, setCameras] = useState([]);
  const [camId, setCamId] = useState(null); // selected camera id

  // Sync GPS pos vào ref để dùng trong callback
  useEffect(() => {
    gpsPosRef.current = gps.pos;
  }, [gps.pos]);

  useEffect(() => {
    socket.on("connect", () => setSocketOk(true));
    socket.on("disconnect", () => setSocketOk(false));

    // Lấy danh sách camera
    Html5Qrcode.getCameras()
      .then((devs) => {
        setCameras(devs);
        // Ưu tiên camera sau (environment)
        const back = devs.find((d) => /back|rear|environment/i.test(d.label));
        setCamId(back ? back.id : devs[0]?.id);
      })
      .catch(() => {});

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      stopScan();
    };
  }, []);

  // ── Bắt đầu quét ─────────────────────────────────────────
  const startScan = async () => {
    setCamErr("");
    try {
      const qr = new Html5Qrcode("qr-reader");
      scannerRef.current = qr;

      const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
        showTorchButtonIfSupported: true,
      };

      // Dùng camera id nếu có, không thì dùng facingMode
      if (camId) {
        await qr.start(camId, config, onQRSuccess, () => {});
      } else {
        await qr.start(
          { facingMode: "environment" },
          config,
          onQRSuccess,
          () => {},
        );
      }
      setScanning(true);
    } catch (e) {
      if (
        e.toString().includes("NotAllowed") ||
        e.toString().includes("Permission")
      ) {
        setCamErr(
          "Chưa cho phép camera. Vào Cài đặt trình duyệt → Cho phép Camera rồi thử lại.",
        );
      } else {
        setCamErr("Không mở được camera: " + e.toString());
      }
    }
  };

  // ── Dừng quét ────────────────────────────────────────────
  const stopScan = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
      } catch {}
      try {
        scannerRef.current.clear();
      } catch {}
      scannerRef.current = null;
    }
    setScanning(false);
  };

  // ── Khi đọc được QR ──────────────────────────────────────
  const onQRSuccess = useCallback((code) => {
    const now = Date.now();
    // Chống đọc trùng trong 2 giây
    if (code === lastCodeRef.current && now - lastTimeRef.current < 2000)
      return;
    lastCodeRef.current = code;
    lastTimeRef.current = now;

    const pos = gpsPosRef.current;
    const time = new Date().toLocaleTimeString("vi-VN");

    const payload = {
      code,
      time,
      ...(pos ? { lat: pos.lat, lng: pos.lng, accuracy: pos.acc } : {}),
    };

    // Gửi lên server qua HTTP POST (server dùng REST, không phải socket emit)
    fetch("https://qr-server-n6pp.onrender.com/scan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ qr: payload.code }),
    }).catch(() => {});

    // Đồng thời gửi GPS lên /location nếu có tọa độ
    if (payload.lat && payload.lng) {
      fetch("https://qr-server-n6pp.onrender.com/location", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lat: payload.lat, lng: payload.lng }),
      }).catch(() => {});
    }

    const result = { code, time, lat: pos?.lat, lng: pos?.lng };
    setLastScan(result);
    setHistory((p) => [result, ...p].slice(0, 100));
    setFlash(true);
    setTimeout(() => setFlash(false), 500);

    // Rung
    if (navigator.vibrate) navigator.vibrate([80, 50, 80]);

    // Beep
    try {
      const ac = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ac.createOscillator();
      const g = ac.createGain();
      osc.connect(g);
      g.connect(ac.destination);
      osc.frequency.value = 1100;
      osc.type = "sine";
      g.gain.setValueAtTime(0.3, ac.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.18);
      osc.start();
      osc.stop(ac.currentTime + 0.18);
    } catch {}
  }, []);

  // ── GPS indicator ─────────────────────────────────────────
  const gpsColor = !gps.pos
    ? "#94a3b8"
    : gps.pos.acc <= 30
      ? "#34d399"
      : gps.pos.acc <= 300
        ? "#fbbf24"
        : "#f87171";
  const gpsText =
    gps.status === "getting"
      ? "Đang lấy GPS..."
      : !gps.pos
        ? "Chưa có GPS"
        : gps.pos.acc <= 30
          ? `±${Math.round(gps.pos.acc)}m ✓`
          : `±${gps.pos.acc >= 1000 ? (gps.pos.acc / 1000).toFixed(1) + "km" : Math.round(gps.pos.acc) + "m"}`;

  return (
    <div
      style={{
        fontFamily: "'Nunito', sans-serif",
        maxWidth: 480,
        margin: "0 auto",
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: 16 }}>
        <p
          style={{
            fontSize: 10,
            fontWeight: 800,
            letterSpacing: ".16em",
            textTransform: "uppercase",
            color: "var(--muted)",
            marginBottom: 3,
          }}
        >
          Quét mã
        </p>
        <h1
          style={{
            fontFamily: "'Raleway', sans-serif",
            fontSize: "clamp(20px,4vw,26px)",
            fontWeight: 900,
            background:
              "linear-gradient(135deg,var(--text) 0%,var(--accent) 130%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            marginBottom: 3,
          }}
        >
          Quét QR bằng Camera
        </h1>
        <p style={{ color: "var(--muted)", fontSize: 12.5 }}>
          Mở camera → đưa vào mã QR → tự động gửi kèm GPS
        </p>
      </div>

      {/* Status pills */}
      <div
        style={{ display: "flex", gap: 7, marginBottom: 14, flexWrap: "wrap" }}
      >
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 5,
            padding: "4px 11px",
            borderRadius: 20,
            fontSize: 11,
            fontWeight: 800,
            border: `1px solid ${socketOk ? "rgba(52,211,153,.35)" : "rgba(248,113,113,.35)"}`,
            color: socketOk ? "var(--success)" : "var(--danger)",
            background: socketOk
              ? "rgba(52,211,153,.07)"
              : "rgba(248,113,113,.07)",
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: socketOk ? "var(--success)" : "var(--danger)",
              animation: socketOk ? "pulse-anim 1.6s infinite" : "none",
            }}
          />
          {socketOk ? "Server OK" : "Mất kết nối"}
        </span>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 5,
            padding: "4px 11px",
            borderRadius: 20,
            fontSize: 11,
            fontWeight: 800,
            border: `1px solid ${gpsColor}44`,
            color: gpsColor,
            background: `${gpsColor}11`,
          }}
        >
          📍 {gpsText}
        </span>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 5,
            padding: "4px 11px",
            borderRadius: 20,
            fontSize: 11,
            fontWeight: 800,
            border: "1px solid var(--card-border)",
            color: "var(--muted)",
          }}
        >
          ✓ {history.length} mã đã quét
        </span>
      </div>

      {/* Camera selector nếu có nhiều camera */}
      {cameras.length > 1 && (
        <div style={{ marginBottom: 10 }}>
          <select
            value={camId || ""}
            onChange={(e) => {
              if (scanning) stopScan();
              setCamId(e.target.value);
            }}
            style={{
              width: "100%",
              padding: "8px 12px",
              background: "var(--surface)",
              border: "1px solid var(--card-border)",
              borderRadius: 9,
              color: "var(--text)",
              fontSize: 12.5,
              fontFamily: "'Nunito',sans-serif",
              outline: "none",
            }}
          >
            {cameras.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label || c.id}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* QR Reader container — html5-qrcode render vào đây */}
      <div
        style={{
          position: "relative",
          borderRadius: 18,
          overflow: "hidden",
          border: `2px solid ${flash ? "#34d399" : scanning ? "rgba(56,189,248,.45)" : "var(--card-border)"}`,
          marginBottom: 12,
          transition: "border-color .25s",
          boxShadow: scanning ? "0 8px 32px rgba(56,189,248,.18)" : "none",
          background: "#000",
          minHeight: scanning ? 0 : 200,
        }}
      >
        {/* Flash overlay */}
        <AnimatePresence>
          {flash && (
            <motion.div
              initial={{ opacity: 0.8 }}
              animate={{ opacity: 0 }}
              transition={{ duration: 0.45 }}
              style={{
                position: "absolute",
                inset: 0,
                background: "rgba(52,211,153,.45)",
                zIndex: 20,
                pointerEvents: "none",
                borderRadius: 16,
              }}
            />
          )}
        </AnimatePresence>

        {/* html5-qrcode mount point */}
        <div id="qr-reader" style={{ width: "100%" }} />

        {/* Placeholder khi chưa quét */}
        {!scanning && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              padding: "40px 24px",
              minHeight: 200,
            }}
          >
            <div style={{ fontSize: 50, opacity: 0.15 }}>📷</div>
            <p
              style={{
                color: "#64748b",
                fontSize: 13,
                textAlign: "center",
                fontWeight: 600,
              }}
            >
              {camErr || "Bấm nút bên dưới để bật camera"}
            </p>
          </div>
        )}
      </div>

      {/* Camera error */}
      {camErr && (
        <div
          style={{
            background: "rgba(248,113,113,.08)",
            border: "1px solid rgba(248,113,113,.3)",
            borderRadius: 12,
            padding: "12px 15px",
            marginBottom: 12,
          }}
        >
          <div
            style={{
              fontSize: 13,
              fontWeight: 800,
              color: "var(--danger)",
              marginBottom: 6,
            }}
          >
            ⚠ {camErr}
          </div>
          <div
            style={{ fontSize: 11.5, color: "var(--muted)", lineHeight: 1.8 }}
          >
            • Vào <b style={{ color: "var(--text)" }}>Cài đặt trình duyệt</b> →
            tìm site này → cho phép Camera
            <br />
            • Hoặc bấm biểu tượng 🔒 trên thanh địa chỉ → Camera → Cho phép
            <br />• Tải lại trang rồi thử lại
          </div>
        </div>
      )}

      {/* GPS warning */}
      {gps.status === "error" && (
        <div
          style={{
            background: "rgba(251,191,36,.07)",
            border: "1px solid rgba(251,191,36,.28)",
            borderRadius: 12,
            padding: "11px 14px",
            marginBottom: 12,
          }}
        >
          <div
            style={{
              fontSize: 12.5,
              fontWeight: 800,
              color: "var(--warning)",
              marginBottom: 4,
            }}
          >
            ⚠ Không có GPS — QR gửi không có tọa độ
          </div>
          <div
            style={{ fontSize: 11.5, color: "var(--muted)", lineHeight: 1.7 }}
          >
            Bật <b style={{ color: "var(--text)" }}>Cài đặt → Vị trí → Bật</b>,
            rồi cho phép trình duyệt truy cập vị trí.
          </div>
        </div>
      )}

      {/* Start / Stop button */}
      {!scanning ? (
        <button
          onClick={startScan}
          style={{
            width: "100%",
            padding: "14px",
            background: "var(--accent)",
            border: "none",
            borderRadius: 13,
            color: "#070d1a",
            fontWeight: 900,
            fontSize: 15,
            cursor: "pointer",
            fontFamily: "'Nunito',sans-serif",
            marginBottom: 10,
            boxShadow: "0 4px 20px var(--accent-glow)",
          }}
        >
          📷 Bật camera quét QR
        </button>
      ) : (
        <button
          onClick={stopScan}
          style={{
            width: "100%",
            padding: "14px",
            background: "transparent",
            border: "2px solid var(--danger)",
            borderRadius: 13,
            color: "var(--danger)",
            fontWeight: 900,
            fontSize: 15,
            cursor: "pointer",
            fontFamily: "'Nunito',sans-serif",
            marginBottom: 10,
          }}
        >
          ⏹ Dừng quét
        </button>
      )}

      {/* Last result */}
      <AnimatePresence>
        {lastScan && (
          <motion.div
            key={lastScan.code + lastScan.time}
            initial={{ opacity: 0, y: -6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0 }}
            style={{
              background:
                "linear-gradient(135deg,rgba(52,211,153,.08),rgba(56,189,248,.08))",
              border: "1px solid rgba(52,211,153,.3)",
              borderRadius: 13,
              padding: "13px 16px",
              marginBottom: 12,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 5,
              }}
            >
              <span
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  background: "var(--success)",
                  flexShrink: 0,
                }}
              />
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 800,
                  letterSpacing: ".1em",
                  textTransform: "uppercase",
                  color: "var(--muted)",
                }}
              >
                Quét thành công
              </span>
              <span
                style={{
                  marginLeft: "auto",
                  fontSize: 10,
                  color: "var(--muted)",
                }}
              >
                {lastScan.time}
              </span>
            </div>
            <div
              style={{
                fontSize: 16,
                fontWeight: 800,
                color: "var(--success)",
                fontFamily: "'JetBrains Mono',monospace",
                marginBottom: 4,
                wordBreak: "break-all",
              }}
            >
              {lastScan.code}
            </div>
            <div
              style={{
                fontSize: 11,
                color: lastScan.lat ? "var(--accent)" : "var(--muted)",
                fontFamily: "'JetBrains Mono',monospace",
              }}
            >
              {lastScan.lat
                ? `📍 ${lastScan.lat.toFixed(5)}, ${lastScan.lng.toFixed(5)}`
                : "📍 Không có tọa độ"}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Upload ảnh QR ── */}
      <UploadQR onResult={onQRSuccess} />

      {/* History */}
      {history.length > 0 && (
        <div
          style={{
            background: "var(--card)",
            border: "1px solid var(--card-border)",
            borderRadius: 16,
            padding: "16px",
            backdropFilter: "blur(16px)",
          }}
        >
          <div
            style={{
              fontSize: 10,
              fontWeight: 800,
              letterSpacing: ".14em",
              textTransform: "uppercase",
              color: "var(--muted)",
              marginBottom: 10,
            }}
          >
            Đã quét ({history.length})
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 6,
              maxHeight: 260,
              overflowY: "auto",
            }}
          >
            {history.map((s, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 9,
                  padding: "7px 10px",
                  background: "var(--surface)",
                  borderRadius: 8,
                  borderLeft: `3px solid ${s.lat ? "var(--success)" : "var(--muted)"}`,
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 800,
                      color: "var(--accent)",
                      fontFamily: "'JetBrains Mono',monospace",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {s.code}
                  </div>
                  {s.lat && (
                    <div
                      style={{
                        fontSize: 9.5,
                        color: "var(--muted)",
                        fontFamily: "'JetBrains Mono',monospace",
                        marginTop: 1,
                      }}
                    >
                      📍 {s.lat.toFixed(4)}, {s.lng.toFixed(4)}
                    </div>
                  )}
                </div>
                <div style={{ flexShrink: 0, textAlign: "right" }}>
                  <div style={{ fontSize: 10, color: "var(--muted)" }}>
                    {s.time}
                  </div>
                  <div
                    style={{
                      fontSize: 9,
                      fontWeight: 700,
                      marginTop: 1,
                      color: s.lat ? "var(--success)" : "var(--muted)",
                    }}
                  >
                    {s.lat ? "✓ GPS" : "No GPS"}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
