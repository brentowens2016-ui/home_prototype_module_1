// --- Disability Enhancements Panel ---
function renderDisabilityPanel() {
    const panel = document.getElementById('dashboard-panel');
    panel.innerHTML = `<div class="panel-header disability-header"><h2>Disability Enhancements</h2></div>
        <div class="disability-controls">
            <label><input type="checkbox" id="toggle-contrast" checked> High Contrast Mode (Recommended for visually impaired)</label><br>
            <label><input type="checkbox" id="toggle-focus-outline" checked> Enhanced Focus Outlines</label><br>
            <label><input type="checkbox" id="toggle-live-region" checked> Enable ARIA Live Region (Screen Reader Feedback)</label><br>
            <label><input type="checkbox" id="toggle-skip-link" checked> Show Skip to Content Link</label><br>
            <label><input type="checkbox" id="toggle-visual-alerts"> Visual Alerts (for hearing impaired)</label><br>
            <div style="margin-top:1em; font-size:1.1em; color:#0078d4;">All settings here are user-selectable and can be changed at any time.</div>
        </div>`;
    // Default: visually impaired enhancements ON
    document.body.classList.add('high-contrast');
    // Handlers
    panel.querySelector('#toggle-contrast').onchange = e => {
        document.body.classList.toggle('high-contrast', e.target.checked);
    };
    panel.querySelector('#toggle-focus-outline').onchange = e => {
        document.body.classList.toggle('focus-outline', e.target.checked);
    };
    panel.querySelector('#toggle-live-region').onchange = e => {
        document.getElementById('aria-status').style.display = e.target.checked ? '' : 'none';
    };
    panel.querySelector('#toggle-skip-link').onchange = e => {
        document.querySelector('.skip-to-content').style.display = e.target.checked ? '' : 'none';
    };
    panel.querySelector('#toggle-visual-alerts').onchange = e => {
        window.visualAlertsEnabled = e.target.checked;
    };
}

// --- Accessibility: Skip to Content Link ---
if (!document.querySelector('.skip-to-content')) {
    const skipLink = document.createElement('a');
    skipLink.href = '#dashboard-root';
    skipLink.className = 'skip-to-content';
    skipLink.innerText = 'Skip to main content';
    document.body.insertBefore(skipLink, document.body.firstChild);
}

// --- Accessibility: ARIA Live Region for Status Updates ---
if (!document.getElementById('aria-status')) {
    const ariaStatus = document.createElement('div');
    ariaStatus.id = 'aria-status';
    ariaStatus.setAttribute('role', 'status');
    ariaStatus.setAttribute('aria-live', 'polite');
    document.body.appendChild(ariaStatus);
}

// Helper to update ARIA live region
function announceStatus(message) {
    const ariaStatus = document.getElementById('aria-status');
    if (ariaStatus) {
        ariaStatus.textContent = '';
        setTimeout(() => { ariaStatus.textContent = message; }, 50);
    }
}
// Helper: Prompt user to upgrade or abort if tier restriction is detected
// --- Live Video/Audio Feed UI for Remote Monitoring ---
function renderLiveFeedPanel() {
    let html = `<div class="live-feed-modal" style="position:fixed;top:10%;left:10%;width:60vw;height:60vh;background:#fff;border:2px solid #888;z-index:10020;overflow:auto;padding:16px;" role="dialog" aria-label="Live Video/Audio Feed">
        <h2>Live Video/Audio Feed</h2>
        <div style="margin-bottom:12px;color:#c00;font-weight:bold;">Privacy Notice: No video/audio is recorded or stored on the server. All streams are view-only and remain on local devices.</div>
        <video id="remote-video" width="100%" height="320" controls autoplay muted style="background:#222;"></video>
        <audio id="remote-audio" controls autoplay style="width:100%;margin-top:12px;"></audio>
        <button onclick="document.querySelector('.live-feed-modal').remove()">Close</button>
    </div>`;
    document.body.insertAdjacentHTML('beforeend', html);
    trapFocus('.live-feed-modal');
    // Example: Connect to local agent WebRTC/WebSocket stream (placeholder)
    // TODO: Replace with actual stream logic
    // document.getElementById('remote-video').srcObject = ...
    // document.getElementById('remote-audio').srcObject = ...
}

const liveFeedBtn = document.createElement('button');
liveFeedBtn.textContent = 'Live Video/Audio Feed';
setAriaAndAccessibility(liveFeedBtn, 'button', 'Open Live Video/Audio Feed');
liveFeedBtn.style.position = 'fixed';
liveFeedBtn.style.bottom = '50px';
liveFeedBtn.style.right = '10px';
liveFeedBtn.style.zIndex = '10021';
liveFeedBtn.onclick = renderLiveFeedPanel;
document.body.appendChild(liveFeedBtn);
// --- Interactive Tutorials & Tooltips ---
function showTooltip(target, text) {
    let tip = document.createElement('div');
    tip.className = 'dashboard-tooltip';
    tip.innerText = text;
    tip.style.position = 'absolute';
    tip.style.background = '#222';
    tip.style.color = '#fff';
    tip.style.padding = '6px 12px';
    tip.style.borderRadius = '6px';
    tip.style.zIndex = 10002;
    document.body.appendChild(tip);
    const rect = target.getBoundingClientRect();
    tip.style.left = rect.left + window.scrollX + 'px';
    tip.style.top = (rect.bottom + window.scrollY + 4) + 'px';
    target.onmouseleave = () => tip.remove();
}

function attachTooltip(selector, text) {
    document.querySelectorAll(selector).forEach(el => {
        el.onmouseenter = () => showTooltip(el, text);
    });
}

function launchTutorial(topic) {
    let steps = {
        'mapping': [
            'Welcome to the Mapping Editor!',
            'Click and drag to add rooms and devices.',
            'Use the annotation tool to add notes/tags.',
            'Save your mapping using the Save button.'
        ],
        'device': [
            'Device Control Tutorial:',
            'View and manage devices from the Device Control panel.',
            'Click a device to see details and trigger actions.'
        ],
        'emergency': [
            'Emergency Protocol Tutorial:',
            'Edit escalation contacts in the Emergency Services tab.',
            'Use the panic button for immediate help.'
        ]
    };
    let html = `<div class="tutorial-modal" style="position:fixed;top:10%;left:10%;width:60vw;height:60vh;background:#fff;border:2px solid #888;z-index:10010;overflow:auto;padding:16px;" role="dialog" aria-label="Tutorial">
        <h2>${topic.charAt(0).toUpperCase()+topic.slice(1)} Tutorial</h2>
        <ol>${steps[topic].map(s => `<li>${s}</li>`).join('')}</ol>
        <button onclick="document.querySelector('.tutorial-modal').remove()">Close</button>
    </div>`;
    document.body.insertAdjacentHTML('beforeend', html);
    trapFocus('.tutorial-modal');
}

// Attach tooltips to key buttons after DOMContentLoaded
document.addEventListener('DOMContentLoaded', function() {
    attachTooltip('button#save-mapping', 'Save your mapping and annotations.');
    attachTooltip('button#device-control', 'Open device control panel.');
    attachTooltip('button#emergency-services', 'Edit contacts or trigger emergency escalation.');
    attachTooltip('button#log-access', 'View system and event logs.');
    attachTooltip('button#mapping3DBtn', 'Launch 3D mapping and AR/VR view.');
});

// Add tutorial launch buttons to dashboard
const tutorialBar = document.createElement('div');
tutorialBar.style.position = 'fixed';
tutorialBar.style.bottom = '0';
tutorialBar.style.left = '0';
tutorialBar.style.width = '100vw';
tutorialBar.style.background = '#f8f8f8';
tutorialBar.style.zIndex = '10011';
tutorialBar.style.padding = '8px 0';
tutorialBar.style.textAlign = 'center';
tutorialBar.innerHTML = `
    <button onclick="launchTutorial('mapping')">Mapping Tutorial</button>
    <button onclick="launchTutorial('device')">Device Control Tutorial</button>
    <button onclick="launchTutorial('emergency')">Emergency Protocol Tutorial</button>
    <button id="setup-tutorial-btn" style="background:#0078d4;color:#fff;font-weight:bold;font-size:1.1em;margin-left:24px;">Set_up Tutorial</button>
`;
document.body.appendChild(tutorialBar);

