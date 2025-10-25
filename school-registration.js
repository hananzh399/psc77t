import { firebaseConfig } from './firebase-config.js';

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// --- FORM & INPUT ELEMENTS ---
const form = document.getElementById('schoolForm');
const welcomeBanner = document.querySelector('.welcome-banner');
const blockedBanner = document.getElementById('blocked-banner');
const welcomeUserMessage = document.getElementById('welcomeUserMessage');
const formNumberInput = document.getElementById('formNumber');
const studentNameInput = document.getElementById('studentName');
const studentCnicInput = document.getElementById('studentCnic');
const fatherNameInput = document.getElementById('fatherName');
const fatherCnicInput = document.getElementById('fatherCnic');
const dobInput = document.getElementById('dob');
const genderInput = document.getElementById('gender');
const admissionClassInput = document.getElementById('admissionClass');
const subjectGroup = document.getElementById('subject-group');
const subjectSelectionInput = document.getElementById('subjectSelection');
const fieldGroup = document.getElementById('field-group');
const fieldSelectionInput = document.getElementById('fieldSelection');
const previousClassInput = document.getElementById('previousClass');
const previousSchoolInput = document.getElementById('previousSchool');
const emailInput = document.getElementById('email');
const mobileNumberInput = document.getElementById('mobileNumber');
const whatsappNumberInput = document.getElementById('whatsappNumber');
const mailingAddressInput = document.getElementById('mailingAddress');
const sameAddressCheckbox = document.getElementById('sameAddressCheckbox');
const permanentAddressInput = document.getElementById('permanentAddress');
const nationalityInput = document.getElementById('nationality');
const religionInput = document.getElementById('religion');
const howYouKnowInput = document.getElementById('howYouKnow');
const studentPictureInput = document.getElementById('studentPicture');
const fileNameDisplay = document.querySelector('#file-name');
const imagePreview = document.getElementById('imagePreview');
const submitBtn = document.getElementById('submitBtn');
const errorMessage = document.getElementById('form-error');


let assignedFormNumber = null;
let currentUser = null;
let formDataKey = null;
let cachedImageDataUrl = null; // This will hold the base64 string of the uploaded image

// --- LOCAL STORAGE & HELPER FUNCTIONS ---
const saveFormDataToLocalStorage = () => {
    if (!currentUser) return;
    const formData = {
        studentName: studentNameInput.value, studentCnic: studentCnicInput.value,
        fatherName: fatherNameInput.value, fatherCnic: fatherCnicInput.value,
        dob: dobInput.value, gender: genderInput.value,
        admissionClass: admissionClassInput.value, subject: subjectSelectionInput.value,
        field: fieldSelectionInput.value, previousClass: previousClassInput.value,
        previousSchool: previousSchoolInput.value, email: emailInput.value,
        mobileNumber: mobileNumberInput.value, whatsappNumber: whatsappNumberInput.value,
        mailingAddress: mailingAddressInput.value, permanentAddress: permanentAddressInput.value,
        isSameAddress: sameAddressCheckbox.checked, nationality: nationalityInput.value,
        religion: religionInput.value, howYouKnow: howYouKnowInput.value,
    };
    localStorage.setItem(formDataKey, JSON.stringify(formData));
};

const loadFormDataFromLocalStorage = () => {
    if (!currentUser) return;
    const savedData = localStorage.getItem(formDataKey);
    if (savedData) {
        const formData = JSON.parse(savedData);
        Object.keys(formData).forEach(key => {
            const elementId = key === 'isSameAddress' ? 'sameAddressCheckbox' : key;
            const element = document.getElementById(elementId);
            if (element) {
                if (element.type === 'checkbox') element.checked = formData[key];
                else element.value = formData[key];
            }
        });
        if (formData.isSameAddress) permanentAddressInput.disabled = true;
        admissionClassInput.dispatchEvent(new Event('change'));
        setTimeout(() => {
            if (formData.subject) subjectSelectionInput.value = formData.subject;
            if (formData.field) fieldSelectionInput.value = formData.field;
        }, 100);
    }
    
    // Set and display the image (cached or default)
    cachedImageDataUrl = localStorage.getItem(`studentPictureData_${currentUser.uid}`);
    if (cachedImageDataUrl) {
        imagePreview.src = cachedImageDataUrl;
        fileNameDisplay.textContent = "Previously selected image restored.";
    } else {
        imagePreview.src = 'member-icon.jpg'; // Show default icon initially
    }
    imagePreview.style.display = 'block';
};

