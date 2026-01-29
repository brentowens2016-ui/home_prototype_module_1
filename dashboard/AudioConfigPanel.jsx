import React, { useEffect, useState } from "react";
import axios from "axios";

export default function AudioConfigPanel() {
  const [devices, setDevices] = useState([]);
  const [config, setConfig] = useState({ input_device_index: null, output_device_index: null });
  const [saving, setSaving] = useState(false);
  const [endpoints, setEndpoints] = useState([]);

  useEffect(() => {
    axios.get("/audio/devices").then(res => setDevices(res.data));
    axios.get("/audio/config").then(res => setConfig(res.data));
    axios.get("/audio-endpoints").then(res => setEndpoints(res.data));
  }, []);

  const handleChange = (type, value) => {
    setConfig(cfg => ({ ...cfg, [type]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    await axios.post("/audio/config", config);
    setSaving(false);
    alert("Audio device configuration saved.");
  };

  return (
    <div style={{ border: "2px solid #4a90e2", margin: 16, padding: 16, position: "relative" }}>
      <h2>Audio Device Configuration</h2>
      {/* Watermark and copyright */}
      <div style={{ position: "absolute", bottom: 8, right: 12, fontSize: 12, color: "#b0b0b0", pointerEvents: "none", userSelect: "none" }}>
        &copy; 2026 Brent [Your Last Name], Author/Creator<br />
        GitHub Copilot, Contributor
      </div>
      <div>
        <label>Input Device: </label>
        <select value={config.input_device_index ?? ""} onChange={e => handleChange("input_device_index", Number(e.target.value))}>
          <option value="">(System Default)</option>
          {devices.filter(d => d.max_input_channels > 0).map(d => (
            <option key={d.index} value={d.index}>{d.name} (#{d.index})</option>
          ))}
        </select>
      </div>
      <div>
        <label>Output Device: </label>
        <select value={config.output_device_index ?? ""} onChange={e => handleChange("output_device_index", Number(e.target.value))}>
          <option value="">(System Default)</option>
          {devices.filter(d => d.max_output_channels > 0).map(d => (
            <option key={d.index} value={d.index}>{d.name} (#{d.index})</option>
          ))}
        </select>
      </div>
      <div style={{ marginTop: 24 }}>
        <h3>Mapped HDMI Hubs & Audio Endpoints</h3>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#eaf6ff" }}>
              <th style={{ border: "1px solid #ccc", padding: 4 }}>ID</th>
              <th style={{ border: "1px solid #ccc", padding: 4 }}>Location</th>
              <th style={{ border: "1px solid #ccc", padding: 4 }}>Hardware</th>
              <th style={{ border: "1px solid #ccc", padding: 4 }}>Features</th>
              <th style={{ border: "1px solid #ccc", padding: 4 }}>Type</th>
              <th style={{ border: "1px solid #ccc", padding: 4 }}>Function</th>
            </tr>
          </thead>
          <tbody>
            {endpoints.map(ep => (
              <tr key={ep.id}>
                <td style={{ border: "1px solid #ccc", padding: 4 }}>{ep.id}</td>
                <td style={{ border: "1px solid #ccc", padding: 4 }}>{ep.location}</td>
                <td style={{ border: "1px solid #ccc", padding: 4 }}>{ep.hardware ?? "-"}</td>
                <td style={{ border: "1px solid #ccc", padding: 4 }}>{Array.isArray(ep.features) ? ep.features.join(", ") : "-"}</td>
                <td style={{ border: "1px solid #ccc", padding: 4 }}>{ep.type}</td>
                <td style={{ border: "1px solid #ccc", padding: 4 }}>{ep.function ?? "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button onClick={handleSave} disabled={saving} style={{ marginTop: 12 }}>
        {saving ? "Saving..." : "Save Configuration"}
      </button>
    </div>
  );
}
