// Helper: Prompt user to upgrade or abort if tier restriction is detected
export function handleTierRestriction(featureName, requiredTier, onAbort, onUpgrade) {
    const msg = `The feature "${featureName}" requires a higher membership tier (${requiredTier}).\n\nWould you like to upgrade now?\n\nPress OK to upgrade, or Cancel to abort this action.`;
    if (window.confirm(msg)) {
        onUpgrade();
    } else {
        onAbort();
    }
}
// Import Bluetooth discovery logic
import { discoverBluetoothDevices, promptDriverInstall } from './modules/bluetooth.js';
// Fetch and present AI templates globally
async function fetchAndShowAITemplates() {
    const res = await fetch('/ai-templates');
    const templates = await res.json();
    // Simple modal/popup for demonstration
    let html = '<div class="ai-template-modal"><h2>AI Templates</h2><ul>';
    templates.forEach(t => {
        html += `<li><b>${t.name}</b>: ${t.description}<br>Steps: <pre>${JSON.stringify(t.steps, null, 2)}</pre></li>`;
    });
    html += '</ul><button onclick="document.querySelector(\'.ai-template-modal\').remove()">Close</button></div>';
    document.body.insertAdjacentHTML('beforeend', html);
}

// ---
// Annotated: February 1, 2026
// Improvements: AI role-based access, contract sync, and dashboard logic separation
// Reason: To support global, adaptive AI with tier/role-based permissions and contract-driven UI
// Scope: Added ai_roles and ai_role to contracts, role-based UI logic, config JSONs for AI and project
// Logic: Dashboard fetches contract with AI role, restricts AI controls by role, and syncs with backend and Rust agent
// ---

// --- AI Health/Diagnostic Panel ---
function renderAIHealthPanel(status) {
    let html = `<div id="ai-health-panel" style="position:fixed;top:10px;right:10px;z-index:1000;background:#222;color:#fff;padding:12px 18px;border-radius:8px;box-shadow:0 2px 8px #0008;min-width:260px;">
        <h3 style="margin-top:0;">AI Health Status</h3>
        <div><b>Timestamp:</b> ${status.timestamp || 'N/A'}</div>
        <div><b>CPU Usage:</b> ${status.cpu_usage?.toFixed(1) ?? 'N/A'}%</div>
        <div><b>Memory Usage:</b> ${status.memory_usage ?? 'N/A'} KB</div>
        <div><b>Status:</b> ${status.ai_status || 'N/A'}</div>
        <div><b>Errors:</b> ${status.error_count ?? 0}</div>
        <div><b>Last Error:</b> ${status.last_error || 'None'}</div>
        <button onclick="document.getElementById('ai-health-panel').remove()" style="margin-top:8px;">Close</button>
    </div>`;
    let panel = document.getElementById('ai-health-panel');
    if (panel) panel.remove();
    document.body.insertAdjacentHTML('beforeend', html);
}

