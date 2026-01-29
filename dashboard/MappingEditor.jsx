
import React, { useEffect, useState } from "react";
import axios from "axios";
import FloorplanGrid from "./FloorplanGrid";
import AutomationRulesEditor from "./AutomationRulesEditor";
import RoomManager from "./RoomManager";

// Tier limits must match backend
const TIER_LIMITS = {
  free:    { max_devices: 10, max_sqft: 800 },
  basic:   { max_devices: 25, max_sqft: 1600 },
  premium: { max_devices: 50, max_sqft: 2400 },
};

export default function MappingEditor() {

  const [mapping, setMapping] = useState([]);
  const [rules, setRules] = useState([]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [rooms, setRooms] = useState([]);
  const [totalSqft, setTotalSqft] = useState(2000);
  const [userTier, setUserTier] = useState("free");
  const [tierInfo, setTierInfo] = useState(TIER_LIMITS["free"]);

  // Fetch user info for tier and sqft
  useEffect(() => {
    axios.get("/users", { headers: { "X-Role": "admin" } })
      .then(res => {
        const admin = res.data.find(u => u.role === "admin") || res.data[0];
        setUserTier(admin?.subscription_tier || "free");
        setTotalSqft(admin?.declared_sqft || 0);
        setTierInfo(TIER_LIMITS[admin?.subscription_tier] || TIER_LIMITS["free"]);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    axios.get("/mapping").then(res => setMapping(res.data)).catch(() => setMapping([]));
  }, []);


  const handleFieldChange = (idx, field, value) => {
    setMapping(m => m.map((entry, i) => i === idx ? { ...entry, [field]: value } : entry));
  };


  const handleAddDevice = () => {
    if (mapping.length >= tierInfo.max_devices) {
      setError(`Device limit reached for your tier (${userTier}: ${tierInfo.max_devices} devices).`);
      return;
    }
    setMapping(m => [
      ...m,
      {
        id: '',
        location: '',
        type: 'pressure',
        function: '',
        room: '',
        x: 0,
        y: 0
      }
    ]);
  };

  const handleRemoveDevice = idx => {
    setMapping(m => m.filter((_, i) => i !== idx));
  };


  const handleSave = () => {
    setSaving(true);
    setError("");
    // Frontend check before sending
    if (totalSqft > tierInfo.max_sqft) {
      setError(`Your declared square footage (${totalSqft}) exceeds the limit for your subscription tier (${userTier}: ${tierInfo.max_sqft} sqft). Please upgrade your plan.`);
      setSaving(false);
      return;
    }
    if (mapping.length > tierInfo.max_devices) {
      setError(`Device mapping exceeds allowed devices for your tier (${userTier}: ${tierInfo.max_devices} devices). Please upgrade your plan or remove devices.`);
      setSaving(false);
      return;
    }
    axios.post("/mapping", mapping)
      .then(() => setError("Saved!"))
      .catch(e => setError(e.response?.data?.error || "Save failed"))
      .finally(() => setSaving(false));
  };

  const handleMove = (idx, x, y) => {
    setMapping(m => m.map((entry, i) => i === idx ? { ...entry, x, y } : entry));
  };

  return (
    <div style={{ border: "1px solid #aaa", margin: 16, padding: 16 }}>
      <h2>Device & Room Mapping Editor</h2>
      <div style={{ marginBottom: 8 }}>
        <b>Subscription Tier:</b> {userTier} &nbsp;|&nbsp;
        <b>Max Devices:</b> {tierInfo.max_devices} &nbsp;|&nbsp;
        <b>Max Sqft:</b> {tierInfo.max_sqft}
      </div>
      <div style={{ marginBottom: 8 }}>
        <b>Current Devices:</b> {mapping.length} &nbsp;|&nbsp;
        <b>Declared Sqft:</b> {totalSqft}
      </div>
      <RoomManager rooms={rooms} setRooms={setRooms} totalSqft={totalSqft} setTotalSqft={setTotalSqft} />
      <FloorplanGrid mapping={mapping} rooms={rooms} onMove={handleMove} />
      <AutomationRulesEditor mapping={mapping} rules={rules} setRules={setRules} />
      {mapping.length === 0 && <div>No mapping loaded.</div>}
      {mapping.map((entry, idx) => (
        <div key={entry.id || idx} style={{ marginBottom: 12, padding: 8, border: "1px solid #eee" }}>
          <div>ID: <input value={entry.id} onChange={e => handleFieldChange(idx, "id", e.target.value)} /></div>
          <div>Location: <input value={entry.location} onChange={e => handleFieldChange(idx, "location", e.target.value)} /></div>
          <div>
            Type:
            <select
              value={entry.type}
              onChange={e => handleFieldChange(idx, "type", e.target.value)}
            >
              <option value="pressure">Pressure Sensor</option>
              <option value="motion">Motion Sensor</option>
              <option value="door">Door Sensor</option>
              <option value="bulb">Smart Bulb</option>
              <option value="router">Router</option>
              <option value="hub">Hub</option>
              <option value="smoke">Smoke Detector</option>
              <option value="co">CO Detector</option>
              <option value="alarm">Alarm</option>
              <option value="other">Other (user-defined)</option>
            </select>
            {entry.type === "other" && (
              <span> <input placeholder="Custom type" value={entry.customType || ""} onChange={e => handleFieldChange(idx, "customType", e.target.value)} /></span>
            )}
          </div>
          <div>Function: <input value={entry.function || ""} onChange={e => handleFieldChange(idx, "function", e.target.value)} /></div>
          <div>Room: <input value={entry.room || ""} onChange={e => handleFieldChange(idx, "room", e.target.value)} /></div>
          <div>X: <input type="number" value={entry.x || 0} onChange={e => handleFieldChange(idx, "x", Number(e.target.value))} /></div>
          <div>Y: <input type="number" value={entry.y || 0} onChange={e => handleFieldChange(idx, "y", Number(e.target.value))} /></div>
          <button onClick={() => handleRemoveDevice(idx)} style={{ marginTop: 4, color: "red" }}>Remove</button>
        </div>
      ))}
      <button onClick={handleAddDevice} style={{ marginRight: 8 }}>Add Device</button>
      <button onClick={handleSave} disabled={saving}>Save Mapping</button>
      {error && <div style={{ color: error === "Saved!" ? "green" : "red" }}>{error}</div>}
    </div>
  );
}
