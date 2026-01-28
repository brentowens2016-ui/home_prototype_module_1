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
  const fetchBulbs = () => axios.get("/bulbs").then((res) => setBulbs(res.data));
  useEffect(() => { fetchBulbs(); }, []);
  return (
    <div>
      <h1>Smart Bulb Dashboard</h1>
      <DeviceAlerts />
      <MappingEditor />
      {Object.entries(bulbs).map(([name, bulb]) => (
        <BulbControl key={name} name={name} bulb={bulb} onChange={fetchBulbs} />
      ))}
    </div>
  );
}
