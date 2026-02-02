// Keyword and Pattern Library for Voice Recognition
// Used by the AI module to match and train on key phrases

export const KEYWORDS = [
  "lights", "thermostat", "coffee maker", "security system", "door locks", "music system", "energy saver", "vacation mode", "night routine", "morning routine", "guest welcome", "away mode", "maintenance reminder", "custom automation", "on", "off", "lock", "unlock", "dim", "set", "play", "arm", "disarm", "alert", "reminder", "temperature", "volume", "brightness", "routine", "mode", "start", "stop", "activate", "deactivate"
];

export function matchKeywords(transcript) {
  const lower = transcript.toLowerCase();
  return KEYWORDS.filter(word => lower.includes(word));
}

export function getBestRoutineMatch(transcript, templates) {
  const lower = transcript.toLowerCase();
  let best = null;
  let maxScore = 0;
  for (const t of templates) {
    let score = 0;
    if (lower.includes(t.name.toLowerCase())) score += 2;
    for (const step of t.steps) {
      if (step.device && lower.includes(step.device.replace('_', ' '))) score++;
      if (step.action && lower.includes(step.action)) score++;
    }
    if (score > maxScore) {
      maxScore = score;
      best = t;
    }
  }
  return best;
}
