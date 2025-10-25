document.addEventListener('DOMContentLoaded', () => {
    // --- Firebase Configuration ---
    // PASTE YOUR FIREBASE CONFIG OBJECT HERE
   const firebaseConfig = {
  apiKey: "AIzaSyDrXmKmm29XgrFQ1m0Rswx1dYlOBNBgf9w",
  authDomain: "school-chatbot-530ac.firebaseapp.com",
  databaseURL: "https://school-chatbot-530ac-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "school-chatbot-530ac",
  storageBucket: "school-chatbot-530ac.firebasestorage.app",
  messagingSenderId: "866135823783",
  appId: "1:866135823783:web:60ad06e16d9826aaead282",
  measurementId: "G-GM92E8NJM1"
};

    // Initialize Firebase
    firebase.initializeApp(firebaseConfig);
    const database = firebase.database();
    const auth = firebase.auth();
    const qnaRef = database.ref('qna');

    // --- HTML Element References ---
    // Login section
    const loginContainer = document.getElementById('loginContainer');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const loginButton = document.getElementById('loginButton');
    const loginError = document.getElementById('loginError');
    const passwordToggle = document.getElementById('passwordToggle');
    const eyeOpen = document.getElementById('eye-open');
    const eyeClosed = document.getElementById('eye-closed');

    // Admin content section
    const adminContainer = document.getElementById('adminContainer');
    const adminContent = document.getElementById('adminContent'); // Content wrapper
    let newQuestionInput, newResponseInput, addButton, searchInput, qnaListContainer, saveButton, logoutButton;

    let qnaData = {};
    let defaultResponse = "I'm not sure how to answer that. For detailed information, please call the school office at 0572700548.";

    // --- Core Functions ---
    function setupAdminPanel() {
        // Move the content from the main body into the admin container
        const cards = document.querySelectorAll('main > .card');
        const adminContentDiv = document.querySelector("#adminContent");
        
        // This is a placeholder for the actual cards which are now defined in admin.html
        // but we'll structure the main content inside the adminContainer
        const adminHTML = `
            <div class="card">
                <h2>Add New Question & Answer</h2>
                <div class="form-group"><label for="newQuestion">Question / Keyword:</label><input type="text" id="newQuestion" placeholder="e.g., 'fees' or 'location'"></div>
                <div class="form-group"><label for="newResponse">Response:</label><textarea id="newResponse" rows="4" placeholder="Enter the bot's answer here. You can use HTML like <a href='...'> for links."></textarea></div>
                <button id="addButton">Add Q&A</button>
            </div>
            <div class="card">
                <h2>Manage Existing Q&A</h2>
                <div class="form-group"><label for="searchInput">Search by Question / Keyword:</label><input type="text" id="searchInput" placeholder="Search for a keyword to edit or delete..."></div>
                <div id="qnaList"></div>
            </div>
            <div class="card export-card">
                <h2>Save Changes Live</h2>
                <p><strong>Instructions:</strong> After making changes, click the button below. The chatbot will be updated on the live website immediately.</p>
                <div class="export-actions"><button id="saveButton">Save Changes to Server</button><button id="logoutButton" class="delete-btn" style="margin-left: 15px;">Logout</button></div>
            </div>
        `;
        adminContentDiv.innerHTML = adminHTML;

        // Now assign the element references
        newQuestionInput = document.getElementById('newQuestion');
        newResponseInput = document.getElementById('newResponse');
        addButton = document.getElementById('addButton');
        searchInput = document.getElementById('searchInput');
        qnaListContainer = document.getElementById('qnaList');
        saveButton = document.getElementById('saveButton');
        logoutButton = document.getElementById('logoutButton');

        // Re-attach event listeners
        logoutButton.addEventListener('click', () => auth.signOut());
        addButton.addEventListener('click', handleAdd);
        searchInput.addEventListener('input', () => renderList(searchInput.value));
        qnaListContainer.addEventListener('click', handleListClick);
        saveButton.addEventListener('click', saveChanges);

        loadInitialData();
    }
    
    function showAdminPanel() {
        loginContainer.style.display = 'none';
        adminContainer.style.display = 'block';
        setupAdminPanel();
    }

    function showLoginForm() {
        loginContainer.style.display = 'flex';
        adminContainer.style.display = 'none';
    }

    // --- Firebase Auth Logic ---
    auth.onAuthStateChanged(user => {
        if (user) showAdminPanel();
        else showLoginForm();
    });

    loginButton.addEventListener('click', () => {
        auth.signInWithEmailAndPassword(emailInput.value, passwordInput.value)
            .catch(error => loginError.textContent = error.message);
    });
    
    passwordToggle.addEventListener('click', () => {
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            eyeOpen.style.display = 'none';
            eyeClosed.style.display = 'inline';
        } else {
            passwordInput.type = 'password';
            eyeOpen.style.display = 'inline';
            eyeClosed.style.display = 'none';
        }
    });

    // --- Q&A Management Functions ---
    async function loadInitialData() { /* ... no changes ... */ }
    function renderList(filter = '') { /* ... no changes ... */ }
    async function saveChanges() { /* ... no changes ... */ }

    // Re-paste logic here for clarity
    async function loadInitialData() {
        try {
            const snapshot = await qnaRef.get();
            if (snapshot.exists()) {
                const data = snapshot.val();
                if (data.default) {
                    defaultResponse = data.default;
                    delete data.default;
                }
                qnaData = data;
            } else {
                qnaData = {};
            }
        } catch (error) { console.error("Could not load data from Firebase:", error); }
        renderList();
    }

    function renderList(filter = '') {
        qnaListContainer.innerHTML = '';
        const filteredKeys = Object.keys(qnaData).filter(key => key.toLowerCase().includes(filter.toLowerCase())).sort();
        if (filteredKeys.length === 0) { qnaListContainer.innerHTML = '<p>No matching items found.</p>'; return; }
        filteredKeys.forEach(key => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'item'; itemDiv.dataset.key = key;
            itemDiv.innerHTML = `<div class="item-content"><p><strong>Question:</strong> ${key}</p><p><strong>Response:</strong> ${qnaData[key]}</p></div><div class="item-actions"><button class="edit-btn">Edit</button><button class="delete-btn">Delete</button></div>`;
            qnaListContainer.appendChild(itemDiv);
        });
    }

    async function saveChanges() {
        saveButton.textContent = 'Saving...'; saveButton.disabled = true;
        const dataToSave = { ...qnaData, default: defaultResponse };
        try {
            await qnaRef.set(dataToSave);
            alert('Success! Chatbot has been updated instantly.');
        } catch (error) {
            alert(`Error: Could not save to Firebase.\n\n${error.message}`);
        } finally {
            saveButton.textContent = 'Save Changes to Server'; saveButton.disabled = false;
        }
    }

    function handleAdd() {
        const question = newQuestionInput.value.trim(); const response = newResponseInput.value.trim();
        if (question && response) { qnaData[question] = response; renderList(searchInput.value); newQuestionInput.value = ''; newResponseInput.value = ''; }
        else { alert('Please fill in both fields.'); }
    }

    function handleListClick(e) {
        const target = e.target; const itemDiv = target.closest('.item');
        if (!itemDiv) return; const key = itemDiv.dataset.key;
        if (target.classList.contains('delete-btn')) {
            if (confirm(`Delete "${key}"?`)) { delete qnaData[key]; renderList(searchInput.value); }
        } else if (target.classList.contains('edit-btn')) {
            const contentDiv = itemDiv.querySelector('.item-content');
            contentDiv.innerHTML = `<div class="form-group"><label>Question:</label><input type="text" class="edit-question" value="${key}"></div><div class="form-group"><label>Response:</label><textarea class="edit-response" rows="4">${qnaData[key]}</textarea></div>`;
            target.textContent = 'Save'; target.classList.replace('edit-btn', 'save-btn');
        } else if (target.classList.contains('save-btn')) {
            const editedQuestion = itemDiv.querySelector('.edit-question').value.trim(); const editedResponse = itemDiv.querySelector('.edit-response').value.trim();
            if (editedQuestion && editedResponse) { if (key !== editedQuestion) { delete qnaData[key]; } qnaData[editedQuestion] = editedResponse; renderList(searchInput.value); }
        }
    }
});