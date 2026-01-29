//
// Admin Audit Log
//
// Copyright (c) 2026 Brent [Your Last Name]. All rights reserved.
// Author/Owner: Brent [Your Last Name]
// Contributor: GitHub Copilot (AI code assistant)
//
import React, { useEffect, useState } from "react";
import axios from "axios";

export default function AdminAuditLog() {
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    axios.get("/admin_audit_log.json")
      .then(res => setLogs(res.data))
      .catch(() => setError("Could not load audit log."));
  }, []);

  return (
    <div style={{ border: "1px solid #888", margin: 16, padding: 16 }}>
      <h3>Admin Audit Log</h3>
      {error && <div style={{ color: "red" }}>{error}</div>}
      <div style={{ maxHeight: 300, overflowY: "auto", fontSize: 13 }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th>Time (UTC)</th>
              <th>Admin</th>
              <th>Action</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            {logs.slice().reverse().map((log, i) => (
              <tr key={i}>
                <td>{log.timestamp}</td>
                <td>{log.admin}</td>
                <td>{log.action}</td>
                <td><pre style={{ margin: 0 }}>{JSON.stringify(log.details, null, 1)}</pre></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
