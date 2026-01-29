import React, { useState } from "react";

export default function RoomManager({ rooms, setRooms, totalSqft, setTotalSqft }) {
  const [newRoom, setNewRoom] = useState({ name: "", area: 0, x: 0, y: 0, w: 4, h: 4 });
  const usedSqft = rooms.reduce((sum, r) => sum + Number(r.area), 0);
  const remainingSqft = Math.max(0, totalSqft - usedSqft);

  const handleAddRoom = () => {
    if (!newRoom.name || newRoom.area <= 0 || newRoom.area > remainingSqft) return;
    setRooms([...rooms, { ...newRoom }]);
    setNewRoom({ name: "", area: 0, x: 0, y: 0, w: 4, h: 4 });
  };

  const handleRemoveRoom = idx => {
    setRooms(rooms.filter((_, i) => i !== idx));
  };

  return (
    <div style={{ border: "1px solid #4a90e2", margin: 8, padding: 8 }}>
      <h3>Room Manager</h3>
      <div>
        <label>Total Square Footage: </label>
        <input type="number" value={totalSqft} min={0} onChange={e => setTotalSqft(Number(e.target.value))} />
        <span style={{ marginLeft: 8 }}>(Remaining: {remainingSqft} sqft)</span>
      </div>
      <div style={{ marginTop: 8 }}>
        <input placeholder="Room Name" value={newRoom.name} onChange={e => setNewRoom(r => ({ ...r, name: e.target.value }))} />
        <input type="number" placeholder="Area (sqft)" value={newRoom.area} min={1} max={remainingSqft} onChange={e => setNewRoom(r => ({ ...r, area: Number(e.target.value) }))} />
        <button onClick={handleAddRoom} disabled={!newRoom.name || newRoom.area <= 0 || newRoom.area > remainingSqft}>Add Room</button>
      </div>
      <ul>
        {rooms.map((room, idx) => (
          <li key={room.name + idx}>
            {room.name} – {room.area} sqft
            <button style={{ marginLeft: 8 }} onClick={() => handleRemoveRoom(idx)}>Remove</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
