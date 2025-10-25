import { firebaseConfig } from './firebase-config.js';

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// --- CONFIGURATION ---
const ADMIN_UID = "pNJ0eOvD5BehD0eLrbWOM4czKR62";
const DELETE_ALL_PASSWORD = "7739";

// --- UI ELEMENTS ---
const loader = document.getElementById('loader');
const adminContent = document.getElementById('admin-content');
const studentsTableBody = document.getElementById('studentsTableBody');
const searchInput = document.getElementById('searchInput');
const signOutBtn = document.getElementById('signOutBtn');
const deleteAllBtn = document.getElementById('deleteAllBtn');
const filterContainer = document.querySelector('.filters');

// Modal Elements
const modal = document.getElementById('detailsModal');
const closeModalBtn = document.querySelector('.close-button');
const modalStudentPicture = document.getElementById('modalStudentPicture');
const modalStudentName = document.getElementById('modalStudentName');
const modalFormNumber = document.getElementById('modalFormNumber');
const modalFatherName = document.getElementById('modalFatherName');
const modalDob = document.getElementById('modalDob');
const modalGender = document.getElementById('modalGender');
const modalStudentCnic = document.getElementById('modalStudentCnic');
const modalFatherCnic = document.getElementById('modalFatherCnic');
const modalNationality = document.getElementById('modalNationality');
const modalReligion = document.getElementById('modalReligion');
const modalAdmissionClass = document.getElementById('modalAdmissionClass');
const modalSubjectField = document.getElementById('modalSubjectField');
const modalPreviousSchool = document.getElementById('modalPreviousSchool');
const modalPreviousClass = document.getElementById('modalPreviousClass');
const modalEmail = document.getElementById('modalEmail');
const modalMobile = document.getElementById('modalMobile');
const modalWhatsapp = document.getElementById('modalWhatsapp');
const modalMailingAddress = document.getElementById('modalMailingAddress');
const modalPermanentAddress = document.getElementById('modalPermanentAddress');
const modalHowYouKnow = document.getElementById('modalHowYouKnow');

let allStudents = []; // Cache all students to avoid re-fetching

// --- DATA & TABLE FUNCTIONS ---
const loadStudentData = async () => {
    try {
        const snapshot = await db.collection('schoolTests').where('status', '==', 'completed').orderBy('submittedAt', 'desc').get();
        allStudents = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        renderTable(allStudents);
    } catch (error) {
        console.error("Error fetching student data:", error);
        studentsTableBody.innerHTML = '<tr><td colspan="6">Error loading data.</td></tr>';
    } finally {
        loader.style.display = 'none';
        adminContent.style.display = 'block';
    }
};

const renderTable = (students) => {
    studentsTableBody.innerHTML = '';
    if (students.length === 0) {
        studentsTableBody.innerHTML = '<tr><td colspan="6">No results found for the selected filter.</td></tr>';
        return;
    }
    students.forEach(student => {
        const tr = document.createElement('tr');
        tr.dataset.id = student.id;
        tr.innerHTML = `
            <td>${student.formNumber}</td>
            <td>${student.studentName}</td>
            <td>${student.fatherName}</td>
            <td>${student.admissionClass}</td>
            <td>${new Date(student.submittedAt.seconds * 1000).toLocaleDateString()}</td>
            <td>
                <div class="action-buttons">
                    <button class="action-button view" data-id="${student.id}"><i class="fas fa-eye"></i></button>
                    <button class="action-button delete" data-id="${student.id}"><i class="fas fa-trash"></i></button>
                </div>
            </td>
        `;
        studentsTableBody.appendChild(tr);
    });
};

// --- MODAL & FILTER FUNCTIONS ---
const showDetailsModal = (studentId) => {
    const student = allStudents.find(s => s.id === studentId);
    if (!student) return;
    modalStudentPicture.src = student.studentPictureDataUrl || 'member-icon.jpg'; 
    modalStudentName.textContent = student.studentName;
    modalFormNumber.textContent = `Form #: ${student.formNumber}`;
    modalFatherName.textContent = student.fatherName;
    modalDob.textContent = student.dateOfBirth;
    modalGender.textContent = student.gender;
    modalStudentCnic.textContent = student.studentCnic || 'N/A';
    modalFatherCnic.textContent = student.fatherCnic;
    modalNationality.textContent = student.nationality;
    modalReligion.textContent = student.religion;
    modalAdmissionClass.textContent = student.admissionClass;
    modalSubjectField.textContent = student.subject || student.field || 'N/A';
    modalPreviousSchool.textContent = student.previousSchool || 'N/A';
    modalPreviousClass.textContent = student.previousClass || 'N/A';
    modalEmail.textContent = student.email;
    modalMobile.textContent = student.mobileNumber;
    modalWhatsapp.textContent = student.whatsappNumber;
    modalMailingAddress.textContent = student.mailingAddress;
    modalPermanentAddress.textContent = student.permanentAddress;
    modalHowYouKnow.textContent = student.howYouKnow || 'N/A';
    modal.style.display = 'block';
};

