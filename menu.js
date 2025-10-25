// Get all the necessary elements from the DOM
const menuContainer = document.getElementById('mb-menu');
const showBtn = document.getElementById('show');
const hideBtn = document.getElementById('hide');
const closeBtn = document.getElementById('menu-close-button');
const body = document.body;

// Function to show the menu
function show_menu() {
    menuContainer.style.display = 'block';
    // Add a class to trigger the button animations
    setTimeout(() => { // Use a tiny delay to ensure the display:block is rendered first
        menuContainer.classList.add('menu-is-open');
    }, 10); 
    
    hideBtn.style.display = 'block';
    showBtn.style.display = 'none';
    body.classList.add('menu-open');
}

// Function to hide the menu
function hide_menu() {
    // Remove the class to reset the animation state
    menuContainer.classList.remove('menu-is-open');
    menuContainer.style.display = 'none';
    
    hideBtn.style.display = 'none';
    showBtn.style.display = 'block';
    body.classList.remove('menu-open');
}

// Add event listener for the menu's dedicated close button
closeBtn.addEventListener('click', hide_menu);

// The onclick attributes in the HTML file will handle the show_menu() and hide_menu() calls
// for the header bar icons.

