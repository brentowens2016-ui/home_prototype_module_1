import React, { useState } from "react";

const DEFAULT_RULE = {
  triggerType: "motion",
  triggerId: "",
  condition: "",
  actionType: "bulb",
  actionId: "",
  action: "on",
  ignore: false,
  description: ""
};

export default function AutomationRulesEditor({ mapping, rules, setRules }) {
  const [editingRule, setEditingRule] = useState(null);

  const handleAddRule = () => {
    setEditingRule({ ...DEFAULT_RULE });
  };

  const handleEditRule = idx => {
    setEditingRule({ ...rules[idx], idx });
  };

  const handleSaveRule = () => {
    if (editingRule.idx !== undefined) {
      setRules(rules.map((r, i) => (i === editingRule.idx ? editingRule : r)));
    } else {
      setRules([...rules, editingRule]);
    }
    setEditingRule(null);
  };

  const handleDeleteRule = idx => {
    setRules(rules.filter((_, i) => i !== idx));
  };

  const deviceOptions = (type) => mapping.filter(d => (d.type === type || (type === "other" && d.type === "other"))).map(d => (
    <option key={d.id} value={d.id}>{d.location || d.id}</option>
  ));

  // Helper to check if a device exists in mapping
  const deviceExists = id => mapping.some(d => d.id === id);

  return (
    <div style={{ border: "1px solid #888", margin: 16, padding: 16 }}>
      <h2>Automation Rules</h2>
      <button onClick={handleAddRule}>Add Rule</button>
      <ul>
        {rules.map((rule, idx) => {
          const missingTrigger = rule.triggerId && !deviceExists(rule.triggerId);
          const missingAction = rule.actionId && !deviceExists(rule.actionId);
          return (
            <li key={idx} style={{ marginBottom: 8 }}>
              <b>{rule.triggerType}</b> ({rule.triggerId}) {rule.condition && `if ${rule.condition}`} → <b>{rule.actionType}</b> ({rule.actionId}) {rule.action} {rule.ignore && <span style={{ color: "orange" }}>[ignore]</span>}
              <button onClick={() => handleEditRule(idx)} style={{ marginLeft: 8 }}>Edit</button>
              <button onClick={() => handleDeleteRule(idx)} style={{ marginLeft: 4, color: "red" }}>Delete</button>
              {rule.description && <div style={{ fontSize: 12, color: "#555" }}>{rule.description}</div>}
              {(missingTrigger || missingAction) && (
                <div style={{ color: "#b00", fontSize: 12, marginTop: 2 }}>
                  Warning: {missingTrigger && "Trigger device missing. "}{missingAction && "Action device missing."}
                </div>
              )}
            </li>
          );
        })}
      </ul>
      {editingRule && (
        <div style={{ border: "1px solid #ccc", padding: 12, marginTop: 12 }}>
          <div>
            Trigger Type:
            <select value={editingRule.triggerType} onChange={e => setEditingRule(r => ({ ...r, triggerType: e.target.value }))}>
              <option value="motion">Motion</option>
              <option value="pressure">Pressure</option>
              <option value="door">Door</option>
              <option value="smoke">Smoke</option>
              <option value="co">CO</option>
              <option value="other">Other</option>
            </select>
            Device:
            <select value={editingRule.triggerId} onChange={e => setEditingRule(r => ({ ...r, triggerId: e.target.value }))}>
              <option value="">--select--</option>
              {deviceOptions(editingRule.triggerType)}
            </select>
          </div>
          <div>
            Condition (optional): <input value={editingRule.condition} onChange={e => setEditingRule(r => ({ ...r, condition: e.target.value }))} />
          </div>
          <div>
            Action Type:
            <select value={editingRule.actionType} onChange={e => setEditingRule(r => ({ ...r, actionType: e.target.value }))}>
              <option value="bulb">Bulb</option>
              <option value="alarm">Alarm</option>
              <option value="other">Other</option>
            </select>
            Device:
            <select value={editingRule.actionId} onChange={e => setEditingRule(r => ({ ...r, actionId: e.target.value }))}>
              <option value="">--select--</option>
              {deviceOptions(editingRule.actionType)}
            </select>
            Action:
            <input value={editingRule.action} onChange={e => setEditingRule(r => ({ ...r, action: e.target.value }))} />
          </div>
          <div>
            Ignore (do not alert): <input type="checkbox" checked={editingRule.ignore} onChange={e => setEditingRule(r => ({ ...r, ignore: e.target.checked }))} />
          </div>
          <div>
            Description (optional): <input value={editingRule.description} onChange={e => setEditingRule(r => ({ ...r, description: e.target.value }))} />
          </div>
          <button onClick={handleSaveRule}>Save Rule</button>
          <button onClick={() => setEditingRule(null)} style={{ marginLeft: 8 }}>Cancel</button>
        </div>
      )}
    </div>
  );
}