const filterRecords = (period) => {
    const now = new Date();
    let startDate;
    if (period === 'all') {
        renderTable(allStudents);
        return;
    }
    if (period === 'today') startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    else if (period === 'week') startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
    else if (period === 'month') startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    else if (period === 'year') startDate = new Date(now.getFullYear(), 0, 1);
    const filtered = allStudents.filter(student => new Date(student.submittedAt.seconds * 1000) >= startDate);
    renderTable(filtered);
};


// --- DELETE FUNCTIONS ---
const deleteStudentRecord = async (studentId) => {
    const student = allStudents.find(s => s.id === studentId);
    if (!student || !confirm(`Are you sure you want to delete all data for ${student.studentName}?`)) {
        return;
    }

    try {
        // --- FEATURE UPDATE: Delete from both collections ---
        const batch = db.batch();

        // 1. Delete the registration details
        const schoolTestRef = db.collection('schoolTests').doc(studentId);
        batch.delete(schoolTestRef);

        // 2. Delete the user profile data
        const userRef = db.collection('users').doc(studentId);
        batch.delete(userRef);
        
        // Commit the batch deletion
        await batch.commit();
        
        alert('Student data deleted successfully from the database.');
        
        // Update the UI
        allStudents = allStudents.filter(s => s.id !== studentId);
        const activeFilter = document.querySelector('.filter-btn.active').dataset.filter;
        filterRecords(activeFilter);

    } catch (error) {
        console.error("Error deleting record:", error);
        alert('Failed to delete student data. Please check the console.');
    }
};

const deleteAllRecords = async () => {
    const password = prompt('To delete ALL records, enter the password:');
    if (password !== DELETE_ALL_PASSWORD) {
        if (password !== null) alert('Incorrect password. Action cancelled.');
        return;
    }
    if (!confirm('FINAL WARNING: This will permanently delete ALL student registrations and profiles. Are you sure?')) return;

    loader.style.display = 'flex';
    try {
        const schoolTestsSnapshot = await db.collection('schoolTests').get();
        const usersSnapshot = await db.collection('users').get();
        const batch = db.batch();

        schoolTestsSnapshot.docs.forEach(doc => batch.delete(doc.ref));
        usersSnapshot.docs.forEach(doc => {
            // IMPORTANT: Do not delete the admin's user profile
            if (doc.id !== ADMIN_UID) {
                batch.delete(doc.ref);
            }
        });
        
        await batch.commit();

        alert(`Successfully deleted all student data.`);
        allStudents = [];
        renderTable(allStudents);
    } catch (error) {
        console.error('Error deleting all records:', error);
        alert('An error occurred during deletion.');
    } finally {
        loader.style.display = 'none';
    }
};


// --- EVENT LISTENERS ---
signOutBtn.addEventListener('click', () => { auth.signOut().then(() => { window.location.href = 'login.html'; }); });
deleteAllBtn.addEventListener('click', deleteAllRecords);
searchInput.addEventListener('keyup', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const filtered = allStudents.filter(s =>
        s.studentName.toLowerCase().includes(searchTerm) ||
        s.formNumber.toLowerCase().includes(searchTerm) ||
        s.admissionClass.toLowerCase().includes(searchTerm)
    );
    renderTable(filtered);
});
closeModalBtn.addEventListener('click', () => { modal.style.display = 'none'; });
window.addEventListener('click', (e) => { if (e.target === modal) modal.style.display = 'none'; });

studentsTableBody.addEventListener('click', (e) => {
    const target = e.target.closest('.action-button');
    if (!target) return;
    const studentId = target.dataset.id;
    if (target.classList.contains('view')) showDetailsModal(studentId);
    else if (target.classList.contains('delete')) deleteStudentRecord(studentId);
});

filterContainer.addEventListener('click', (e) => {
    if (e.target.classList.contains('filter-btn')) {
        document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
        e.target.classList.add('active');
        const period = e.target.dataset.filter;
        filterRecords(period);
    }
});

// --- AUTHENTICATION & INITIALIZATION ---
auth.onAuthStateChanged(user => {
    if (user && user.uid === ADMIN_UID) {
        loadStudentData();
    } else {
        window.location.href = 'login.html';
    }
});