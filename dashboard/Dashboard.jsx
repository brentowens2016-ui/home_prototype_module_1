// PrivacyDashboardPanel: Visualize data collection, storage, and retention
function PrivacyDashboardPanel() {
  const [dataInfo, setDataInfo] = useState({});
  useEffect(() => {
    fetch('/privacy/data-info').then(res => res.json()).then(setDataInfo);
  }, []);
  return (
    <div style={{ border: '1px solid #aaa', margin: 16, padding: 16 }}>
      <h2>Privacy Dashboard</h2>
      <div><b>Data Collected:</b> {dataInfo.collected ? dataInfo.collected.join(', ') : 'Loading...'}</div>
      <div><b>Storage Location:</b> {dataInfo.storage || 'Loading...'}</div>
      <div><b>Retention Policy:</b> {dataInfo.retention || 'Loading...'}</div>
      <button style={{ marginTop: 12 }}>Manage Data Retention</button>
    </div>
  );
}
// Multi-language support scaffolding
import { useState } from 'react';
const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Español' },
  { code: 'fr', label: 'Français' },
  { code: 'de', label: 'Deutsch' },
  { code: 'zh', label: '中文' },
  // Add more languages as needed
];
// StorageUsagePanel: Shows user storage usage and quota
import { useEffect, useState } from 'react';
function StorageUsagePanel() {
  const [usage, setUsage] = useState(0);
  const [quota, setQuota] = useState(512 * 1024 * 1024); // 0.5 GB default
  useEffect(() => {
    fetch('/backup/usage').then(res => res.json()).then(data => setUsage(data.usage || 0));
  }, []);
  return (
    <div style={{ margin: '16px 0', border: '1px solid #aaa', padding: 8 }}>
      <b>Storage Usage:</b> {((usage / 1024 / 1024).toFixed(1))} MB / {(quota / 1024 / 1024).toFixed(0)} MB
      <div style={{ background: '#eee', height: 8, width: 200, marginTop: 4 }}>
        <div style={{ background: usage > quota * 0.9 ? '#e74c3c' : '#4a90e2', height: 8, width: `${Math.min(usage / quota * 200, 200)}px` }} />
      </div>
      {usage > quota * 0.9 && <span style={{ color: '#e74c3c', fontSize: 12 }}>Warning: Approaching storage limit!</span>}
    </div>
  );
}
// SupportCollaborationPanel: Real-time collaboration, remote diagnostics, and support tools
import { useState } from 'react';
function SupportCollaborationPanel({ user }) {
  const [remoteAllowed, setRemoteAllowed] = useState(false);
  return (
    <div>
      <h2>Support & Collaboration</h2>
      <p>Tech support and admins can access your dashboard (with consent) for real-time troubleshooting, remote diagnostics, and collaborative problem solving.</p>
      <div style={{ marginBottom: 16 }}>
        <label>
          <input type="checkbox" checked={remoteAllowed} onChange={e => setRemoteAllowed(e.target.checked)} />
          Allow remote access for support and diagnostics
        </label>
      </div>
      <div style={{ marginBottom: 16 }}>
        <button disabled={!remoteAllowed}>Request Remote Support</button>
        <button style={{ marginLeft: 8 }} disabled={!remoteAllowed}>Share Dashboard Session</button>
        <button style={{ marginLeft: 8 }} disabled={!remoteAllowed}>Access Diagnostic Tools</button>
      </div>
      <div style={{ color: '#888', fontSize: 14 }}>
        <b>Security Tip:</b> Remote access and diagnostics require your explicit consent. All sessions are logged for privacy and security.
      </div>
      <div style={{ marginTop: 16 }}>
        <b>Session Info:</b> <span>Location: {user.location || "Unknown"} | User: {user.username}</span>
      </div>
    </div>
  );
}
//
// Smart Home Dashboard UI (React)
//
// Copyright (c) 2026 Brent [Your Last Name]. All rights reserved.
// Author/Owner: Brent [Your Last Name]
// Contributor: GitHub Copilot (AI code assistant)
//
// # Learning References
// - Python for Dummies
//   - Chapter 16: Web Programming Basics (see REST API concepts)
//   - Chapter 12: Organizing Code with Modules and Packages (see import structure)
// - React (see https://react.dev/)
//   - Main concepts: Components, State, Props, Effects
//   - See also: Vite docs for build tooling (https://vitejs.dev/)
//
// Purpose:
// - Provides a web interface for controlling and monitoring smart home devices.
// - Consumes REST API exposed by FastAPI backend (python_wrapper/api.py).
//
// Service Type:
// - Web dashboard (React, Vite)
// - Consumed by end users in browser
//
// Linked Dependencies:
// - Depends on: REST API (FastAPI), axios (HTTP client)
// - Used by: index.html, main.jsx
//
// Update Guidance:
// - When adding new device types or controls, update both API endpoints and UI components.
// - Document all UI patterns and API interactions for maintainability.
//
// ---
import React, { useEffect, useState } from "react";
import axios from "axios";
import { doubleEncrypt, doubleDecrypt } from "./encryption";
// Axios double encryption interceptor
axios.interceptors.request.use(async config => {
  if (config.data) {
    config.data = await doubleEncrypt(config.data);
    config.headers["Content-Type"] = "application/octet-stream";
  }
  return config;
});
axios.interceptors.response.use(async response => {
  if (response.headers["content-type"] === "application/octet-stream" && response.data) {
    response.data = await doubleDecrypt(response.data);
  }
  return response;
});

