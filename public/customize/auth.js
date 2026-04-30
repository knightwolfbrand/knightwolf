// Knight Wolf - Firebase Authentication Logic
// To use this, create a Firebase project at console.firebase.google.com 
// and paste your configuration below.

const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Initialize Firebase (Compatibility Mode)
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

// UI Elements
const authModal = document.querySelector('.auth-modal');
const closeAuthBtn = document.querySelector('.close-auth');
const authTabBtns = document.querySelectorAll('.auth-tab-btn');
const authContents = document.querySelectorAll('.auth-content');
const sendOtpBtn = document.getElementById('send-otp-btn');
const verifyOtpBtn = document.getElementById('verify-otp-btn');
const otpSection = document.querySelector('.otp-verification');
const emailSigninBtn = document.getElementById('email-signin-btn');

let confirmationResult = null;

// Toggle Tabs
authTabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const method = btn.dataset.authMethod;
        authTabBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        authContents.forEach(content => {
            content.style.display = content.id === `${method}-auth` ? 'block' : 'none';
        });
    });
});

// Phone Authentication (OTP)
auth.useDeviceLanguage();
window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container', {
    'size': 'invisible'
});

sendOtpBtn?.addEventListener('click', async () => {
    const phoneNumber = document.getElementById('phone-number').value;
    if (!phoneNumber) return alert('Enter a valid phone number with country code (e.g., +91...)');

    try {
        sendOtpBtn.innerText = 'Sending...';
        confirmationResult = await auth.signInWithPhoneNumber(phoneNumber, window.recaptchaVerifier);
        sendOtpBtn.style.display = 'none';
        otpSection.style.display = 'block';
        console.log('OTP Sent');
    } catch (error) {
        console.error('OTP Error:', error);
        alert(error.message);
        sendOtpBtn.innerText = 'Send Access Code';
    }
});

verifyOtpBtn?.addEventListener('click', async () => {
    const code = document.getElementById('otp-code').value;
    if (code.length !== 6) return alert('Enter 6-digit code');

    try {
        verifyOtpBtn.innerText = 'Verifying...';
        const result = await confirmationResult.confirm(code);
        const user = result.user;
        console.log('User logged in via Phone:', user.uid);
        closeAuthModal();
        window.location.reload(); // Refresh to update UI state
    } catch (error) {
        console.error('Verification Error:', error);
        alert('Invalid code. Please try again.');
        verifyOtpBtn.innerText = 'Verify & Enter';
    }
});

// Email/Password Authentication
emailSigninBtn?.addEventListener('click', async () => {
    const email = document.getElementById('auth-email').value;
    const password = document.getElementById('auth-password').value;

    try {
        emailSigninBtn.innerText = 'Signing In...';
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        console.log('User logged in via Email:', userCredential.user.uid);
        closeAuthModal();
        window.location.reload();
    } catch (error) {
        console.error('Email login error:', error);
        // If user not found, try creating account (simplified flow)
        if (error.code === 'auth/user-not-found') {
            if (confirm('Account not found. Join the pack now?')) {
                await auth.createUserWithEmailAndPassword(email, password);
                window.location.reload();
            }
        } else {
            alert(error.message);
        }
        emailSigninBtn.innerText = 'Sign In';
    }
});

const closeAuthModal = () => {
    authModal.style.display = 'none';
};

closeAuthBtn?.addEventListener('click', closeAuthModal);

// Auth State Observer
auth.onAuthStateChanged((user) => {
    if (user) {
        console.log("Active User:", user.email || user.phoneNumber);
        document.body.classList.add('is-logged-in');
        window.CURRENT_ALPHA_ID = user.uid;
    } else {
        document.body.classList.remove('is-logged-in');
        window.CURRENT_ALPHA_ID = null;
    }

    // Dispatch custom event for script.js to listen to
    const event = new CustomEvent('authStateChanged', { detail: { user } });
    document.dispatchEvent(event);
});
