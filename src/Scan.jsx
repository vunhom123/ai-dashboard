import { useEffect } from "react";

export default function Scan() {
  useEffect(() => {
    navigator.geolocation.getCurrentPosition((pos) => {
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;

      fetch("http://localhost:5000/location", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lat, lng }),
      });
    });
  }, []);

  return (
    <div style={{ padding: "40px" }}>
      <h1>Sending GPS...</h1>
    </div>
  );
}
