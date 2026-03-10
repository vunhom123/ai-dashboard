import React, { useState } from "react";
import bg from "./assets/login-bg.jpg";

export default function Login({ onLogin }) {
  const [dark, setDark] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = () => {
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      onLogin();
    }, 1500);
  };

  return (
    <div style={styles.container}>
      <div style={styles.image}>
        <img
          src={bg}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </div>

      <div
        style={{
          ...styles.form,
          background: dark ? "#0f172a" : "#f1f5f9",
          color: dark ? "white" : "black",
        }}
      >
        <div style={styles.card}>
          <h1>AI Factory</h1>

          <input placeholder="Username" style={styles.input} />
          <input placeholder="Password" type="password" style={styles.input} />

          <button style={styles.button} onClick={handleLogin}>
            {loading ? "Loading..." : "Login"}
          </button>

          <button style={styles.themeButton} onClick={() => setDark(!dark)}>
            {dark ? "☀ Light Mode" : "🌙 Dark Mode"}
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    height: "100vh",
  },

  image: {
    flex: 1,
  },

  form: {
    flex: 1,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    transition: "0.3s",
  },

  card: {
    padding: "40px",
    borderRadius: "12px",
    backdropFilter: "blur(10px)",
    background: "rgba(255,255,255,0.05)",
    boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    animation: "fade 0.6s ease",
  },

  input: {
    width: "250px",
    padding: "12px",
    margin: "10px",
    borderRadius: "8px",
    border: "none",
  },

  button: {
    width: "250px",
    padding: "12px",
    background: "#2563eb",
    border: "none",
    borderRadius: "8px",
    color: "white",
    cursor: "pointer",
  },

  themeButton: {
    marginTop: "15px",
    padding: "8px",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
  },
};
