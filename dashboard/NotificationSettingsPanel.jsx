import React, { useEffect, useState } from "react";
import axios from "axios";

export default function NotificationSettingsPanel() {
  const [channels, setChannels] = useState({ email: true, sms: false, push: false });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    axios.get("/notify/channels").then(res => setChannels(res.data)).catch(() => {});
  }, []);

  const handleChange = (type) => {
    setChannels(c => ({ ...c, [type]: !c[type] }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      await axios.post("/notify/channels", channels);
      setError("Saved!");
    } catch (e) {
      setError("Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ border: "1px solid #4a90e2", margin: 16, padding: 16 }}>
      <h3>Notification Channels</h3>
      <div>
        <label><input type="checkbox" checked={channels.email} onChange={() => handleChange("email")} /> Email</label>
        <label style={{ marginLeft: 16 }}><input type="checkbox" checked={channels.sms} onChange={() => handleChange("sms")} /> SMS</label>
        <label style={{ marginLeft: 16 }}><input type="checkbox" checked={channels.push} onChange={() => handleChange("push")} /> Push Notification</label>
      </div>
      <button onClick={handleSave} disabled={saving} style={{ marginTop: 12 }}>{saving ? "Saving..." : "Save Preferences"}</button>
      {error && <div style={{ color: error === "Saved!" ? "green" : "red", marginTop: 8 }}>{error}</div>}
    </div>
  );
}