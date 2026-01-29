import React, { useEffect, useState } from "react";
import axios from "axios";

// AdminNotifications: Shows real-time notifications and anomaly events for admins
export default function AdminNotifications() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Poll for new notifications/anomalies every 10s
    const fetchEvents = () => {
      axios.get("/alerts").then(res => {
        setEvents(res.data || []);
        setLoading(false);
      });
    };
    fetchEvents();
    const interval = setInterval(fetchEvents, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleAcknowledge = (deviceId) => {
    axios.post("/alerts/ack", null, { params: { device_id: deviceId } })
      .then(() => setEvents(events.filter(e => e.device_id !== deviceId)));
  };

  return (
    <section aria-label="Admin Notifications" style={{ marginTop: 24 }}>
      <h2>Notifications & Anomaly Events</h2>
      {loading ? <p>Loading...</p> : null}
      {events.length === 0 && !loading ? <p>No active notifications or anomalies.</p> : null}
      <ul>
        {events.map(event => (
          <li key={event.device_id} style={{ marginBottom: 12 }}>
            <strong>{event.type || "Anomaly"}:</strong> {event.message}
            <br />
            <span>Device: {event.device_id}</span>
            <button style={{ marginLeft: 16 }} onClick={() => handleAcknowledge(event.device_id)}>
              Acknowledge
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
