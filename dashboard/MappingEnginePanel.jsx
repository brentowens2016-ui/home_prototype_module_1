import React, { useEffect, useState } from "react";
import axios from "axios";

export default function MappingEnginePanel() {
  const [mapping, setMapping] = useState({ devices: [] });
  const [status, setStatus] = useState("");
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    axios.get("/mapping").then(res => setMapping(res.data));
  }, []);

  const handleChange = (idx, field, value) => {
    setMapping(m => {
      const devices = [...m.devices];
      devices[idx] = { ...devices[idx], [field]: value };
      return { ...m, devices };
    });
  };

  const handleSave = async () => {
    setStatus("");
    try {
      const res = await axios.post("/mapping", mapping);
      setStatus("Mapping saved successfully.");
      setEditing(false);
    } catch (err) {
      setStatus("Error: " + (err?.response?.data?.error || err.message));
    }
  };

  return (
    <div style={{ border: "1px solid #aaa", margin: 16, padding: 16, background: "#f8faff" }}>
      <h2>Device Mapping Engine</h2>
      <button onClick={() => setEditing(e => !e)} style={{ marginBottom: 8 }}>
        {editing ? "Cancel Edit" : "Edit Mapping"}
      </button>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ background: "#eaf6ff" }}>
            <th>ID</th>
            <th>Type</th>
            <th>Room</th>
            <th>Features</th>
          </tr>
        </thead>
        <tbody>
          {mapping.devices.map((dev, idx) => (
            <tr key={dev.id}>
              <td>{dev.id}</td>
              <td>{dev.type}</td>
              <td>
                {editing ? (
                  <input value={dev.room || ""} onChange={e => handleChange(idx, "room", e.target.value)} />
                ) : dev.room}
              </td>
              <td>{Array.isArray(dev.features) ? dev.features.join(", ") : dev.features}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {editing && (
        <button onClick={handleSave} style={{ marginTop: 12 }}>Save Mapping</button>
      )}
      {status && <div style={{ marginTop: 8, color: status.startsWith("Error") ? "#d00" : "#090" }}>{status}</div>}
    </div>
  );
}
