//
// Smart Home Dashboard UI (React)
//
// # Learning References
// - Python for Dummies
//   - Chapter 16: Web Programming Basics (see REST API concepts)
//   - Chapter 12: Organizing Code with Modules and Packages (see import structure)
// - React (see https://react.dev/)
//   - Main concepts: Components, State, Props, Effects
//   - See also: Vite docs for build tooling (https://vitejs.dev/)
//
// Purpose:
// - Provides a web interface for controlling and monitoring smart home devices.
// - Consumes REST API exposed by FastAPI backend (python_wrapper/api.py).
//
// Service Type:
// - Web dashboard (React, Vite)
// - Consumed by end users in browser
//
// Linked Dependencies:
// - Depends on: REST API (FastAPI), axios (HTTP client)
// - Used by: index.html, main.jsx
//
// Update Guidance:
// - When adding new device types or controls, update both API endpoints and UI components.
// - Document all UI patterns and API interactions for maintainability.
//
// ---
import React, { useEffect, useState } from "react";
import axios from "axios";

import MappingEditor from "./MappingEditor";
import DeviceAlerts from "./DeviceAlerts";

import EmergencyContactsEditor from "./EmergencyContactsEditor";
import SupportTickets from "./SupportTickets";


function BulbControl({ name, bulb, onChange }) {
  const [brightness, setBrightness] = useState(bulb.brightness);
  const [color, setColor] = useState(bulb.color);
  const handleOn = () => axios.post(`/bulbs/${name}/on`).then(() => onChange());
  const handleOff = () => axios.post(`/bulbs/${name}/off`).then(() => onChange());
  const handleBrightness = (e) => {
    const value = Number(e.target.value);
    setBrightness(value);
    axios.post(`/bulbs/${name}/brightness`, null, { params: { brightness: value } }).then(() => onChange());
  };
  const handleColor = (e) => {
    const rgb = e.target.value.match(/\d+/g).map(Number);
    setColor(rgb);
    axios.post(`/bulbs/${name}/color`, null, { params: { r: rgb[0], g: rgb[1], b: rgb[2] } }).then(() => onChange());
  };
  return (
    <div style={{ border: "1px solid #ccc", margin: 8, padding: 8 }}>
      <h3>{name}</h3>
      <div>Status: {bulb.is_on ? "ON" : "OFF"}</div>
      <button onClick={handleOn}>On</button>
      <button onClick={handleOff}>Off</button>
      <div>
        Brightness: <input type="range" min="0" max="100" value={brightness} onChange={handleBrightness} /> {brightness}%
      </div>
      <div>
        Color: <input type="color" value={`rgb(${color[0]},${color[1]},${color[2]})`} onChange={handleColor} />
        <span style={{ marginLeft: 8 }}>RGB({color[0]}, {color[1]}, {color[2]})</span>
      </div>
    </div>
  );
}



export default function Dashboard() {
  const [bulbs, setBulbs] = useState({});
  const [user, setUser] = useState(null); // { username, role, ... }
  const [showDownload, setShowDownload] = useState(false);
  const fetchBulbs = () => axios.get("/bulbs").then((res) => setBulbs(res.data));
  useEffect(() => { if (user) fetchBulbs(); }, [user]);

  if (!user) {
    return <AuthPanel onAuth={setUser} onShowDownload={() => setShowDownload(true)} />;
  }

  if (showDownload) {
    return (
      <div style={{ padding: 32 }}>
        <h2>Download Local Agent</h2>
        <p>Download the latest version of the local agent for your platform:</p>
        <ul>
          <li><a href="/downloads/agent-win.exe">Windows</a></li>
          <li><a href="/downloads/agent-linux.tar.gz">Linux</a></li>
          <li><a href="/downloads/agent-mac.dmg">macOS</a></li>
        </ul>
        <button onClick={() => setShowDownload(false)}>Back to Dashboard</button>
      </div>
    );
  }

  return (
    <div>
      <h1>Smart Bulb Dashboard</h1>
      <div style={{ marginBottom: 16 }}>
        <span>Logged in as: {user.username} ({user.role})</span>
        <button style={{ marginLeft: 16 }} onClick={() => setUser(null)}>Log Out</button>
      </div>
      <DeviceAlerts />
      <MappingEditor />
      <EmergencyContactsEditor userRole={user.role} />
      <SupportTickets />
      {Object.entries(bulbs).map(([name, bulb]) => (
        <BulbControl key={name} name={name} bulb={bulb} onChange={fetchBulbs} />
      ))}
    </div>
  );
}
