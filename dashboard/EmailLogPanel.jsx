//
// Email Log Panel
//
// Copyright (c) 2026 Brent [Your Last Name]. All rights reserved.
// Author/Owner: Brent [Your Last Name]
// Contributor: GitHub Copilot (AI code assistant)
//
import React, { useEffect, useState } from "react";
import axios from "axios";

export default function EmailLogPanel() {
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    axios.get("/email-log")
      .then(res => {
        setLogs(res.data);
        setError("");
      })
      .catch(e => {
        setError(e.response?.data?.error || "Failed to load email log");
        setLogs([]);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ border: "1px solid #888", margin: 16, padding: 16 }}>
      <h2>Email Notification Log</h2>
      {loading && <div>Loading...</div>}
      {error && <div style={{ color: "red" }}>{error}</div>}
      {!loading && logs.length === 0 && !error && <div>No email notifications logged.</div>}
      {!loading && logs.length > 0 && (
        <table style={{ width: "100%", fontSize: 14, borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ borderBottom: "1px solid #ccc" }}>Timestamp</th>
              <th style={{ borderBottom: "1px solid #ccc" }}>To</th>
              <th style={{ borderBottom: "1px solid #ccc" }}>Subject</th>
              <th style={{ borderBottom: "1px solid #ccc" }}>Type</th>
              <th style={{ borderBottom: "1px solid #ccc" }}>Details</th>
            </tr>
          </thead>
          <tbody>
            {logs.slice().reverse().map((entry, idx) => (
              <tr key={idx}>
                <td style={{ borderBottom: "1px solid #eee" }}>{new Date(entry.timestamp * 1000).toLocaleString()}</td>
                <td style={{ borderBottom: "1px solid #eee" }}>{entry.to}</td>
                <td style={{ borderBottom: "1px solid #eee" }}>{entry.subject}</td>
                <td style={{ borderBottom: "1px solid #eee" }}>{entry.type}</td>
                <td style={{ borderBottom: "1px solid #eee" }}>{entry.details || ""}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}