// ZigbeeRouters.jsx
// Purpose: UI component for monitoring Zigbee routers and network status
// Implementation to be added when backend API is available

import React from 'react';


import { useEffect, useState } from 'react';
import axios from 'axios';

const ZigbeeRouters = () => {
  const [routers, setRouters] = useState([]);
  const [devices, setDevices] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    axios.get("/zigbee/routers").then(res => setRouters(res.data)).catch(() => setError("Failed to load routers"));
    axios.get("/zigbee/devices").then(res => setDevices(res.data)).catch(() => setError("Failed to load devices"));
  }, []);

  return (
    <div>
      <h2>Zigbee Routers & Network Status</h2>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <div>
        <b>Routers & Coordinators:</b>
        <ul>
          {routers.map(r => (
            <li key={r.ieee}>{r.name} ({r.type}) - {r.status} - Last seen: {r.last_seen ? new Date(r.last_seen * 1000).toLocaleString() : "N/A"}</li>
          ))}
        </ul>
      </div>
      <div>
        <b>Devices:</b>
        <ul>
          {devices.map(d => (
            <li key={d.ieee}>{d.name} ({d.type}) - {d.status} - Signal: {d.signal !== undefined ? d.signal : "N/A"}</li>
          ))}
        </ul>
      </div>
      <div style={{ marginTop: 16 }}>
        <b>Troubleshooting:</b>
        <ul>
          <li>Check router placement for optimal coverage.</li>
          <li>Monitor device signal and last seen time for connectivity issues.</li>
          <li>Use the refresh button to re-scan network status.</li>
        </ul>
        <button onClick={() => window.location.reload()}>Refresh</button>
      </div>
    </div>
  );
};

export default ZigbeeRouters;
