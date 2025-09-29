// Minimal Firebase authentication for login page
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, connectAuthEmulator } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyA5vLyX5Zq_YTBj0coqUN6RTFxGUr_KHWw",
    authDomain: "ai-payroll-dashboard.firebaseapp.com",
    projectId: "ai-payroll-dashboard",
    storageBucket: "ai-payroll-dashboard.firebasestorage.app",
    messagingSenderId: "446937180242",
    appId: "1:446937180242:web:7beb8c5ccf1e5a8045178b"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Connect to emulator if running locally
if (window.location.hostname === "127.0.0.1" || window.location.hostname === "localhost") {
    console.log("🔧 Connecting to Auth emulator");
    connectAuthEmulator(auth, "http://127.0.0.1:9099");
}

// Login form handler
document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    try {
        await signInWithEmailAndPassword(auth, email, password);
        // Redirect to dashboard on successful login
        window.location.href = '/clean-firebase-dashboard.html';
    } catch (error) {
        console.error('Login error:', error);
        alert('Login failed: ' + error.message);
    }
});

// Show/hide register form (disabled)
document.getElementById('show-register').addEventListener('click', (e) => {
    e.preventDefault();
    alert('User registration is restricted. Please contact your administrator.');
});

document.getElementById('show-login').addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('login-container').style.display = 'block';
    document.getElementById('register-container').style.display = 'none';
});
