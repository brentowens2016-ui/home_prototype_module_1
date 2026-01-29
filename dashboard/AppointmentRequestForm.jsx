import React, { useState } from "react";
import axios from "axios";

export default function AppointmentRequestForm() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    preferred_date: "",
    details: ""
  });
  const [status, setStatus] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setStatus("");
    try {
      const res = await axios.post("/appointment/request", form);
      setSubmitted(true);
      setStatus("Request submitted successfully. We will contact you soon.");
    } catch (err) {
      setStatus("Error submitting request: " + (err?.response?.data?.error || err.message));
    }
  };

  if (submitted) {
    return <div style={{ padding: 16, color: '#090' }}>{status}</div>;
  }

  return (
    <form onSubmit={handleSubmit} style={{ border: "1px solid #aaa", padding: 16, margin: 16, maxWidth: 400, background: "#f8faff" }}>
      <h2>Request Appointment / Estimate</h2>
      <div>
        <label>Name:<br />
          <input name="name" value={form.name} onChange={handleChange} required />
        </label>
      </div>
      <div>
        <label>Email:<br />
          <input name="email" type="email" value={form.email} onChange={handleChange} required />
        </label>
      </div>
      <div>
        <label>Phone:<br />
          <input name="phone" value={form.phone} onChange={handleChange} />
        </label>
      </div>
      <div>
        <label>Preferred Date:<br />
          <input name="preferred_date" type="date" value={form.preferred_date} onChange={handleChange} />
        </label>
      </div>
      <div>
        <label>Details / Notes:<br />
          <textarea name="details" value={form.details} onChange={handleChange} rows={3} />
        </label>
      </div>
      <button type="submit" style={{ marginTop: 12 }}>Submit Request</button>
      {status && <div style={{ marginTop: 8, color: status.startsWith("Error") ? "#d00" : "#090" }}>{status}</div>}
    </form>
  );
}
