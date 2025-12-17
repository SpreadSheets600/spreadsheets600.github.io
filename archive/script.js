document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener("click", function(e) {
      e.preventDefault();
      document.querySelector(this.getAttribute("href")).scrollIntoView({
        behavior: "smooth"
      });
    });
  });
  
  // Load particles.js
  particlesJS.load('particles-js', 'particles.json', function() {
    console.log('particles.js loaded');
  });
  