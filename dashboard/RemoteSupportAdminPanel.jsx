import React, { useEffect, useState } from "react";
import { useUserStatusColor } from "./useUserStatusColor";

export function RemoteSupportAdminPanel({ onSelectUser }) {
  const [users, setUsers] = useState([]);
  useEffect(() => {
    fetch('/users', { headers: { 'X-Role': 'admin' } })
      .then(res => res.json())
      .then(data => setUsers(Array.isArray(data) ? data : []));
  }, []);
  const remoteUsers = users.filter(u => u.allow_remote);
  return (
    <div style={{ border: '1px solid #4a90e2', margin: 16, padding: 16 }}>
      <h2>Users with Remote Support Enabled</h2>
      {remoteUsers.length === 0 && <div>No users have enabled remote support.</div>}
      <ul>
        {remoteUsers.map(u => {
          const color = useUserStatusColor(u.username);
          return (
            <li key={u.username}>
              <span style={{
                display: 'inline-block',
                width: 12, height: 12, borderRadius: 6,
                background: color, marginRight: 8, border: '1px solid #888', verticalAlign: 'middle'
              }} title={color}></span>
              <b>{u.username}</b> ({u.email || 'no email'})
              <button style={{ marginLeft: 12 }} onClick={() => onSelectUser(u)}>Monitor Dashboard</button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
