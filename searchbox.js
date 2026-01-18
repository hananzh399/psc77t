{
const searchIcons = document.querySelectorAll("#search-icon");
const searchArea = document.querySelector('.search-area');
const closeBtn = document.querySelector('.close-btn');
const inputField = document.querySelector('.search-bar');
const clearInput = document.querySelector('.clear-input');

let inputValue = '';

const pages = {
    'gallery' : 'file:///C:/Users/DCS%20ATK/Desktop/SchWeb2Try/gallery.html',
    'home' : 'file:///C:/Users/DCS%20ATK/Desktop/SchWeb2Try/index.html'
};

function inputHandler() {
   if(pages[inputValue]){
    window.location.href = pages[inputValue];
   }else if(inputValue == ''){
    alert('Enter something');
   }
   else{
    alert('No result found for ' + inputValue);
   }
}

searchIcons.forEach((icon) => {
icon.addEventListener('click', () => {
    searchArea.style.display = 'flex';
    inputField.focus();
});
});

inputField.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        let rawInput = e.target.value;
        inputValue = rawInput.replace(/\s+/g, '').toLowerCase().trim();
        inputHandler();
    }
});

clearInput.addEventListener('click', () => {
    inputField.value = '';
});

closeBtn.addEventListener('click', () => {
    searchArea.style.display = 'none';
    searchIcon.style.display = 'block';
    inputField.value = '';
});
}