const configureDateInput = () => {
    dobInput.max = new Date().toISOString().split("T")[0];
};


// --- VALIDATION HELPERS ---
const setError = (element, message) => { const inputGroup = element.closest('.input-group,.file-upload-zone'); if(!inputGroup) return; inputGroup.classList.add('error'); inputGroup.classList.remove('success'); let errorDisplay = (element.id === 'studentPicture') ? document.getElementById('file-error-text') : inputGroup.querySelector('.error-text'); if(errorDisplay) errorDisplay.innerText = message; };
const setSuccess = (element) => { const inputGroup = element.closest('.input-group,.file-upload-zone'); if(!inputGroup) return; inputGroup.classList.add('success'); inputGroup.classList.remove('error'); let errorDisplay = (element.id === 'studentPicture') ? document.getElementById('file-error-text') : inputGroup.querySelector('.error-text'); if(errorDisplay) errorDisplay.innerText = ''; };

const validateForm = () => {
    let isValid = true;
    const isRequired = (element) => {
        if (element.value.trim() === '') {
            setError(element, 'This field is required.');
            return false;
        }
        setSuccess(element);
        return true;
    };
    
    if (!isRequired(studentNameInput)) isValid = false;
    if (!isRequired(fatherNameInput)) isValid = false;
    if (!isRequired(dobInput)) isValid = false;
    if (!isRequired(emailInput)) isValid = false;
    if (!isRequired(mailingAddressInput)) isValid = false;
    if (!sameAddressCheckbox.checked && !isRequired(permanentAddressInput)) isValid = false; else setSuccess(permanentAddressInput);
    if (!isRequired(fatherCnicInput)) isValid = false;
    
    setSuccess(studentPictureInput); // Always show success for the optional image field
    return isValid;
};


// --- EVENT LISTENERS ---
const addSaveOnChangeListener = () => form.querySelectorAll('input, select, textarea').forEach(el => el.addEventListener('input', saveFormDataToLocalStorage));
const filterNumericInput = (e) => { e.target.value = e.target.value.replace(/[^0-9]/g, ''); };
mobileNumberInput.addEventListener('input', filterNumericInput);
whatsappNumberInput.addEventListener('input', filterNumericInput);
admissionClassInput.addEventListener('change', () => { const sel = admissionClassInput.value; subjectGroup.style.display = sel === 'Nine (9)' || sel === 'Ten (10)' ? 'block' : 'none'; subjectSelectionInput.required = subjectGroup.style.display === 'block'; fieldGroup.style.display = sel === 'First Year (11)' || sel === '2nd Year (12)' ? 'block' : 'none'; fieldSelectionInput.required = fieldGroup.style.display === 'block'; });
studentPictureInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        setSuccess(studentPictureInput);
        fileNameDisplay.textContent = file.name;
        const reader = new FileReader();
        reader.onload = (event) => {
            cachedImageDataUrl = event.target.result;
            imagePreview.src = cachedImageDataUrl;
            imagePreview.style.display = 'block';
            try { localStorage.setItem(`studentPictureData_${currentUser.uid}`, cachedImageDataUrl); }
            catch (err) { console.error("Error saving image to localStorage:", err); }
        };
        reader.readAsDataURL(file);
    }
});
sameAddressCheckbox.addEventListener('change', () => { permanentAddressInput.disabled = sameAddressCheckbox.checked; if (sameAddressCheckbox.checked) permanentAddressInput.value = mailingAddressInput.value; setSuccess(permanentAddressInput); });
mailingAddressInput.addEventListener('input', () => { if (sameAddressCheckbox.checked) permanentAddressInput.value = mailingAddressInput.value; });


// --- AUTHENTICATION & INITIALIZATION ---
async function generateNewFormNumber() { const ref = db.collection('schoolTests'); const q = ref.orderBy('formNumber', 'desc').limit(1); try { const snap = await q.get(); let next = 1001; if (!snap.empty) { const last = snap.docs[0].data().formNumber; const p = last.split('|'); if (p.length >= 2) { const num = parseInt(p[1], 10); if (!isNaN(num)) next = num + 1; } } const y = new Date().getFullYear().toString().slice(-2); assignedFormNumber = `PSC-|${next}|-${y}`; formNumberInput.value = assignedFormNumber; } catch (err) { console.error(err); errorMessage.innerText = "Could not generate form number."; submitBtn.disabled = true; } }

