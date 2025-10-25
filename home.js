import { firebaseConfig } from './firebase-config.js';

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// --- UI ELEMENTS ---
const loader = document.getElementById('loader');
const content = document.getElementById('content');
const signOutBtn = document.getElementById('signOutBtn');
const schoolDetailsCard = document.getElementById('school-details');
const noDetailsMessage = document.getElementById('no-details-message');
const testDateBanner = document.getElementById('test-date-banner');
const testDateMessage = document.getElementById('test-date-message');

/**
 * A helper function to safely populate an element's text content.
 */
const setText = (id, text) => {
    const element = document.getElementById(id);
    if (element) {
        element.textContent = text || 'N/A';
    }
};

/**
 * A helper function to safely set an image source.
 */
const setSrc = (id, src) => {
    const element = document.getElementById(id);
    if (element) {
        element.src = src || 'member-icon.jpg'; // Use default icon if src is null/undefined
    }
};

/**
 * Fetches and displays the entry test date for the student's class.
 * @param {string} admissionClass - The class the student registered for.
 */
const fetchAndDisplayTestDate = async (admissionClass) => {
    if (!admissionClass) return;
    try {
        const testDateDoc = await db.collection('testDates').doc(admissionClass).get();
        if (testDateDoc.exists && testDateDoc.data().testDate) {
            const dateStr = testDateDoc.data().testDate;
            // Add T00:00:00 to avoid timezone issues when creating the Date object
            const testDate = new Date(dateStr + 'T00:00:00');

            // Format the date to "12-October-2025, Sunday"
            const options = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' };
            const formattedDate = testDate.toLocaleDateString('en-GB', options).replace(/(\d{1,2}) (\w+) (\d{4}), (\w+)/, '$1-$2-$3, $4');

            if (testDateMessage) {
                testDateMessage.textContent = `Visit The School For Entry Test On ${formattedDate}.`;
            }
            if (testDateBanner) {
                testDateBanner.style.display = 'block';
            }
        }
    } catch (error) {
        console.error("Could not fetch test date:", error);
    }
};


// --- AUTHENTICATION & DATA FETCHING ---
auth.onAuthStateChanged(user => {
    if (user) {
        db.collection('schoolTests').doc(user.uid).get()
            .then(doc => {
                if (doc.exists && doc.data().status === 'completed') {
                    const data = doc.data();
                    
                    // Populate student details
                    setSrc('details-student-picture', data.studentPictureDataUrl);
                    setText('details-student-name', data.studentName);
                    setText('details-form-number', `Form #: ${data.formNumber}`);
                    // ... (populate all other fields)
                    setText('details-father-name', data.fatherName);
                    setText('details-dob', data.dateOfBirth);
                    setText('details-gender', data.gender);
                    setText('details-student-cnic', data.studentCnic);
                    setText('details-father-cnic', data.fatherCnic);
                    setText('details-nationality', data.nationality);
                    setText('details-religion', data.religion);
                    setText('details-admission-class', data.admissionClass);
                    setText('details-subject-field', data.subject || data.field);
                    setText('details-previous-school', data.previousSchool);
                    setText('details-previous-class', data.previousClass);
                    setText('details-email', data.email);
                    setText('details-mobile', data.mobileNumber);
                    setText('details-whatsapp', data.whatsappNumber);
                    setText('details-mailing-address', data.mailingAddress);
                    setText('details-permanent-address', data.permanentAddress);
                    
                    if(schoolDetailsCard) schoolDetailsCard.style.display = 'block';

                    // After showing details, fetch the test date for their class
                    fetchAndDisplayTestDate(data.admissionClass);
                    
                } else {
                    if(noDetailsMessage) noDetailsMessage.style.display = 'block';
                }
            })
            .catch(error => {
                console.error("Error fetching student details:", error);
                if (noDetailsMessage) {
                    noDetailsMessage.innerHTML = "<p>Error loading your details. Please try again.</p>";
                    noDetailsMessage.style.display = 'block';
                }
            })
            .finally(() => {
                if(loader) loader.style.display = 'none';
                if(content) content.style.display = 'block';
            });
    } else {
        window.location.href = 'login.html';
    }
});

// --- EVENT LISTENERS ---
if (signOutBtn) {
    signOutBtn.addEventListener('click', () => {
        auth.signOut().finally(() => { window.location.href = 'login.html'; });
    });
}