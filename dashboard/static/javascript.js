  // --- Password Reset Request Handler ---
  const resetRequestForm = document.getElementById('reset-request-form');
  const resetForm = document.getElementById('reset-form');
  if (resetRequestForm && resetForm) {
    resetRequestForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      const email = resetRequestForm.email.value;
      const res = await fetch('/users/request_reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (res.ok) {
        alert('Reset token sent to your email (stub). Enter it below to set a new password.');
        resetForm.style.display = '';
      } else {
        alert('Reset request failed: ' + (data.error || 'Unknown error'));
      }
    });
    resetForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      const email = resetRequestForm.email.value;
      const token = resetForm.token.value;
      const new_password = resetForm.new_password.value;
      const res = await fetch('/users/reset_password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, token, new_password })
      });
      const data = await res.json();
      if (res.ok) {
        alert('Password reset successful! You may now log in.');
        window.location.href = 'login.html';
      } else {
        alert('Password reset failed: ' + (data.error || 'Unknown error'));
      }
    });
  }
// JavaScript for static LifeLink Home pages
document.addEventListener('DOMContentLoaded', function() {
  // --- Signup Form Handler ---
  const signupForm = document.getElementById('signup-form');
  if (signupForm) {
    signupForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      const email = signupForm.email.value;
      const password = signupForm.password.value;
      const fullname = signupForm.fullname.value;
      const payload = { username: email, password, fullname };
      const res = await fetch('/users/signup_strong', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok) {
        alert('Signup successful! Please log in.');
        window.location.href = 'login.html';
      } else {
        alert('Signup failed: ' + (data.error || 'Unknown error'));
      }
    });
  }

  // --- Login Form Handler ---
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      const email = loginForm.email.value;
      const password = loginForm.password.value;
      const payload = { username: email, password };
      const res = await fetch('/users/login_strong', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok && data.status === 'ok') {
        alert('Login successful!');
        window.location.href = '/dashboard';
      } else if (data.status === '2fa_required') {
        const code = prompt('Enter 2FA code sent to your email or phone:');
        if (code) {
          const verifyRes = await fetch('/users/verify-2fa', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: email, code })
          });
          const verifyData = await verifyRes.json();
          if (verifyRes.ok && verifyData.status === 'ok') {
            alert('2FA verified!');
            window.location.href = '/dashboard';
          } else {
            alert('2FA verification failed: ' + (verifyData.error || 'Unknown error'));
          }
        }
      } else {
        alert('Login failed: ' + (data.error || 'Unknown error'));
      }
    });
  }

  // --- Tier Selection Handler ---
  const tierButtons = document.querySelectorAll('.tier button');
  if (tierButtons.length) {
    tierButtons.forEach(btn => {
      btn.addEventListener('click', async function() {
        document.querySelectorAll('.tier').forEach(t => t.classList.remove('selected'));
        btn.parentElement.classList.add('selected');
        const selectedTier = btn.parentElement.querySelector('h2').textContent;
        localStorage.setItem('selected_tier', selectedTier);
        // If user is logged in, update tier in backend
        const username = localStorage.getItem('username');
        if (username) {
          const res = await fetch('/users/update_tier', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-Role': 'user', 'X-Username': username },
            body: JSON.stringify({ username, subscription_tier: selectedTier })
          });
          const data = await res.json();
          if (res.ok) {
            alert('Subscription tier updated!');
          } else {
            alert('Tier update failed: ' + (data.error || 'Unknown error'));
          }
        }
      });
    });
  }

  // --- Payment Form Handler ---
  const paymentForm = document.getElementById('payment-form');
  if (paymentForm) {
    paymentForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      // Payment integration would go here (stub)
      alert('Payment submitted! (stub)');
      window.location.href = '/dashboard';
    });
  }

  // --- Store username on login/signup for later use ---
  function storeUsername(email) {
    if (email) localStorage.setItem('username', email);
  }
  if (signupForm) {
    signupForm.addEventListener('submit', function(e) {
      const email = signupForm.email.value;
      storeUsername(email);
    });
  }
  if (loginForm) {
    loginForm.addEventListener('submit', function(e) {
      const email = loginForm.email.value;
      storeUsername(email);
    });
  }
});
