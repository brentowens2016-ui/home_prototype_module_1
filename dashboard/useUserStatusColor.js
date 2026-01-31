import { useEffect, useState } from "react";

export function useUserStatusColor(username) {
  const [color, setColor] = useState("gray");
  useEffect(() => {
    let active = true;
    async function poll() {
      if (!username) return;
      try {
        const res = await fetch(`/users/${encodeURIComponent(username)}/status_color`);
        const data = await res.json();
        if (active && data.status_color) setColor(data.status_color);
      } catch {}
      if (active) setTimeout(poll, 5000); // poll every 5s
    }
    poll();
    return () => { active = false; };
  }, [username]);
  return color;
}
