/*!
 * Dental Zone Mianwali — site scripts
 * Header scroll state, scroll-reveal, reviews carousel, 3D tooth (Three.js),
 * gallery lightbox, FAQ accordion, language switcher, and WhatsApp-based
 * appointment booking with automatic doctor assignment.
 */
(function () {
  'use strict';

  /* =========================================================
     CONFIG
     ========================================================= */
  var CLINIC_PHONE_DISPLAY = '0300-6093493';

  /* =========================================================
     Header scroll state
     ========================================================= */
  var header = document.getElementById('site-header');
  window.addEventListener('scroll', function () {
    header.classList.toggle('scrolled', window.scrollY > 12);
  }, { passive: true });

  /* =========================================================
     Reduced motion preference
     ========================================================= */
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* =========================================================
     Scroll reveal
     ========================================================= */
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  document.querySelectorAll('[data-animate]').forEach(function (el, i) {
    el.style.transitionDelay = reduceMotion ? '0s' : (i % 6) * 0.05 + 's';
    io.observe(el);
  });

  /* =========================================================
     Mark decorative icons as hidden from assistive tech
     ========================================================= */
  document.querySelectorAll('.service-icon svg, .info-row .ico svg, .why-row .check, .logo .mark svg')
    .forEach(function (el) { el.setAttribute('aria-hidden', 'true'); });

  /* =========================================================
     Testimonial slider
     ========================================================= */
  var slides = Array.prototype.slice.call(document.querySelectorAll('.t-slide'));
  var dotsWrap = document.getElementById('t-dots');
  var active = 0;
  var tInterval;

  if (slides.length && dotsWrap) {
    slides.forEach(function (_, i) {
      var b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('aria-label', 'Show testimonial ' + (i + 1));
      if (i === 0) b.classList.add('active');
      b.addEventListener('click', function () { showSlide(i); });
      dotsWrap.appendChild(b);
    });

    function showSlide(i) {
      slides[active].classList.remove('active');
      dotsWrap.children[active].classList.remove('active');
      active = i;
      slides[active].classList.add('active');
      dotsWrap.children[active].classList.add('active');
    }

    function startAutoplay() {
      if (reduceMotion) return;
      tInterval = setInterval(function () { showSlide((active + 1) % slides.length); }, 5500);
    }

    startAutoplay();
    var slider = document.getElementById('t-slider');
    slider.addEventListener('mouseenter', function () { clearInterval(tInterval); });
    slider.addEventListener('mouseleave', startAutoplay);
  }

  /* =========================================================
     3D tooth (Three.js) — hero visual
     ========================================================= */
  function initTooth() {
    var canvas = document.getElementById('tooth-canvas');
    if (!canvas || typeof THREE === 'undefined') return;
    var container = canvas.parentElement;
    var scene = new THREE.Scene();

    var camera = new THREE.PerspectiveCamera(38, container.clientWidth / container.clientHeight, 0.1, 100);
    camera.position.set(0, 0.4, 7.2);

    var renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);

    scene.add(new THREE.AmbientLight(0xffffff, 0.55));
    var key = new THREE.DirectionalLight(0xffffff, 1.1);
    key.position.set(4, 6, 6);
    scene.add(key);
    var rim = new THREE.DirectionalLight(0x8fd0ab, 0.7);
    rim.position.set(-5, -2, -4);
    scene.add(rim);
    var warm = new THREE.PointLight(0xd9a441, 0.5, 20);
    warm.position.set(-3, -3, 4);
    scene.add(warm);

    var tooth = new THREE.Group();
    var enamelMat = new THREE.MeshStandardMaterial({ color: 0xf8faf6, roughness: 0.28, metalness: 0.04 });

    var crownGeo = new THREE.SphereGeometry(1.5, 48, 48);
    crownGeo.scale(1, 0.72, 1.05);
    var posAttr = crownGeo.attributes.position;
    for (var i = 0; i < posAttr.count; i++) {
      var y = posAttr.getY(i);
      if (y > 0.5) {
        var x = posAttr.getX(i), z = posAttr.getZ(i);
        posAttr.setY(i, y + Math.sin(x * 3) * Math.cos(z * 3) * 0.06);
      }
    }
    crownGeo.computeVertexNormals();
    var crown = new THREE.Mesh(crownGeo, enamelMat);
    crown.position.y = 1.15;
    tooth.add(crown);

    var rootGeo = new THREE.CylinderGeometry(0.42, 0.05, 2.4, 24);
    var rootL = new THREE.Mesh(rootGeo, enamelMat);
    rootL.position.set(-0.55, -1.15, 0);
    rootL.rotation.z = 0.16;
    tooth.add(rootL);
    var rootR = new THREE.Mesh(rootGeo, enamelMat);
    rootR.position.set(0.55, -1.15, 0);
    rootR.rotation.z = -0.16;
    tooth.add(rootR);

    var neckGeo = new THREE.SphereGeometry(1.05, 32, 32);
    neckGeo.scale(1, 0.4, 0.9);
    var neck = new THREE.Mesh(neckGeo, enamelMat);
    neck.position.y = 0.15;
    tooth.add(neck);

    tooth.scale.setScalar(1.15);
    scene.add(tooth);

    var shadowGeo = new THREE.CircleGeometry(1.9, 48);
    var shadowMat = new THREE.MeshBasicMaterial({ color: 0x0b3d2e, transparent: true, opacity: 0.12 });
    var shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    shadowMesh.rotation.x = -Math.PI / 2;
    shadowMesh.position.y = -2.75;
    scene.add(shadowMesh);

    var dragging = false, lastX = 0, lastY = 0;
    var velX = 0.004, velY = 0;

    function pointerDown(x, y) { dragging = true; lastX = x; lastY = y; }
    function pointerMove(x, y) {
      if (!dragging) return;
      var dx = x - lastX, dy = y - lastY;
      velY = dx * 0.005;
      velX = dy * 0.005;
      tooth.rotation.y += velY;
      tooth.rotation.x += velX;
      lastX = x; lastY = y;
    }
    function pointerUp() { dragging = false; }

    canvas.addEventListener('mousedown', function (e) { pointerDown(e.clientX, e.clientY); });
    window.addEventListener('mousemove', function (e) { pointerMove(e.clientX, e.clientY); });
    window.addEventListener('mouseup', pointerUp);
    canvas.addEventListener('touchstart', function (e) { var t = e.touches[0]; pointerDown(t.clientX, t.clientY); }, { passive: true });
    canvas.addEventListener('touchmove', function (e) { var t = e.touches[0]; pointerMove(t.clientX, t.clientY); }, { passive: true });
    canvas.addEventListener('touchend', pointerUp);

    function animate() {
      requestAnimationFrame(animate);
      if (!dragging) {
        if (!reduceMotion) { tooth.rotation.y += velY; tooth.rotation.x += velX; }
        velY *= 0.965;
        velX *= 0.965;
        if (Math.abs(velY) < 0.0035 && !reduceMotion) velY = 0.0035;
      }
      tooth.rotation.x = Math.max(-0.6, Math.min(0.6, tooth.rotation.x));
      renderer.render(scene, camera);
    }
    animate();

    window.addEventListener('resize', function () {
      var w = container.clientWidth, h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    });
  }

  // Defer the 3D scene very slightly so it never blocks first paint / LCP.
  if ('requestIdleCallback' in window) {
    requestIdleCallback(initTooth, { timeout: 1500 });
  } else {
    window.addEventListener('load', initTooth);
  }

  /* =========================================================
     Doctor auto-assignment map (Service -> one or more Doctors)
     When a service is offered by exactly one doctor, that doctor is
     shown automatically. When more than one doctor offers the same
     service, a "Select Doctor" dropdown appears so the patient can
     choose between them.
     ========================================================= */
  var SERVICE_DOCTORS = {
    'Consultation': ['Dr. Hanif Niazi'],
    'Tooth Extraction': ['Dr. Hanif Niazi'],
    'Scaling and Polishing': ['Dr. Hanif Niazi', 'Dr. Saad Abdullah', 'Dr. Tehseen Khatoon'],
    'Tooth-Colored (Composite) Filling': ['Dr. Hanif Niazi'],
    'Silver (Amalgam) Filling': ['Dr. Hanif Niazi'],
    'Cosmetic Dentistry': ['Dr. Hanif Niazi'],
    'Root Canal Treatment': ['Dr. Saad Abdullah'],
    'Braces': ['Dr. Arshad Malik'],
    'Invisible Aligners': ['Dr. Arshad Malik'],
    'Retainers': ['Dr. Arshad Malik'],
    'Extractions': ['Dr. Saad Abdullah', 'Dr. Tehseen Khatoon'],
    'Fillings': ['Dr. Saad Abdullah', 'Dr. Tehseen Khatoon'],
    'Crowns & Bridges': ['Dr. Saad Abdullah', 'Dr. Tehseen Khatoon'],
    'Partial Dentures': ['Dr. Saad Abdullah', 'Dr. Tehseen Khatoon'],
    'Complete Dentures': ['Dr. Saad Abdullah', 'Dr. Tehseen Khatoon']
  };

  var CLINIC_WHATSAPP = '923187520272'; // 0318-7520272 in international format, no + or leading 0

  /* =========================================================
     Appointment booking — WhatsApp submission
     ========================================================= */
  var form = document.getElementById('booking-form');
  if (form) {
    var submitBtn = form.querySelector('[data-submit-btn]');
    var statusBox = document.getElementById('form-status');
    var assignedBox = document.getElementById('assigned-doctor-box');
    var doctorSelectField = document.getElementById('doctor-select-field');
    var doctorSelect = document.getElementById('p-doctor');
    var fridayWarning = document.getElementById('friday-warning');
    var isSubmitting = false;
    var lastSubmitAt = 0;

    var fields = {
      name: form.querySelector('#p-name'),
      phone: form.querySelector('#p-phone'),
      service: form.querySelector('#p-service'),
      doctor: form.querySelector('#p-doctor'),
      date: form.querySelector('#p-date'),
      time: form.querySelector('#p-time'),
      honeypot: form.querySelector('#company')
    };

    function setFieldError(field, message) {
      var errorEl = document.getElementById(field.id + '-error');
      if (errorEl) errorEl.textContent = message || '';
      field.setAttribute('aria-invalid', message ? 'true' : 'false');
    }

    function sanitize(value) {
      return String(value || '').trim().replace(/[<>]/g, '');
    }

    function isValidPhone(value) {
      return /^[0-9+\-\s()]{7,16}$/.test(value);
    }

    function isFriday(dateStr) {
      if (!dateStr) return false;
      var d = new Date(dateStr + 'T00:00:00');
      return d.getDay() === 5; // 0 = Sunday ... 5 = Friday
    }

    function isPastDate(dateStr) {
      if (!dateStr) return false;
      var chosen = new Date(dateStr + 'T00:00:00');
      var today = new Date();
      today.setHours(0, 0, 0, 0);
      return chosen < today;
    }

    function getCurrentLang() {
      return document.documentElement.getAttribute('lang') === 'ur' ? 'ur' : 'en';
    }

    function populateDoctorSelect(doctors) {
      if (!doctorSelect) return;
      var lang = getCurrentLang();
      doctorSelect.innerHTML = '';
      var placeholder = document.createElement('option');
      placeholder.value = '';
      placeholder.textContent = lang === 'ur' ? 'ایک ڈاکٹر منتخب کریں' : 'Choose a doctor';
      doctorSelect.appendChild(placeholder);
      doctors.forEach(function (name) {
        var opt = document.createElement('option');
        opt.value = name;
        opt.textContent = name;
        doctorSelect.appendChild(opt);
      });
    }

    function updateAssignedDoctor() {
      var service = fields.service.value;
      var doctors = SERVICE_DOCTORS[service];

      if (!doctors) {
        if (assignedBox) assignedBox.hidden = true;
        if (doctorSelectField) doctorSelectField.hidden = true;
        return;
      }

      if (doctors.length === 1) {
        // Exactly one doctor performs this service — auto-assign, no picker needed.
        if (assignedBox) {
          assignedBox.hidden = false;
          assignedBox.innerHTML = 'This appointment will be assigned to <strong>' + doctors[0] + '</strong>.';
        }
        if (doctorSelectField) doctorSelectField.hidden = true;
        if (doctorSelect) doctorSelect.value = '';
        if (fields.doctor) setFieldError(fields.doctor, '');
      } else {
        // More than one doctor offers this service — let the patient choose.
        if (assignedBox) assignedBox.hidden = true;
        if (doctorSelectField) doctorSelectField.hidden = false;
        populateDoctorSelect(doctors);
      }
    }

    function checkFriday() {
      var showWarning = isFriday(fields.date.value);
      if (fridayWarning) fridayWarning.classList.toggle('show', showWarning);
      return showWarning;
    }

    if (fields.service) {
      updateAssignedDoctor();
      fields.service.addEventListener('change', updateAssignedDoctor);
    }
    if (fields.date) {
      fields.date.addEventListener('change', checkFriday);
    }

    function showStatus(type, message) {
      statusBox.textContent = message;
      statusBox.className = 'form-status ' + type;
      statusBox.hidden = false;
    }

    function setLoading(loading) {
      isSubmitting = loading;
      submitBtn.disabled = loading;
      submitBtn.classList.toggle('is-loading', loading);
    }

    function validateForm(data) {
      var valid = true;

      if (!data.name) { setFieldError(fields.name, 'Full name is required.'); valid = false; }
      else setFieldError(fields.name, '');

      if (!data.phone) { setFieldError(fields.phone, 'Phone number is required.'); valid = false; }
      else if (!isValidPhone(data.phone)) { setFieldError(fields.phone, 'Enter a valid phone number.'); valid = false; }
      else setFieldError(fields.phone, '');

      if (!data.service) { setFieldError(fields.service, 'Please choose a service.'); valid = false; }
      else setFieldError(fields.service, '');

      if (!data.date) { setFieldError(fields.date, 'Please choose a preferred date.'); valid = false; }
      else if (isPastDate(data.date)) { setFieldError(fields.date, 'Please choose today or a future date.'); valid = false; }
      else setFieldError(fields.date, '');

      if (!data.time) { setFieldError(fields.time, 'Please choose a preferred time.'); valid = false; }
      else setFieldError(fields.time, '');

      if (doctorSelectField && !doctorSelectField.hidden) {
        if (!data.doctor) {
          if (fields.doctor) setFieldError(fields.doctor, 'Please choose a doctor.');
          valid = false;
        } else if (fields.doctor) {
          setFieldError(fields.doctor, '');
        }
      }

      return valid;
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      if (isSubmitting) return;
      if (Date.now() - lastSubmitAt < 6000) {
        showStatus('error', 'Please wait a few seconds before trying again.');
        return;
      }

      var data = {
        name: sanitize(fields.name.value),
        phone: sanitize(fields.phone.value),
        service: fields.service.value,
        doctor: fields.doctor ? fields.doctor.value : '',
        date: sanitize(fields.date.value),
        time: sanitize(fields.time.value),
        honeypot: fields.honeypot ? fields.honeypot.value : ''
      };

      // Silent bot trap
      if (data.honeypot) {
        form.reset();
        showStatus('success', 'Appointment request submitted successfully.');
        return;
      }

      if (!validateForm(data)) {
        showStatus('error', 'Please fix the highlighted fields and try again.');
        return;
      }

      // Hard block: Friday is closed
      if (isFriday(data.date)) {
        checkFriday();
        showStatus('error', 'The clinic is closed on Fridays. Please select another date.');
        return;
      }

      var possibleDoctors = SERVICE_DOCTORS[data.service] || [];
      var doctor = possibleDoctors.length === 1 ? possibleDoctors[0] : (data.doctor || 'Our team');

      setLoading(true);
      statusBox.hidden = true;
      lastSubmitAt = Date.now();

      var message =
        'New Appointment\n' +
        'Patient Name: ' + data.name + '\n' +
        'Phone Number: ' + data.phone + '\n' +
        'Selected Service: ' + data.service + '\n' +
        'Assigned Doctor: ' + doctor + '\n' +
        'Preferred Date: ' + data.date + '\n' +
        'Preferred Time: ' + data.time;

      var waUrl = 'https://wa.me/' + CLINIC_WHATSAPP + '?text=' + encodeURIComponent(message);

      showStatus('success', 'Opening WhatsApp to confirm your appointment with ' + doctor + '…');
      window.open(waUrl, '_blank', 'noopener');

      setTimeout(function () {
        form.reset();
        if (assignedBox) assignedBox.hidden = true;
        if (doctorSelectField) doctorSelectField.hidden = true;
        if (fridayWarning) fridayWarning.classList.remove('show');
        setLoading(false);
      }, 900);
    });
  }

  /* =========================================================
     FAQ accordion
     ========================================================= */
  document.querySelectorAll('.faq-item').forEach(function (item) {
    var btn = item.querySelector('.faq-question');
    var answer = item.querySelector('.faq-answer');
    if (!btn || !answer) return;
    btn.addEventListener('click', function () {
      var isOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item.open').forEach(function (openItem) {
        openItem.classList.remove('open');
        openItem.querySelector('.faq-answer').style.maxHeight = null;
        openItem.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
      });
      if (!isOpen) {
        item.classList.add('open');
        answer.style.maxHeight = answer.scrollHeight + 'px';
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });

  /* =========================================================
     Gallery lightbox
     ========================================================= */
  (function initLightbox() {
    var items = Array.prototype.slice.call(document.querySelectorAll('.gallery-item img'));
    if (!items.length) return;

    var overlay = document.getElementById('lightbox');
    var imgEl = document.getElementById('lightbox-img');
    var captionEl = document.getElementById('lightbox-caption');
    var current = 0;

    function open(i) {
      current = i;
      render();
      overlay.classList.add('open');
      document.body.style.overflow = 'hidden';
    }
    function close() {
      overlay.classList.remove('open');
      document.body.style.overflow = '';
    }
    function render() {
      var el = items[current];
      imgEl.src = el.currentSrc || el.src;
      imgEl.alt = el.alt;
      captionEl.textContent = el.alt;
    }
    function next() { current = (current + 1) % items.length; render(); }
    function prev() { current = (current - 1 + items.length) % items.length; render(); }

    items.forEach(function (img, i) {
      img.closest('.gallery-item').addEventListener('click', function () { open(i); });
    });

    document.getElementById('lightbox-close').addEventListener('click', close);
    document.getElementById('lightbox-next').addEventListener('click', next);
    document.getElementById('lightbox-prev').addEventListener('click', prev);
    overlay.addEventListener('click', function (e) { if (e.target === overlay) close(); });
    window.addEventListener('keydown', function (e) {
      if (!overlay.classList.contains('open')) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft') prev();
    });
  })();

  /* =========================================================
     Language switcher (English / Urdu)
     ========================================================= */
  (function initLangSwitch() {
    var buttons = document.querySelectorAll('[data-lang-btn]');
    if (!buttons.length) return;

    function applyLang(lang) {
      document.querySelectorAll('[data-en]').forEach(function (el) {
        var text = lang === 'ur' ? el.getAttribute('data-ur') : el.getAttribute('data-en');
        if (text !== null) el.textContent = text;
      });
      document.body.classList.toggle('lang-ur', lang === 'ur');
      buttons.forEach(function (b) {
        b.classList.toggle('active', b.getAttribute('data-lang-btn') === lang);
      });
      document.documentElement.setAttribute('lang', lang === 'ur' ? 'ur' : 'en');
    }

    buttons.forEach(function (b) {
      b.addEventListener('click', function () { applyLang(b.getAttribute('data-lang-btn')); });
    });
  })();
})();