import MappingEditor from "./MappingEditor";
import DeviceAlerts from "./DeviceAlerts";
import SupportTickets from "./SupportTickets";
import AuthPanel from "./AuthPanel";
import AIVoicePanel from "./AIVoicePanel";
import AudioConfigPanel from "./AudioConfigPanel";
import AdminInvitePanel from "./AdminInvitePanel";
import AdminUserManager from "./AdminUserManager";
import AdminAuditLog from "./AdminAuditLog";
import EmailLogPanel from "./EmailLogPanel";
import OnboardingModal from "./OnboardingModal";
import AdminNotifications from "./AdminNotifications";
import ThirdPartyDevicesPanel from "./ThirdPartyDevicesPanel";

import NotificationSettingsPanel from "./NotificationSettingsPanel";
import PrivacySettingsPanel from "./PrivacySettingsPanel";
import AccessibilitySettingsPanel from "./AccessibilitySettingsPanel";
import SecuritySettingsPanel from "./SecuritySettingsPanel";

const DASHBOARD_TABS = {
  user: [
    { key: "devices", label: "Devices & Controls" },
    { key: "mapping", label: "Mapping & Automation" },
    { key: "updates", label: "Updates & Recovery" },
    { key: "notifications", label: "Notification Settings" },
    { key: "privacy", label: "Privacy & Data Usage" },
    { key: "accessibility", label: "Accessibility" },
    { key: "security", label: "Security" },
    { key: "support", label: "Support & Tickets" },
  ],
  tech: [
    { key: "devices", label: "Devices & Controls" },
    { key: "mapping", label: "Mapping & Automation" },
    { key: "updates", label: "Updates & Recovery" },
    { key: "notifications", label: "Notification Settings" },
    { key: "privacy", label: "Privacy & Data Usage" },
    { key: "accessibility", label: "Accessibility" },
    { key: "security", label: "Security" },
    { key: "support", label: "Support & Tickets" },
    { key: "impersonate", label: "Impersonate User" },
  ],
  admin: [
    { key: "admin", label: "Admin Dashboard" },
    { key: "users", label: "User Management" },
    { key: "logs", label: "Logs & Audit" },
    { key: "devices", label: "Devices & Controls" },
    { key: "mapping", label: "Mapping & Automation" },
    { key: "updates", label: "Updates & Recovery" },
    { key: "notifications", label: "Notification Settings" },
    { key: "privacy", label: "Privacy & Data Usage" },
    { key: "accessibility", label: "Accessibility" },
    { key: "security", label: "Security" },
    { key: "support", label: "Support & Tickets" },
    { key: "third_party_devices", label: "Third-Party Devices" }
  ]
};
// Updates & Recovery Panel (placeholder)
function UpdatesRecoveryPanel({ user }) {
  return (
    <div>
      <h2>Updates, Restore & Cloud Storage</h2>
      <p>Check for agent updates, install new versions, restore/recover system, and configure cloud storage for backups.</p>
      <div style={{ marginBottom: 16 }}>
        <button>Check for Updates</button>
        <button style={{ marginLeft: 8 }}>Install Latest Agent</button>
      </div>
      <div style={{ marginBottom: 16 }}>
        <button>Restore/Recover</button>
      </div>
      <div style={{ marginBottom: 16 }}>
        <label>Cloud Storage Provider:</label>
        <select>
          <option value="">Select Provider</option>
          <option value="aws">AWS S3</option>
          <option value="gdrive">Google Drive</option>
          <option value="azure">Azure Blob</option>
        </select>
        <input type="text" placeholder="Cloud Token/API Key" style={{ marginLeft: 8 }} />
        <input type="text" placeholder="Bucket/Folder Name" style={{ marginLeft: 8 }} />
        <button style={{ marginLeft: 8 }}>Save Cloud Config</button>
      </div>
      <div style={{ color: '#888', fontSize: 14 }}>
        <b>Security Tip:</b> For maximum privacy, configure your own cloud storage. Otherwise, backups will be stored on the system server.
      </div>
    </div>
  );
}

