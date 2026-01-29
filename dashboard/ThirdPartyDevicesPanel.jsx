import React, { useEffect, useState } from "react";
import axios from "axios";

// ThirdPartyDevicesPanel: Manage and view third-party, smart appliances, and home assistant integrations
export default function ThirdPartyDevicesPanel() {
  const [devices, setDevices] = useState([]);
  const [wifiDevices, setWifiDevices] = useState([]);
  const [selectedWifi, setSelectedWifi] = useState([]);
  const [integration, setIntegration] = useState({ alexa: false, google: false });

  useEffect(() => {
    axios.get("/mapping").then(res => {
      setDevices(res.data.filter(dev => ["security_hardwired", "security_wifi", "appliance", "alexa", "google_home"].includes(dev.type)));
    });
    axios.get("/discover-wifi").then(res => setWifiDevices(res.data));
  }, []);

  const handleWifiSelect = (id) => {
    setSelectedWifi(sel => sel.includes(id) ? sel.filter(x => x !== id) : [...sel, id]);
  };
  const handleConnectWifi = () => {
    axios.post("/connect-wifi-devices", selectedWifi).then(() => alert("Devices connected!"));
  };
  const handleIntegrationChange = (type) => {
    setIntegration(i => ({ ...i, [type]: !i[type] }));
    axios.post("/integration", { type, enabled: !integration[type] });
  };

  return (
    <section aria-label="Third-Party Devices" style={{ marginTop: 24 }}>
      <h2>Third-Party, Smart Appliances & Home Assistant Integrations</h2>
      <div style={{ marginBottom: 16 }}>
        <label><input type="checkbox" checked={integration.alexa} onChange={() => handleIntegrationChange("alexa")}/> Alexa Integration</label>
        <label style={{ marginLeft: 16 }}><input type="checkbox" checked={integration.google} onChange={() => handleIntegrationChange("google")}/> Google Home Integration</label>
      </div>
      <h3>Discovered Wi-Fi Devices</h3>
      {wifiDevices.length === 0 ? <p>No Wi-Fi devices found.</p> : (
        <ul>
          {wifiDevices.map(dev => (
            <li key={dev.id || dev.address}>
              <label>
                <input type="checkbox" checked={selectedWifi.includes(dev.id || dev.address)} onChange={() => handleWifiSelect(dev.id || dev.address)} />
                {dev.name || dev.address}
              </label>
            </li>
          ))}
        </ul>
      )}
      <button onClick={handleConnectWifi} disabled={selectedWifi.length === 0}>Connect Selected Devices</button>
      <h3>Mapped Third-Party & Appliance Devices</h3>
      {devices.length === 0 ? <p>No third-party devices mapped.</p> : null}
      <ul>
        {devices.map(dev => (
          <li key={dev.id}>
            <strong>{dev.hardware}</strong> ({dev.type.replace("_", " ")})<br />
            Location: {dev.location}<br />
            Function: {dev.function}<br />
            Features: {dev.features && dev.features.join(", ")}
          </li>
        ))}
      </ul>
    </section>
  );
}
