import { firebaseConfig } from './firebase-config.js';

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// --- CONFIGURATION ---
// IMPORTANT: Double-check this is the correct Admin UID from your Firebase project.
const ADMIN_UID = "pNJ0eOvD5BehD0eLrbWOM4czKR62"; // <-- SET THIS VALUE

// --- FORM ELEMENTS ---
const form = document.getElementById('loginForm');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const firebaseError = document.getElementById('firebase-error');

form.addEventListener('submit', e => {
    e.preventDefault();
    if (!validateLoginInputs()) return;

    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();
    firebaseError.innerText = '';

    let userEmail = '';

    db.collection('users').where('username', '==', username).get()
        .then(querySnapshot => {
            if (querySnapshot.empty) {
                throw new Error("Invalid credentials");
            }
            querySnapshot.forEach(doc => {
                userEmail = doc.data().email;
            });
            return auth.signInWithEmailAndPassword(userEmail, password);
        })
        .then(userCredential => {
            form.reset();

            if (userCredential.user.uid === ADMIN_UID) {
                window.location.href = 'admin.html';
            } else {
                window.location.href = 'school-registration.html';
            }
        })
        .catch(error => {
            console.error('Login error:', error);
            firebaseError.innerText = "Invalid username or password.";
        });
});

// --- Helper and Validation Functions (Client-side checks) ---

const setError = (element, message) => {
    const inputGroup = element.parentElement;
    const errorDisplay = inputGroup.querySelector('.error');
    if (errorDisplay) {
        errorDisplay.innerText = message;
        inputGroup.classList.add('error');
    }
};

const setSuccess = (element) => {
    const inputGroup = element.parentElement;
    const errorDisplay = inputGroup.querySelector('.error');
    if (errorDisplay) {
        errorDisplay.innerText = '';
        inputGroup.classList.remove('error');
    }
};

const validateLoginInputs = () => {
    const usernameValue = usernameInput.value.trim();
    const passwordValue = passwordInput.value.trim();
    let isValid = true;

    if (usernameValue === '') {
        setError(usernameInput, 'Username is required');
        isValid = false;
    } else {
        setSuccess(usernameInput);
    }

    if (passwordValue === '') {
        setError(passwordInput, 'Password is required');
        isValid = false;
    } else {
        setSuccess(passwordInput);
    }

    return isValid;
};