// Helper: get user role from auth/session (stub for now)
function getUserRole() {
  // TODO: Replace with real auth/session logic
  return window.localStorage.getItem("user_role") || "user";
}

function BulbControl({ name, bulb, onChange }) {
  const [brightness, setBrightness] = useState(bulb.brightness);
  const [color, setColor] = useState(bulb.color);
  const handleOn = () => axios.post(`/bulbs/${name}/on`).then(() => onChange());
  const handleOff = () => axios.post(`/bulbs/${name}/off`).then(() => onChange());
  const handleBrightness = (e) => {
    const value = Number(e.target.value);
    setBrightness(value);
    axios.post(`/bulbs/${name}/brightness`, null, { params: { brightness: value } }).then(() => onChange());
  };
  const handleColor = (e) => {
    const rgb = e.target.value.match(/\d+/g).map(Number);
    setColor(rgb);
    axios.post(`/bulbs/${name}/color`, null, { params: { r: rgb[0], g: rgb[1], b: rgb[2] } }).then(() => onChange());
  };
  return (
    <div style={{ border: "1px solid #ccc", margin: 8, padding: 8 }}>
      <h3>{name}</h3>
      <div>Status: {bulb.is_on ? "ON" : "OFF"}</div>
      <button onClick={handleOn}>On</button>
      <button onClick={handleOff}>Off</button>
      <div>
        Brightness: <input type="range" min="0" max="100" value={brightness} onChange={handleBrightness} /> {brightness}%
      </div>
      <div>
        Color: <input type="color" value={`rgb(${color[0]},${color[1]},${color[2]})`} onChange={handleColor} />
        <span style={{ marginLeft: 8 }}>RGB({color[0]}, {color[1]}, {color[2]})</span>
      </div>
    </div>
  );
}



// Watermark component for copyright/ownership assertion
function Watermark() {
  return (
    <div style={{
      position: "fixed",
      bottom: 10,
      right: 20,
      opacity: 0.18,
      fontSize: 18,
      pointerEvents: "none",
      zIndex: 9999,
      color: "#222"
    }}>
      © 2026 Brent [Your Last Name] · Powered by GitHub Copilot
    </div>
  );
}

