// Main JavaScript for Scribl.li Landing Page

// Mobile menu toggle
document.addEventListener('DOMContentLoaded', function () {
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const mobileMenu = document.getElementById('mobileMenu');

  if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener('click', function () {
      mobileMenu.classList.toggle('hidden');
      mobileMenu.classList.toggle('mobile-menu-enter');
    });
  }

  // Close mobile menu when clicking on a link
  const mobileLinks = mobileMenu.querySelectorAll('a');
  mobileLinks.forEach((link) => {
    link.addEventListener('click', function () {
      mobileMenu.classList.add('hidden');
    });
  });
});

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  });
});

// Navbar background on scroll
window.addEventListener('scroll', function () {
  const nav = document.querySelector('nav');
  if (window.scrollY > 50) {
    nav.classList.add('shadow-lg');
  } else {
    nav.classList.remove('shadow-lg');
  }
});

// Form validation for signup
function validateSignupForm() {
  const email = document.getElementById('email');
  const password = document.getElementById('password');
  const confirmPassword = document.getElementById('confirmPassword');

  let isValid = true;

  // Email validation
  if (!email.value.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
    showError(email, 'Please enter a valid email address');
    isValid = false;
  } else {
    hideError(email);
  }

  // Password validation
  if (password.value.length < 8) {
    showError(password, 'Password must be at least 8 characters');
    isValid = false;
  } else {
    hideError(password);
  }

  // Confirm password validation
  if (password.value !== confirmPassword.value) {
    showError(confirmPassword, 'Passwords do not match');
    isValid = false;
  } else {
    hideError(confirmPassword);
  }

  return isValid;
}

// Show error message
function showError(input, message) {
  const formGroup = input.parentElement;
  const error = formGroup.querySelector('.error-message') || document.createElement('small');
  error.className = 'error-message text-red-500 mt-1 block';
  error.textContent = message;

  if (!formGroup.querySelector('.error-message')) {
    formGroup.appendChild(error);
  }

  input.classList.add('border-red-500');
}

// Hide error message
function hideError(input) {
  const formGroup = input.parentElement;
  const error = formGroup.querySelector('.error-message');

  if (error) {
    error.remove();
  }

  input.classList.remove('border-red-500');
}

// Typing effect for hero section
function typeWriter(element, text, speed = 100) {
  let i = 0;
  element.innerHTML = '';

  function type() {
    if (i < text.length) {
      element.innerHTML += text.charAt(i);
      i++;
      setTimeout(type, speed);
    }
  }

  type();
}

// Initialize typing effect when page loads
window.addEventListener('load', function () {
  const heroTitle = document.querySelector('.hero-title');
  if (heroTitle) {
    // Uncomment to enable typing effect
    // typeWriter(heroTitle, heroTitle.textContent, 50);
  }
});

// Intersection Observer for fade-in animations
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px',
};

const observer = new IntersectionObserver(function (entries) {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('fade-in');
      observer.unobserve(entry.target);
    }
  });
}, observerOptions);

// Observe all sections
document.querySelectorAll('section').forEach((section) => {
  observer.observe(section);
});

// Add fade-in class to CSS
const style = document.createElement('style');
style.textContent = `
    .fade-in {
        opacity: 1;
        transform: translateY(0);
        transition: opacity 0.6s ease, transform 0.6s ease;
    }
    
    section {
        opacity: 0;
        transform: translateY(20px);
    }
`;
document.head.appendChild(style);

// Counter animation for statistics
function animateCounter(element, target, duration = 2000) {
  let start = 0;
  const increment = target / (duration / 16);

  function updateCounter() {
    start += increment;
    if (start < target) {
      element.textContent = Math.floor(start).toLocaleString();
      requestAnimationFrame(updateCounter);
    } else {
      element.textContent = target.toLocaleString();
    }
  }

  updateCounter();
}

// Initialize counters when they come into view
const counters = document.querySelectorAll('.counter');
counters.forEach((counter) => {
  const target = parseInt(counter.getAttribute('data-target'));
  const counterObserver = new IntersectionObserver(function (entries) {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animateCounter(entry.target, target);
        counterObserver.unobserve(entry.target);
      }
    });
  }, observerOptions);

  counterObserver.observe(counter);
});

// Newsletter signup
function handleNewsletterSignup(email) {
  // Show loading state
  const button = document.querySelector('.newsletter-btn');
  const originalText = button.textContent;
  button.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Subscribing...';
  button.disabled = true;

  // Simulate API call
  setTimeout(() => {
    button.innerHTML = '<i class="fas fa-check mr-2"></i>Subscribed!';
    button.classList.remove('bg-primary-600');
    button.classList.add('bg-green-600');

    // Reset after 3 seconds
    setTimeout(() => {
      button.textContent = originalText;
      button.disabled = false;
      button.classList.remove('bg-green-600');
      button.classList.add('bg-primary-600');
      document.getElementById('newsletter-email').value = '';
    }, 3000);
  }, 1500);
}

// Dark mode toggle
function toggleDarkMode() {
  document.body.classList.toggle('dark-mode');
  localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
}

// Load dark mode preference
if (localStorage.getItem('darkMode') === 'true') {
  document.body.classList.add('dark-mode');
}

// Performance monitoring
window.addEventListener('load', function () {
  if ('performance' in window) {
    const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
    console.log(`Page load time: ${loadTime}ms`);
  }
});