// Add a button for users/admins to open the AI Health panel
document.addEventListener('DOMContentLoaded', function() {
        // Feature notification flags
        const newFeatures = [
            { name: 'Advanced Mapping', tier: 'pro', description: 'Edit and manage advanced maps.' },
            { name: 'Remote Agent Access', tier: 'elite', description: 'Control your home remotely.' }
            // Add more features as needed
        ];
        newFeatures.forEach(feature => {
            const flag = document.createElement('div');
            flag.className = 'feature-flag';
            flag.style.position = 'fixed';
            flag.style.bottom = '10px';
            flag.style.left = '10px';
        flag.innerHTML = `<b>New Feature:</b> ${feature.name}<br>${feature.description}`;
        // Check if user tier allows feature
        const userTier = window.dashboardUserTier || 'basic';
        if (["basic", "pro", "elite"].indexOf(userTier) < ["basic", "pro", "elite"].indexOf(feature.tier)) {
            flag.innerHTML += `<br><button style='margin-top:8px;' onclick='window.location.href="store.html"'>Upgrade to Access</button>`;
        } else {
            flag.innerHTML += `<br><span style='color:green;'>Available on your tier</span>`;
        }
        document.body.appendChild(flag);
    });
        // Global Speech-to-Text Integration
        function addSpeechToTextButton(inputElem) {
            const micBtn = document.createElement('button');
            micBtn.type = 'button';
            micBtn.className = 'mic-btn';
            micBtn.innerHTML = '🎤';
            micBtn.title = 'Speak to input';
            micBtn.style.marginLeft = '8px';
            micBtn.onclick = function() {
                if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
                    alert('Speech recognition not supported in this browser.');
                    return;
                }
                const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
                const recognition = new SpeechRecognition();
                recognition.lang = 'en-US';
                recognition.interimResults = false;
                recognition.maxAlternatives = 1;
                micBtn.disabled = true;
                micBtn.textContent = '🎤...';
                recognition.onresult = function(event) {
                    const transcript = event.results[0][0].transcript;
                    inputElem.value = transcript;
                    micBtn.textContent = '🎤';
                    micBtn.disabled = false;
                };
                recognition.onerror = function() {
                    micBtn.textContent = '🎤';
                    micBtn.disabled = false;
                    alert('Speech recognition error.');
                };
                recognition.onend = function() {
                    micBtn.textContent = '🎤';
                    micBtn.disabled = false;
                };
                recognition.start();
            };
            inputElem.parentNode.insertBefore(micBtn, inputElem.nextSibling);
        }

        // Attach to all text inputs in dashboard panel
        setTimeout(() => {
            document.querySelectorAll('#dashboard-panel input[type="text"], #dashboard-panel textarea').forEach(addSpeechToTextButton);
        }, 1000);
    const aiHealthBtn = document.createElement('button');
    aiHealthBtn.textContent = 'Show AI Health Status';
    aiHealthBtn.onclick = pollAIHealthStatus;
    aiHealthBtn.style.position = 'fixed';
    aiHealthBtn.style.top = '10px';
    aiHealthBtn.style.right = '10px';
    aiHealthBtn.style.zIndex = 1001;
    document.body.appendChild(aiHealthBtn);

    // Text-to-Speech UI
    const ttsBtn = document.createElement('button');
    ttsBtn.textContent = 'Text to Speech';
    ttsBtn.style.position = 'fixed';
    ttsBtn.style.top = '50px';
    ttsBtn.style.right = '10px';
    ttsBtn.style.zIndex = 1001;
    ttsBtn.onclick = async function() {
        const text = prompt('Enter text to speak:');
        if (!text) return;
        const language = prompt('Enter language code (e.g., en, es, fr) or leave blank for auto-detect:');
        // TODO: Device selection UI (use discovered devices)
        const { speakText } = await import('./modules/text_to_speech.js');
        const result = await speakText(text, language);
        alert(`Spoken in language: ${result.language}`);
    };
    document.body.appendChild(ttsBtn);

    // Accessibility: AI-driven TTS deployment button
    const aiTTSBtn = document.createElement('button');
    aiTTSBtn.textContent = 'Deploy AI Text-to-Speech (Accessibility)';
    aiTTSBtn.style.position = 'fixed';
    aiTTSBtn.style.top = '90px';
    aiTTSBtn.style.right = '10px';
    aiTTSBtn.style.zIndex = 1001;
    aiTTSBtn.onclick = async function() {
        const text = prompt('Enter text for AI to speak (or describe your accessibility need):');
        if (!text) return;
        // Simulate AI routine calling TTS
        const res = await fetch('/accessibility/text-to-speech', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text })
        });
        const result = await res.json();
        alert(`AI TTS deployed. Spoken in language: ${result.language}`);
    };
    document.body.appendChild(aiTTSBtn);

    // Speech input to request TTS deployment (for mobility/physically handicapped)
    const speechInputBtn = document.createElement('button');
    speechInputBtn.textContent = 'Request TTS by Speech Input';
    speechInputBtn.style.position = 'fixed';
    speechInputBtn.style.top = '130px';
    speechInputBtn.style.right = '10px';
    speechInputBtn.style.zIndex = 1001;
    speechInputBtn.onclick = async function() {
        alert('Speech input feature coming soon: This will allow users to request TTS deployment by speaking.');
        // TODO: Integrate with speech-to-text backend and trigger TTS
    };
    document.body.appendChild(speechInputBtn);

    // Home Assistant test UI
    const haBtn = document.createElement('button');
    haBtn.textContent = 'Discover Home Assistant Devices';
    haBtn.onclick = async function() {
        const { discoverHomeAssistantDevices, controlHomeAssistantDevice } = await import('./modules/home_assistant.js');
        const devices = await discoverHomeAssistantDevices();
        let html = '<div class="ha-modal"><h2>Home Assistant Devices</h2><ul>';
        devices.forEach(d => {
            html += `<li><b>${d.name}</b> (${d.type}) - Status: ${d.status} <button data-id="${d.id}" data-action="toggle">Toggle</button></li>`;
        });
        html += '</ul><button onclick="document.querySelector(\'.ha-modal\').remove()">Close</button></div>';
        document.body.insertAdjacentHTML('beforeend', html);
        document.querySelectorAll('.ha-modal button[data-id]').forEach(btn => {
            btn.onclick = async function() {
                const id = btn.getAttribute('data-id');
                const action = btn.getAttribute('data-action');
                const result = await controlHomeAssistantDevice(id, action);
                alert(result);
            };
        });
    };
    document.body.appendChild(haBtn);

    // Bluetooth discovery integration example
    // This could be triggered by a user action or on startup
    // For demonstration, we'll add a button to trigger discovery
    const btBtn = document.createElement('button');
    btBtn.textContent = 'Discover Bluetooth Devices';
    btBtn.onclick = async function() {
        // Placeholder: Simulate device discovery
        const discovered = [
            { name: 'Bluetooth Speaker', id: 'bt-001' },
            { name: 'Health Sensor', id: 'bt-002' }
        ];
        for (const device of discovered) {
            promptDriverInstall(device.name, async () => {
                // Call backend API to download/install driver
                const res = await fetch('/bluetooth-install-driver', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ device_name: device.name, device_id: device.id })
                });
                const msg = await res.text();
                alert(msg);
            }, () => {
                alert('Driver installation cancelled for ' + device.name);
            });
        }
    };
    document.body.appendChild(btBtn);