auth.onAuthStateChanged(async (user) => {
    if (user) {
        currentUser = user;
        formDataKey = `savedStudentFormData_${user.uid}`;
        const userDocRef = db.collection('users').doc(user.uid);
        const schoolDocRef = db.collection('schoolTests').doc(user.uid);
        const regSettingsRef = db.collection('settings').doc('registration');

        try {
            // Check if registration is blocked
            const regSettingsDoc = await regSettingsRef.get();
            if (regSettingsDoc.exists && regSettingsDoc.data().isBlocked === true) {
                blockedBanner.style.display = 'block';
                submitBtn.disabled = true;
                form.querySelectorAll('input, select, textarea').forEach(el => el.disabled = true);
            }

            const userDoc = await userDocRef.get();
            if (userDoc.exists) {
                welcomeUserMessage.textContent = `Welcome, ${userDoc.data().username}!`;
                welcomeBanner.style.display = 'block';
            }
            const schoolDoc = await schoolDocRef.get();
            if (schoolDoc.exists && schoolDoc.data().status === 'completed') {
                localStorage.removeItem(formDataKey);
                localStorage.removeItem(`studentPictureData_${user.uid}`);
                alert('You have already completed the registration.');
                window.location.href = 'home.html';
                return;
            } else if (schoolDoc.exists) {
                assignedFormNumber = schoolDoc.data().formNumber;
                formNumberInput.value = assignedFormNumber;
            } else {
                await generateNewFormNumber();
                await schoolDocRef.set({ formNumber: assignedFormNumber, status: 'pending', assignedAt: new Date() });
            }
            configureDateInput();
            loadFormDataFromLocalStorage();
            addSaveOnChangeListener();
        } catch (error) {
            console.error("Error managing registration state:", error);
            errorMessage.innerText = "Error loading your details.";
            submitBtn.disabled = true;
        }
    } else {
        window.location.href = 'login.html';
    }
});

// --- FORM SUBMISSION ---
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!validateForm()) {
        errorMessage.innerText = 'Please fix the errors above and try again.';
        return;
    }
    submitBtn.disabled = true;
    errorMessage.innerText = 'Submitting... Please wait.';

    try {
        const user = auth.currentUser;

        // If no new image was uploaded (still default), set URL to null
        const finalImageDataUrl = studentPictureInput.files.length > 0 ? cachedImageDataUrl : null;

        const formValues = {
            studentPictureDataUrl: finalImageDataUrl,
            formNumber: assignedFormNumber,
            studentName: studentNameInput.value.trim(),
            studentCnic: studentCnicInput.value.trim(),
            fatherName: fatherNameInput.value.trim(),
            fatherCnic: fatherCnicInput.value.trim(),
            dateOfBirth: dobInput.value,
            gender: genderInput.value,
            admissionClass: admissionClassInput.value,
            subject: subjectSelectionInput.required ? subjectSelectionInput.value : null,
            field: fieldSelectionInput.required ? fieldSelectionInput.value : null,
            previousClass: previousClassInput.value,
            previousSchool: previousSchoolInput.value.trim(),
            email: emailInput.value.trim(),
            mobileNumber: mobileNumberInput.value.trim(),
            whatsappNumber: whatsappNumberInput.value.trim(),
            mailingAddress: mailingAddressInput.value.trim(),
            permanentAddress: permanentAddressInput.value.trim(),
            nationality: nationalityInput.value,
            religion: religionInput.value,
            howYouKnow: howYouKnowInput.value,
            submittedAt: new Date(),
            status: 'completed'
        };

        await db.collection('schoolTests').doc(user.uid).set(formValues, { merge: true });
        
        localStorage.removeItem(formDataKey);
        localStorage.removeItem(`studentPictureData_${user.uid}`);
        
        alert('Student registration successful!');
        window.location.href = 'home.html';

    } catch (dbError) {
        console.error('Error during submission: ', dbError);
        errorMessage.innerText = 'Could not submit registration. Please try again.';
        submitBtn.disabled = false;
    }
});