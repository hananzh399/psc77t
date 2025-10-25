 document.addEventListener('DOMContentLoaded', function() {
            const slider = document.querySelector('.slider');
            const slides = document.querySelectorAll('.slide');
            const prevBtn = document.querySelector('.prev-btn');
            const nextBtn = document.querySelector('.next-btn');
            const dots = document.querySelectorAll('.slider-dot');
            
            let currentIndex = 0;
            const totalSlides = slides.length;
            
            function updateSlider() {
                slider.style.transform = `translateX(-${currentIndex * 100}%)`;
                
                // Update dots
                dots.forEach(dot => dot.classList.remove('active'));
                dots[currentIndex].classList.add('active');
            }
            
            function nextSlide() {
                currentIndex = (currentIndex + 1) % totalSlides;
                updateSlider();
            }
            
            function prevSlide() {
                currentIndex = (currentIndex - 1 + totalSlides) % totalSlides;
                updateSlider();
            }
            
            // Auto-advance slides every 1.5 seconds
            let slideInterval = setInterval(nextSlide, 1500);
            
            // Reset interval when user interacts
            function resetInterval() {
                clearInterval(slideInterval);
                slideInterval = setInterval(nextSlide, 1500);
            }
            
            // Button click handlers
            nextBtn.addEventListener('click', () => {
                nextSlide();
                resetInterval();
            });
            
            prevBtn.addEventListener('click', () => {
                prevSlide();
                resetInterval();
            });
            
            // Dot click handlers
            dots.forEach(dot => {
                dot.addEventListener('click', () => {
                    currentIndex = parseInt(dot.getAttribute('data-index'));
                    updateSlider();
                    resetInterval();
                });
            });
            
            // Pause on hover
            slider.addEventListener('mouseenter', () => {
                clearInterval(slideInterval);
            });
            
            slider.addEventListener('mouseleave', resetInterval);
            
            // Keyboard navigation
            document.addEventListener('keydown', (e) => {
                if (e.key === 'ArrowRight') {
                    nextSlide();
                    resetInterval();
                } else if (e.key === 'ArrowLeft') {
                    prevSlide();
                    resetInterval();
                }
            });
        });