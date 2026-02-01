document.addEventListener('DOMContentLoaded', function() {

// Contract structure for dashboard features
class FeatureContract {
    constructor(name, tier, enabled, controls = []) {
        this.name = name;
        this.tier = tier;
        this.enabled = enabled;
        this.controls = controls;
    }
}

class DashboardContract {
    constructor(user_tier, features = []) {
        this.user_tier = user_tier;
        this.features = features;
    }
}

(async function() {
    // Fetch dashboard contract from backend
    let dashboard;
    try {
        const res = await fetch('/dashboard-data');
        const data = await res.json();
        dashboard = new DashboardContract(
            data.user_tier,
            data.features.map(f => new FeatureContract(f.name, f.tier, f.enabled, f.controls || []))
        );
    } catch (e) {
        // Fallback to default contract if backend is unavailable
        dashboard = new DashboardContract('basic', [
            new FeatureContract('AI Controls & Settings', 'basic', true),
            new FeatureContract('Audio/Video Controls & Settings', 'basic', true),
            new FeatureContract('Monitoring Controls & Settings', 'basic', true),
            new FeatureContract('Mapping Controls & Settings', 'basic', true),
            new FeatureContract('Map Editor', 'basic', true)
        ]);
    }

    // Sidebar feature toggles
    const featureList = document.getElementById('feature-list');
    dashboard.features.forEach((feature, idx) => {
        const li = document.createElement('li');
        li.innerHTML = `<label><input type="checkbox" ${feature.enabled ? 'checked' : ''} data-idx="${idx}"> ${feature.name}</label>`;
        featureList.appendChild(li);
    });

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
            panel.innerHTML = `<div class="panel-header"><h2>${feature.name}</h2></div><p>This feature is locked. Upgrade your subscription to access.</p>`;
            return;
        }
        panel.innerHTML = `<div class="panel-header"><h2>${feature.name}</h2><button class="panel-toggle ${feature.enabled ? '' : 'off'}" data-idx="${idx}">${feature.enabled ? 'On' : 'Off'}</button></div>`;
        if (feature.enabled) {
            panel.innerHTML += `<div>Outputs and controls for ${feature.name} will appear here.</div>`;
        } else {
            panel.innerHTML += `<div>This panel is off. Turn it on to see outputs.</div>`;
        }
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

