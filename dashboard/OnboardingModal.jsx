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
    content: "Let's get your smart home set up. This guided onboarding will walk you through the essential configuration steps."
  },
  {
    title: "Step 1: Device Mapping",
    content: (
      <span>
        Assign devices to rooms and set up automation rules.<br />
        <b>Action:</b> <a href="#mapping" onClick={() => window.scrollTo(0, document.getElementById('tabpanel-mapping')?.offsetTop || 0)}>Go to Mapping Editor</a>
      </span>
    )
  },
  {
    title: "Step 2: Emergency Contacts",
    content: (
      <span>
        Add emergency contacts for alerts and notifications.<br />
        <b>Action:</b> <a href="#support" onClick={() => window.scrollTo(0, document.getElementById('tabpanel-support')?.offsetTop || 0)}>Go to Emergency Contacts Editor</a>
      </span>
    )
  },
  {
    title: "Step 3: Notification Preferences",
    content: (
      <span>
        Configure how you receive alerts and notifications.<br />
        <b>Action:</b> <a href="#notifications" onClick={() => window.scrollTo(0, document.getElementById('tabpanel-admin')?.offsetTop || 0)}>Go to Notification Settings</a>
      </span>
    )
  },
  {
    title: "Step 4: Support & Help",
    content: (
      <span>
        Access support tickets and help resources.<br />
        <b>Action:</b> <a href="#support" onClick={() => window.scrollTo(0, document.getElementById('tabpanel-support')?.offsetTop || 0)}>Go to Support Tickets</a>
      </span>
    )
  },
  {
    title: "Setup Complete!",
    content: "Your smart home is now configured. You can revisit these panels anytime from the dashboard tabs."
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