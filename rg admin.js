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

// Dashboard Elements
const totalTodayEl = document.getElementById('totalToday');
const totalMonthEl = document.getElementById('totalMonth');
const totalYearEl = document.getElementById('totalYear');
const totalOverallEl = document.getElementById('totalOverall');
const sourceSocialMediaEl = document.getElementById('sourceSocialMedia');
const sourceFriendEl = document.getElementById('sourceFriend');
const sourceAdvertisementEl = document.getElementById('sourceAdvertisement');
const sourceSchoolVisitEl = document.getElementById('sourceSchoolVisit');
const sourceOtherEl = document.getElementById('sourceOther');

// --- FUNCTIONS ---

/**
 * Calculates and displays dashboard statistics.
 */
const calculateAndDisplayStats = (students) => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const yearStart = new Date(now.getFullYear(), 0, 1);
    let totalToday = 0, totalMonth = 0, totalYear = 0;
    const totalOverall = students.length;
    const sourceCounts = { "Social Media": 0, "Friend or Family": 0, "Advertisement": 0, "School Visit": 0, "Other": 0 };
    students.forEach(student => {
        if (!student.submittedAt || !student.submittedAt.seconds) return;
        const submissionDate = new Date(student.submittedAt.seconds * 1000);
        if (submissionDate >= todayStart) totalToday++;
        if (submissionDate >= monthStart) totalMonth++;
        if (submissionDate >= yearStart) totalYear++;
        if (student.howYouKnow && sourceCounts.hasOwnProperty(student.howYouKnow)) {
            sourceCounts[student.howYouKnow]++;
        }
    });
    totalTodayEl.textContent = totalToday;
    totalMonthEl.textContent = totalMonth;
    totalYearEl.textContent = totalYear;
    totalOverallEl.textContent = totalOverall;
    sourceSocialMediaEl.textContent = sourceCounts["Social Media"];
    sourceFriendEl.textContent = sourceCounts["Friend or Family"];
    sourceAdvertisementEl.textContent = sourceCounts["Advertisement"];
    sourceSchoolVisitEl.textContent = sourceCounts["School Visit"];
    sourceOtherEl.textContent = sourceCounts["Other"];
};

/**
 * Fetches data for the dashboard.
 */
const loadDashboardData = async () => {
    try {
        const snapshot = await db.collection('schoolTests').where('status', '==', 'completed').get();
        const allStudents = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        calculateAndDisplayStats(allStudents);
    } catch (error) {
        console.error("Error fetching dashboard data:", error);
    } finally {
        loader.style.display = 'none';
        adminContent.style.display = 'block';
    }
};

// --- EVENT LISTENERS ---
signOutBtn.addEventListener('click', () => auth.signOut().then(() => { window.location.href = 'login.html'; }));

// --- AUTHENTICATION & INITIALIZATION ---
auth.onAuthStateChanged(user => {
    if (user && user.uid === ADMIN_UID) {
        console.log("Admin user authenticated.");
        loadDashboardData();
    } else {
        window.location.href = 'login.html';
    }
});