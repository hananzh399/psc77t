document.addEventListener('DOMContentLoaded', function() {
  let valueDisplays = document.querySelectorAll(".num");
  let interval = 2000;

  // Create an Intersection Observer
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Start the counter when element is visible
        startCounter(entry.target);
        // Stop observing after animation starts
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.5 // Trigger when 50% of element is visible
  });

  // Function to start the counter animation
  function startCounter(valueDisplay) {
    let startValue = 0;
    let endValue = parseInt(valueDisplay.getAttribute("data-val"));
    let duration = Math.floor(interval / endValue);
    
    let counter = setInterval(function() {
      startValue += 1;
      valueDisplay.textContent = startValue + '+';
      if (startValue == endValue) {
        clearInterval(counter);
      }
    }, duration);
  }

  // Observe all counter elements
  valueDisplays.forEach(display => {
    observer.observe(display);
  });

  // Fallback for browsers without IntersectionObserver
  if (!('IntersectionObserver' in window)) {
    valueDisplays.forEach(display => {
      startCounter(display);
    });
  }
});