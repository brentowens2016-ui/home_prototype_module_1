// Membership tier definitions and features
const membershipTiers = [
  {
    name: 'Basic',
    price: '$5/mo',
    features: [
      'Access to dashboard',
      'Basic device control',
      'AI health diagnostics (view only)',
      'Bluetooth device discovery',
      'Standard support',
    ],
    paypalId: 'PAYPAL_BASIC', // Placeholder
    available: true
  },
  {
    name: 'Pro',
    price: '$15/mo',
    features: [
      'All Basic features',
      'Advanced device control',
      'AI health diagnostics (full)',
      'Home Assistant integration',
      'Custom dashboard panels',
      'Priority support',
    ],
    paypalId: 'PAYPAL_PRO', // Placeholder
    available: true
  },
  {
    name: 'Elite',
    price: '$30/mo',
    features: [
      'All Pro features',
      'Remote agent access',
      'Tiered AI roles',
      'Advanced mapping & editor',
      'Early access to new features',
      'Dedicated support',
      'Advanced device control (Elite tier only): Unlimited device management, custom automations, audit trail, external integrations, advanced AI routines'
    ],
    paypalId: 'PAYPAL_ELITE', // Placeholder
    available: false // Coming soon
  }
];

function renderTiers() {
  const tiersList = document.getElementById('tiers-list');
  tiersList.innerHTML = '';
  membershipTiers.forEach(tier => {
    const card = document.createElement('div');
    card.className = 'tier-card';
    card.innerHTML = `
      <div class="tier-title">${tier.name}</div>
      <div class="tier-price">${tier.price}</div>
      <ul class="tier-features">
        ${tier.features.map(f => `<li>${f}</li>`).join('')}
      </ul>
      ${tier.available ? `<button class="buy-btn" data-tier="${tier.name}" data-paypal="${tier.paypalId}">Buy with PayPal</button>` : `<div class="coming-soon">Coming Soon</div>`}
    `;
    tiersList.appendChild(card);
  });

  // Payment button click handler
  document.querySelectorAll('.buy-btn').forEach(btn => {
    btn.onclick = function() {
      const tier = btn.getAttribute('data-tier');
      const paypalId = btn.getAttribute('data-paypal');
      // Placeholder: Integrate PayPal button code here
      alert(`Proceeding to PayPal for ${tier} (ID: ${paypalId})...`);
      // You will import PayPal button code here later
        // Simulate payment verification and redirect
        setTimeout(() => {
          // In real integration, redirect after PayPal payment success
          window.location.href = 'download.html';
        }, 1500);
    };
  });
}

document.addEventListener('DOMContentLoaded', renderTiers);
