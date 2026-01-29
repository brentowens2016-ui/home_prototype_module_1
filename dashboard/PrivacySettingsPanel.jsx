import React, { useEffect, useState } from "react";
import axios from "axios";

export default function PrivacySettingsPanel() {
  const [settings, setSettings] = useState({ data_sharing: false, analytics: true, personalized_ads: false });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    axios.get("/privacy/settings").then(res => setSettings(res.data)).catch(() => {});
  }, []);

  const handleChange = (type) => {
    setSettings(s => ({ ...s, [type]: !s[type] }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      await axios.post("/privacy/settings", settings);
      setError("Saved!");
    } catch (e) {
      setError("Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ border: "1px solid #4a90e2", margin: 16, padding: 16 }}>
      <h3>Privacy & Data Usage</h3>
      <div>
        <label><input type="checkbox" checked={settings.data_sharing} onChange={() => handleChange("data_sharing")} /> Allow data sharing with third parties</label>
        <br />
        <label><input type="checkbox" checked={settings.analytics} onChange={() => handleChange("analytics")} /> Enable usage analytics</label>
        <br />
        <label><input type="checkbox" checked={settings.personalized_ads} onChange={() => handleChange("personalized_ads")} /> Allow personalized ads</label>
      </div>
      <button onClick={handleSave} disabled={saving} style={{ marginTop: 12 }}>{saving ? "Saving..." : "Save Preferences"}</button>
      {error && <div style={{ color: error === "Saved!" ? "green" : "red", marginTop: 8 }}>{error}</div>}
    </div>
  );
}