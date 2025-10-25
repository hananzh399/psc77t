import { firebaseConfig } from './firebase-config.js';

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// Form Elements
const form = document.getElementById('registerForm');
const usernameInput = document.getElementById('username');
const emailInput = document.getElementById('email');
const phoneInput = document.getElementById('phone');
const passwordInput = document.getElementById('password');
const firebaseError = document.getElementById('firebase-error');
const submitButton = form.querySelector('button');

// --- EVENT LISTENER ---
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    firebaseError.innerText = '';
    submitButton.disabled = true;

    // --- CHECK IF REGISTRATION IS BLOCKED ---
    try {
        const regSettingsDoc = await db.collection('settings').doc('registration').get();
        if (regSettingsDoc.exists && regSettingsDoc.data().isBlocked === true) {
            firebaseError.innerText = 'New user registration is currently disabled. Please try again later.';
            submitButton.disabled = false;
            return; // Halt submission
        }
    } catch (error) {
        console.error("Could not check registration status:", error);
        // Fail open: If we can't check, we allow registration to not lock users out.
    }
    // --- END OF CHECK ---

    const isFormValid = await validateAllInputs();

    if (isFormValid) {
        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();
        const username = usernameInput.value.trim();
        const phone = phoneInput.value.trim();

        auth.createUserWithEmailAndPassword(email, password)
            .then(userCredential => {
                const user = userCredential.user;
                return db.collection('users').doc(user.uid).set({
                    username: username,
                    email: email,
                    phone: phone
                });
            })
            .then(() => {
                alert('Registration successful! Please login.');
                form.reset();
                window.location.href = 'login.html';
            })
            .catch(error => {
                console.error('Firebase registration error:', error);
                firebaseError.innerText = error.message;
            })
            .finally(() => {
                submitButton.disabled = false;
            });
    } else {
        console.log("Validation failed. Form submission stopped.");
        submitButton.disabled = false;
    }
});

// --- HELPER FUNCTIONS to show error/success in the UI ---
const setError = (element, message) => {
    const inputGroup = element.parentElement;
    const errorDisplay = inputGroup.querySelector('.error');
    errorDisplay.innerText = message;
    inputGroup.classList.add('error');
    inputGroup.classList.remove('success');
};

const setSuccess = (element) => {
    const inputGroup = element.parentElement;
    const errorDisplay = inputGroup.querySelector('.error');
    errorDisplay.innerText = '';
    inputGroup.classList.add('success');
    inputGroup.classList.remove('error');
};

// --- VALIDATION FUNCTIONS ---
const validateAllInputs = async () => {
    let isUsernameValid = await validateUsername();
    let isEmailValid = validateEmail();
    let isPhoneValid = validatePhone();
    let isPasswordValid = validatePassword();
    return isUsernameValid && isEmailValid && isPhoneValid && isPasswordValid;
};

const validateUsername = async () => {
    const usernameValue = usernameInput.value.trim();
    if (usernameValue === '') {
        setError(usernameInput, 'Username is required');
        return false;
    }
    const userQuery = db.collection('users').where('username', '==', usernameValue);
    const querySnapshot = await userQuery.get();
    if (!querySnapshot.empty) {
        setError(usernameInput, 'This username is already taken.');
        return false;
    } else {
        setSuccess(usernameInput);
        return true;
    }
};

const validateEmail = () => {
    const emailValue = emailInput.value.trim();
    if (emailValue === '') {
        setError(emailInput, 'Email is required');
        return false;
    }
    const emailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (!emailRegex.test(String(emailValue).toLowerCase())) {
        setError(emailInput, 'Please enter a valid email address');
        return false;
    } else {
        setSuccess(emailInput);
        return true;
    }
};

const validatePhone = () => {
    const phoneValue = phoneInput.value.trim();
    if (phoneValue === '') {
        setError(phoneInput, 'Phone number is required');
        return false;
    }
    const phoneRegex = /^\d{10,11}$/;
    if (!phoneRegex.test(phoneValue)) {
        setError(phoneInput, 'Phone number must be 10 or 11 digits');
        return false;
    } else {
        setSuccess(phoneInput);
        return true;
    }
};

const validatePassword = () => {
    const passwordValue = passwordInput.value.trim();
    if (passwordValue === '') {
        setError(passwordInput, 'Password is required');
        return false;
    }
    if (passwordValue.length < 4) {
        setError(passwordInput, 'Password must be at least 4 characters long');
        return false;
    } else {
        setSuccess(passwordInput);
        return true;
    }
};

//--Footer Start--//

document.addEventListener('DOMContentLoaded', function() {

    // --- Smooth Scroll to Top on Button Click ---
    const backToTopBtn = document.querySelector('.back-to-top-button-rg');

    backToTopBtn.addEventListener('click', function(e) {
        e.preventDefault();
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    // --- Phone Link Click Handler ---
    const phoneLinks = document.querySelectorAll('.phone-link');

    const handlePhoneClick = (e) => {
        const isMobile = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

        if (!isMobile) {
            e.preventDefault();
            const href = e.currentTarget.getAttribute('href');
            if (href.startsWith('mailto:')) {
                 window.location.href = href;
                 return;
            }
            alert('Your device does not support making phone calls directly from the browser.');
        }
    };

    phoneLinks.forEach(link => {
        link.addEventListener('click', handlePhoneClick);
    });

});