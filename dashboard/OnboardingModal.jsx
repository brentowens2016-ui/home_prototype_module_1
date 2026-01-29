//
// Onboarding Modal
//
// Copyright (c) 2026 Brent [Your Last Name]. All rights reserved.
// Author/Owner: Brent [Your Last Name]
// Contributor: GitHub Copilot (AI code assistant)
//
import React, { useState } from "react";

const steps = [
  {
    title: "Welcome to the Smart Home Dashboard!",
    content: "This dashboard lets you control, monitor, and automate your smart home devices."
  },
  {
    title: "Device Controls",
    content: "Use the device panels to turn bulbs on/off, adjust brightness, and set colors."
  },
  {
    title: "Mapping & Automation",
    content: "The Mapping Editor lets you assign devices to rooms and create automation rules."
  },
  {
    title: "Alerts & Logs",
    content: "Admins can view device alerts, audit logs, and email notifications for full oversight."
  },
  {
    title: "Support & Settings",
    content: "Access support tickets, manage users, and configure advanced settings from the admin panels."
  }
];

export default function OnboardingModal({ open, onClose }) {
  const [step, setStep] = useState(0);
  if (!open) return null;
  return (
    <div style={{
      position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.4)",
      zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center"
    }}>
      <div style={{ background: "#fff", padding: 32, borderRadius: 8, maxWidth: 420, boxShadow: "0 2px 16px #0003" }}>
        <h2>{steps[step].title}</h2>
        <div style={{ marginBottom: 24 }}>{steps[step].content}</div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <button onClick={onClose}>Skip</button>
          {step > 0 && <button onClick={() => setStep(step - 1)}>Back</button>}
          {step < steps.length - 1 ? (
            <button onClick={() => setStep(step + 1)}>Next</button>
          ) : (
            <button onClick={onClose}>Finish</button>
          )}
        </div>
      </div>
    </div>
  );
}