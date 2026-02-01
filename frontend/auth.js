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
