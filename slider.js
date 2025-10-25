const left = document.querySelector('.left');
const right = document.querySelector('.right');
const slider = document.querySelector('.slider');
const images = document.querySelectorAll('.image')

let slideNumber = 1;
const length = images.length

//start for dots

const bottom = document.querySelector(".bottom");

for(let i=0; i<length; i++){
    const div = document.createElement('div');
    div.className = 'button';
    bottom.appendChild(div);
};

const buttons = document.querySelectorAll('.button');

buttons[0].style.backgroundColor = '#2C2D2D';

const resetbg = ()=>{
    buttons.forEach((button) =>{
        button.style.backgroundColor = 'transparent';
        button.addEventListener('mouseover',stopSlideShow);
       button.addEventListener('mouseout',startSlideShow);

    });
};

buttons.forEach((button, i) =>{
    button.addEventListener('click',()=>{
        resetbg();
        slider.style.transform = `translateX(-${i*850}px)`;
        slideNumber = i + 1;
        button.style.backgroundColor = '#2C2D2D';
    });
});




const changeColor = ()=>{
    resetbg();
    buttons[slideNumber-1].style.backgroundColor = '#2C2D2D';
};

//end dots

const nextSlide = ()=>{
 slider.style.transform = `translateX(-${slideNumber*850}px)`;
    slideNumber++;
};
const prevSlide = ()=>{
 slider.style.transform = `translateX(-${(slideNumber-2)*850}px)`;
    slideNumber--;
};
const getFirstSlide = ()=>{
     slider.style.transform = `translateX(0px)`;
    slideNumber = 1; 
};
const getLastSlide = ()=>{
     slider.style.transform = `translateX(-${(length-1)*850}px)`;
    slideNumber = length; 
};

right.addEventListener('click',()=>{
    slideNumber <length ? nextSlide() : getFirstSlide(); 
    changeColor();
});
left.addEventListener('click',()=>{
    slideNumber >1 ? prevSlide() : getLastSlide(); 
    changeColor();
});

//start auto Slider

let slideInterval;

const startSlideShow = () =>{
    slideInterval = setInterval(()=>{
      slideNumber <length ? nextSlide() : getFirstSlide();
      changeColor();   
    },1500);
};

const stopSlideShow = ()=>{
    clearInterval(slideInterval);
};

startSlideShow();

slider.addEventListener('mouseover',stopSlideShow);
slider.addEventListener('mouseout',startSlideShow);
right.addEventListener('mouseover',stopSlideShow);
right.addEventListener('mouseout',startSlideShow);
left.addEventListener('mouseover',stopSlideShow);
left.addEventListener('mouseout',startSlideShow);
