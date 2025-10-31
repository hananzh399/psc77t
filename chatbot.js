document.addEventListener('DOMContentLoaded', () => {
    // --- Get references to the HTML elements ---
    const chatbot = document.querySelector(".chatbot");
    const openButton = document.querySelector(".chat-open-button");
    const closeButton = document.querySelector(".chat-close-button");
    const userInput = document.getElementById("userInput");
    const sendButton = document.getElementById("sendButton");
    const chatbotMessages = document.querySelector(".chat-messages");
    const suggestionBox = document.getElementById("suggestionBox");

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

    let responses = {};

    // --- Main Functions ---

    // Function to set up a real-time listener for Q&A data from Firebase.
    function setupFirebaseListener() {
        console.log("Setting up Firebase real-time listener...");
        const qnaRef = database.ref('qna');
        
        qnaRef.on('value', (snapshot) => {
            if (snapshot.exists()) {
                responses = snapshot.val();
                console.log("SUCCESS: Chatbot knowledge base loaded/updated in real-time.", responses);
            } else {
                console.warn("WARNING: No Q&A data found in Firebase. Chatbot will use default responses.");
                responses = { "default": "Sorry, my responses are not configured right now." };
            }
        }, (error) => {
            console.error("ERROR: Firebase real-time listener failed.", error);
            responses = { "default": "Sorry, I'm having trouble connecting to my knowledge base." };
        });
    }

    // --- Chatbot UI Functions ---
    function showTypingIndicator() {
        const indicator = document.createElement("div");
        indicator.classList.add("message", "bot-message", "typing-indicator");
        indicator.innerHTML = `
            <div class="avatar"><img src="school logo.jpg" alt="PSC"></div>
            <div><span></span><span></span><span></span></div>
        `;
        chatbotMessages.appendChild(indicator);
        chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
    }

    function hideTypingIndicator() {
        const indicator = chatbotMessages.querySelector(".typing-indicator");
        if (indicator) {
            indicator.remove();
        }
    }

    function addMessage(text, sender) {
        const messageElement = document.createElement("div");
        messageElement.classList.add("message", sender === "user" ? "user-message" : "bot-message");

        const avatarContent = sender === "user"
            ? `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12,12A5,5,0,1,0,7,7,5,5,0,0,0,12,12Zm0,2c-2.7,0-8,1.3-8,4v2H20V18C20,15.3,14.7,14,12,14Z"/></svg>`
            : `<img src="school logo.jpg" alt="PSC">`;

        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        const messageContentDiv = document.createElement('div');
        messageContentDiv.className = 'message-content';
        const messageSpan = document.createElement('span');

        if (sender === 'bot') {
            messageSpan.innerHTML = text; // Allow HTML for links
        } else {
            messageSpan.textContent = text;
        }
        
        const timestampDiv = document.createElement('div');
        timestampDiv.className = 'timestamp';
        timestampDiv.textContent = time;

        messageContentDiv.appendChild(messageSpan);
        messageContentDiv.appendChild(timestampDiv);
        
        messageElement.innerHTML = `<div class="avatar">${avatarContent}</div>`;
        messageElement.appendChild(messageContentDiv);

        chatbotMessages.appendChild(messageElement);
        chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
    }

    // --- Chatbot Logic ---
    function normalizeText(text = '') {
        // Converts to lowercase, removes all whitespace characters (spaces, tabs, newlines)
        return text.toLowerCase().replace(/\s+/g, '');
    }

    /**
     * Finds the best response from the knowledge base.
     * This new logic finds all matching keywords and picks the longest one
     * to ensure the most specific match is chosen.
     * @param {string} userText The text entered by the user.
     * @returns {string} The best possible response.
     */
    function getResponse(userText) {
        const normalizedInput = normalizeText(userText);
        let bestMatch = null;

        if (!responses || typeof responses !== 'object') {
            return "I'm having trouble retrieving answers right now.";
        }

        // Find all keywords that are present in the user's input
        const matchingKeywords = Object.keys(responses).filter(keyword => {
            if (keyword === "default") return false;
            const normalizedKeyword = normalizeText(keyword);
            return normalizedInput.includes(normalizedKeyword);
        });

        // If there are matches, find the longest one (most specific)
        if (matchingKeywords.length > 0) {
            bestMatch = matchingKeywords.reduce((longest, current) => {
                return current.length > longest.length ? current : longest;
            }, "");
        }

        console.log(`User Input: "${userText}" | Normalized: "${normalizedInput}"`);
        console.log("Matching Keywords Found:", matchingKeywords);
        console.log("Best Match Selected:", bestMatch);

        // Return the response for the best match, or the default response
        if (bestMatch && responses[bestMatch]) {
            return responses[bestMatch];
        } else {
            return responses["default"] || "I'm sorry, I don't have an answer for that.";
        }
    }

    // --- Search Suggestion Logic ---
    function updateSuggestions() {
        const inputText = userInput.value.trim().toLowerCase();
        suggestionBox.innerHTML = '';

        if (inputText.length === 0) {
            suggestionBox.style.display = 'none';
            return;
        }

        const suggestions = Object.keys(responses).filter(keyword =>
            keyword.toLowerCase().startsWith(inputText) && keyword !== "default"
        );

        if (suggestions.length > 0) {
            suggestions.forEach(suggestion => {
                const suggestionItem = document.createElement('div');
                suggestionItem.textContent = suggestion;
                suggestionItem.classList.add('suggestion-item');
                suggestionItem.addEventListener('click', () => {
                    userInput.value = suggestion;
                    suggestionBox.style.display = 'none';
                    handleUserInput();
                });
                suggestionBox.appendChild(suggestionItem);
            });
            suggestionBox.style.display = 'block';
        } else {
            suggestionBox.style.display = 'none';
        }
    }

    // --- Main Handler for User Input ---
    function handleUserInput() {
        const userText = userInput.value.trim();
        if (userText === "") return;

        addMessage(userText, "user");
        userInput.value = ""; 
        suggestionBox.style.display = 'none';

        showTypingIndicator();

        setTimeout(() => {
            hideTypingIndicator();
            const botResponse = getResponse(userText);
            addMessage(botResponse, "bot");
        }, 1000); // Reduced delay for faster response
    }

    // --- Initialize everything ---
    setupFirebaseListener(); // Call the real-time listener

    openButton.addEventListener("click", () => chatbot.classList.add("active"));
    closeButton.addEventListener("click", () => chatbot.classList.remove("active"));
    sendButton.addEventListener("click", handleUserInput);
    userInput.addEventListener("keydown", (event) => {
        if (event.key === "Enter") handleUserInput();
    });
    userInput.addEventListener("input", updateSuggestions);
    document.addEventListener('click', (event) => {
        if (!userInput.contains(event.target) && !suggestionBox.contains(event.target)) {
            suggestionBox.style.display = 'none';
        }
    });
});