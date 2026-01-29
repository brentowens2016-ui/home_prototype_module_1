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
          <br /><span style={{ color: '#4a90e2' }}>Tip: Hover over any field for a tooltip describing its function.</span>
        </span>
      )
    },
    {
      title: "Step 2: Emergency Contacts",
      content: (
        <span>
          Add emergency contacts for alerts and notifications.<br />
          <span style={{ color: '#4a90e2' }}>Tip: Click the info icon next to any input for contextual help.</span>
        </span>
      )
    },
    {
      title: "Step 3: Dashboard Tour",
      content: (
        <span>
          Explore each tab for device controls, automation, notifications, and more.<br />
          <span style={{ color: '#4a90e2' }}>Tip: Use the help button in the top right for a guided tour and feature explanations.</span>
        </span>
      )
    },
    {
      title: "Step 4: Accessibility & Customization",
      content: (
        <span>
          Personalize your dashboard theme, notification preferences, and accessibility settings.<br />
          <span style={{ color: '#4a90e2' }}>Tip: Find accessibility and customization options in the Settings tab.</span>
        </span>
      )
    },
    {
      title: "Step 5: Mobile & Remote Access",
      content: (
        <span>
          Access your dashboard from any device. Mobile support and companion app coming soon!<br />
          <span style={{ color: '#4a90e2' }}>Tip: Bookmark the dashboard URL for quick access on your phone or tablet.</span>
        </span>
      )
    },
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
          <div className="disclaimer" style={{marginTop: '1em', color: 'red', fontWeight: 'bold'}}>
            Disclaimer: User data stored on the server is only accessible for backup and restore operations. No direct access or browsing of user files on the server is permitted. All other data is stored locally or in user-owned cloud storage. This policy is strictly enforced for your privacy and security.
          </div>
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