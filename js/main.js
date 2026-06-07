// Logistica Global - Shared Script

document.addEventListener('DOMContentLoaded', () => {
  // 1. Mobile Menu Toggle
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const closeMobileMenu = document.getElementById('closeMobileMenu');
  const mobileMenu = document.getElementById('mobileMenu');
  const mobileOverlay = document.getElementById('mobileOverlay');
  const mobileLinks = document.querySelectorAll('.mobile-link');

  function toggleMenu(open) {
    if (open) {
      mobileMenu.classList.add('open');
      mobileOverlay.classList.remove('hidden');
      mobileOverlay.classList.add('open');
      mobileMenuBtn.setAttribute('aria-expanded', 'true');
    } else {
      mobileMenu.classList.remove('open');
      mobileOverlay.classList.add('hidden');
      mobileOverlay.classList.remove('open');
      mobileMenuBtn.setAttribute('aria-expanded', 'false');
    }
  }

  if (mobileMenuBtn && closeMobileMenu && mobileMenu && mobileOverlay) {
    mobileMenuBtn.addEventListener('click', () => toggleMenu(true));
    closeMobileMenu.addEventListener('click', () => toggleMenu(false));
    mobileOverlay.addEventListener('click', () => toggleMenu(false));

    // Close menu when clicking a link
    mobileLinks.forEach(link => {
      link.addEventListener('click', () => toggleMenu(false));
    });
  }

  // 2. Active Link Highlighting
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  const navLinks = document.querySelectorAll('.nav-link, .mobile-link');

  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPath || (currentPath === 'index.html' && href === '/')) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });

  // 3. Scroll Fade-in Animations (Intersection Observer)
  const fadeElements = document.querySelectorAll('.fade-in, .slide-up');
  
  if ('IntersectionObserver' in window) {
    const observerOptions = {
      root: null,
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    fadeElements.forEach(el => observer.observe(el));
  } else {
    // Fallback for older browsers
    fadeElements.forEach(el => el.classList.add('visible'));
  }

  // 4. FAQ Accordion Logic
  const accordionBtns = document.querySelectorAll('.accordion-btn');

  accordionBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const isExpanded = btn.getAttribute('aria-expanded') === 'true';
      
      // Close other accordions in the same section
      const siblingAccordions = btn.closest('.space-y-4').querySelectorAll('.accordion-btn');
      siblingAccordions.forEach(sibBtn => {
        if (sibBtn !== btn) {
          sibBtn.setAttribute('aria-expanded', 'false');
          const sibContent = sibBtn.nextElementSibling;
          if (sibContent) sibContent.classList.remove('open');
          const sibIcon = sibBtn.querySelector('.accordion-icon');
          if (sibIcon) sibIcon.classList.remove('rotated');
        }
      });

      // Toggle current accordion
      btn.setAttribute('aria-expanded', !isExpanded);
      const content = btn.nextElementSibling;
      if (content) content.classList.toggle('open');
      const icon = btn.querySelector('.accordion-icon');
      if (icon) icon.classList.toggle('rotated');
    });
  });

  // 5. Multi-step Quote Form (quote.html)
  const quoteForm = document.getElementById('freightQuoteForm');
  if (quoteForm) {
    const steps = quoteForm.querySelectorAll('.form-step');
    const stepIndicators = document.querySelectorAll('.step-circle');
    const stepLines = document.querySelectorAll('.step-line');
    const nextButtons = quoteForm.querySelectorAll('.next-step');
    const prevButtons = quoteForm.querySelectorAll('.prev-step');

    // Utility validation function
    function validateStep(stepNum) {
      const activeStepEl = quoteForm.querySelector(`[data-form-step="${stepNum}"]`);
      const inputs = activeStepEl.querySelectorAll('[required]');
      let isValid = true;

      inputs.forEach(input => {
        if (!input.checkValidity()) {
          isValid = false;
          input.reportValidity();
          // Visual warning
          input.classList.add('border-red-500');
          input.addEventListener('input', function onInput() {
            if (input.checkValidity()) {
              input.classList.remove('border-red-500');
              input.removeEventListener('input', onInput);
            }
          });
        }
      });

      return isValid;
    }

    // Set step function
    function setStep(stepNum) {
      steps.forEach(step => {
        const stepIndex = parseInt(step.getAttribute('data-form-step'));
        if (stepIndex === stepNum) {
          step.classList.remove('hidden');
          step.classList.add('active');
        } else {
          step.classList.add('hidden');
          step.classList.remove('active');
        }
      });

      // Update indicators
      stepIndicators.forEach(indicator => {
        const indNum = parseInt(indicator.getAttribute('data-step-num'));
        if (indNum < stepNum) {
          indicator.classList.remove('active');
          indicator.classList.add('completed');
        } else if (indNum === stepNum) {
          indicator.classList.add('active');
          indicator.classList.remove('completed');
        } else {
          indicator.classList.remove('active', 'completed');
        }
      });

      // Update progress lines
      stepLines.forEach((line, index) => {
        if (index < stepNum - 1) {
          line.classList.add('active');
        } else {
          line.classList.remove('active');
        }
      });

      // Scroll form into view
      quoteForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    // Bind next step triggers
    nextButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const currentStep = parseInt(btn.closest('.form-step').getAttribute('data-form-step'));
        const nextStep = parseInt(btn.getAttribute('data-next'));

        if (validateStep(currentStep)) {
          setStep(nextStep);
        }
      });
    });

    // Bind prev step triggers
    prevButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const prevStep = parseInt(btn.getAttribute('data-prev'));
        setStep(prevStep);
      });
    });

    // Form submission
    quoteForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const currentStep = 3;
      if (validateStep(currentStep)) {
        // Show loading state
        const submitBtn = quoteForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = 'Sending Quote Request...';
        submitBtn.disabled = true;

        setTimeout(() => {
          // Replace form content with success screen
          quoteForm.innerHTML = `
            <div class="text-center py-12 px-6">
              <div class="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-green-500">
                <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <h2 class="text-2xl font-bold text-[#0a1628] mb-3">Quote Request Submitted!</h2>
              <p class="text-gray-600 mb-8 max-w-md mx-auto">
                Thank you for choosing Logistica Global. Our freight logistics team is reviewing your shipment details and will respond with a custom quote within 24 hours.
              </p>
              <div class="space-y-4">
                <p class="text-sm text-gray-500">Reference Number: <span class="font-semibold text-[#0a1628]">LG-${Math.floor(100000 + Math.random() * 900000)}</span></p>
                <div class="flex gap-4 justify-center">
                  <a href="index.html" class="btn-primary">Return Home</a>
                  <a href="services.html" class="btn-navy">Our Services</a>
                </div>
              </div>
            </div>
          `;
        }, 1500);
      }
    });
  }

  // 6. Contact Form handler (contact.html)
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const submitBtn = contactForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;
      submitBtn.innerHTML = 'Sending Message...';
      submitBtn.disabled = true;

      setTimeout(() => {
        contactForm.innerHTML = `
          <div class="text-center py-8">
            <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-green-500">
              <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h3 class="text-xl font-bold text-[#0a1628] mb-2">Message Sent Successfully!</h3>
            <p class="text-gray-600 mb-6">Our regional coordinator will contact you shortly.</p>
            <a href="index.html" class="btn-primary">Back to Home</a>
          </div>
        `;
      }, 1200);
    });
  }
});
