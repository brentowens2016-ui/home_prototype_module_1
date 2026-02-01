// Emergency Services Tab Logic
// Global Speech-to-Text Integration for Emergency Inputs
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
document.querySelectorAll('#emergency-form input[type="text"]').forEach(addSpeechToTextButton);
const form = document.getElementById('emergency-form');
const panicBtn = document.getElementById('panic-btn');

panicBtn.onclick = function() {
    const primary = form['primary-contact'].value;
    const alt = form['alt-contact'].value;
    // Emergency contacts
    const emergencyContacts = window.emergencyContacts || [];
    // Trigger backend escalation (simulate call to emergency services)
    fetch('/emergency/escalate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ primary, alt, contacts: emergencyContacts })
    }).then(() => {
        alert('Emergency escalation triggered!');
    });
};

form.onchange = function() {
    // Save updated emergency contacts to backend
    const primary = form['primary-contact'].value;
    const alt = form['alt-contact'].value;
    const emergencyContacts = window.emergencyContacts || [];
    fetch('/emergency/update-contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ primary, alt, contacts: emergencyContacts })
    });
};

// Emergency Contacts UI logic
const contactsListDiv = document.getElementById('emergency-contacts-list');
const addContactBtn = document.getElementById('add-emergency-contact-btn');
let emergencyContacts = window.emergencyContacts || [];
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
contactsListDiv.addEventListener('click', function(e) {
    if (e.target.classList.contains('remove-contact-btn')) {
        const idx = e.target.getAttribute('data-idx');
        emergencyContacts.splice(idx, 1);
        window.emergencyContacts = emergencyContacts;
        renderContacts();
    }
});
};
