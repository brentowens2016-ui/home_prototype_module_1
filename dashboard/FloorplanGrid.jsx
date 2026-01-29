import React, { useEffect, useState } from "react";
import axios from "axios";

const DEVICE_TYPE_ICONS = {
  pressure: "🛏️",
  motion: "🚶",
  door: "🚪",
  bulb: "💡",
  router: "📡",
  hub: "🖧",
  unknown: "❓"
};

function getIcon(type) {
  return DEVICE_TYPE_ICONS[type] || DEVICE_TYPE_ICONS.unknown;
}

export default function FloorplanGrid({ mapping, rooms = [], onMove }) {
  // Simple 20x20 grid, 600x600px
  const gridSize = 20;
  const cellSize = 30;
  const width = gridSize * cellSize;
  const height = gridSize * cellSize;

  // Drag state
  const [dragIdx, setDragIdx] = useState(null);

  const handleDragStart = idx => setDragIdx(idx);
  const handleDrop = (x, y) => {
    if (dragIdx !== null) {
      onMove(dragIdx, x, y);
      setDragIdx(null);
    }
  };

  return (
    <div style={{ position: "relative", width, height, border: "2px solid #888", margin: 16 }}>
      {/* Grid background */}
      {[...Array(gridSize)].map((_, y) =>
        [...Array(gridSize)].map((_, x) => (
          <div
            key={`cell-${x}-${y}`}
            onDragOver={e => e.preventDefault()}
            onDrop={() => handleDrop(x * cellSize + cellSize / 2, y * cellSize + cellSize / 2)}
            style={{
              position: "absolute",
              left: x * cellSize,
              top: y * cellSize,
              width: cellSize,
              height: cellSize,
              border: "1px solid #eee",
              boxSizing: "border-box"
            }}
          />
        ))
      )}
      {/* Rooms as rectangles */}
      {rooms.map((room, idx) => (
        <div
          key={room.name + idx}
          style={{
            position: "absolute",
            left: room.x * cellSize,
            top: room.y * cellSize,
            width: (room.w || 4) * cellSize,
            height: (room.h || 4) * cellSize,
            background: "rgba(200,220,255,0.25)",
            border: "2px solid #4a90e2",
            borderRadius: 8,
            zIndex: 1,
            pointerEvents: "none"
          }}
        >
          <span style={{ position: "absolute", left: 4, top: 4, fontWeight: "bold", color: "#235" }}>{room.name}</span>
        </div>
      ))}
      {/* Devices */}
      {mapping.map((entry, idx) => (
        <div
          key={entry.id || idx}
          draggable
          onDragStart={() => handleDragStart(idx)}
          style={{
            position: "absolute",
            left: (entry.x || 0) - 12,
            top: (entry.y || 0) - 12,
            width: 24,
            height: 24,
            fontSize: 22,
            cursor: "grab",
            background: "#fff",
            border: "1px solid #aaa",
            borderRadius: 6,
            textAlign: "center",
            zIndex: 2
          }}
          title={`${entry.type} (${entry.location || entry.room || "?"})`}
        >
          {getIcon(entry.type)}
        </div>
      ))}
    </div>
  );
}
