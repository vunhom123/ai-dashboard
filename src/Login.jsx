import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import bg from "./assets/login-bg.jpg";
import utcLogo from "./assets/utc-logo.png"; // ← đổi thành tên file logo thực tế của bạn

export default function Login({ onLogin }) {
  const [tab, setTab] = useState("login");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regUsername, setRegUsername] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirm, setRegConfirm] = useState("");
  const [regError, setRegError] = useState("");

  const handleLogin = () => {
    if (!username || !password) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onLogin();
    }, 1500);
  };

  const handleRegister = () => {
    setRegError("");
    if (!regName || !regEmail || !regUsername || !regPassword) {
      setRegError("Vui lòng điền đầy đủ thông tin.");
      return;
    }
    if (regPassword !== regConfirm) {
      setRegError("Mật khẩu xác nhận không khớp.");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setTab("login");
      }, 2000);
    }, 1500);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900&family=Raleway:wght@700;800;900&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .lroot {
          position: relative;
          width: 100vw; height: 100vh;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Nunito', 'Segoe UI', sans-serif;
        }

        .lbg {
          position: absolute; inset: 0;
          background-image: url(${bg});
          background-size: cover;
          background-position: center;
          z-index: 0;
        }

        .loverlay {
          position: absolute; inset: 0;
          background: linear-gradient(
            135deg,
            rgba(4,8,20,0.80) 0%,
            rgba(8,16,38,0.65) 50%,
            rgba(4,8,20,0.88) 100%
          );
          z-index: 1;
        }

        .lgrid {
          position: absolute; inset: 0;
          background-image:
            linear-gradient(rgba(56,189,248,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(56,189,248,0.03) 1px, transparent 1px);
          background-size: 56px 56px;
          z-index: 1;
        }

        .lcard {
          position: relative; z-index: 2;
          width: 440px;
          background: rgba(8,16,40,0.76);
          border: 1px solid rgba(56,189,248,0.16);
          border-radius: 28px;
          padding: 44px 48px 48px;
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          box-shadow: 0 40px 90px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.07);
        }
        .lcard::before {
          content: '';
          position: absolute;
          top: 0; left: 12%; right: 12%;
          height: 2px;
          background: linear-gradient(90deg, transparent, #38bdf8, transparent);
          border-radius: 0 0 3px 3px;
        }

        .logo-img {
          width: 76px; height: 76px;
          border-radius: 50%;
          object-fit: cover;
          display: block;
          margin: 0 auto 10px;
          border: 2px solid rgba(56,189,248,0.35);
          box-shadow: 0 0 24px rgba(56,189,248,0.22);
        }

        /* Tên trường: Nunito, gọn, rõ, hỗ trợ dấu tiếng Việt hoàn hảo */
        .school-name {
          text-align: center;
          font-family: 'Nunito', sans-serif;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          color: rgba(56,189,248,0.75);
          margin-bottom: 5px;
        }

        /* Tiêu đề lớn: Raleway bold, gradient */
        .app-title {
          text-align: center;
          font-family: 'Raleway', sans-serif;
          font-size: 32px;
          font-weight: 900;
          letter-spacing: -0.5px;
          margin-bottom: 30px;
          background: linear-gradient(135deg, #e0f2fe 0%, #7dd3fc 50%, #a5b4fc 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        /* Tab bar */
        .tab-bar {
          display: flex;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(56,189,248,0.1);
          border-radius: 14px;
          padding: 5px;
          margin-bottom: 26px;
          gap: 5px;
        }

        /* Tab buttons: Nunito semibold — đẹp với tiếng Việt */
        .tab-btn {
          flex: 1;
          padding: 10px 8px;
          border: none;
          border-radius: 10px;
          font-family: 'Nunito', sans-serif;
          font-size: 14.5px;
          font-weight: 800;
          cursor: pointer;
          transition: all 0.22s ease;
        }
        .tab-btn.active {
          background: linear-gradient(135deg, #38bdf8, #6366f1);
          color: #fff;
          box-shadow: 0 4px 16px rgba(56,189,248,0.38);
        }
        .tab-btn.inactive {
          background: transparent;
          color: #4e6080;
        }
        .tab-btn.inactive:hover {
          color: #7ea8c4;
          background: rgba(255,255,255,0.04);
        }

        /* Label: nhỏ, uppercase, Nunito bold */
        .flabel {
          display: block;
          font-family: 'Nunito', sans-serif;
          font-size: 11.5px;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #4e6a80;
          margin-top: 16px;
          margin-bottom: 7px;
        }

        /* Input: Nunito regular, đọc dễ */
        .finput {
          width: 100%;
          padding: 12px 16px;
          background: rgba(255,255,255,0.055);
          border: 1px solid rgba(56,189,248,0.14);
          border-radius: 12px;
          color: #dbeafe;
          font-size: 15px;
          font-family: 'Nunito', sans-serif;
          font-weight: 500;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
        }
        .finput::placeholder {
          color: #2d3f55;
          font-weight: 400;
          font-size: 14px;
        }
        .finput:focus {
          border-color: rgba(56,189,248,0.5);
          background: rgba(56,189,248,0.06);
          box-shadow: 0 0 0 3px rgba(56,189,248,0.10);
        }

        /* Messages */
        .errmsg {
          margin-top: 12px;
          padding: 10px 14px;
          background: rgba(248,113,113,0.09);
          border: 1px solid rgba(248,113,113,0.28);
          border-radius: 10px;
          color: #fca5a5;
          font-family: 'Nunito', sans-serif;
          font-size: 13.5px;
          font-weight: 600;
        }
        .okmsg {
          margin-top: 12px;
          padding: 10px 14px;
          background: rgba(52,211,153,0.09);
          border: 1px solid rgba(52,211,153,0.28);
          border-radius: 10px;
          color: #6ee7b7;
          font-family: 'Nunito', sans-serif;
          font-size: 13.5px;
          font-weight: 600;
          text-align: center;
        }

        /* Button: Nunito ExtraBold, chữ rõ và đẹp */
        .submitbtn {
          width: 100%;
          padding: 14px;
          margin-top: 24px;
          background: linear-gradient(135deg, #38bdf8 0%, #6366f1 100%);
          border: none;
          border-radius: 14px;
          color: #fff;
          font-size: 15.5px;
          font-weight: 800;
          font-family: 'Nunito', sans-serif;
          letter-spacing: 0.02em;
          cursor: pointer;
          transition: opacity 0.2s, transform 0.15s, box-shadow 0.2s;
          box-shadow: 0 8px 26px rgba(56,189,248,0.32);
        }
        .submitbtn:hover:not(:disabled) {
          opacity: 0.88;
          transform: translateY(-2px);
          box-shadow: 0 12px 32px rgba(56,189,248,0.42);
        }
        .submitbtn:disabled { opacity: 0.45; cursor: not-allowed; }

        @keyframes floatup {
          0%   { transform: translateY(0)     rotate(0deg);   opacity: 0.3; }
          50%  { transform: translateY(-20px) rotate(180deg); opacity: 0.7; }
          100% { transform: translateY(0)     rotate(360deg); opacity: 0.3; }
        }
        .dot {
          position: absolute; border-radius: 50%;
          background: rgba(56,189,248,0.36);
          animation: floatup ease-in-out infinite;
          z-index: 1;
        }
      `}</style>

      <div className="lroot">
        <div className="lbg" />
        <div className="loverlay" />
        <div className="lgrid" />

        {[
          { l: "10%", t: "18%", s: 5, d: "6.5s", dl: "0s" },
          { l: "82%", t: "14%", s: 7, d: "8s", dl: "1.2s" },
          { l: "22%", t: "72%", s: 5, d: "7.2s", dl: "2s" },
          { l: "72%", t: "66%", s: 4, d: "9s", dl: "0.6s" },
          { l: "52%", t: "84%", s: 4, d: "5.5s", dl: "3s" },
          { l: "38%", t: "10%", s: 3, d: "7.8s", dl: "1.8s" },
        ].map((p, i) => (
          <div
            key={i}
            className="dot"
            style={{
              left: p.l,
              top: p.t,
              width: p.s,
              height: p.s,
              animationDuration: p.d,
              animationDelay: p.dl,
            }}
          />
        ))}

        <motion.div
          className="lcard"
          initial={{ opacity: 0, y: 32, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <img src={utcLogo} alt="UTC" className="logo-img" />
          <p className="school-name">Trường ĐH Giao thông Vận tải</p>
          <h1 className="app-title">AI Factory</h1>

          <div className="tab-bar">
            <button
              className={`tab-btn ${tab === "login" ? "active" : "inactive"}`}
              onClick={() => {
                setTab("login");
                setRegError("");
              }}
            >
              Đăng nhập
            </button>
            <button
              className={`tab-btn ${tab === "register" ? "active" : "inactive"}`}
              onClick={() => {
                setTab("register");
                setRegError("");
              }}
            >
              Đăng ký
            </button>
          </div>

          <AnimatePresence mode="wait">
            {tab === "login" ? (
              <motion.div
                key="login"
                initial={{ opacity: 0, x: -18 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 18 }}
                transition={{ duration: 0.22 }}
              >
                <label className="flabel">Tên đăng nhập</label>
                <input
                  className="finput"
                  placeholder="Nhập username..."
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                />

                <label className="flabel">Mật khẩu</label>
                <input
                  className="finput"
                  type="password"
                  placeholder="Nhập mật khẩu..."
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                />

                <button
                  className="submitbtn"
                  onClick={handleLogin}
                  disabled={loading}
                >
                  {loading ? "Đang đăng nhập..." : "Đăng nhập →"}
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="register"
                initial={{ opacity: 0, x: 18 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -18 }}
                transition={{ duration: 0.22 }}
              >
                <label className="flabel">Họ và tên</label>
                <input
                  className="finput"
                  placeholder="Nguyễn Văn A..."
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                />

                <label className="flabel">Email</label>
                <input
                  className="finput"
                  type="email"
                  placeholder="example@utc.edu.vn"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                />

                <label className="flabel">Tên đăng nhập</label>
                <input
                  className="finput"
                  placeholder="Chọn username..."
                  value={regUsername}
                  onChange={(e) => setRegUsername(e.target.value)}
                />

                <label className="flabel">Mật khẩu</label>
                <input
                  className="finput"
                  type="password"
                  placeholder="Tối thiểu 8 ký tự..."
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                />

                <label className="flabel">Xác nhận mật khẩu</label>
                <input
                  className="finput"
                  type="password"
                  placeholder="Nhập lại mật khẩu..."
                  value={regConfirm}
                  onChange={(e) => setRegConfirm(e.target.value)}
                />

                {regError && <div className="errmsg">⚠ {regError}</div>}
                {success && (
                  <div className="okmsg">
                    ✓ Đăng ký thành công! Đang chuyển...
                  </div>
                )}

                <button
                  className="submitbtn"
                  onClick={handleRegister}
                  disabled={loading}
                >
                  {loading ? "Đang xử lý..." : "Tạo tài khoản →"}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </>
  );
}
