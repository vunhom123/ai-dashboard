import React from "react";

export default function App() {
  return (
    <div
      style={{
        background: "#0f172a",
        minHeight: "100vh",
        color: "white",
        padding: "40px",
      }}
    >
      <h1 style={{ fontSize: "40px", marginBottom: "10px" }}>AI Dashboard</h1>

      <p style={{ opacity: 0.7 }}>Hệ thống đang chạy</p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4,1fr)",
          gap: "20px",
          marginTop: "40px",
        }}
      >
        <Card title="Total" value="0" />
        <Card title="OK" value="0" color="#22c55e" />
        <Card title="FAIL" value="0" color="#ef4444" />
        <Card title="Error %" value="0%" />
      </div>
    </div>
  );
}

function Card({ title, value, color = "white" }) {
  return (
    <div
      style={{
        background: "#1e293b",
        padding: "30px",
        borderRadius: "15px",
        boxShadow: "0 10px 30px rgba(0,0,0,0.4)",
      }}
    >
      <h3 style={{ opacity: 0.7 }}>{title}</h3>

      <h1
        style={{
          fontSize: "40px",
          color: color,
        }}
      >
        {value}
      </h1>
    </div>
  );
}
