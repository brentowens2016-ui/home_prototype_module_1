// Membership tiers (sync with store.js)
const membershipTiers = [
  { name: 'Basic', price: '$5/mo', available: true },
  { name: 'Pro', price: '$15/mo', available: true },
  { name: 'Elite', price: '$30/mo', available: false }
];

function populateTierSelect() {
  const tierSelect = document.getElementById('tier');
  membershipTiers.forEach(tier => {
    const option = document.createElement('option');
    option.value = tier.name;
    option.textContent = `${tier.name} (${tier.price})${tier.available ? '' : ' - Coming Soon'}`;
    option.disabled = !tier.available;
    tierSelect.appendChild(option);
  });
}

document.addEventListener('DOMContentLoaded', populateTierSelect);

// Simulate signup and redirect to store for payment
const signupForm = document.getElementById('signup-form');
signupForm.onsubmit = function(e) {
  e.preventDefault();
  // Collect form data
  const name = signupForm.name.value;
  const email = signupForm.email.value;
  const password = signupForm.password.value;
  const tier = signupForm.tier.value;
  // Simulate signup success
  document.getElementById('signup-success').style.display = 'block';
  document.getElementById('signup-success').textContent = `Signup successful! Redirecting to checkout for ${tier}...`;
  setTimeout(() => {
    // Redirect to store page, passing selected tier
    window.location.href = `store.html?tier=${encodeURIComponent(tier)}`;
  }, 1500);
};
