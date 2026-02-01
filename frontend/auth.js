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
