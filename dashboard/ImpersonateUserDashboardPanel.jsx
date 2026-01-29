import React, { useState, useEffect } from "react";
import axios from "axios";
import io from "socket.io-client";
import axios from "axios";

export default function ImpersonateUserDashboardPanel({ currentUser }) {
  const [username, setUsername] = useState("");
  const [impersonatedUser, setImpersonatedUser] = useState(null);
  const [error, setError] = useState("");
  const [userList, setUserList] = useState([]);
  const [collabLog, setCollabLog] = useState([]);
  const [collabMsg, setCollabMsg] = useState("");
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    axios.get("/users", { headers: { "X-Role": currentUser.role } })
      .then(res => {
        const sorted = [...res.data].sort((a, b) => a.username.localeCompare(b.username));
        setUserList(sorted);
      });
    // Setup socket.io for real-time collaboration
    const s = io("/collab");
    setSocket(s);
    s.on("collab_event", msg => setCollabLog(log => [...log, msg]));
    return () => { s.disconnect(); };
  }, [currentUser.role]);

  const handleFetchUser = async (name) => {
    setError("");
    try {
      const res = await axios.get(`/users/${name || username}`, { headers: { "X-Role": currentUser.role } });
      setImpersonatedUser(res.data);
      if (socket) socket.emit("collab_event", { type: "view", admin: currentUser.username, user: name || username });
    } catch (e) {
      setError("User not found or access denied.");
      setImpersonatedUser(null);
    }
  };

  const handleSendCollabMsg = () => {
    if (socket && impersonatedUser) {
      socket.emit("collab_event", { type: "message", admin: currentUser.username, user: impersonatedUser.username, msg: collabMsg });
      setCollabMsg("");
    }
  };

  return (
    <div role="tabpanel" id="tabpanel-impersonate" aria-labelledby="tab-impersonate" style={{ border: "1px solid #4a90e2", margin: 16, padding: 16 }}>
      <h2>Impersonate/Assist User Dashboard</h2>
      <p>Search for a user by name or email, or type the address of the site. All contacts reference registered user accounts.</p>
      <input value={username} onChange={e => setUsername(e.target.value)} placeholder="Enter username/email/site address" style={{ marginRight: 8 }} />
      <button onClick={() => handleFetchUser()}>View User Dashboard</button>
      <div style={{ marginTop: 16 }}>
        <b>Account Holders (A-Z):</b>
        <ul style={{ maxHeight: 120, overflowY: "auto", border: "1px solid #ccc", padding: 8 }}>
          {userList.map(u => (
            <li key={u.username}>
              <button style={{ textAlign: "left" }} onClick={() => handleFetchUser(u.username)}>{u.username} ({u.email})</button>
            </li>
          ))}
        </ul>
      </div>
      {error && <div style={{ color: "red", marginTop: 8 }}>{error}</div>}
      {impersonatedUser && (
        <div style={{ marginTop: 24 }}>
          <h3>User Info</h3>
          <div><b>Username:</b> {impersonatedUser.username}</div>
          <div><b>Role:</b> {impersonatedUser.role}</div>
          <div><b>Tier:</b> {impersonatedUser.subscription_tier}</div>
          <div><b>Email:</b> {impersonatedUser.email}</div>
          <hr />
          <h3>Dashboard Controls</h3>
          <p>Collaborate in real time with the user. You can assist with device mapping, emergency contacts, notification settings, and more.</p>
          <div style={{ border: "1px solid #ccc", margin: 8, padding: 8 }}>
            <b>Device Mapping:</b> <button>Assist/Edit</button>
          </div>
          <div style={{ border: "1px solid #ccc", margin: 8, padding: 8 }}>
            <b>Emergency Contacts:</b> <button>Assist/Edit</button>
          </div>
          <div style={{ border: "1px solid #ccc", margin: 8, padding: 8 }}>
            <b>Notification Settings:</b> <button>Assist/Edit</button>
          </div>
          <div style={{ marginTop: 16 }}>
            <b>Real-Time Collaboration:</b>
            <div style={{ border: "1px solid #eee", padding: 8, maxHeight: 100, overflowY: "auto" }}>
              {collabLog.map((msg, i) => (
                <div key={i}><b>{msg.admin || "User"}:</b> {msg.msg || msg.type + " " + msg.user}</div>
              ))}
            </div>
            <input value={collabMsg} onChange={e => setCollabMsg(e.target.value)} placeholder="Type a message..." style={{ marginRight: 8 }} />
            <button onClick={handleSendCollabMsg}>Send</button>
          </div>
        </div>
      )}
    </div>
  );
}