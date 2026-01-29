import React, { useEffect, useState } from "react";
import axios from "axios";

export default function AccessibilitySettingsPanel() {
  const [settings, setSettings] = useState({ high_contrast: false, text_to_speech: false, font_size: "medium" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    axios.get("/accessibility/settings").then(res => setSettings(res.data)).catch(() => {});
  }, []);

  const handleChange = (type, value) => {
    setSettings(s => ({ ...s, [type]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      await axios.post("/accessibility/settings", settings);
      setError("Saved!");
    } catch (e) {
      setError("Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ border: "1px solid #4a90e2", margin: 16, padding: 16 }}>
      <h3>Accessibility Settings</h3>
      <div>
        <label><input type="checkbox" checked={settings.high_contrast} onChange={e => handleChange("high_contrast", e.target.checked)} /> High Contrast Mode</label>
        <br />
        <label><input type="checkbox" checked={settings.text_to_speech} onChange={e => handleChange("text_to_speech", e.target.checked)} /> Enable Text-to-Speech</label>
        <br />
        <label>Font Size:
          <select value={settings.font_size} onChange={e => handleChange("font_size", e.target.value)} style={{ marginLeft: 8 }}>
            <option value="small">Small</option>
            <option value="medium">Medium</option>
            <option value="large">Large</option>
          </select>
        </label>
      </div>
      <button onClick={handleSave} disabled={saving} style={{ marginTop: 12 }}>{saving ? "Saving..." : "Save Preferences"}</button>
      {error && <div style={{ color: error === "Saved!" ? "green" : "red", marginTop: 8 }}>{error}</div>}
    </div>
  );
}