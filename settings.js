import { firebaseConfig } from './firebase-config.js';

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// --- CONFIGURATION ---
const ADMIN_UID = "pNJ0eOvD5BehD0eLrbWOM4czKR62";

// --- UI ELEMENTS ---
const loader = document.getElementById('loader');
const adminContent = document.getElementById('admin-content');
const signOutBtn = document.getElementById('signOutBtn');
const registrationStatusBtn = document.getElementById('registrationStatusBtn');
const testDatesContainer = document.getElementById('test-dates-container');

let isRegistrationBlocked = false;
const registrationSettingsRef = db.collection('settings').doc('registration');
const testDatesRef = db.collection('testDates');

const CLASSES_LIST = [
    "Montessori", "Nursery", "Prep", "One (1)", "Two (2)", "Three (3)", "Four (4)",
    "Five (5)", "Six (6)", "Seven (7)", "Eight (8)", "Nine (9)", "Ten (10)",
    "First Year (11)", "2nd Year (12)"
];

// --- FUNCTIONS ---

/**
 * Updates the UI of the registration status button.
 */
const updateStatusButtonUI = () => {
    registrationStatusBtn.textContent = `Registration is ${isRegistrationBlocked ? 'BLOCKED' : 'OPEN'}`;
    registrationStatusBtn.className = isRegistrationBlocked ? 'blocked' : 'open';
};

/**
 * Fetches the current registration status from Firestore.
 */
const fetchRegistrationStatus = async () => {
    try {
        const doc = await registrationSettingsRef.get();
        isRegistrationBlocked = doc.exists ? doc.data().isBlocked : false;
        if (!doc.exists) await registrationSettingsRef.set({ isBlocked: false });
        updateStatusButtonUI();
    } catch (error) {
        console.error("Error fetching registration status:", error);
        registrationStatusBtn.textContent = 'Error Loading Status';
        registrationStatusBtn.disabled = true;
    }
};

/**
 * Renders the input fields for setting test dates.
 */
const renderTestDateInputs = async () => {
    testDatesContainer.innerHTML = '<h4>Loading test dates...</h4>';
    try {
        const snapshot = await testDatesRef.get();
        const dates = {};
        snapshot.forEach(doc => {
            dates[doc.id] = doc.data().testDate;
        });

        let html = '';
        CLASSES_LIST.forEach(className => {
            const savedDate = dates[className] || '';
            html += `
                <div class="stat-card">
                    <div class="info">
                        <p style="margin-bottom: 10px;"><strong>${className}</strong></p>
                        <input type="date" value="${savedDate}" data-class="${className}" style="width: 100%; padding: 8px;">
                        <button class="action-button view" data-class-save="${className}" style="width: 100%; margin-top: 10px;">Save Date</button>
                    </div>
                </div>
            `;
        });
        testDatesContainer.innerHTML = html;
    } catch (error) {
        console.error("Error rendering test date inputs:", error);
        testDatesContainer.innerHTML = '<h4>Could not load test date settings.</h4>';
    }
};


// --- EVENT LISTENERS ---
signOutBtn.addEventListener('click', () => auth.signOut().then(() => { window.location.href = 'login.html'; }));

registrationStatusBtn.addEventListener('click', async () => {
    const newState = !isRegistrationBlocked;
    try {
        await registrationSettingsRef.update({ isBlocked: newState });
        isRegistrationBlocked = newState;
        updateStatusButtonUI();
        alert(`Registration has been successfully ${newState ? 'BLOCKED' : 'UNBLOCKED'}.`);
    } catch (error) {
        console.error("Error updating registration status:", error);
        alert("Failed to update status.");
    }
});

testDatesContainer.addEventListener('click', async (e) => {
    const target = e.target;
    if (target.matches('button[data-class-save]')) {
        const className = target.dataset.classSave;
        const dateInput = testDatesContainer.querySelector(`input[data-class="${className}"]`);
        const dateValue = dateInput.value;

        if (!dateValue) {
            alert('Please select a date before saving.');
            return;
        }

        target.textContent = 'Saving...';
        target.disabled = true;

        try {
            await testDatesRef.doc(className).set({ testDate: dateValue });
            alert(`Test date for ${className} saved successfully.`);
        } catch (error) {
            console.error('Error saving test date:', error);
            alert('Failed to save the date. Please try again.');
        } finally {
            target.textContent = 'Save Date';
            target.disabled = false;
        }
    }
});

// --- AUTHENTICATION & INITIALIZATION ---
auth.onAuthStateChanged(user => {
    if (user && user.uid === ADMIN_UID) {
        console.log("Admin user authenticated.");
        fetchRegistrationStatus();
        renderTestDateInputs();
        loader.style.display = 'none';
        adminContent.style.display = 'block';
    } else {
        window.location.href = 'login.html';
    }
});