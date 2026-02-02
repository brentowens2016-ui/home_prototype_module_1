// Voice Recognition Frontend Module
// Handles voice input and sends recognized commands to backend for AI routines

export function startVoiceRecognition(onResult) {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
        alert('Voice recognition not supported in this browser.');
        return;
    }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onresult = function(event) {
        const transcript = event.results[0][0].transcript;
        if (onResult) onResult(transcript);
    };
    recognition.onerror = function(event) {
        alert('Voice recognition error: ' + event.error);
    };
    recognition.start();
}

export function sendVoiceCommandToAI(command) {
    return fetch('/api/ai/voice-command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command })
    }).then(resp => resp.json());
}
