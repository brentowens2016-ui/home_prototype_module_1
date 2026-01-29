import React, { useEffect, useState } from "react";
import axios from "axios";

export default function EmergencyContactsEditor({ userRole }) {
  const [contacts, setContacts] = useState({ emergency_services: { name: "911", phone: "911" }, contacts: [] });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const isSpecialAccess = userRole === "special";

  useEffect(() => {
    axios.get("/contacts").then(res => setContacts(res.data)).catch(() => setContacts({ emergency_services: { name: "911", phone: "911" }, contacts: [] }));
  }, []);

  const handleFieldChange = (field, value) => {
    setContacts(c => ({ ...c, emergency_services: { ...c.emergency_services, [field]: value } }));
  };

  const handleContactChange = (idx, field, value) => {
    setContacts(c => ({ ...c, contacts: c.contacts.map((ct, i) => i === idx ? { ...ct, [field]: value } : ct) }));
  };

  const handleAddContact = () => {
    if (contacts.contacts.length < 7) {
      setContacts(c => ({ ...c, contacts: [...c.contacts, { name: "", phone: "", email: "", mobile: "" }] }));
    }
  };

  const handleRemoveContact = idx => {
    setContacts(c => ({ ...c, contacts: c.contacts.filter((_, i) => i !== idx) }));
  };

  const handleSave = () => {
    setSaving(true);
    setError("");
    axios.post("/contacts", contacts)
      .then(() => setError("Saved!"))
      .catch(e => setError(e.response?.data?.detail || "Save failed"))
      .finally(() => setSaving(false));
  };

  return (
    <div style={{ border: "1px solid #aaa", margin: 16, padding: 16 }}>
      <h2>Emergency Contacts Editor</h2>
      <div>
        <strong>Emergency Services:</strong>
        <div>Name: <input value={contacts.emergency_services.name} onChange={e => handleFieldChange("name", e.target.value)} disabled={isSpecialAccess} /></div>
        <div>Phone: <input value={contacts.emergency_services.phone} onChange={e => handleFieldChange("phone", e.target.value)} disabled={isSpecialAccess} /></div>
      </div>
      <h3>Contacts (up to 7):</h3>
      {contacts.contacts.map((ct, idx) => (
        <div key={idx} style={{ marginBottom: 8, border: "1px solid #eee", padding: 8 }}>
          <div>Name: <input value={ct.name} onChange={e => handleContactChange(idx, "name", e.target.value)} disabled={isSpecialAccess} /></div>
          <div>Phone: <input value={ct.phone} onChange={e => handleContactChange(idx, "phone", e.target.value)} disabled={isSpecialAccess} /></div>
          <div>Email: <input value={ct.email || ""} onChange={e => handleContactChange(idx, "email", e.target.value)} disabled={isSpecialAccess} /></div>
          <div>Mobile: <input value={ct.mobile || ""} onChange={e => handleContactChange(idx, "mobile", e.target.value)} disabled={isSpecialAccess} /></div>
          {!isSpecialAccess && <button onClick={() => handleRemoveContact(idx)} style={{ color: "red", marginTop: 4 }}>Remove</button>}
        </div>
      ))}
      {!isSpecialAccess && <button onClick={handleAddContact} style={{ marginRight: 8 }} disabled={contacts.contacts.length >= 7}>Add Contact</button>}
      {!isSpecialAccess && <button onClick={handleSave} disabled={saving}>Save Contacts</button>}
      {error && <div style={{ color: error === "Saved!" ? "green" : "red" }}>{error}</div>}
      {isSpecialAccess && <div style={{ color: "#888", marginTop: 8 }}>Special Access: View-only. You cannot edit contacts.</div>}
    </div>
  );
}
