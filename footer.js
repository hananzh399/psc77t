document.addEventListener('DOMContentLoaded', function() {

    // --- Smooth Scroll to Top on Button Click ---
    const backToTopBtn = document.querySelector('.back-to-top-button');

    backToTopBtn.addEventListener('click', function(e) {
        e.preventDefault();
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    // --- Phone Link Click Handler ---
    const phoneLinks = document.querySelectorAll('.phone-link');

    const handlePhoneClick = (e) => {
        const isMobile = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

        if (!isMobile) {
            e.preventDefault();
            const href = e.currentTarget.getAttribute('href');
            if (href.startsWith('mailto:')) {
                 window.location.href = href;
                 return;
            }
            alert('Your device does not support making phone calls directly from the browser.');
        }
    };

    phoneLinks.forEach(link => {
        link.addEventListener('click', handlePhoneClick);
    });

});