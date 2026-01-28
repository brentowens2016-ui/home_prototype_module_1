import React, { useEffect, useState } from "react";
import axios from "axios";

export default function SupportTickets() {
  const [tickets, setTickets] = useState([]);
  const [form, setForm] = useState({ user: "", subject: "", description: "" });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    axios.get("/tickets").then(res => setTickets(res.data)).catch(() => setTickets([]));
  }, []);

  const handleFieldChange = (field, value) => {
    setForm(f => ({ ...f, [field]: value }));
  };

  const handleSubmit = () => {
    setSaving(true);
    setError("");
    axios.post("/tickets", form)
      .then(() => {
        setError("Submitted!");
        setForm({ user: "", subject: "", description: "" });
        axios.get("/tickets").then(res => setTickets(res.data));
      })
      .catch(e => setError(e.response?.data?.detail || "Submit failed"))
      .finally(() => setSaving(false));
  };

  const handleClose = (id) => {
    axios.post(`/tickets/${id}/close`)
      .then(() => axios.get("/tickets").then(res => setTickets(res.data)));
  };

  return (
    <div style={{ border: "1px solid #aaa", margin: 16, padding: 16 }}>
      <h2>Support Tickets</h2>
      <div>
        <h3>Submit a Ticket</h3>
        <div>User: <input value={form.user} onChange={e => handleFieldChange("user", e.target.value)} /></div>
        <div>Subject: <input value={form.subject} onChange={e => handleFieldChange("subject", e.target.value)} /></div>
        <div>Description:<br /><textarea value={form.description} onChange={e => handleFieldChange("description", e.target.value)} rows={3} /></div>
        <button onClick={handleSubmit} disabled={saving}>Submit</button>
        {error && <div style={{ color: error === "Submitted!" ? "green" : "red" }}>{error}</div>}
      </div>
      <h3>Existing Tickets</h3>
      {tickets.length === 0 && <div>No tickets found.</div>}
      {tickets.map(t => (
        <div key={t.id} style={{ marginBottom: 8, border: "1px solid #eee", padding: 8 }}>
          <div><strong>{t.subject}</strong> ({t.status})</div>
          <div>User: {t.user}</div>
          <div>Description: {t.description}</div>
          <div>Created: {new Date(t.created_at).toLocaleString()}</div>
          {t.status === "open" && <button onClick={() => handleClose(t.id)} style={{ color: "red", marginTop: 4 }}>Close Ticket</button>}
        </div>
      ))}
    </div>
  );
}
