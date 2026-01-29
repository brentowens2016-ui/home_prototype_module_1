//
// Admin User Manager
//
// Copyright (c) 2026 Brent [Your Last Name]. All rights reserved.
// Author/Owner: Brent [Your Last Name]
// Contributor: GitHub Copilot (AI code assistant)
//
import React, { useEffect, useState } from "react";
import axios from "axios";

const TIER_LABELS = {
  free: "Free",
  basic: "Basic",
  premium: "Premium",
  beta: "Beta (All Features)",
};

export default function AdminUserManager() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");

  const fetchUsers = () => {
    axios.get("/users", { headers: { "X-Role": "admin" } })
      .then(res => setUsers(res.data))
      .catch(() => setError("Failed to load users"));
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleTierChange = (username, newTier) => {
    setError(""); setStatus("");
    axios.post("/users/update_tier", { username, subscription_tier: newTier }, { headers: { "X-Role": "admin" } })
      .then(() => { setStatus("Tier updated"); fetchUsers(); })
      .catch(e => setError(e.response?.data?.detail || "Update failed"));
  };

  return (
    <div style={{ border: "1px solid #4a90e2", margin: 16, padding: 16 }}>
      <h3>User Management & Tier Control</h3>
      {error && <div style={{ color: "red" }}>{error}</div>}
      {status && <div style={{ color: "green" }}>{status}</div>}
      <table style={{ width: "100%", marginTop: 8, borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th>Email</th>
            <th>Role</th>
            <th>Current Tier</th>
            <th>Change Tier</th>
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u.username}>
              <td>{u.username}</td>
              <td>{u.role}</td>
              <td>{TIER_LABELS[u.subscription_tier] || u.subscription_tier}</td>
              <td>
                <select
                  value={u.subscription_tier}
                  onChange={e => handleTierChange(u.username, e.target.value)}
                  disabled={u.role === "admin"}
                >
                  <option value="free">Free</option>
                  <option value="basic">Basic</option>
                  <option value="premium">Premium</option>
                  <option value="beta">Beta (All Features)</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
