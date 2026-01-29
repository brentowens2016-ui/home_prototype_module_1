import React, { useEffect, useState } from "react";
import axios from "axios";

// ThirdPartyDevicesPanel: Manage and view third-party security devices
export default function ThirdPartyDevicesPanel() {
  const [devices, setDevices] = useState([]);
  useEffect(() => {
    axios.get("/mapping").then(res => {
      setDevices(res.data.filter(dev => ["security_hardwired", "security_wifi"].includes(dev.type)));
    });
  }, []);
  return (
    <section aria-label="Third-Party Devices" style={{ marginTop: 24 }}>
      <h2>Third-Party Security Devices</h2>
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
