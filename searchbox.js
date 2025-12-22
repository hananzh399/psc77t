   //search values and results
   
   function ValueAndResults(){
    if (sval === 'paytrack'){
                window.location.href = "https://hananzh399.github.io/School-website-try/"
            }
            else if (sval === 'fa'){
                 window.location.href = "https://www.youtube.com/@FazalAcademy"
            }else if(sval === "news"){
                document.querySelector('.h-latest-news').scrollIntoView({
                    behavior: "smooth",
                });
            }else if(sval === ''){
                console.log("Empty");
            }else if(sval === ''){
                console.log("Empty");
            }else{
                alert(`No result found for : ${sval}`);
            }
            
        }
   
   
   //search bar for Desktop// 
    
    let search = document.querySelector('.search');
    let clean = document.querySelector('.searchclean');
    let seco = document.getElementById('search-container');
    let sechea = document.getElementById('second-header');
    let seaIcon = document.querySelector('.search-open');
    let cleIcon = document.querySelector('.search-close');
    let searchBtn = document.querySelector('.clear .fa-search');
    let input = document.querySelector('.search-input');


    search.onclick = function(){
        seco.classList.toggle('active');
        if (seco.classList.contains('active')) {
       seaIcon.style.visibility = "collapse";
       cleIcon.style.visibility = "visible";
       input.focus();
    };
        document.querySelector('.search-close').addEventListener('click', ()=>{
            seco.classList.remove('active');
            seaIcon.style.visibility = "visible";
       cleIcon.style.visibility = "collapse";
       input.value = '';
        });
    };
    clean.onclick = function(){
        document.getElementById('search').value = '';
    }

    
     input.onkeypress = function(event) {
        if (event.key === 'Enter') {
            sval = input.value.toLowerCase().replace(/\s+/g, '');
          ValueAndResults();
            input.value = '';
            
    };
};

searchBtn.addEventListener('click', ()=>{
    sval = input.value.toLowerCase().replace(/\s+/g, '');

   ValueAndResults();
   document.getElementById('search').value = '';
});


//search bar for mobile//

let mbSearchOpen = document.querySelector('.mb-search');
let mbSearchContainer = document.querySelector('.mb-search-container');
let mbSearchClose = document.querySelector('.mb-search-close');
let mbSearchResult = document.querySelector('.mb-search-result');
let mbSearchClear = document.querySelector('.mb-search-clear');
let ip = document.querySelector('.mb-serach-input');
let deviders = document.querySelectorAll('.vartical-devider1');

 mbSearchOpen.addEventListener('click', ()=>{
    mbSearchContainer.style.visibility = "visible";
    ip.focus();
    deviders.forEach((deviders)=>{
        deviders.style.visibility = "hidden";
    });
 });

 mbSearchClose.addEventListener('click', ()=>{
    mbSearchContainer.style.visibility = "hidden";
    ip.value = '';
    deviders.forEach((deviders)=>{
        deviders.style.visibility = "visible";
    });
 });

 mbSearchResult.addEventListener('click', ()=>{
    sval = ip.value.toLowerCase().replace(/\s+/g, '');
    ValueAndResults();
    ip.value = '';
 });

 mbSearchClear.addEventListener('click', ()=>{
    ip.value = '';
 });

 ip.onkeypress = function(event) {
        if (event.key === 'Enter') {
            sval = ip.value.toLowerCase().replace(/\s+/g, '');
          
            ip.value = '';
            ValueAndResults();
    };
};