// Main Dashboard component (role-based tab filtering, ARIA attributes)
export default function Dashboard() {
  const role = getUserRole();
  const tabs = DASHBOARD_TABS[role] || DASHBOARD_TABS.user;
  const [activeTab, setActiveTab] = useState(tabs[0].key);

  return (
    <div role="application" aria-label="Smart Home Dashboard">
      <nav aria-label="Dashboard Navigation">
        <ul style={{ display: "flex", gap: 16, listStyle: "none", padding: 0 }}>
          {tabs.map(tab => (
            <li key={tab.key}>
              <button
                aria-label={tab.label}
                aria-current={activeTab === tab.key ? "page" : undefined}
                onClick={() => setActiveTab(tab.key)}
                style={{ fontWeight: activeTab === tab.key ? "bold" : "normal" }}
              >
                {tab.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>
      <main aria-live="polite" tabIndex={-1}>
        {/* Render tab content based on activeTab and role */}
        {activeTab === "devices" && <DeviceAlerts />}
        {activeTab === "mapping" && <MappingEditor />}
        {activeTab === "support" && <SupportTickets />}
        {role === "admin" && activeTab === "admin" && <AdminAuditLog />}
        {role === "admin" && activeTab === "users" && <AdminUserManager />}
        {role === "admin" && activeTab === "logs" && <EmailLogPanel />}
        {/* Only show admin panels for admin role */}
      </main>
      <Watermark />
    </div>
  );
}

export default function Dashboard() {
  const [bulbs, setBulbs] = useState({});
  const [user, setUser] = useState(null); // { username, role, ... }
  const [showDownload, setShowDownload] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [activeTab, setActiveTab] = useState(null);
  const fetchBulbs = () => axios.get("/bulbs").then((res) => setBulbs(res.data));
  useEffect(() => { if (user) fetchBulbs(); }, [user]);
  useEffect(() => {
    if (user && !localStorage.getItem("onboarding_complete")) {
      setShowOnboarding(true);
    }
    if (user && !activeTab) {
      // Set default tab based on role
      if (user.role === "admin") setActiveTab("admin");
      else if (user.role === "tech") setActiveTab("devices");
      else setActiveTab("devices");
    }
  }, [user]);

  const handleOnboardingClose = () => {
    setShowOnboarding(false);
    localStorage.setItem("onboarding_complete", "1");
  };

  if (!user) {
    return <AuthPanel onAuth={setUser} onShowDownload={() => setShowDownload(true)} />;
  }

  const [agreementAccepted, setAgreementAccepted] = useState(false);
  if (showDownload) {
    return (
      <div style={{ padding: 32 }}>
        <h2>Download Local Agent</h2>
        <div style={{ border: '1px solid #aaa', padding: 16, marginBottom: 16 }}>
          <h3>User Agreement & Privacy Policy</h3>
          <div style={{ maxHeight: 180, overflowY: 'auto', fontSize: 14, background: '#f9f9f9', padding: 8 }}>
            <b>Terms of Service:</b> By downloading or installing this agent, you agree to abide by all applicable laws and our user agreement. Subscription fees cover access to the software platform and standard support only. Hardware, installation, interfaces, wiring, electrical or plumbing work, and custom programming for new features or hardware are not included and may require separate agreements or fees. Use of the system is at your own risk. We reserve the right to update these terms at any time.<br /><br />
            <b>Privacy Policy:</b> This system collects only the data necessary to provide monitoring, automation, and safety features. Data is not sold or shared with third parties except as required by law or to provide core services. You may review, update, or request deletion of your data at any time. Our privacy practices may change to comply with legal requirements or policy updates; you will be notified of any changes.<br /><br />
            <b>Authorization:</b> Remote access, diagnostics, and support require your explicit consent. All sessions are logged for privacy and security. You may revoke authorization at any time in your dashboard settings.<br /><br />
            <b>Legal Disclaimer:</b> This system is designed to assist with monitoring and safety, but no system can guarantee detection or prevention of all incidents. We are not liable for any failure to detect, respond to, or prevent bodily harm, injury, or death to users, family members, or others. Users are responsible for maintaining their equipment and ensuring emergency contacts and procedures are up to date. Use of this system constitutes acceptance of these terms.
          </div>
          <label style={{ display: 'block', marginTop: 12 }}>
            <input type="checkbox" checked={agreementAccepted} onChange={e => setAgreementAccepted(e.target.checked)} />
            I have read and accept the User Agreement, Privacy Policy, and Authorization terms above.
          </label>
        </div>
        <ul>
          <li><a href="/downloads/agent-win.exe" style={{ pointerEvents: agreementAccepted ? 'auto' : 'none', color: agreementAccepted ? '' : '#aaa' }}>Windows</a></li>
          <li><a href="/downloads/agent-linux.tar.gz" style={{ pointerEvents: agreementAccepted ? 'auto' : 'none', color: agreementAccepted ? '' : '#aaa' }}>Linux</a></li>
          <li><a href="/downloads/agent-mac.dmg" style={{ pointerEvents: agreementAccepted ? 'auto' : 'none', color: agreementAccepted ? '' : '#aaa' }}>macOS</a></li>
        </ul>
        <button onClick={() => setShowDownload(false)}>Back to Dashboard</button>
      </div>
    );
  }

  // Role-based tab set
  let roleTabs = DASHBOARD_TABS[user.role] || DASHBOARD_TABS.user;

  // Strictly hide admin/tech tabs from users
  if (user.role !== "admin" && user.role !== "tech") {
    roleTabs = DASHBOARD_TABS.user;
  }

  // Tabbed/layered dashboard
  return (
    <div>
      <OnboardingModal open={showOnboarding} onClose={handleOnboardingClose} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <h1>Smart Home Dashboard</h1>
        <label htmlFor="lang-select" style={{ fontSize: 14 }}>
          Language:
          <select id="lang-select" style={{ marginLeft: 8 }}>
            {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
          </select>
        </label>
      </div>
      <StorageUsagePanel />
      <div style={{ marginBottom: 16 }}>
        <span>Logged in as: {user.username} ({user.role})</span>
        <button style={{ marginLeft: 16 }} onClick={() => setUser(null)} title="Log out of your account">Log Out</button>
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }} role="tablist" aria-label="Dashboard Tabs">
        {roleTabs.map(tab => (
          <button
            key={tab.key}
            role="tab"
            aria-selected={activeTab === tab.key}
            aria-controls={`tabpanel-${tab.key}`}
            id={`tab-${tab.key}`}
            tabIndex={activeTab === tab.key ? 0 : -1}
            onClick={() => setActiveTab(tab.key)}
            style={{ fontWeight: activeTab === tab.key ? "bold" : "normal" }}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {/* Layered/tabbed content by role and tab */}
      {activeTab === "admin" && user.role === "admin" && (
        <div role="tabpanel" id="tabpanel-admin" aria-labelledby="tab-admin">
          <h2>Admin Dashboard</h2>
          <AdminInvitePanel />
          <AdminUserManager />
          <AdminNotifications />
        </div>
      )}
      {activeTab === "users" && user.role === "admin" && (
        <div role="tabpanel" id="tabpanel-users" aria-labelledby="tab-users">
          <h2>User Management</h2>
          <AdminUserManager />
        </div>
      )}
      {activeTab === "logs" && user.role === "admin" && (
        <div role="tabpanel" id="tabpanel-logs" aria-labelledby="tab-logs">
          <h2>Logs & Audit</h2>
          <AdminAuditLog />
          <EmailLogPanel />
        </div>
      )}
      {activeTab === "devices" && (
        <div role="tabpanel" id="tabpanel-devices" aria-labelledby="tab-devices">
          <h2>Devices & Controls</h2>
          <DeviceAlerts />
          {Object.entries(bulbs).map(([name, bulb]) => (
            <BulbControl key={name} name={name} bulb={bulb} onChange={fetchBulbs} helpTooltip="Control this smart bulb." />
          ))}
        </div>
      )}
      {activeTab === "mapping" && (
        <div role="tabpanel" id="tabpanel-mapping" aria-labelledby="tab-mapping">
          <h2>Mapping & Automation</h2>
          <MappingEditor helpTooltip="Map devices to rooms and set up automation rules here." />
          <AudioConfigPanel helpTooltip="Configure audio devices and settings." />
          <AIVoicePanel user={user} helpTooltip="AI voice assistant configuration." />
        </div>
      )}
      {activeTab === "updates" && (
        <div role="tabpanel" id="tabpanel-updates" aria-labelledby="tab-updates">
          <UpdatesRecoveryPanel user={user} />
        </div>
      )}
      {activeTab === "notifications" && (
        <div role="tabpanel" id="tabpanel-notifications" aria-labelledby="tab-notifications">
          <h2>Notification Settings</h2>
          <NotificationSettingsPanel helpTooltip="Configure notification channels and preferences." />
        </div>
      )}
      {activeTab === "privacy" && (
        <div role="tabpanel" id="tabpanel-privacy" aria-labelledby="tab-privacy">
          <h2>Privacy & Data Usage</h2>
          <PrivacySettingsPanel helpTooltip="Configure privacy and data usage preferences." />
          <PrivacyDashboardPanel />
          <div className="disclaimer" style={{marginTop: '1em', color: 'red', fontWeight: 'bold'}}>
            Disclaimer: User data stored on the server is only accessible for backup and restore operations. No direct access or browsing of user files on the server is permitted. All other data is stored locally or in user-owned cloud storage. This policy is strictly enforced for your privacy and security.
          </div>
        </div>
      )}
      {activeTab === "accessibility" && (
        <div role="tabpanel" id="tabpanel-accessibility" aria-labelledby="tab-accessibility">
          <h2>Accessibility</h2>
          <AccessibilitySettingsPanel helpTooltip="Configure accessibility preferences." />
        </div>
      )}
      {activeTab === "security" && (
        <div role="tabpanel" id="tabpanel-security" aria-labelledby="tab-security">
          <h2>Security</h2>
          <SecuritySettingsPanel helpTooltip="Configure 2FA, encryption, and OTA update controls." />
        </div>
      )}
      {activeTab === "support" && (
        <div role="tabpanel" id="tabpanel-support" aria-labelledby="tab-support">
          <h2>Support & Tickets</h2>
          <EmergencyContactsEditor userRole={user.role} helpTooltip="Manage emergency contacts for alerts." />
          <SupportTickets helpTooltip="Submit and track support requests." />
          <SupportCollaborationPanel user={user} />
        </div>
      )}
      {activeTab === "impersonate" && (user.role === "tech" || user.role === "admin") && (
        <ImpersonateUserDashboardPanel currentUser={user} />
      )}
      {activeTab === "third_party_devices" && user.role === "admin" && (
        <div role="tabpanel" id="tabpanel-third-party-devices" aria-labelledby="tab-third-party-devices">
          <ThirdPartyDevicesPanel />
        </div>
      )}
      <Watermark />
    </div>
  );
}
