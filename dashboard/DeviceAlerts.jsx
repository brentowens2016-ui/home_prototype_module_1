import React, { useEffect, useState } from "react";
import axios from "axios";

export default function DeviceAlerts() {
  const [alerts, setAlerts] = useState([]);
  const [acknowledged, setAcknowledged] = useState({});

  useEffect(() => {
    fetchAlerts();
    // Optionally poll for new alerts
    const interval = setInterval(fetchAlerts, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchAlerts = () => {
    axios.get("/alerts").then(res => setAlerts(res.data));
  };

  const handleAcknowledge = device_id => {
    axios.post("/alerts/ack", null, { params: { device_id } })
      .then(() => {
        setAcknowledged(a => ({ ...a, [device_id]: true }));
        fetchAlerts();
      });
  };

  if (alerts.length === 0) return null;

  return (
    <div style={{ background: "#ffe0e0", border: "2px solid #b00", padding: 16, margin: 16 }}>
      <h2>Device Alerts</h2>
      <ul>
        {alerts.map(alert => (
          <li key={alert.device_id + alert.timestamp}>
            <b>Device {alert.device_id}</b> is <span style={{ color: "#b00" }}>{alert.event}</span> (since {new Date(alert.timestamp * 1000).toLocaleString()})
            {!acknowledged[alert.device_id] && (
              <button onClick={() => handleAcknowledge(alert.device_id)} style={{ marginLeft: 8 }}>Acknowledge</button>
            )}
          </li>
        ))}
      </ul>
      <div style={{ fontSize: 12, color: "#b00" }}>
        These alerts must be acknowledged locally. Remote monitoring will always be notified of device-down events.
      </div>
    </div>
  );
}
