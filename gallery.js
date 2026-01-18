{
let image = document.querySelectorAll('.images');
const expendedImg = document.querySelector('#expendedImg');
const closeBtn = document.querySelector('.close-btn');
let description = document.querySelector('.description');

let currentIndex = 0;
function showImage(index){
    currentIndex = index;
    const img = image[index];
    expendedImg.src = img.src;
    description.innerText = img.alt;
    let imageNumber = document.querySelector('.image-number');
        imageNumber.innerText = (index + 1) + ' / ' + image.length;
}
closeBtn.addEventListener('click', ()=>{
    let open = document.querySelector('.open');
    open.style.display = 'none';
     clearInterval(loopInterval);
        loopInterval = null;
        document.querySelector('.loop').style.color = '';
});

function open(){
    let open = document.querySelector('.open');
    open.style.display = 'flex';
}

image.forEach(function(img,index) {
    let desc = img.alt;
    img.addEventListener('mouseenter', ()=>{
        img.style.opacity = '0.6';
        let caption = document.createElement('div');
        caption.className = 'caption';
        caption.innerText = desc;

        img.parentElement.appendChild(caption);
        document.querySelector('.shrink').style.display = 'none';
    });

    img.addEventListener('mouseout', ()=>{
        img.style.opacity = '1';
        let caption = img.parentElement.querySelector('.caption');
        if(caption){
            caption.remove();
        };
    });

    img.addEventListener('click', () => {
        open();
        showImage(index);
    });

});

function nextImage(){
    currentIndex = (currentIndex + 1) % image.length;
    showImage(currentIndex);
};

function prevImage(){
   currentIndex = (currentIndex - 1 + image.length) % image.length;
   showImage(currentIndex);
}

document.querySelector('.arrow-right').addEventListener('click', () => {
    nextImage();
});

document.querySelector('.arrow-left').addEventListener('click', () => {
    prevImage();
});

let loopInterval = null;
document.querySelector('.loop').addEventListener('click', () => {
    if(loopInterval){
        clearInterval(loopInterval);
        loopInterval = null;
        document.querySelector('.loop').style.color = '';
    }else{
        loopInterval = setInterval(nextImage, 2000);
        document.querySelector('.loop').style.color = 'green';
    };
});

document.querySelector('.expand').addEventListener('click', () => {
    expendedImg.style.width = '100%';
    expendedImg.style.height = '100%';
    document.querySelector('.expand').style.display = 'none';
    document.querySelector('.shrink').style.display = 'block';
});

document.querySelector('.shrink').addEventListener('click', () => {
    expendedImg.style.width = 'auto';
    expendedImg.style.height = 'auto';
     document.querySelector('.expand').style.display = 'block';
    document.querySelector('.shrink').style.display = 'none';
});

document.querySelector('.increase-size').addEventListener('click', () => {
    let buttons = document.querySelectorAll('.buttons');
    buttons.forEach((btn) => {
        btn.style.display = 'none';
    });
    expendedImg.style.width = '100vw';
    expendedImg.style.height = '100vh';
    expendedImg.style.objectFit = 'cover';

    expendedImg.style.top = '0';
    expendedImg.style.left = '0';
    expendedImg.style.bottom = '0';
    expendedImg.style.right = '0';
    expendedImg.style.position = 'fixed';

    expendedImg.style.margin = '0';
    expendedImg.style.maxWidth = 'none';
    expendedImg.style.maxHeight = 'none';

    document.querySelector('.decrease-size').style.setProperty('display', 'block', 'important');
    document.querySelector('.decrease-size').style.color = 'white';
    document.querySelector('.decrease-size').style.backgroundColor = 'grey';
    document.querySelector('.decrease-size').style.right = '20px';
});
document.querySelector('.decrease-size').addEventListener('click', () => {
    let buttons = document.querySelectorAll('.buttons');
    buttons.forEach((btn) => {
        btn.style.display = 'block';
    });
    expendedImg.style.width = 'auto';
    expendedImg.style.height = 'auto';
    expendedImg.style.maxWidth = '80vw';
    expendedImg.style.maxHeight = '80vh';
    expendedImg.style.position = 'relative';
    expendedImg.style.top = '';
    expendedImg.style.left = '';
    expendedImg.style.bottom = '';
    expendedImg.style.right = '';
    expendedImg.style.margin = 'auto';

    document.querySelector('.decrease-size').style.setProperty('display', 'none', 'important');
    document.querySelector('.shrink').style.display = 'none';
});

let tuchStartX = 0;
let touchEndX = 0;

expendedImg.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
}, {passive: true});

expendedImg.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleTouch();
}, {passive: true});

function handleTouch(){
    if(touchStartX < touchEndX - 50){
        prevImage();
    }
    if(touchStartX > touchEndX + 50){
        nextImage();
    }
}
}