// Contract structure for dashboard features
class FeatureContract {
    constructor(name, tier, enabled, controls = [], ai_roles = []) {
        this.name = name;
        this.tier = tier;
        this.enabled = enabled;
        this.controls = controls;
        this.ai_roles = ai_roles;
    }
}

class DashboardContract {
    constructor(user_tier, features = [], ai_role = "user_admin") {
        this.user_tier = user_tier;
        this.features = features;
        this.ai_role = ai_role;
    }
}

(async function() {
        // Custom dashboard panels (user-configurable widgets, backend sync, advanced types)
        let customPanels = [];
        let userTier = null;

        async function fetchCustomPanels() {
            try {
                const res = await fetch('/dashboard/custom-panels');
                const data = await res.json();
                if (data.status === 'ok') {
                    customPanels = data.panels;
                } else {
                    customPanels = [];
                }
            } catch (e) {
                customPanels = [];
            }
        }

        async function addCustomPanel(panel) {
            try {
                const res = await fetch('/dashboard/custom-panels/add', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(panel)
                });
                const data = await res.json();
                if (data.status === 'ok') {
                    customPanels = data.panels;
                    renderCustomPanels();
                } else {
                    alert(data.error || 'Failed to add panel');
                }
            } catch (e) {
                alert('Error adding panel: ' + e.message);
            }
        }

        async function removeCustomPanel(idx) {
            try {
                const res = await fetch('/dashboard/custom-panels/remove', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ idx })
                });
                const data = await res.json();
                if (data.status === 'ok') {
                    customPanels = data.panels;
                    renderCustomPanels();
                } else {
                    alert(data.error || 'Failed to remove panel');
                }
            } catch (e) {
                alert('Error removing panel: ' + e.message);
            }
        }

        function renderCustomPanels() {
            const customPanelDiv = document.getElementById('custom-panels');
            if (!customPanelDiv) return;
            customPanelDiv.innerHTML = '<h3>Custom Panels</h3>';
            if (!userTier || !['advanced', 'pro'].includes(userTier)) {
                customPanelDiv.innerHTML += '<div style="color:#a00;">Custom panels are available for Advanced and Pro tier members only.</div>';
                return;
            }
            if (customPanels.length === 0) {
                customPanelDiv.innerHTML += '<div>No custom panels yet.</div>';
            }
            customPanels.forEach((panel, idx) => {
                let widgetHtml = '';
                if (panel.type === 'text') {
                    widgetHtml = `<div>${panel.content}</div>`;
                } else if (panel.type === 'chart') {
                    widgetHtml = `<canvas id="custom-chart-${idx}" width="300" height="120"></canvas>`;
                    // Chart rendering logic (placeholder)
                } else if (panel.type === 'device') {
                    widgetHtml = `<div>Device Widget: ${panel.config.deviceName || 'Unknown'}</div>`;
                } else {
                    widgetHtml = `<div>${panel.content}</div>`;
                }
                customPanelDiv.innerHTML += `<div class="custom-panel-widget" style="border:1px solid #ccc;padding:10px;margin-bottom:10px;">
                    <b>${panel.title}</b><br>
                    ${widgetHtml}
                    <button data-idx="${idx}" class="remove-custom-panel-btn">Remove</button>
                </div>`;
            });
            // Add panel button
            customPanelDiv.innerHTML += `<button id="add-custom-panel-btn">Add Custom Panel</button>`;
            // Add event listeners
            customPanelDiv.querySelectorAll('.remove-custom-panel-btn').forEach(btn => {
                btn.onclick = function() {
                    const idx = btn.getAttribute('data-idx');
                    removeCustomPanel(idx);
                };
            });
            const addBtn = customPanelDiv.querySelector('#add-custom-panel-btn');
            if (addBtn) {
                addBtn.onclick = function() {
                    const title = prompt('Panel Title:');
                    if (!title) return alert('Title required.');
                    const type = prompt('Panel Type (text, chart, device):', 'text');
                    if (!type || !['text', 'chart', 'device'].includes(type)) return alert('Invalid type.');
                    let content = '';
                    let config = {};
                    if (type === 'text') {
                        content = prompt('Panel Content (HTML allowed):');
                        if (content === null) return;
                    } else if (type === 'chart') {
                        content = 'Chart will be rendered here.';
                    } else if (type === 'device') {
                        config.deviceName = prompt('Device Name:');
                    }
                    addCustomPanel({ title, type, content, config });
                };
            }
        }
    // Fetch dashboard contract from backend
    let dashboard;
    let availableRoles = ["user_admin", "system_admin", "remote_agent"];
    try {
        const res = await fetch('/dashboard-data');
        const data = await res.json();
        dashboard = new DashboardContract(
            data.user_tier,
            data.features.map(f => new FeatureContract(f.name, f.tier, f.enabled, f.controls || [], f.ai_roles || [])),
            data.ai_role || "user_admin"
        );
        if (data.available_roles) availableRoles = data.available_roles;
        userTier = data.user_tier;
        await fetchCustomPanels();
    } catch (e) {
        // Fallback to default contract if backend is unavailable
        const dashboardRoot = document.getElementById('dashboard-root');
        if (dashboardRoot) {
            dashboardRoot.setAttribute('role', 'main');
            dashboardRoot.setAttribute('aria-label', 'Home Automation Dashboard');
        }
        const themeToggle = document.createElement('button');
        themeToggle.innerText = 'Toggle High Contrast';
        themeToggle.setAttribute('aria-label', 'Toggle high contrast mode');
        themeToggle.style.position = 'fixed';
        themeToggle.style.bottom = '10px';
        themeToggle.style.right = '10px';
        themeToggle.style.zIndex = 1001;
        themeToggle.onclick = () => {
            document.body.classList.toggle('high-contrast');
        };
        document.body.appendChild(themeToggle);
        document.body.classList.add('responsive-dashboard');
    }
    // Fallback block for dashboard initialization
    {
        // Hearing impaired support: visual alerts, captions
        window.showVisualAlert = function(message) {
            const alertDiv = document.createElement('div');
            alertDiv.className = 'visual-alert';
            alertDiv.innerText = message;
            alertDiv.setAttribute('role', 'alert');
            alertDiv.style.position = 'fixed';
            alertDiv.style.bottom = '60px';
            alertDiv.style.right = '10px';
            alertDiv.style.background = '#fffae6';
            alertDiv.style.color = '#222';
            alertDiv.style.padding = '12px 18px';
            alertDiv.style.borderRadius = '8px';
            alertDiv.style.boxShadow = '0 2px 8px #0008';
            alertDiv.style.zIndex = 1002;
            document.body.appendChild(alertDiv);
            setTimeout(() => alertDiv.remove(), 5000);
        };
        dashboard = new DashboardContract('basic', [
            new FeatureContract('AI Controls & Settings', 'basic', true, [], ["system_admin", "remote_agent", "user_admin"]),
            new FeatureContract('Audio/Video Controls & Settings', 'basic', true, [], ["user_admin", "remote_agent"]),
            new FeatureContract('Monitoring Controls & Settings', 'basic', true, [], ["user_admin"]),
            new FeatureContract('Mapping Controls & Settings', 'basic', true, [], ["user_admin"]),
            new FeatureContract('Map Editor', 'basic', true, [], ["user_admin"]),
            new FeatureContract('Advanced Device Control', 'elite', true, [
                { type: 'button', label: 'Manage Devices', value: false },
                { type: 'button', label: 'Create Automation', value: false },
                { type: 'button', label: 'View Audit Trail', value: false },
                { type: 'button', label: 'Integrate External Provider', value: false },
                { type: 'button', label: 'Advanced AI Routine', value: false }
            ], ["system_admin", "remote_agent", "user_admin"])
        ], "user_admin");
        // Sidebar feature toggles
        const featureList = document.getElementById('feature-list');
        if (featureList && dashboard && dashboard.features) {
            dashboard.features.forEach((feature, idx) => {
                const li = document.createElement('li');
                li.innerHTML = `<label><input type="checkbox" ${feature.enabled ? 'checked' : ''} data-idx="${idx}"> ${feature.name}</label>`;
                featureList.appendChild(li);
            });
        }
    }

    // Tabs
    const tabsDiv = document.querySelector('.dashboard-tabs');
    dashboard.features.forEach((feature, idx) => {
        const tab = document.createElement('div');
        tab.className = 'dashboard-tab' + (feature.tier !== dashboard.user_tier ? ' locked' : '') + (feature.enabled ? ' active' : '');
        tab.textContent = feature.name;
        if (feature.tier !== dashboard.user_tier) tab.title = 'Upgrade to access';
        tab.dataset.idx = idx;
        tabsDiv.appendChild(tab);
    });

    // Panel rendering
    const panel = document.getElementById('dashboard-panel');
    function renderPanel(idx) {
        const feature = dashboard.features[idx];
        panel.innerHTML = '';
        if (feature.tier !== dashboard.user_tier) {
            handleTierRestriction(
                feature.name,
                feature.tier,
                () => { panel.innerHTML = `<div class="panel-header"><h2>${feature.name}</h2></div><p>This feature is locked. Action aborted.</p>`; },
                () => { panel.innerHTML = `<div class="panel-header"><h2>${feature.name}</h2></div><p>Redirecting to upgrade page...</p>`; window.location.href = '/upgrade'; }
            );
            return;
        }
        // AI role-based UI separation
        let aiRoleInfo = '';
        let aiNameInputHtml = '';
        let roleDropdownHtml = '';
        if (feature.name === 'AI Controls & Settings') {
                    // Advanced Device Control panel UI (Elite tier only)
                    if (feature.name === 'Advanced Device Control' && dashboard.user_tier === 'elite') {
                        panel.innerHTML += `<div class="adc-panel">
                            <h3>Advanced Device Control (Elite Tier)</h3>
                            <button id="adc-manage-devices">Manage Devices</button>
                            <button id="adc-create-automation">Create Automation</button>
                            <button id="adc-view-audit">View Audit Trail</button>
                            <button id="adc-integrate-provider">Integrate External Provider</button>
                            <button id="adc-ai-routine">Run Advanced AI Routine</button>
                            <div id="adc-output" style="margin-top:1em;"></div>
                        </div>`;
                        // Button handlers
                        const outputDiv = panel.querySelector('#adc-output');
                        panel.querySelector('#adc-manage-devices').onclick = async function() {
                            const res = await fetch('/device-control/devices');
                            const data = await res.json();
                            if (data.status === 'ok') {
                                outputDiv.innerHTML = `<b>Managed Devices:</b><pre>${JSON.stringify(data.devices, null, 2)}</pre>`;
                            } else {
                                outputDiv.innerHTML = `<span style='color:red;'>${data.error}</span>`;
                            }
                        };
                        panel.querySelector('#adc-create-automation').onclick = async function() {
                            const name = prompt('Automation Name:');
                            if (!name) return;
                            const trigger = prompt('Trigger (e.g., time, event):');
                            if (!trigger) return;
                            const action = prompt('Action (e.g., turn on device):');
                            if (!action) return;
                            const res = await fetch('/device-control/automation', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ name, trigger, action })
                            });
                            const data = await res.json();
                            if (data.status === 'ok') {
                                outputDiv.innerHTML = `<b>Automation Created:</b><pre>${JSON.stringify(data.automation, null, 2)}</pre>`;
                            } else {
                                outputDiv.innerHTML = `<span style='color:red;'>${data.error}</span>`;
                            }
                        };
                        panel.querySelector('#adc-view-audit').onclick = async function() {
                            const res = await fetch('/device-control/audit-trail');
                            const data = await res.json();
                            if (data.status === 'ok') {
                                outputDiv.innerHTML = `<b>Audit Trail:</b><pre>${JSON.stringify(data.audit, null, 2)}</pre>`;
                            } else {
                                outputDiv.innerHTML = `<span style='color:red;'>${data.error}</span>`;
                            }
                        };
                        panel.querySelector('#adc-integrate-provider').onclick = async function() {
                            const provider = prompt('Provider Name:');
                            if (!provider) return;
                            const res = await fetch('/device-control/integrate-provider', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ provider })
                            });
                            const data = await res.json();
                            if (data.status === 'ok') {
                                outputDiv.innerHTML = `<b>External Provider Integrated:</b><pre>${JSON.stringify(data.provider, null, 2)}</pre>`;
                            } else {
                                outputDiv.innerHTML = `<span style='color:red;'>${data.error}</span>`;
                            }
                        };
                        panel.querySelector('#adc-ai-routine').onclick = async function() {
                            const routine = prompt('Routine Name:');
                            if (!routine) return;
                            const res = await fetch('/device-control/ai-routine', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ routine })
                            });
                            const data = await res.json();
                            if (data.status === 'ok') {
                                outputDiv.innerHTML = `<b>AI Routine Executed:</b><pre>${JSON.stringify(data.details, null, 2)}</pre>`;
                            } else {
                                outputDiv.innerHTML = `<span style='color:red;'>${data.error}</span>`;
                            }
                        };
                    }
            // Emergency Protocol Routine UI
            panel.innerHTML += `<div style="margin:1em 0;"><button id="ai-emergency-btn">Trigger Emergency Protocol (Voice)</button></div>`;
            aiRoleInfo = `<div class="ai-role-info">Your AI Role: <b id="current-ai-role">${dashboard.ai_role}</b></div>`;
            // Role management dropdown (admin only)
            if (dashboard.ai_role === 'system_admin') {
                roleDropdownHtml = `<div style="margin:1em 0;"><label for="ai-role-select">Change AI Role:</label> <select id="ai-role-select">${availableRoles.map(r => `<option value="${r}"${r === dashboard.ai_role ? ' selected' : ''}>${r}</option>`).join('')}</select> <button id="ai-role-set-btn">Set Role</button></div>`;
            }
            // Manual AI name input field
            aiNameInputHtml = `<div style="margin:1em 0;"><label for="ai-name-input">AI Name:</label> <input id="ai-name-input" type="text" value="${window.aiName || 'AI'}" style="width:120px;"> <button id="ai-name-set-btn">Set Name</button> <button id="ai-name-stt-btn">Speech to Text</button></div>`;
            if (!feature.ai_roles.includes(dashboard.ai_role)) {
                panel.innerHTML = `<div class="panel-header"><h2>${feature.name}</h2></div><p>You do not have permission to access AI controls for this feature.</p>${aiRoleInfo}${roleDropdownHtml}`;
                return;
            }
        }
        panel.innerHTML = `<div class="panel-header"><h2>${feature.name}</h2><button class="panel-toggle ${feature.enabled ? '' : 'off'}" data-idx="${idx}">${feature.enabled ? 'On' : 'Off'}</button></div>${aiRoleInfo}${roleDropdownHtml}${aiNameInputHtml}`;
        if (feature.enabled) {
                                                // Emergency Services logic
                                                const emergencyServicesInput = panel.querySelector('#emergency-services-number');
                                                const setEmergencyServicesBtn = panel.querySelector('#set-emergency-services-btn');
                                                if (setEmergencyServicesBtn) {
                                                    setEmergencyServicesBtn.onclick = function() {
                                                        window.emergencyServicesNumber = emergencyServicesInput.value.trim() || '911';
                                                        alert('Emergency Services contact set to: ' + window.emergencyServicesNumber);
                                                    };
                                                }
                                    // Emergency Contacts logic
                                    let emergencyContacts = window.emergencyContacts || [];
                                    const contactsListDiv = panel.querySelector('#emergency-contacts-list');
                                    function renderContacts() {
                                        contactsListDiv.innerHTML = '';
                                        emergencyContacts.forEach((c, idx) => {
                                            contactsListDiv.innerHTML += `<div style='border:1px solid #ccc;padding:8px;margin-bottom:8px;'>
                                                <b>${c.name}</b> (${c.relationship})<br>
                                                Phone: ${c.phone}<br>
                                                Email: ${c.email}<br>
                                                <button data-idx='${idx}' class='remove-contact-btn'>Remove</button>
                                            </div>`;
                                        });
                                    }
                                    renderContacts();
                                    // Add contact button logic
                                    const addContactBtn = panel.querySelector('#add-emergency-contact-btn');
                                    if (addContactBtn) {
                                        addContactBtn.onclick = function() {
                                            if (emergencyContacts.length >= 7) {
                                                alert('Maximum 7 emergency contacts allowed.');
                                                return;
                                            }
                                            // Prompt for all required fields
                                            const name = prompt('Contact Name:');
                                            if (!name) return alert('Name required.');
                                            const relationship = prompt('Relationship (family member, relative, spouse, Doctor, other):');
                                            if (!relationship) return alert('Relationship required.');
                                            const phone = prompt('Phone number (TXT/SMS required):');
                                            if (!phone) return alert('Phone number required.');
                                            const email = prompt('Email address:');
                                            if (!email) return alert('Email required.');
                                            emergencyContacts.push({ name, relationship, phone, email });
                                            window.emergencyContacts = emergencyContacts;
                                            renderContacts();
                                        };
                                    }
                                    // Remove contact button logic
                                    contactsListDiv.addEventListener('click', function(e) {
                                        if (e.target.classList.contains('remove-contact-btn')) {
                                            const idx = e.target.getAttribute('data-idx');
                                            emergencyContacts.splice(idx, 1);
                                            window.emergencyContacts = emergencyContacts;
                                            renderContacts();
                                        }
                                    });
                        // Add event listener for emergency protocol button
                        const aiEmergencyBtn = panel.querySelector('#ai-emergency-btn');
                        if (aiEmergencyBtn) {
                            aiEmergencyBtn.onclick = async function() {
                                // Simulate voice-to-text trigger
                                const voiceInput = prompt('Say or type: "Go To Emergency Protocols!"');
                                if (!voiceInput || voiceInput.trim().toLowerCase() !== 'go to emergency protocols!') {
                                    alert('Voice trigger not recognized.');
                                    return;
                                }
                                // Ask for confirmation (simulated voice)
                                const confirmInput = prompt('AI: Are you sure you want to start emergency protocols? (Say "Yes" to confirm)');
                                if (!confirmInput || confirmInput.trim().toLowerCase() !== 'yes') {
                                    alert('Emergency protocol cancelled.');
                                    return;
                                }
                                // Call backend to start emergency protocols
                                try {
                                    const res = await fetch('/emergency/start-protocol', {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ user: window.aiName || 'AI' })
                                    });
                                    const result = await res.json();
                                    alert('Emergency protocols started: ' + (result.status || 'Notified contacts and services.'));
                                } catch (e) {
                                    alert('Error starting emergency protocols: ' + e.message);
                                }
                            };
                        }
            // Render controls from feature.controls
            if (feature.controls && feature.controls.length > 0) {
                let controlsHtml = '<form class="feature-controls-form">';
                feature.controls.forEach((ctrl, cidx) => {
                    if (ctrl.type === 'checkbox') {
                        controlsHtml += `<label><input type="checkbox" data-ctrl-idx="${cidx}" ${ctrl.value ? 'checked' : ''}> ${ctrl.label}</label><br>`;
                    } else if (ctrl.type === 'slider') {
                        controlsHtml += `<label>${ctrl.label}: <input type="range" min="${ctrl.min}" max="${ctrl.max}" value="${ctrl.value}" data-ctrl-idx="${cidx}"></label> <span class="slider-value">${ctrl.value}</span><br>`;
                    } else if (ctrl.type === 'input') {
                        controlsHtml += `<label>${ctrl.label}: <input type="text" value="${ctrl.value}" data-ctrl-idx="${cidx}"></label><br>`;
                    }
                });
                controlsHtml += '</form>';
                panel.innerHTML += controlsHtml;
            } else {
                panel.innerHTML += `<div>No controls available for this feature.</div>`;
            }
            // Add event listeners for AI name input and buttons
            if (feature.name === 'AI Controls & Settings') {
                const aiNameInput = panel.querySelector('#ai-name-input');
                const aiNameSetBtn = panel.querySelector('#ai-name-set-btn');
                const aiNameSTTBtn = panel.querySelector('#ai-name-stt-btn');
                if (aiNameSetBtn) {
                    aiNameSetBtn.onclick = function() {
                        window.aiName = aiNameInput.value.trim() || 'AI';
                        alert('AI name set to: ' + window.aiName);
                    };
                }
                if (aiNameSTTBtn) {
                    aiNameSTTBtn.onclick = function() {
                        alert('Speech-to-text integration coming soon.');
                        // TODO: Integrate with speech-to-text backend and set AI name
                    };
                }
                // Role management event
                const aiRoleSetBtn = panel.querySelector('#ai-role-set-btn');
                const aiRoleSelect = panel.querySelector('#ai-role-select');
                if (aiRoleSetBtn && aiRoleSelect) {
                    aiRoleSetBtn.onclick = async function() {
                        const newRole = aiRoleSelect.value;
                        try {
                            const res = await fetch('/dashboard/set-role', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ ai_role: newRole })
                            });
                            const result = await res.json();
                            if (result.status === 'ok') {
                                dashboard.ai_role = newRole;
                                document.getElementById('current-ai-role').textContent = newRole;
                                alert('AI role updated to: ' + newRole);
                                renderPanel(idx);
                            } else {
                                alert('Failed to update role: ' + (result.error || 'Unknown error'));
                            }
                        } catch (e) {
                            alert('Error updating role: ' + e.message);
                        }
                    };
                }
            }
        } else {
            panel.innerHTML += `<div>This panel is off. Turn it on to see outputs.</div>`;
        }

        // Add event listeners for controls
        const form = panel.querySelector('.feature-controls-form');
        if (form) {
            form.addEventListener('input', async function(e) {
                const ctrlIdx = e.target.getAttribute('data-ctrl-idx');
                if (ctrlIdx === null) return;
                let newValue;
                if (e.target.type === 'checkbox') {
                    newValue = e.target.checked;
                } else {
                    newValue = e.target.value;
                }
                // Update UI (e.g., slider value)
                if (e.target.type === 'range') {
                    e.target.parentElement.querySelector('.slider-value').textContent = newValue;
                }
                // Send control change to backend
                await fetch('/feature-control', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        feature: feature.name,
                        control_idx: ctrlIdx,
                        value: newValue
                    })
                });
            });
        }
    }


    // Add global AI template button
    const aiBtn = document.createElement('button');
    aiBtn.textContent = 'Show AI Templates';
    aiBtn.onclick = fetchAndShowAITemplates;
    document.body.appendChild(aiBtn);

    // Insert custom panels section into dashboard main
    const dashboardMain = document.querySelector('.dashboard-main');
    if (dashboardMain) {
        const customPanelDiv = document.createElement('div');
        customPanelDiv.id = 'custom-panels';
        customPanelDiv.style.margin = '2em 0';
        dashboardMain.insertBefore(customPanelDiv, dashboardMain.firstChild);
        renderCustomPanels();
    }

    // Initial render
    renderPanel(0);

    // Tab click handler
    tabsDiv.addEventListener('click', function(e) {
        if (!e.target.classList.contains('dashboard-tab')) return;
        const idx = e.target.dataset.idx;
        renderPanel(idx);
        document.querySelectorAll('.dashboard-tab').forEach(tab => tab.classList.remove('active'));
        e.target.classList.add('active');
    });

    // Panel toggle handler
    panel.addEventListener('click', function(e) {
        if (!e.target.classList.contains('panel-toggle')) return;
        const idx = e.target.dataset.idx;
        dashboard.features[idx].enabled = !dashboard.features[idx].enabled;
        renderPanel(idx);
    });

    // Sidebar feature toggle handler
    featureList.addEventListener('change', function(e) {
        if (e.target.tagName !== 'INPUT') return;
        const idx = e.target.dataset.idx;
        dashboard.features[idx].enabled = e.target.checked;
        // Update tab and panel
        document.querySelectorAll('.dashboard-tab')[idx].classList.toggle('active', e.target.checked);
        renderPanel(idx);
    });

