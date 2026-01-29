//
// Admin Invite Panel
//
// Copyright (c) 2026 Brent [Your Last Name]. All rights reserved.
// Author/Owner: Brent [Your Last Name]
// Contributor: GitHub Copilot (AI code assistant)
//
import React, { useState } from "react";
import axios from "axios";

export default function AdminInvitePanel() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  const handleInvite = () => {
    setStatus(""); setError("");
    axios.post("/users/invite", { email }, { headers: { "X-Role": "admin" } })
      .then(res => {
        if (res.data.status === "invited") setStatus("Invitation sent!");
        else if (res.data.status === "already_invited") setStatus("User already invited.");
        else setStatus("Unknown response.");
      })
      .catch(e => setError(e.response?.data?.detail || "Invite failed"));
  };

  return (
    <div style={{ border: "1px solid #4a90e2", margin: 16, padding: 16 }}>
      <h3>Invite User to Beta</h3>
      <input
        type="email"
        placeholder="User Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        style={{ marginRight: 8 }}
      />
      <button onClick={handleInvite} disabled={!email}>Invite</button>
      {status && <div style={{ color: "green", marginTop: 8 }}>{status}</div>}
      {error && <div style={{ color: "red", marginTop: 8 }}>{error}</div>}
    </div>
  );
}
