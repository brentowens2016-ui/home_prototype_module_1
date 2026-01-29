import React, { useEffect, useState } from "react";
import axios from "axios";

export default function SecuritySettingsPanel() {
  const [settings, setSettings] = useState({ two_factor_auth: false, encryption: true, ota_updates: true });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    axios.get("/security/settings").then(res => setSettings(res.data)).catch(() => {});
  }, []);

  const handleChange = (type) => {
    setSettings(s => ({ ...s, [type]: !s[type] }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      await axios.post("/security/settings", settings);
      setError("Saved!");
    } catch (e) {
      setError("Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ border: "1px solid #4a90e2", margin: 16, padding: 16 }}>
      <h3>Security Settings</h3>
      <div>
        <label><input type="checkbox" checked={settings.two_factor_auth} onChange={() => handleChange("two_factor_auth")} /> Enable Two-Factor Authentication (2FA)</label>
        <br />
        <label><input type="checkbox" checked={settings.encryption} onChange={() => handleChange("encryption")} /> Enable Data Encryption</label>
        <br />
        <label><input type="checkbox" checked={settings.ota_updates} onChange={() => handleChange("ota_updates")} /> Enable OTA Updates</label>
      </div>
      <button onClick={handleSave} disabled={saving} style={{ marginTop: 12 }}>{saving ? "Saving..." : "Save Preferences"}</button>
      {error && <div style={{ color: error === "Saved!" ? "green" : "red", marginTop: 8 }}>{error}</div>}
    </div>
  );
}