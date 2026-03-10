import React from "react";
import bg from "./assets/login-bg.jpg";

export default function Login({ onLogin }) {
  return (
    <div style={styles.container}>
      <div style={styles.image}>
        <img
          src={bg}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </div>

      <div style={styles.form}>
        <h1>AI Factory</h1>

        <input placeholder="Username" style={styles.input} />
        <input placeholder="Password" type="password" style={styles.input} />

        <button style={styles.button} onClick={onLogin}>
          Login
        </button>
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
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    background: "#0f172a",
    color: "white",
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
};