// Set_up Tutorial logic
document.getElementById('setup-tutorial-btn').onclick = function() {
    // Open the setup tutorial in a modal (iframe) for accessibility
    let modal = document.createElement('div');
    modal.className = 'setup-tutorial-modal';
    modal.style.position = 'fixed';
    modal.style.top = '5%';
    modal.style.left = '50%';
    modal.style.transform = 'translateX(-50%)';
    modal.style.width = '70vw';
    modal.style.height = '80vh';
    modal.style.background = '#fff';
    modal.style.border = '2px solid #0078d4';
    modal.style.zIndex = '10050';
    modal.style.overflow = 'auto';
    modal.style.padding = '0';
    modal.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center;background:#0078d4;color:#fff;padding:12px 24px;">
            <h2 style="margin:0;font-size:1.3em;">Set_up Tutorial</h2>
            <button style="background:#fff;color:#0078d4;font-weight:bold;font-size:1.1em;border:none;padding:4px 16px;cursor:pointer;" onclick="this.closest('.setup-tutorial-modal').remove()">Close</button>
        </div>
        <iframe src="dashboard-setup-tutorial.html" style="width:100%;height:calc(100% - 56px);border:none;"></iframe>
    `;
    document.body.appendChild(modal);
    trapFocus('.setup-tutorial-modal');
};
// --- Accessibility Enhancements ---
function setAriaAndAccessibility(element, role, label) {
    if (role) element.setAttribute('role', role);
    if (label) element.setAttribute('aria-label', label);
    element.tabIndex = 0;
}

function trapFocus(modalSelector) {
    const modal = document.querySelector(modalSelector);
    if (!modal) return;
    const focusable = modal.querySelectorAll('button, [tabindex]:not([tabindex="-1"])');
    let first = focusable[0], last = focusable[focusable.length-1];
    modal.addEventListener('keydown', function(e) {
        if (e.key === 'Tab') {
            if (e.shiftKey && document.activeElement === first) {
                last.focus(); e.preventDefault();
            } else if (!e.shiftKey && document.activeElement === last) {
                first.focus(); e.preventDefault();
            }
        }
    });
    first.focus();
}
// --- Event & Emergency Logging Integration ---
async function logFrontendEvent(eventType, details) {
    await fetch('/logs/event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event_type: eventType, details })
    });
}

async function logFrontendEmergency(details) {
    await fetch('/logs/emergency', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ details })
    });
}
// --- 3D Mapping & AR/VR Integration ---
import { init3DMapping } from './modules/threejs_3d_mapping.js';

function render3DMappingPanel() {
    init3DMapping();
}

const mapping3DBtn = document.createElement('button');
mapping3DBtn.textContent = '3D Mapping / AR/VR';
mapping3DBtn.style.position = 'fixed';
mapping3DBtn.style.bottom = '10px';
mapping3DBtn.style.right = '10px';
mapping3DBtn.style.zIndex = '10001';
mapping3DBtn.onclick = render3DMappingPanel;
document.body.appendChild(mapping3DBtn);
// --- Decompression Helper ---
import pako from 'pako';

function decompressGzipBase64(encoded) {
    // Decode base64 to Uint8Array
    const str = atob(encoded);
    const bytes = new Uint8Array(str.length);
    for (let i = 0; i < str.length; ++i) bytes[i] = str.charCodeAt(i);
    // Decompress gzip
    const decompressed = pako.ungzip(bytes, { to: 'string' });
    return decompressed;
}
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
                                                            // --- Dynamic Optimization ---
                                                            let perfStats = { renderCount: 0, lastRender: Date.now(), avgRenderTime: 0 };
                                                            function monitorPerformance() {
                                                                perfStats.renderCount++;
                                                                const now = Date.now();
                                                                const renderTime = now - perfStats.lastRender;
                                                                perfStats.avgRenderTime = (perfStats.avgRenderTime * (perfStats.renderCount - 1) + renderTime) / perfStats.renderCount;
                                                                perfStats.lastRender = now;
                                                                if (perfStats.avgRenderTime > 500) {
                                                                    // If rendering is slow, throttle updates or paginate lists
                                                                    window.lazyLoadTickets = true;
                                                                    window.lazyLoadUSB = true;
                                                                }
                                                            }

                                                            // Debounce rapid network requests
                                                            function debounce(fn, delay) {
                                                                let timer = null;
                                                                return function(...args) {
                                                                    clearTimeout(timer);
                                                                    timer = setTimeout(() => fn.apply(this, args), delay);
                                                                };
                                                            }

                                                            // Patch ticket and USB loading to support pagination if needed
                                                            async function loadTickets(page=0, pageSize=20) {
                                                                const res = await fetch('/tickets/list');
                                                                const data = await res.json();
                                                                const listDiv = document.getElementById('ticket-list');
                                                                if (!listDiv) return;
                                                                let html = '<h3>Your Tickets</h3><ul>';
                                                                const tickets = window.lazyLoadTickets ? data.tickets.slice(page*pageSize, (page+1)*pageSize) : data.tickets;
                                                                tickets.forEach(t => {
                                                                    html += `<li><b>${t.subject}</b> [${t.status}] (${t.priority})<br>${t.description}<br>
                                                                        <button onclick="window.viewTicket('${t.id}')">View</button></li>`;
                                                                });
                                                                html += '</ul>';
                                                                if (window.lazyLoadTickets && data.tickets.length > (page+1)*pageSize) {
                                                                    html += `<button onclick="window.loadTickets(${page+1},${pageSize})">Load More</button>`;
                                                                }
                                                                listDiv.innerHTML = html;
                                                                monitorPerformance();
                                                            }

                                                            async function loadUSBModules(page=0, pageSize=20) {
                                                                const res = await fetch('/usb/modules');
                                                                const data = await res.json();
                                                                const div = document.getElementById('usb-module-list');
                                                                if (!div) return;
                                                                let html = '<h3>Registered USB Modules</h3><ul>';
                                                                const modules = window.lazyLoadUSB ? Object.entries(data.modules).slice(page*pageSize, (page+1)*pageSize) : Object.entries(data.modules);
                                                                for (const [id, info] of modules) {
                                                                    html += `<li><b>${info.name}</b> (${info.vendor}) - ${info.status}</li>`;
                                                                }
                                                                html += '</ul>';
                                                                if (window.lazyLoadUSB && Object.entries(data.modules).length > (page+1)*pageSize) {
                                                                    html += `<button onclick="window.loadUSBModules(${page+1},${pageSize})">Load More</button>`;
                                                                }
                                                                div.innerHTML = html;
                                                                monitorPerformance();
                                                            }

                                                            window.loadTickets = debounce(loadTickets, 100);
                                                            window.loadUSBModules = debounce(loadUSBModules, 100);
                                                        // --- USB Module Detection & Management UI ---
                                                        function renderUSBPanel() {
                                                            let html = `<div class="usb-modal" style="position:fixed;top:10%;left:10%;width:60vw;height:70vh;background:#fff;border:2px solid #888;z-index:4400;overflow:auto;padding:16px;">
                                                                <h2>USB Module Management</h2>
                                                                <button onclick="window.discoverUSBDevices()">Discover USB Devices</button>
                                                                <div id="usb-device-list"><span style="color:#888;">Click to discover devices...</span></div>
                                                                <hr>
                                                                <div id="usb-module-list"><span style="color:#888;">Loading modules...</span></div>
                                                                <button onclick="document.querySelector('.usb-modal').remove()">Close</button>
                                                            </div>`;
                                                            document.body.insertAdjacentHTML('beforeend', html);
                                                            setTimeout(loadUSBModules, 100); // Lazy load after panel opens
                                                        }

                                                        window.discoverUSBDevices = async function() {
                                                            const res = await fetch('/usb/discover');
                                                            const data = await res.json();
                                                            const div = document.getElementById('usb-device-list');
                                                            if (!div) return;
                                                            let html = '<h3>Detected USB Devices</h3><ul>';
                                                            data.devices.forEach(d => {
                                                                html += `<li><b>${d.name}</b> (${d.vendor}) - ${d.status}
                                                                    <button onclick="window.registerUSBModule('${d.id}', '${d.name}', '${d.vendor}')">Register Module</button></li>`;
                                                            });
                                                            html += '</ul>';
                                                            div.innerHTML = html;
                                                        };

                                                        window.registerUSBModule = async function(id, name, vendor) {
                                                            await fetch('/usb/register', {
                                                                method: 'POST',
                                                                headers: { 'Content-Type': 'application/json' },
                                                                body: JSON.stringify({ module_id: id, info: { name, vendor, status: 'registered' } })
                                                            });
                                                            loadUSBModules();
                                                        };

                                                        async function loadUSBModules() {
                                                            const res = await fetch('/usb/modules');
                                                            const data = await res.json();
                                                            const div = document.getElementById('usb-module-list');
                                                            if (!div) return;
                                                            let html = '<h3>Registered USB Modules</h3><ul>';
                                                            for (const [id, info] of Object.entries(data.modules)) {
                                                                html += `<li><b>${info.name}</b> (${info.vendor}) - ${info.status}</li>`;
                                                            }
                                                            html += '</ul>';
                                                            div.innerHTML = html;
                                                        }

                                                        // Add button to open USB panel
                                                        const usbBtn = document.createElement('button');
                                                        usbBtn.textContent = 'USB Modules';
                                                        usbBtn.onclick = renderUSBPanel;
                                                        document.body.appendChild(usbBtn);
                                                    // --- Log Access & Query UI ---
                                                    function renderLogPanel() {
                                                        let html = `<div class="log-modal" style="position:fixed;top:10%;left:10%;width:60vw;height:70vh;background:#fff;border:2px solid #888;z-index:4300;overflow:auto;padding:16px;" role="dialog" aria-label="Log Access Panel">
                                                            <h2>Log Access</h2>
                                                            <button id="agent-logs-btn">Query Agent Logs</button>
                                                            <button id="server-logs-btn">View Server Logs</button>
                                                            <button id="log-event-btn">Log Event: Viewed Log Panel</button>
                                                            <button id="log-emergency-btn">Log Emergency</button>
                                                            <div id="log-results"><span style="color:#888;">Select a log type to load...</span></div>
                                                            <button id="close-log-modal">Close</button>
                                                        </div>`;
                                                        document.body.insertAdjacentHTML('beforeend', html);
                                                        setAriaAndAccessibility(document.querySelector('.log-modal'), 'dialog', 'Log Access Panel');
                                                        trapFocus('.log-modal');
                                                        document.getElementById('agent-logs-btn').onclick = window.queryAgentLogs;
                                                        document.getElementById('server-logs-btn').onclick = window.queryServerLogs;
                                                        document.getElementById('log-event-btn').onclick = () => window.logFrontendEvent('manual','User viewed log panel');
                                                        document.getElementById('log-emergency-btn').onclick = () => window.logFrontendEmergency('User triggered emergency log from log panel');
                                                        document.getElementById('close-log-modal').onclick = () => document.querySelector('.log-modal').remove();
                                                    }
window.logFrontendEvent = logFrontendEvent;
window.logFrontendEmergency = logFrontendEmergency;

                                                    window.queryAgentLogs = async function() {
                                                        const res = await fetch('/logs/agent');
                                                        const data = await res.json();
                                                        const div = document.getElementById('log-results');
                                                        if (!div) return;
                                                        if (data.error) {
                                                            div.innerHTML = `<b>Error:</b> ${data.error}`;
                                                            return;
                                                        }
                                                        let html = '<h3>Agent Logs</h3><ul>';
                                                        data.logs.forEach(l => { html += `<li>${l}</li>`; });
                                                        html += '</ul>';
                                                        div.innerHTML = html;
                                                    };

                                                    window.queryServerLogs = async function() {
                                                        const res = await fetch('/logs/server');
                                                        const data = await res.json();
                                                        const div = document.getElementById('log-results');
                                                        if (!div) return;
                                                        let html = '<h3>Server Logs</h3>';
                                                        for (const [fname, content] of Object.entries(data.logs)) {
                                                            let logText = content;
                                                            if (data.compression === 'gzip+base64') {
                                                                try {
                                                                    logText = decompressGzipBase64(content);
                                                                } catch (e) {
                                                                    logText = '[Error decompressing log]';
                                                                }
                                                            }
                                                            html += `<b>${fname}</b><pre style="background:#eee;padding:8px;">${logText}</pre>`;
                                                        }
                                                        div.innerHTML = html;
                                                        // Example: decompress mapping data from /mapping/load
                                                        const mappingRes = await fetch('/mapping/load');
                                                        const mappingData = await mappingRes.json();
                                                        let mapping = mappingData.mapping;
                                                        if (mappingData.compression === 'gzip+base64') {
                                                            try {
                                                                mapping = JSON.parse(decompressGzipBase64(mappingData.mapping));
                                                            } catch (e) {
                                                                mapping = {};
                                                            }
                                                        }
                                                        // Use mapping object as needed
                                                    };

                                                    // Add button to open log panel (support/admin only)
                                                    const logBtn = document.createElement('button');
                                                    logBtn.textContent = 'Log Access';
                                                    setAriaAndAccessibility(logBtn, 'button', 'Open Log Access Panel');
                                                    logBtn.onclick = renderLogPanel;
                                                    document.body.appendChild(logBtn);
                                                // --- AI Ticket Suggestion Flagging ---
                                                async function pollAITicketSuggestions() {
                                                    // Placeholder: fetch AI ticket suggestions from backend
                                                    const res = await fetch('/tickets/list');
                                                    const data = await res.json();
                                                    const flagged = data.tickets.filter(t => t.user_id === 'ai_model');
                                                    if (flagged.length > 0) {
                                                        let html = `<div id="ai-ticket-flags" style="position:fixed;top:120px;right:10px;z-index:4200;background:#ffeedd;padding:10px 18px;border-radius:8px;box-shadow:0 2px 8px #0002;min-width:220px;">
                                                            <b>AI Support Suggestions:</b><ul>`;
                                                        flagged.forEach(t => {
                                                            html += `<li><b>${t.subject}</b><br>${t.description}</li>`;
                                                        });
                                                        html += '</ul></div>';
                                                        let panel = document.getElementById('ai-ticket-flags');
                                                        if (panel) panel.remove();
                                                        document.body.insertAdjacentHTML('beforeend', html);
                                                    } else {
                                                        let panel = document.getElementById('ai-ticket-flags');
                                                        if (panel) panel.remove();
                                                    }
                                                }
                                                setInterval(pollAITicketSuggestions, 10000); // Poll every 10s
                                            // --- Support Ticketing UI ---
                                            function renderTicketPanel() {
                                                let html = `<div class="ticket-modal" style="position:fixed;top:10%;left:10%;width:60vw;height:70vh;background:#fff;border:2px solid #888;z-index:4000;overflow:auto;padding:16px;">
                                                    <h2>Support Tickets</h2>
                                                    <div>
                                                        <label>Subject: <input id="ticket-subject" type="text" /></label><br>
                                                        <label>Description:<br><textarea id="ticket-description" rows="4" style="width:90%"></textarea></label><br>
                                                        <label>Priority: <select id="ticket-priority"><option value="normal">Normal</option><option value="urgent">Urgent</option></select></label><br>
                                                        <button onclick="window.submitTicket()">Submit Ticket</button>
                                                    </div>
                                                    <hr>
                                                    <div id="ticket-list"><span style="color:#888;">Loading tickets...</span></div>
                                                    <button onclick="document.querySelector('.ticket-modal').remove()">Close</button>
                                                </div>`;
                                                document.body.insertAdjacentHTML('beforeend', html);
                                                setTimeout(loadTickets, 100); // Lazy load after panel opens
                                            }

                                            window.submitTicket = async function() {
                                                const subject = document.getElementById('ticket-subject').value.trim();
                                                const description = document.getElementById('ticket-description').value.trim();
                                                const priority = document.getElementById('ticket-priority').value;
                                                if (!subject || !description) { alert('Subject and description required'); return; }
                                                await fetch('/tickets/create', {
                                                    method: 'POST',
                                                    headers: { 'Content-Type': 'application/json' },
                                                    body: JSON.stringify({
                                                        user_id: window.dashboardUserName || 'user',
                                                        subject,
                                                        description,
                                                        priority,
                                                        created_at: new Date().toISOString()
                                                    })
                                                });
                                                alert('Ticket submitted!');
                                                loadTickets();
                                            };

                                            async function loadTickets() {
                                                const res = await fetch('/tickets/list');
                                                const data = await res.json();
                                                const listDiv = document.getElementById('ticket-list');
                                                if (!listDiv) return;
                                                let html = '<h3>Your Tickets</h3><ul>';
                                                data.tickets.forEach(t => {
                                                    html += `<li><b>${t.subject}</b> [${t.status}] (${t.priority})<br>${t.description}<br>
                                                        <button onclick="window.viewTicket('${t.id}')">View</button></li>`;
                                                });
                                                html += '</ul>';
                                                listDiv.innerHTML = html;
                                            }

                                            window.viewTicket = async function(ticketId) {
                                                const res = await fetch(`/tickets/${ticketId}`);
                                                const data = await res.json();
                                                const t = data.ticket;
                                                let html = `<div class="ticket-detail-modal" style="position:fixed;top:15%;left:15%;width:50vw;height:60vh;background:#f9f9f9;border:2px solid #888;z-index:4100;overflow:auto;padding:16px;">
                                                    <h3>Ticket: ${t.subject}</h3>
                                                    <div>Status: ${t.status} | Priority: ${t.priority} | Assigned: ${t.assigned_to || 'Unassigned'}</div>
                                                    <div>Description: ${t.description}</div>
                                                    <div>Messages:<ul>`;
                                                t.messages.forEach(m => {
                                                    html += `<li><b>${m.author}</b> [${m.timestamp}]: ${m.message}</li>`;
                                                });
                                                html += `</ul></div>
                                                    <textarea id="ticket-message" rows="2" style="width:90%"></textarea><br>
                                                    <button onclick="window.addTicketMessage('${t.id}')">Add Message</button>
                                                    <button onclick="document.querySelector('.ticket-detail-modal').remove()">Close</button>
                                                </div>`;
                                                document.body.insertAdjacentHTML('beforeend', html);
                                            };

                                            window.addTicketMessage = async function(ticketId) {
                                                const msg = document.getElementById('ticket-message').value.trim();
                                                if (!msg) return;
                                                await fetch(`/tickets/message/${ticketId}`, {
                                                    method: 'POST',
                                                    headers: { 'Content-Type': 'application/json' },
                                                    body: JSON.stringify({
                                                        author: window.dashboardUserName || 'user',
                                                        message: msg,
                                                        timestamp: new Date().toISOString()
                                                    })
                                                });
                                                document.querySelector('.ticket-detail-modal').remove();
                                                window.viewTicket(ticketId);
                                            };

                                            // Add button to open ticket panel
                                            const ticketBtn = document.createElement('button');
                                            ticketBtn.textContent = 'Support Tickets';
                                            ticketBtn.onclick = renderTicketPanel;
                                            document.body.appendChild(ticketBtn);
                                        // --- WebSocket Remote Support Logic ---
                                        let wsSupport = null;
                                        function connectRemoteSupportWS() {
                                            if (wsSupport) wsSupport.close();
                                            wsSupport = new WebSocket(`ws://${window.location.host}/ws/remote-support`);
                                            wsSupport.onopen = () => {
                                                console.log('Remote support WebSocket connected');
                                                // Broadcast initial dashboard state
                                                wsSupport.send(JSON.stringify({ type: 'dashboard_state', state: getDashboardState() }));
                                            };
                                            wsSupport.onmessage = (event) => {
                                                const msg = JSON.parse(event.data);
                                                if (msg.type === 'remote_action') {
                                                    handleRemoteAction(msg.action);
                                                }
                                            };
                                            wsSupport.onclose = () => {
                                                console.log('Remote support WebSocket disconnected');
                                            };
                                        }

                                        function getDashboardState() {
                                            // Gather relevant dashboard state (rooms, devices, walls, annotations, etc.)
                                            return {
                                                rooms,
                                                devices,
                                                walls,
                                                annotations,
                                                floor: currentFloor+1
                                            };
                                        }

                                        function broadcastDashboardState() {
                                            if (wsSupport && wsSupport.readyState === 1) {
                                                wsSupport.send(JSON.stringify({ type: 'dashboard_state', state: getDashboardState() }));
                                            }
                                        }

                                        function handleRemoteAction(action) {
                                            // Example: apply remote changes (e.g., update config, logs, etc.)
                                            // Extend this to support specific remote support actions
                                            console.log('Remote support action received:', action);
                                            // You can add logic here to apply changes to dashboard
                                        }

                                        // Hook into remote support switch
                                        document.getElementById('remote-support-toggle').addEventListener('change', function(e) {
                                            if (e.target.checked) {
                                                connectRemoteSupportWS();
                                            } else {
                                                if (wsSupport) wsSupport.close();
                                            }
                                        });

                                        // Broadcast dashboard state on relevant changes
                                        [addRoom, addDevice, addWall, moveRoom, moveDevice, removeWall].forEach(fn => {
                                            const orig = fn;
                                            window[fn.name] = function(...args) {
                                                orig.apply(this, args);
                                                broadcastDashboardState();
                                            };
                                        });
                                    // --- Remote Support Permission Switch ---
                                    let remoteSupportEnabled = false;
                                    function renderRemoteSupportSwitch() {
                                        let html = `<div id="remote-support-switch" style="position:fixed;top:60px;right:10px;z-index:1100;background:#f8f8f8;padding:10px 18px;border-radius:8px;box-shadow:0 2px 8px #0002;min-width:220px;">
                                            <label><b>Remote Support Access:</b></label><br>
                                            <label class="switch">
                                                <input type="checkbox" id="remote-support-toggle" ${remoteSupportEnabled ? 'checked' : ''}>
                                                <span class="slider"></span>
                                            </label>
                                            <span id="remote-support-status" style="margin-left:10px;">${remoteSupportEnabled ? 'Enabled' : 'Disabled'}</span>
                                        </div>`;
                                        let panel = document.getElementById('remote-support-switch');
                                        if (panel) panel.remove();
                                        document.body.insertAdjacentHTML('beforeend', html);
                                        document.getElementById('remote-support-toggle').onchange = async function(e) {
                                            remoteSupportEnabled = e.target.checked;
                                            document.getElementById('remote-support-status').textContent = remoteSupportEnabled ? 'Enabled' : 'Disabled';
                                            await fetch('/agent/remote-support', {
                                                method: 'POST',
                                                headers: { 'Content-Type': 'application/json' },
                                                body: JSON.stringify({ enabled: remoteSupportEnabled })
                                            });
                                            if (remoteSupportEnabled) {
                                                // Broadcast dashboard display on localhost (placeholder)
                                                // You may want to trigger a local websocket or HTTP broadcast here
                                                console.log('Remote support enabled: broadcasting dashboard on localhost');
                                            } else {
                                                // Stop broadcast
                                                console.log('Remote support disabled: stopping dashboard broadcast');
                                            }
                                        };
                                    }
                                    renderRemoteSupportSwitch();
                                // --- Role Management UI ---
                                function renderRoleManagementPanel() {
                                    let html = `<div class="role-management-modal" style="position:fixed;top:10%;left:10%;width:60vw;height:70vh;background:#fff;border:2px solid #888;z-index:3000;overflow:auto;padding:16px;">
                                        <h2>Role Management</h2>
                                        <div>
                                            <label>New Role Name: <input id="new-role-name" type="text" /></label>
                                            <label>Actions (comma separated): <input id="new-role-actions" type="text" /></label>
                                            <button onclick="window.createRole()">Create Role</button>
                                        </div>
                                        <hr>
                                        <div>
                                            <label>User ID: <input id="role-user-id" type="text" /></label>
                                            <label>Role Name: <input id="role-assign-name" type="text" /></label>
                                            <button onclick="window.assignRole()">Assign Role</button>
                                        </div>
                                        <hr>
                                        <div>
                                            <label>Group Name (optional): <input id="role-group-name" type="text" /></label>
                                            <label>Role Name: <input id="role-group-role" type="text" /></label>
                                            <button onclick="window.createRoleGroup()">Create Group</button>
                                        </div>
                                        <button onclick="document.querySelector('.role-management-modal').remove()">Close</button>
                                    </div>`;
                                    document.body.insertAdjacentHTML('beforeend', html);
                                }

                                window.createRole = async function() {
                                    const name = document.getElementById('new-role-name').value.trim();
                                    const actions = document.getElementById('new-role-actions').value.split(',').map(a => a.trim()).filter(a => a);
                                    if (!name || actions.length === 0) { alert('Role name and actions required'); return; }
                                    await fetch('/roles/create', {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ role_name: name, actions })
                                    });
                                    alert('Role created!');
                                };

                                window.assignRole = async function() {
                                    const userId = document.getElementById('role-user-id').value.trim();
                                    const roleName = document.getElementById('role-assign-name').value.trim();
                                    if (!userId || !roleName) { alert('User ID and role name required'); return; }
                                    await fetch('/roles/assign', {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ user_id: userId, role_name: roleName })
                                    });
                                    alert('Role assigned!');
                                };

                                window.createRoleGroup = async function() {
                                    const groupName = document.getElementById('role-group-name').value.trim();
                                    const roleName = document.getElementById('role-group-role').value.trim();
                                    if (!groupName || !roleName) { alert('Group name and role name required'); return; }
                                    await fetch('/roles/group', {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ group_name: groupName, role_name: roleName })
                                    });
                                    alert('Group created/updated!');
                                };

                                // Add button to open role management panel (admin only)
                                const roleBtn = document.createElement('button');
                                roleBtn.textContent = 'Role Management';
                                roleBtn.onclick = renderRoleManagementPanel;
                                document.body.appendChild(roleBtn);
                            // --- Audit Trail & Versioning (Elite) ---
                            let auditTrail = [];
                            let versionHistory = [];
                            function recordMapChange(action, detail) {
                                if (!eliteAllowed) return;
                                const entry = {
                                    timestamp: new Date().toISOString(),
                                    user: window.dashboardUserName || 'user',
                                    action,
                                    detail: JSON.parse(JSON.stringify(detail)),
                                    floor: currentFloor+1
                                };
                                auditTrail.push(entry);
                                versionHistory.push({
                                    rooms: JSON.parse(JSON.stringify(rooms)),
                                    devices: JSON.parse(JSON.stringify(devices)),
                                    walls: JSON.parse(JSON.stringify(walls)),
                                    floor: currentFloor+1,
                                    timestamp: entry.timestamp
                                });
                            }

                            // Hook into room/device/wall changes
                            function addRoom(room) { rooms.push(room); recordMapChange('add_room', room); drawMappingCanvas(); sendMappingToAIModel(); }
                            function addDevice(device) { devices.push(device); recordMapChange('add_device', device); drawMappingCanvas(); sendMappingToAIModel(); }
                            function addWall(wall) { walls.push(wall); recordMapChange('add_wall', wall); drawMappingCanvas(); sendMappingToAIModel(); }
                            function moveRoom(idx, x, y) { rooms[idx].x = x; rooms[idx].y = y; recordMapChange('move_room', rooms[idx]); drawMappingCanvas(); sendMappingToAIModel(); }
                            function moveDevice(idx, x, y) { devices[idx].x = x; devices[idx].y = y; recordMapChange('move_device', devices[idx]); drawMappingCanvas(); sendMappingToAIModel(); }
                            function removeWall(idx) { const w = walls.splice(idx,1)[0]; recordMapChange('remove_wall', w); drawMappingCanvas(); sendMappingToAIModel(); }

                            // Patch palette and drag logic to use hooks
                            document.querySelectorAll('.room-palette-btn').forEach(btn => {
                                btn.addEventListener('click', () => {
                                    const type = btn.dataset.room;
                                    const colorMap = {bedroom:'#cce6ff',bathroom:'#e6ccff',kitchen:'#ffe6cc',living:'#ccffe6',dining:'#fffacc',closet:'#e6e6e6',pantry:'#f5e6cc',balcony:'#ccf5ff',service:'#ffd6cc'};
                                    addRoom({
                                        x: 100+Math.random()*200, y: 100+Math.random()*200, w: 120, h: 90,
                                        label: type.charAt(0).toUpperCase()+type.slice(1), color: colorMap[type]||'#cce6ff', type
                                    });
                                });
                            });
                            document.querySelectorAll('.device-palette-btn').forEach(btn => {
                                btn.addEventListener('click', () => {
                                    const type = btn.dataset.device;
                                    addDevice({
                                        x: 200+Math.random()*200, y: 200+Math.random()*200, label: type.charAt(0).toUpperCase()+type.slice(1), illum: true, type
                                    });
                                });
                            });
                            // Wall drawing/erasing
                            if (mappingCanvas) {
                                mappingCanvas.addEventListener('click', e => {
                                    const mx = (e.offsetX-panX)/scale, my = (e.offsetY-panY)/scale;
                                    if (wallDrawing) {
                                        if (!wallStart) {
                                            wallStart = {x:mx, y:my};
                                        } else {
                                            addWall({x1:wallStart.x, y1:wallStart.y, x2:mx, y2:my});
                                            wallStart = null;
                                        }
                                    } else if (wallErasing) {
                                        let idx = walls.findIndex(w => {
                                            const d = Math.abs((w.x2-w.x1)*(w.y1-my)-(w.x1-mx)*(w.y2-w.y1))/Math.hypot(w.x2-w.x1,w.y2-w.y1);
                                            return d < 10;
                                        });
                                        if (idx>=0) { removeWall(idx); }
                                    }
                                });
                            }

                            // Drag-to-move hooks
                            if (mappingCanvas) {
                                mappingCanvas.addEventListener('mousemove', e => {
                                    if (dragObj) {
                                        const mx = (e.offsetX-panX)/scale, my = (e.offsetY-panY)/scale;
                                        if (dragObj.type==='room') {
                                            let nx = Math.round((mx-dragObj.offsetX)/20)*20;
                                            let ny = Math.round((my-dragObj.offsetY)/20)*20;
                                            moveRoom(dragObj.idx, nx, ny);
                                        } else if (dragObj.type==='device') {
                                            let nx = Math.round((mx-dragObj.offsetX)/20)*20;
                                            let ny = Math.round((my-dragObj.offsetY)/20)*20;
                                            // Snap to wall logic as before
                                            let snapped = false;
                                            for (const r of rooms) {
                                                if (Math.abs(nx-r.x)<12 && ny>=r.y && ny<=r.y+r.h) { nx = r.x; snapped=true; }
                                                if (Math.abs(nx-(r.x+r.w))<12 && ny>=r.y && ny<=r.y+r.h) { nx = r.x+r.w; snapped=true; }
                                                if (Math.abs(ny-r.y)<12 && nx>=r.x && nx<=r.x+r.w) { ny = r.y; snapped=true; }
                                                if (Math.abs(ny-(r.y+r.h))<12 && nx>=r.x && nx<=r.x+r.w) { ny = r.y+r.h; snapped=true; }
                                            }
                                            moveDevice(dragObj.idx, nx, ny);
                                        }
                                    }
                                });
                            }

                            // Audit trail and versioning UI
                            document.getElementById('audit-trail-btn').onclick = function() {
                                if (!eliteAllowed) return;
                                let html = '<div class="audit-modal" style="position:fixed;top:10%;left:10%;width:80vw;height:70vh;background:#fff;border:2px solid #888;z-index:2000;overflow:auto;padding:16px;">';
                                html += '<h3>Audit Trail</h3><ul>';
                                auditTrail.forEach(entry => {
                                    html += `<li>[${entry.timestamp}] [Floor ${entry.floor}] ${entry.user}: ${entry.action} (${JSON.stringify(entry.detail)})</li>`;
                                });
                                html += '</ul><button onclick="document.querySelector(\'.audit-modal\').remove()">Close</button></div>';
                                document.body.insertAdjacentHTML('beforeend', html);
                            };
                            document.getElementById('version-history-btn').onclick = function() {
                                if (!eliteAllowed) return;
                                let html = '<div class="version-modal" style="position:fixed;top:10%;left:10%;width:80vw;height:70vh;background:#fff;border:2px solid #888;z-index:2000;overflow:auto;padding:16px;">';
                                html += '<h3>Version History</h3><ul>';
                                versionHistory.forEach((v, idx) => {
                                    html += `<li>[${v.timestamp}] [Floor ${v.floor}] <button onclick="window.restoreVersion(${idx})">Restore</button></li>`;
                                });
                                html += '</ul><button onclick="document.querySelector(\'.version-modal\').remove()">Close</button></div>';
                                document.body.insertAdjacentHTML('beforeend', html);
                            };
                            window.restoreVersion = function(idx) {
                                if (!eliteAllowed) return;
                                const v = versionHistory[idx];
                                rooms.length = 0; devices.length = 0; walls.length = 0;
                                v.rooms.forEach(r => rooms.push(JSON.parse(JSON.stringify(r))));
                                v.devices.forEach(d => devices.push(JSON.parse(JSON.stringify(d))));
                                v.walls.forEach(w => walls.push(JSON.parse(JSON.stringify(w))));
                                drawMappingCanvas();
                                alert('Restored version from '+v.timestamp);
                            };
                        // --- Elite Feature Gating ---
                        const eliteAllowed = ['pro','elite'].includes(userTier);
                        const eliteTools = document.getElementById('elite-mapping-tools');
                        if (eliteTools && !eliteAllowed) {
                            document.getElementById('elite-feature-warning').style.display = '';
                            eliteTools.querySelectorAll('button').forEach(el => { el.disabled = true; });
                        }

                        // Audit trail (Elite)
                        document.getElementById('audit-trail-btn').onclick = function() {
                            if (!eliteAllowed) return;
                            alert('Audit trail UI coming soon.');
                        };

                        // Version history (Elite)
                        document.getElementById('version-history-btn').onclick = function() {
                            if (!eliteAllowed) return;
                            alert('Version history UI coming soon.');
                        };

                        // Annotation (Elite)
                        // --- Annotation/Collaboration (Elite) ---
                        let annotations = [];
                        // --- AI Model Connection Logic ---
                        async function sendMappingToAIModel() {
                            // Gather mapping and annotation data
                            const data = {
                                rooms: rooms,
                                devices: devices,
                                walls: walls,
                                annotations: annotations,
                                floor: currentFloor+1
                            };
                            try {
                                // Placeholder: Replace with actual AI model endpoint
                                const res = await fetch('/api/ai/mapping-suggest', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify(data)
                                });
                                if (!res.ok) throw new Error('AI model error');
                                const aiResult = await res.json();
                                // Handle AI suggestions (e.g., update UI, show modal, etc.)
                                console.log('AI Model Suggestions:', aiResult);
                                // Optionally, display suggestions to user
                                // showAISuggestions(aiResult);
                            } catch (err) {
                                console.error('AI model connection failed:', err);
                            }
                        }

                        // --- Backend Mapping Persistence Logic ---
                        async function saveMappingToBackend() {
                            const data = {
                                rooms: rooms,
                                devices: devices,
                                walls: walls,
                                annotations: annotations,
                                floor: currentFloor+1
                            };
                            try {
                                const res = await fetch('/mapping/save', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify(data)
                                });
                                if (!res.ok) throw new Error('Save failed');
                                console.log('Mapping saved to backend');
                            } catch (err) {
                                console.error('Save to backend failed:', err);
                            }
                        }

                        async function loadMappingFromBackend() {
                            try {
                                const res = await fetch('/mapping/load');
                                if (!res.ok) throw new Error('Load failed');
                                const data = await res.json();
                                // Replace current state
                                rooms.length = 0; devices.length = 0; walls.length = 0; annotations.length = 0;
                                data.rooms.forEach(r => rooms.push(r));
                                data.devices.forEach(d => devices.push(d));
                                data.walls.forEach(w => walls.push(w));
                                data.annotations.forEach(a => annotations.push(a));
                                if (typeof data.floor === 'number') currentFloor = data.floor-1;
                                drawMappingCanvas();
                                console.log('Mapping loaded from backend');
                            } catch (err) {
                                console.error('Load from backend failed:', err);
                            }
                        }
                        function renderAnnotationModal() {
                            let html = '<div class="annotation-modal" style="position:fixed;top:10%;left:10%;width:60vw;height:60vh;background:#fff;border:2px solid #888;z-index:2000;overflow:auto;padding:16px;">';
                            html += '<h3>Annotations</h3>';
                            html += '<ul id="annotation-list">';
                            annotations.forEach((a, idx) => {
                                html += `<li><b>${a.type}</b> [${a.targetId}]: ${a.text} <i>(${a.author || 'anon'}, ${new Date(a.timestamp).toLocaleString()})</i> <button onclick="window.editAnnotation(${idx})">Edit</button> <button onclick="window.deleteAnnotation(${idx})">Delete</button></li>`;
                            });
                            html += '</ul>';
                            html += '<button onclick="window.showAnnotationForm()">Add Annotation</button>';
                            html += '<button onclick="document.querySelector(\'.annotation-modal\').remove()">Close</button>';
                            html += '<div id="annotation-form" style="display:none;margin-top:16px;">';
                            html += 'Target Type: <select id="annotation-type"><option value="room">Room</option><option value="device">Device</option></select> ';
                            html += 'Target ID: <input id="annotation-target" type="text" /> ';
                            html += 'Note/Tag: <input id="annotation-text" type="text" /> ';
                            html += '<button onclick="window.saveAnnotation()">Save</button> ';
                            html += '<button onclick="window.cancelAnnotation()">Cancel</button>';
                            html += '</div>';
                            html += '</div>';
                            document.body.insertAdjacentHTML('beforeend', html);
                        }
                        window.showAnnotationForm = function(idx) {
                            document.getElementById('annotation-form').style.display = '';
                            if (typeof idx === 'number') {
                                const a = annotations[idx];
                                document.getElementById('annotation-type').value = a.type;
                                document.getElementById('annotation-target').value = a.targetId;
                                document.getElementById('annotation-text').value = a.text;
                                window._editAnnotationIdx = idx;
                            } else {
                                document.getElementById('annotation-type').value = 'room';
                                document.getElementById('annotation-target').value = '';
                                document.getElementById('annotation-text').value = '';
                                window._editAnnotationIdx = null;
                            }
                        };
                        window.saveAnnotation = function() {
                            const type = document.getElementById('annotation-type').value;
                            const targetId = document.getElementById('annotation-target').value;
                            const text = document.getElementById('annotation-text').value;
                            if (!targetId || !text) { alert('Target ID and text required'); return; }
                            const author = window.dashboardUserName || 'anon';
                            if (window._editAnnotationIdx != null) {
                                const a = annotations[window._editAnnotationIdx];
                                a.type = type; a.targetId = targetId; a.text = text; a.timestamp = Date.now(); a.author = author;
                            } else {
                                annotations.push({ id: 'a_' + Date.now(), type, targetId, text, timestamp: Date.now(), author });
                            }
                            document.getElementById('annotation-form').style.display = 'none';
                            document.querySelector('.annotation-modal').remove();
                            renderAnnotationModal();
                            saveMappingToBackend();
                            sendMappingToAIModel();
                        };
                        window.cancelAnnotation = function() {
                            document.getElementById('annotation-form').style.display = 'none';
                        };
                        window.editAnnotation = function(idx) {
                            document.getElementById('annotation-form').style.display = '';
                            window.showAnnotationForm(idx);
                            // AI sync will occur on save, but if you want to sync on edit open, uncomment below:
                            // sendMappingToAIModel();
                        };
                        window.deleteAnnotation = function(idx) {
                            if (confirm('Delete this annotation?')) {
                                annotations.splice(idx, 1);
                                document.querySelector('.annotation-modal').remove();
                                renderAnnotationModal();
                                saveMappingToBackend();
                                sendMappingToAIModel();
                            }
                        };
                        document.getElementById('add-annotation-btn').onclick = function() {
                            if (!eliteAllowed) return;
                            renderAnnotationModal();
                        };
                        // Add AI Suggestion button for Elite users
                        if (eliteAllowed) {
                            let aiBtn = document.createElement('button');
                            aiBtn.textContent = 'Get AI Suggestions';
                            aiBtn.style.marginLeft = '1em';
                            aiBtn.onclick = sendMappingToAIModel;
                            document.getElementById('elite-mapping-tools').appendChild(aiBtn);
                            // Add Save/Load buttons for backend persistence
                            let saveBtn = document.createElement('button');
                            saveBtn.textContent = 'Save Mapping';
                            saveBtn.style.marginLeft = '1em';
                            saveBtn.onclick = saveMappingToBackend;
                            document.getElementById('elite-mapping-tools').appendChild(saveBtn);
                            let loadBtn = document.createElement('button');
                            loadBtn.textContent = 'Load Mapping';
                            loadBtn.style.marginLeft = '1em';
                            loadBtn.onclick = loadMappingFromBackend;
                            document.getElementById('elite-mapping-tools').appendChild(loadBtn);
                        }

                        // Custom icons (Elite)
                        document.getElementById('custom-icon-btn').onclick = function() {
                            if (!eliteAllowed) return;
                            alert('Custom icon upload UI coming soon.');
                        };

                        // Analytics (Elite)
                        document.getElementById('analytics-btn').onclick = function() {
                            if (!eliteAllowed) return;
                            alert('Analytics/AI suggestions/heatmaps UI coming soon.');
                        };
                    // --- Advanced/Elite Feature Gating ---
                    const userTier = window.dashboardUserTier || 'basic';
                    const advancedAllowed = ['advanced','pro','elite'].includes(userTier);
                    const advTools = document.getElementById('advanced-mapping-tools');
                    if (advTools && !advancedAllowed) {
                        document.getElementById('advanced-feature-warning').style.display = '';
                        advTools.querySelectorAll('input,button').forEach(el => { el.disabled = true; });
                    }

                    // Floor plan upload (Advanced/Elite)
                    const floorplanUpload = document.getElementById('floorplan-upload');
                    let floorplanImg = null;
                    if (floorplanUpload) {
                        floorplanUpload.addEventListener('change', e => {
                            const file = e.target.files[0];
                            if (!file) return;
                            const reader = new FileReader();
                            reader.onload = function(ev) {
                                const img = new window.Image();
                                img.onload = function() {
                                    floorplanImg = img;
                                    drawMappingCanvas();
                                };
                                img.src = ev.target.result;
                            };
                            reader.readAsDataURL(file);
                        });
                    }

                    // Device grouping (Advanced/Elite)
                    document.getElementById('device-group-btn').onclick = function() {
                        if (!advancedAllowed) return;
                        alert('Device grouping UI coming soon.');
                    };

                    // Live status overlay (Advanced/Elite)
                    document.getElementById('show-status-overlay-btn').onclick = function() {
                        if (!advancedAllowed) return;
                        alert('Live device status overlay coming soon.');
                    };
                // --- Multi-floor and wall drawing state ---
                let floors = [{rooms:[], devices:[], walls:[]}];
                let currentFloor = 0;
                let wallDrawing = false;
                let wallErasing = false;
                let wallStart = null;

            // --- Mapping Editor: Canvas, Zoom, Pan, Drag/Drop ---
            const mappingCanvas = document.getElementById('mapping-canvas');
            const ctx = mappingCanvas ? mappingCanvas.getContext('2d') : null;
            let scale = 1.0;
            let panX = 0, panY = 0;
            let isPanning = false, lastPan = {x:0, y:0};

            let dragObj = null; // {type: 'room'|'device', idx, offsetX, offsetY}
            let rooms = floors[0].rooms;
            let devices = floors[0].devices;
            let walls = floors[0].walls;
            let validationMsg = '';

            function drawMappingCanvas() {
                                // Draw floor plan image (if uploaded)
                                if (floorplanImg) {
                                    ctx.save();
                                    ctx.setTransform(scale, 0, 0, scale, panX, panY);
                                    ctx.globalAlpha = 0.5;
                                    ctx.drawImage(floorplanImg, 0, 0, mappingCanvas.width/scale, mappingCanvas.height/scale);
                                    ctx.globalAlpha = 1.0;
                                    ctx.restore();
                                }
                        // Draw walls (before rooms)
                        ctx.save();
                        ctx.strokeStyle = '#444';
                        ctx.lineWidth = 5;
                        (walls||[]).forEach(w => {
                            ctx.beginPath();
                            ctx.moveTo(w.x1, w.y1);
                            ctx.lineTo(w.x2, w.y2);
                            ctx.stroke();
                        });
                        ctx.lineWidth = 1;
                        ctx.restore();
                if (!ctx) return;
                ctx.save();
                ctx.setTransform(scale, 0, 0, scale, panX, panY);
                ctx.clearRect(-panX/scale, -panY/scale, mappingCanvas.width/scale, mappingCanvas.height/scale);
                // Draw grid (snap every 20px, bold every 100px)
                for (let x = 0; x < mappingCanvas.width/scale; x += 20) {
                    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, mappingCanvas.height/scale);
                    ctx.strokeStyle = (x%100===0)?'#bbb':'#eee'; ctx.stroke();
                }
                for (let y = 0; y < mappingCanvas.height/scale; y += 20) {
                    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(mappingCanvas.width/scale, y);
                    ctx.strokeStyle = (y%100===0)?'#bbb':'#eee'; ctx.stroke();
                }
                        // Validation: total mapped area
                        const allowedArea = Number(document.getElementById('squareFootage')?.value) || 0;
                        let totalArea = rooms.reduce((sum, r) => sum + (r.w*r.h/400), 0); // 20px=1ft, so 400px^2=1sqft
                        validationMsg = '';
                        if (allowedArea && totalArea > allowedArea) {
                            validationMsg = `Warning: Mapped area (${totalArea.toFixed(1)} sqft) exceeds allowed (${allowedArea} sqft)!`;
                        }
                        // Validation message
                        if (validationMsg) {
                            ctx.save();
                            ctx.setTransform(1,0,0,1,0,0);
                            ctx.fillStyle = '#b00';
                            ctx.font = 'bold 20px sans-serif';
                            ctx.fillText(validationMsg, 20, 40);
                            ctx.restore();
                        }
                // Draw rooms
                rooms.forEach(room => {
                    ctx.save();
                    ctx.fillStyle = room.color || '#cce6ff';
                    ctx.strokeStyle = '#333';
                    ctx.globalAlpha = 0.8;
                    ctx.fillRect(room.x, room.y, room.w, room.h);
                    ctx.globalAlpha = 1.0;
                    ctx.strokeRect(room.x, room.y, room.w, room.h);
                    ctx.fillStyle = '#222';
                    ctx.font = '16px sans-serif';
                    ctx.fillText(room.label, room.x+8, room.y+24);
                    ctx.restore();
                });
                // Draw devices
                devices.forEach(dev => {
                    ctx.save();
                    ctx.beginPath();
                    ctx.arc(dev.x, dev.y, 14, 0, 2*Math.PI);
                    ctx.fillStyle = dev.illum ? '#ff0' : '#888';
                    ctx.globalAlpha = 0.9;
                    ctx.fill();
                    ctx.globalAlpha = 1.0;
                    ctx.strokeStyle = '#333';
                    ctx.stroke();
                    ctx.fillStyle = '#222';
                    ctx.font = '12px sans-serif';
                    ctx.fillText(dev.label, dev.x-12, dev.y+28);
                    ctx.restore();
                });
                ctx.restore();


            if (mappingCanvas) {
                        // Wall drawing/erasing
                        document.getElementById('wall-draw-btn').onclick = () => { wallDrawing = true; wallErasing = false; };
                        document.getElementById('wall-erase-btn').onclick = () => { wallErasing = true; wallDrawing = false; };
                        mappingCanvas.addEventListener('click', e => {
                            const mx = (e.offsetX-panX)/scale, my = (e.offsetY-panY)/scale;
                            if (wallDrawing) {
                                if (!wallStart) {
                                    wallStart = {x:mx, y:my};
                                } else {
                                    walls.push({x1:wallStart.x, y1:wallStart.y, x2:mx, y2:my});
                                    wallStart = null;
                                    drawMappingCanvas();
                                }
                            } else if (wallErasing) {
                                // Remove nearest wall segment if within 10px
                                let idx = walls.findIndex(w => {
                                    const d = Math.abs((w.x2-w.x1)*(w.y1-my)-(w.x1-mx)*(w.y2-w.y1))/Math.hypot(w.x2-w.x1,w.y2-w.y1);
                                    return d < 10;
                                });
                                if (idx>=0) { walls.splice(idx,1); drawMappingCanvas(); }
                            }
                        });
                        mappingCanvas.addEventListener('dblclick', e => { wallStart = null; });
                        // Floor selector logic
                        const floorSelector = document.getElementById('floor-selector');
                        const addFloorBtn = document.getElementById('add-floor-btn');
                        const removeFloorBtn = document.getElementById('remove-floor-btn');
                        function switchFloor(idx) {
                            currentFloor = idx;
                            rooms = floors[idx].rooms;
                            devices = floors[idx].devices;
                            walls = floors[idx].walls;
                            drawMappingCanvas();
                        }
                        floorSelector.onchange = () => { switchFloor(Number(floorSelector.value)-1); };
                        addFloorBtn.onclick = () => {
                            floors.push({rooms:[], devices:[], walls:[]});
                            const opt = document.createElement('option');
                            opt.value = floors.length;
                            opt.textContent = floors.length;
                            floorSelector.appendChild(opt);
                            floorSelector.value = floors.length;
                            switchFloor(floors.length-1);
                        };
                        removeFloorBtn.onclick = () => {
                            if (floors.length>1) {
                                floors.splice(currentFloor,1);
                                floorSelector.removeChild(floorSelector.options[floorSelector.selectedIndex]);
                                switchFloor(Math.max(0,currentFloor-1));
                                floorSelector.value = currentFloor+1;
                            }
                        };
                    }
                drawMappingCanvas();
                // Zoom controls
                document.getElementById('zoom-in-btn').onclick = () => { scale *= 1.2; drawMappingCanvas(); };
                document.getElementById('zoom-out-btn').onclick = () => { scale /= 1.2; drawMappingCanvas(); };
                document.getElementById('reset-pan-btn').onclick = () => { scale = 1.0; panX = 0; panY = 0; drawMappingCanvas(); };
                // Pan/drag/selection logic
                mappingCanvas.addEventListener('mousedown', e => {
                    const mx = (e.offsetX-panX)/scale, my = (e.offsetY-panY)/scale;
                    // Check for device drag
                    for (let i=devices.length-1; i>=0; --i) {
                        const d = devices[i];
                        if (Math.hypot(mx-d.x, my-d.y) < 16) {
                            dragObj = {type:'device', idx:i, offsetX:mx-d.x, offsetY:my-d.y};
                            return;
                        }
                    }
                    // Check for room drag
                    for (let i=rooms.length-1; i>=0; --i) {
                        const r = rooms[i];
                        if (mx>=r.x && mx<=r.x+r.w && my>=r.y && my<=r.y+r.h) {
                            dragObj = {type:'room', idx:i, offsetX:mx-r.x, offsetY:my-r.y};
                            return;
                        }
                    }
                    // Otherwise, start panning
                    isPanning = true; lastPan = {x: e.offsetX, y: e.offsetY};
                });
                mappingCanvas.addEventListener('mousemove', e => {
                    if (isPanning) {
                        panX += e.offsetX - lastPan.x;
                        panY += e.offsetY - lastPan.y;
                        lastPan = {x: e.offsetX, y: e.offsetY};
                        drawMappingCanvas();
                    } else if (dragObj) {
                        const mx = (e.offsetX-panX)/scale, my = (e.offsetY-panY)/scale;
                        if (dragObj.type==='room') {
                            // Snap to grid (20px)
                            rooms[dragObj.idx].x = Math.round((mx-dragObj.offsetX)/20)*20;
                            rooms[dragObj.idx].y = Math.round((my-dragObj.offsetY)/20)*20;
                        } else if (dragObj.type==='device') {
                            // Snap to grid, but also check for wall snap
                            let nx = Math.round((mx-dragObj.offsetX)/20)*20;
                            let ny = Math.round((my-dragObj.offsetY)/20)*20;
                            // Snap to nearest room wall if close
                            let snapped = false;
                            for (const r of rooms) {
                                // Left/right wall
                                if (Math.abs(nx-r.x)<12 && ny>=r.y && ny<=r.y+r.h) { nx = r.x; snapped=true; }
                                if (Math.abs(nx-(r.x+r.w))<12 && ny>=r.y && ny<=r.y+r.h) { nx = r.x+r.w; snapped=true; }
                                // Top/bottom wall
                                if (Math.abs(ny-r.y)<12 && nx>=r.x && nx<=r.x+r.w) { ny = r.y; snapped=true; }
                                if (Math.abs(ny-(r.y+r.h))<12 && nx>=r.x && nx<=r.x+r.w) { ny = r.y+r.h; snapped=true; }
                            }
                            devices[dragObj.idx].x = nx;
                            devices[dragObj.idx].y = ny;
                        }
                        drawMappingCanvas();
                    }
                });
                mappingCanvas.addEventListener('mouseup', () => { isPanning = false; dragObj=null; });
                mappingCanvas.addEventListener('mouseleave', () => { isPanning = false; dragObj=null; });
            }

            // Room palette drag/drop
            document.querySelectorAll('.room-palette-btn').forEach(function(btn) {
                btn.addEventListener('click', function() {
                    // Add a new room at default position/size
                    const type = btn.dataset.room;
                    const colorMap = {bedroom:'#cce6ff',bathroom:'#e6ccff',kitchen:'#ffe6cc',living:'#ccffe6',dining:'#fffacc',closet:'#e6e6e6',pantry:'#f5e6cc',balcony:'#ccf5ff',service:'#ffd6cc'};
                    rooms.push({
                        x: 100+Math.random()*200,
                        y: 100+Math.random()*200,
                        w: 120,
                        h: 90,
                        label: type.charAt(0).toUpperCase()+type.slice(1),
                        color: colorMap[type]||'#cce6ff',
                        type: type
                    });
                    drawMappingCanvas();
                });
            });

            // Device palette drag/drop
            document.querySelectorAll('.device-palette-btn').forEach(function(btn) {
                btn.addEventListener('click', function() {
                    // Add a new device at default position
                    const type = btn.dataset.device;
                    devices.push({
                        x: 200+Math.random()*200,
                        y: 200+Math.random()*200,
                        label: type.charAt(0).toUpperCase()+type.slice(1),
                        illum: true,
                        type: type
                    });
                    drawMappingCanvas();
                });
            });


        // Feature notification flags
        const newFeatures = [
            { name: 'Advanced Mapping', tier: 'pro', description: 'Edit and manage advanced maps.' },
            { name: 'Remote Agent Access', tier: 'elite', description: 'Control your home remotely.' },
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

        // --- Mapping Editor Panel Logic ---
        fetch('/mapping-info').then(async resp => {
            if (!resp.ok) {
                // Account frozen or unauthorized
                const panel = document.getElementById('mapping-editor-panel');
                if (panel) {
                    panel.innerHTML = '<h2>Mapping Editor</h2><div style="color:#b00;font-weight:bold;">Account is frozen or unauthorized. Contact admin/support to restore access.</div>';
                }
                return;
            }
            const mappingInfo = await resp.json();
            document.getElementById('squareFootage').value = mappingInfo.square_footage;
            document.getElementById('commercialSquareFootage').value = mappingInfo.commercial_square_footage;
            document.getElementById('siteAddress').value = mappingInfo.site_address;
            document.getElementById('siteCity').value = mappingInfo.site_city;
            document.getElementById('siteState').value = mappingInfo.site_state;
            document.getElementById('siteZip').value = mappingInfo.site_zip;

            // Role-based edit/create logic
            const userRole = window.dashboardUserRole || 'user_admin';
            if (userRole === 'system_admin') {
                ['squareFootage','commercialSquareFootage','siteAddress','siteCity','siteState','siteZip'].forEach(id => {
                    document.getElementById(id).removeAttribute('readonly');
                });
                // Add save button
                const btn = document.createElement('button');
                btn.textContent = mappingInfo.site_address ? 'Save Mapping Info' : 'Create Site';
                btn.onclick = async function() {
                    const payload = {
                        square_footage: Number(document.getElementById('squareFootage').value),
                        commercial_square_footage: Number(document.getElementById('commercialSquareFootage').value),
                        site_address: document.getElementById('siteAddress').value,
                        site_city: document.getElementById('siteCity').value,
                        site_state: document.getElementById('siteState').value,
                        site_zip: document.getElementById('siteZip').value,
                        allowed_ips: mappingInfo.allowed_ips || []
                    };
                    const endpoint = mappingInfo.site_address ? '/admin/edit-site' : '/admin/create-site';
                    const res = await fetch(endpoint, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload)
                    });
                    const result = await res.json();
                    alert(result.message || 'Site info updated.');
                };
                document.getElementById('adminEditBtnContainer').appendChild(btn);
            }
        }).catch(() => {
            const panel = document.getElementById('mapping-editor-panel');
            if (panel) {
                panel.innerHTML = '<h2>Mapping Editor</h2><div style="color:#b00;font-weight:bold;">Unable to load mapping info. Please try again later.</div>';
            }
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
    // Disability Enhancements tab
    const disabilityTab = document.createElement('div');
    disabilityTab.className = 'dashboard-tab disability-tab';
    disabilityTab.textContent = 'Disability Enhancements';
    tabsDiv.appendChild(disabilityTab);

    // Panel rendering
    const panel = document.getElementById('dashboard-panel');
    function renderPanel(idx) {
        const feature = dashboard.features[idx];
        panel.innerHTML = '';
        function renderPanel(idx) {
            // If last tab, show Disability Enhancements
            if (typeof idx === 'undefined' || idx === 'disability') {
                renderDisabilityPanel();
                return;
            }
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
            // ...existing code...
        }

        // Tab click handlers
        tabsDiv.querySelectorAll('.dashboard-tab').forEach((tab, idx) => {
            tab.onclick = () => {
                tabsDiv.querySelectorAll('.dashboard-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                if (tab.classList.contains('disability-tab')) {
                    renderPanel('disability');
                } else {
                    renderPanel(idx);
                }
            };
        });
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

