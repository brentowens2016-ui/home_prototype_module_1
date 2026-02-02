document.addEventListener('DOMContentLoaded', function() {
    const loginTab = document.getElementById('login-tab');
    const signupTab = document.getElementById('signup-tab');
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');

    loginTab.addEventListener('click', function() {
        loginForm.style.display = '';
        signupForm.style.display = 'none';
    });
    signupTab.addEventListener('click', function() {
        loginForm.style.display = 'none';
        signupForm.style.display = '';
    });

    // Two-Factor Temp Password UI Logic
    const tempBtn = document.getElementById('temp-password-btn');
    const tempModal = document.getElementById('temp-password-modal');
    const closeTempModal = document.getElementById('close-temp-modal');
    const sendTempRequest = document.getElementById('send-temp-request');
    const verifySmsBtn = document.getElementById('verify-sms');
    const getTempPasswordBtn = document.getElementById('get-temp-password');
    const tempStep1 = document.getElementById('temp-step1');
    const tempStep2 = document.getElementById('temp-step2');
    const tempStep3 = document.getElementById('temp-step3');
    const smsCodeInput = document.getElementById('sms-code');
    const emailInstructions = document.getElementById('email-instructions');
    const tempPasswordResult = document.getElementById('temp-password-result');

    let tempUserId = '';
    let tempEmail = '';
    let tempPhone = '';
    let smsVerified = false;
    let emailVerified = false;

    if (tempBtn) tempBtn.onclick = () => { tempModal.style.display = 'block'; };
    if (closeTempModal) closeTempModal.onclick = () => {
        tempModal.style.display = 'none';
        tempStep1.style.display = '';
        tempStep2.style.display = 'none';
        tempStep3.style.display = 'none';
        smsCodeInput.value = '';
        emailInstructions.textContent = '';
        tempPasswordResult.textContent = '';
    };
    if (sendTempRequest) sendTempRequest.onclick = async () => {
        tempUserId = document.getElementById('temp-user-id').value.trim();
        tempEmail = document.getElementById('temp-email').value.trim();
        tempPhone = document.getElementById('temp-phone').value.trim();
        if (!tempUserId || !tempEmail || !tempPhone) return alert('All fields required.');
        const res = await fetch('/auth/request-temp-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: tempUserId, email: tempEmail, phone: tempPhone })
        });
        const data = await res.json();
        if (data.status === 'pending') {
            tempStep1.style.display = 'none';
            tempStep2.style.display = '';
            emailInstructions.textContent = 'Check your email for a verification link. (Simulated: Click the link in the backend log)';
        } else {
            alert(data.error || 'Failed to send verification codes.');
        }
    };
    if (verifySmsBtn) verifySmsBtn.onclick = async () => {
        const code = smsCodeInput.value.trim();
        if (!code) return alert('Enter the SMS code.');
        const res = await fetch('/auth/verify-sms', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: tempUserId, code })
        });
        const data = await res.json();
        if (data.status === 'ok') {
            smsVerified = true;
            alert('SMS verified. Now verify your email (see instructions above).');
            // Optionally, poll backend for email verification status
            tempStep2.style.display = 'none';
            tempStep3.style.display = '';
        } else {
            alert(data.error || 'SMS verification failed.');
        }
    };
    if (getTempPasswordBtn) getTempPasswordBtn.onclick = async () => {
        const res = await fetch('/auth/issue-temp-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: tempUserId })
        });
        const data = await res.json();
        if (data.status === 'ok') {
            tempPasswordResult.textContent = 'Your temporary password: ' + data.temp_password;
        } else {
            tempPasswordResult.textContent = data.error || 'Unable to issue temp password.';
        }
    };

    // Auto-issue temp password if support is unavailable
    const autoTempBtn = document.getElementById('auto-temp-password-btn');
    if (autoTempBtn) autoTempBtn.onclick = async () => {
        if (!tempUserId || !tempEmail) {
            tempPasswordResult.textContent = 'Please enter your username and registered email above.';
            return;
        }
        autoTempBtn.disabled = true;
        autoTempBtn.textContent = 'Requesting...';
        try {
            const response = await fetch('/auth/auto-issue-temp-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id: tempUserId, email: tempEmail })
            });
            const data = await response.json();
            if (data.status === 'ok') {
                tempPasswordResult.textContent = 'A temporary password has been sent to your registered email.';
            } else {
                tempPasswordResult.textContent = data.error || 'Could not auto-issue temporary password.';
            }
        } catch (err) {
            tempPasswordResult.textContent = 'Network error. Please try again later.';
        }
        autoTempBtn.disabled = false;
        autoTempBtn.textContent = 'Auto-Issue Temp Password';
    };
});
    // Global Speech-to-Text Integration for Auth Inputs
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
    document.querySelectorAll('input[type="email"], input[type="password"]').forEach(addSpeechToTextButton);
