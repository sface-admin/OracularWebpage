/* Oracular - main.js
   Contact form: by default uses a mailto fallback.
   To send through a hosted endpoint, set FORMSPREE_ENDPOINT below,
   e.g. https://formspree.io/f/abcdwxyz (create a form at formspree.io).
*/
var FORMSPREE_ENDPOINT = '';

(function () {
  'use strict';

  /* Mobile navigation */
  var toggle = document.getElementById('navToggle');
  var links = document.getElementById('navLinks');
  if (toggle && links) {
    toggle.addEventListener('click', function () {
      var open = links.classList.toggle('open');
      toggle.classList.toggle('active', open);
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    Array.prototype.forEach.call(links.querySelectorAll('a'), function (a) {
      a.addEventListener('click', function () {
        links.classList.remove('open');
        toggle.classList.remove('active');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* Scroll reveal */
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && revealEls.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    Array.prototype.forEach.call(revealEls, function (el) { io.observe(el); });
  } else {
    Array.prototype.forEach.call(revealEls, function (el) { el.classList.add('in'); });
  }

  /* Lightbox for process flow diagrams */
  var lightbox = document.getElementById('lightbox');
  var lbImg = document.getElementById('lightboxImg');
  var lbTitle = document.getElementById('lightboxTitle');
  var lbClose = document.getElementById('lightboxClose');
  function openLightbox(src, title) {
    if (!lightbox) return;
    lbImg.src = src;
    lbImg.alt = title || 'Process flow diagram';
    lbTitle.textContent = title || 'Process flow diagram';
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
    lbImg.src = '';
  }
  if (lightbox) {
    Array.prototype.forEach.call(document.querySelectorAll('[data-pfd]'), function (btn) {
      btn.addEventListener('click', function () {
        openLightbox(btn.getAttribute('data-pfd'), btn.getAttribute('data-title'));
      });
    });
    if (lbClose) lbClose.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', function (e) { if (e.target === lightbox) closeLightbox(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeLightbox(); });
  }

  /* Contact form */
  var form = document.getElementById('contactForm');
  var statusEl = document.getElementById('formStatus');
  function showStatus(msg, type) {
    if (!statusEl) return;
    statusEl.textContent = msg;
    statusEl.className = 'form-status ' + type;
  }
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = ((document.getElementById('name') || {}).value || '').trim();
      var email = ((document.getElementById('email') || {}).value || '').trim();
      var company = ((document.getElementById('company') || {}).value || '').trim();
      var message = ((document.getElementById('message') || {}).value || '').trim();
      if (!name || !email || !message) {
        showStatus('Please fill in your name, email and message.', 'err');
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showStatus('Please enter a valid email address.', 'err');
        return;
      }
      if (FORMSPREE_ENDPOINT) {
        showStatus('Sending...', 'ok');
        fetch(FORMSPREE_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify({ name: name, email: email, company: company, message: message })
        }).then(function (res) {
          if (res.ok) {
            showStatus('Thanks! Your message has been sent. We will get back to you shortly.', 'ok');
            form.reset();
          } else {
            showStatus('Something went wrong. Please email support@sface.no directly.', 'err');
          }
        }).catch(function () {
          showStatus('Something went wrong. Please email support@sface.no directly.', 'err');
        });
      } else {
        var subject = encodeURIComponent('Oracular website enquiry from ' + name);
        var body = encodeURIComponent('Name: ' + name + '\nEmail: ' + email + '\nCompany: ' + company + '\n\n' + message);
        window.location.href = 'mailto:support@sface.no?subject=' + subject + '&body=' + body;
        showStatus('Opening your email app - or email support@sface.no directly.', 'ok');
      }
    });
  }
})();