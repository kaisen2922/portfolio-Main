/* ============================================
   PORTFOLIO JS — Joydip Acharjee
   ============================================ */

'use strict';

/**
 * 1. CUSTOM CURSOR (SMART & SMOOTH)
 */
const cursorDot = document.querySelector('.cursor-dot');
const cursorGlow = document.querySelector('.cursor-glow');
const cursorRing = document.querySelector('.cursor-ring');

let mouseX = 0, mouseY = 0;
let dotX = 0, dotY = 0;
let ringX = 0, ringY = 0;

document.addEventListener('mousemove', (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
});

function tickCursor() {
  dotX += (mouseX - dotX) * 0.25;
  dotY += (mouseY - dotY) * 0.25;
  ringX += (mouseX - ringX) * 0.15;
  ringY += (mouseY - ringY) * 0.15;

  if (cursorDot) cursorDot.style.transform = `translate(${dotX}px, ${dotY}px)`;
  if (cursorGlow) { cursorGlow.style.left = mouseX + 'px'; cursorGlow.style.top = mouseY + 'px'; }
  if (cursorRing) { cursorRing.style.left = ringX + 'px'; cursorRing.style.top = ringY + 'px'; }
  
  requestAnimationFrame(tickCursor);
}
tickCursor();

// Hover interactions for cursor
const hoverTargets = 'a, button, .project-card, .process-card, .experience-card, .cert-card, .map-hotspot, .js-profile-trigger, .luffy-avatar, .q-link';
document.querySelectorAll(hoverTargets).forEach(el => {
  el.addEventListener('mouseenter', () => {
    if (cursorRing) cursorRing.style.transform = 'translate(-50%, -50%) scale(1.5)';
    if (cursorGlow) { cursorGlow.style.width = '100px'; cursorGlow.style.height = '100px'; }
  });
  el.addEventListener('mouseleave', () => {
    if (cursorRing) cursorRing.style.transform = 'translate(-50%, -50%) scale(1)';
    if (cursorGlow) { cursorGlow.style.width = '60px'; cursorGlow.style.height = '60px'; }
  });
});


/**
 * 2. NAVIGATION (SMART & RESPONSIVE)
 */
const nav = document.querySelector('nav');
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');
const navAnchors = document.querySelectorAll('.nav-links a');
const sections = document.querySelectorAll('section[id]');

// Mobile Menu
if (hamburger && navLinks) {
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    navLinks.classList.toggle('open');
  });
  navAnchors.forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('open');
      navLinks.classList.remove('open');
    });
  });
}

// Scroll Effects (Shrink + Active Highlight)
window.addEventListener('scroll', () => {
  // Shrink Logic
  if (nav) {
    if (window.scrollY > 50) {
      nav.style.padding = '12px 5%';
      nav.style.background = 'rgba(15,0,0,0.95)';
      nav.style.backdropFilter = 'blur(15px)';
      nav.style.borderBottom = '1px solid var(--glass-border)';
    } else {
      nav.style.padding = '24px 5%';
      nav.style.background = 'linear-gradient(to bottom, rgba(15,0,0,0.9) 0%, transparent 100%)';
      nav.style.backdropFilter = 'blur(6px)';
      nav.style.borderBottom = 'none';
    }
  }

  // Active Highlight
  let current = "";
  sections.forEach(section => {
    const sectionTop = section.offsetTop;
    if (window.scrollY >= sectionTop - 150) {
      current = section.getAttribute("id");
    }
  });
  navAnchors.forEach(link => {
    link.classList.remove("active");
    if (link.getAttribute("href") === `#${current}`) link.classList.add("active");
  });
});


/**
 * 3. UNIFIED MODAL SYSTEM (Profile, Projects & Advanced Skill Breakdowns)
 */
const profileModal = document.querySelector('#profile-modal');
const projectModal = document.querySelector('#project-modal');
const pmTitle = document.querySelector('#pm-title');
const pmDesc = document.querySelector('#pm-desc');
const pmTags = document.querySelector('#pm-tags');
const pmLink = document.querySelector('#pm-link');
const pmGalleryTrack = document.querySelector('#pm-gallery-track');
const pmGalleryNav = document.querySelector('#pm-gallery-nav');
const pmNext = document.querySelector('#pm-next');
const pmPrev = document.querySelector('#pm-prev');

const openM = (m) => { if (m) { m.classList.add('open'); document.body.style.overflow = 'hidden'; } };
const closeM = (m) => { if (m) { m.classList.remove('open'); document.body.style.overflow = ''; } };

// Profile Triggers
document.querySelector('.js-profile-trigger')?.addEventListener('click', () => openM(profileModal));
profileModal?.querySelector('.modal-close')?.addEventListener('click', () => closeM(profileModal));

// Project Triggers
projectModal?.querySelector('.modal-close')?.addEventListener('click', () => closeM(projectModal));

document.querySelectorAll('.project-card').forEach(card => {
  card.addEventListener('click', () => {
    if (projectModal && pmTitle && pmDesc) {
      triggerSceneChange(() => {
        pmTitle.textContent = card.querySelector('.project-title').textContent;
        pmDesc.innerHTML = card.querySelector('.project-desc').innerHTML;
        if (pmTags) pmTags.innerHTML = card.querySelector('.project-tags').innerHTML;
        
        // Handle Gallery
        if (pmGalleryTrack) {
          pmGalleryTrack.innerHTML = '';
          const galleryData = card.dataset.gallery;
          
          if (galleryData) {
            const images = galleryData.split(',');
            images.forEach(imgSrc => {
              const img = document.createElement('img');
              img.src = imgSrc.trim();
              pmGalleryTrack.appendChild(img);
            });
            initGalleryLogic(images.length);
            if (pmPrev) pmPrev.style.display = 'flex';
            if (pmNext) pmNext.style.display = 'flex';
          } else {
            const img = document.createElement('img');
            img.src = card.querySelector('img').src;
            pmGalleryTrack.appendChild(img);
            if (pmGalleryNav) pmGalleryNav.innerHTML = '';
            if (pmPrev) pmPrev.style.display = 'none';
            if (pmNext) pmNext.style.display = 'none';
            pmGalleryTrack.style.transform = 'translateX(0)';
          }
        }
        
        // Handle Live Link
        if (pmLink) {
          if (card.dataset.link) {
            pmLink.href = card.dataset.link;
            pmLink.style.display = 'inline-flex';
          } else {
            pmLink.style.display = 'none';
          }
        }

        openM(projectModal);
      });
    }
  });
});

let currentGalleryIdx = 0;
function initGalleryLogic(count) {
  currentGalleryIdx = 0;
  if (pmGalleryTrack) pmGalleryTrack.style.transform = 'translateX(0)';
  if (pmGalleryNav) {
    pmGalleryNav.innerHTML = '';
    for (let i = 0; i < count; i++) {
      const dot = document.createElement('div');
      dot.className = `gallery-dot ${i === 0 ? 'active' : ''}`;
      dot.addEventListener('click', () => goToGallerySlide(i));
      pmGalleryNav.appendChild(dot);
    }
  }
}

function goToGallerySlide(idx) {
  const count = pmGalleryTrack.children.length;
  if (!count) return;
  if (idx < 0) idx = count - 1;
  if (idx >= count) idx = 0;
  
  currentGalleryIdx = idx;
  
  if (typeof gsap !== 'undefined') {
    gsap.to(pmGalleryTrack, {
      x: `-${idx * 100}%`,
      duration: 0.8,
      ease: "expo.out"
    });
    
    const imgs = pmGalleryTrack.querySelectorAll('img');
    imgs.forEach((img, i) => {
        gsap.to(img, {
            scale: i === idx ? 1 : 0.9,
            opacity: i === idx ? 1 : 0.3,
            duration: 0.8,
            ease: "expo.out"
        });
    });
  } else {
    pmGalleryTrack.style.transform = `translateX(-${idx * 100}%)`;
  }
  
  const dots = pmGalleryNav.querySelectorAll('.gallery-dot');
  dots.forEach((dot, i) => {
    dot.classList.toggle('active', i === idx);
  });
}

pmNext?.addEventListener('click', () => goToGallerySlide(currentGalleryIdx + 1));
pmPrev?.addEventListener('click', () => goToGallerySlide(currentGalleryIdx - 1));

// Map Hotspot Triggers (Advanced Skill Breakdown)
document.querySelectorAll('.map-hotspot').forEach(hotspot => {
  hotspot.addEventListener('click', () => {
    if (projectModal && pmTitle && pmDesc) {
      const level = hotspot.dataset.level || 0;
      const built = hotspot.dataset.built || "Various Projects";
      
      pmTitle.textContent = hotspot.dataset.island;
      pmDesc.innerHTML = `
        <div class="skill-breakdown">
          <div class="skill-stat">
            <span class="stat-label">Mastery Level:</span>
            <div class="stat-bar-bg"><div class="stat-bar-fill" style="width: ${level}%"></div></div>
            <span class="stat-pct">${level}%</span>
          </div>
          <p class="built-with"><strong>Featured Builds:</strong><br>${built}</p>
          <hr style="opacity:0.1; margin:20px 0;">
          <p>${hotspot.dataset.content}</p>
        </div>
      `;

      if (pmGalleryTrack) {
        pmGalleryTrack.innerHTML = '';
        const img = document.createElement('img');
        img.src = document.querySelector('.mastery-map-img').src;
        pmGalleryTrack.appendChild(img);
        if (pmGalleryNav) pmGalleryNav.innerHTML = '';
        if (pmPrev) pmPrev.style.display = 'none';
        if (pmNext) pmNext.style.display = 'none';
        pmGalleryTrack.style.transform = 'translateX(0)';
      }
      
      if (pmTags) pmTags.innerHTML = "";
      if (pmLink) pmLink.style.display = 'none';
      openM(projectModal);
    }
  });
});

// Global close on background or ESC
[profileModal, projectModal].forEach(m => m?.addEventListener('click', (e) => e.target === m && closeM(m)));


/**
 * 4. ADVANCED UX: PROJECT FILTERING
 */
const filterBtns = document.querySelectorAll('.filter-btn');
const projectCards = document.querySelectorAll('.project-card');

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const filter = btn.dataset.filter;
    projectCards.forEach(card => {
      if (filter === 'all' || card.dataset.category === filter) {
        card.style.display = 'block';
        setTimeout(() => card.style.opacity = '1', 50);
      } else {
        card.style.opacity = '0';
        setTimeout(() => card.style.display = 'none', 400);
      }
    });
  });
});


/**
 * 5. CINEMATIC: PARALLAX BACKGROUND LAYERS
 */
const pLayers = document.querySelectorAll('.parallax-layer');
window.addEventListener('mousemove', (e) => {
  const x = (e.clientX / window.innerWidth) - 0.5;
  const y = (e.clientY / window.innerHeight) - 0.5;

  pLayers.forEach((layer, i) => {
    const depth = (i + 1) * 20;
    layer.style.transform = `translate(${x * depth}px, ${y * depth}px)`;
  });
});


/**
 * 6. PRO UX: QUICK NAV OVERLAY ('M' KEY)
 */
const quickNav = document.getElementById('quick-nav');
const qLinks = document.querySelectorAll('.q-link');

const openQuickNav = () => { if (quickNav) quickNav.classList.add('open'); };
const closeQuickNav = () => { if (quickNav) quickNav.classList.remove('open'); };

window.addEventListener('keydown', (e) => {
  if (e.key.toLowerCase() === 'm' && !quickNav.classList.contains('open')) {
    openQuickNav();
  }
  if (e.key === 'Escape') {
    closeQuickNav();
    closeM(profileModal);
    closeM(projectModal);
  }
});

qLinks.forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const target = document.querySelector(link.getAttribute('href'));
    closeQuickNav();
    if (target) {
      triggerSceneChange(() => {
        target.scrollIntoView({ behavior: 'auto' });
      });
    }
  });
});


/**
 * 6.5 PLAY MODE TRANSITIONS
 */
const enterPlayBtn = document.getElementById('enter-play-mode');
const exitPlayBtn = document.getElementById('exit-play-mode');
const mainLayout = document.body;

if (enterPlayBtn && typeof gsap !== 'undefined') {
  enterPlayBtn.addEventListener('click', () => {
    // Zoom out main site
    gsap.to('main, nav, header, section, footer, .cursor-dot, .cursor-ring', {
      scale: 0.9,
      filter: 'blur(20px) grayscale(0.5)',
      opacity: 0.3,
      duration: 1.2,
      ease: 'power4.inOut',
      stagger: 0.05
    });
  });
}

if (exitPlayBtn && typeof gsap !== 'undefined') {
  exitPlayBtn.addEventListener('click', () => {
    // Restore main site
    gsap.to('main, nav, header, section, footer, .cursor-dot, .cursor-ring', {
      scale: 1,
      filter: 'blur(0px) grayscale(0)',
      opacity: 1,
      duration: 1,
      ease: 'power4.out'
    });
  });
}


/**
 * 7. SCENE CHANGE SYSTEM (APP FEEL)
 */
const sceneOverlay = document.getElementById('scene-overlay');
const sceneText = sceneOverlay?.querySelector('.scene-text');

function triggerSceneChange(callback) {
  if (!sceneOverlay) return callback();

  if (typeof gsap !== 'undefined') {
    const tl = gsap.timeline();
    tl.set(sceneOverlay, { visibility: 'visible' });
    tl.to('.scene-wipe', { display: 'block', y: '0%', duration: 0.5, ease: 'power4.inOut' });
    tl.to(sceneText, { opacity: 1, y: -20, duration: 0.3 }, "-=0.1");
    
    tl.add(() => { callback(); });

    tl.to(sceneText, { opacity: 0, y: 0, duration: 0.3, delay: 0.4 });
    tl.to('.scene-wipe', { y: '-100%', duration: 0.5, ease: 'power4.inOut' });
    tl.set(sceneOverlay, { visibility: 'hidden' });
    tl.set('.scene-wipe', { y: '100%', display: 'none' });
  } else {
    callback();
  }
}


/**
 * 8. INTERACTION FEEDBACK: MAGNETIC & RIPPLE
 */
document.querySelectorAll('.magnetic-btn').forEach(btn => {
  btn.addEventListener('mousemove', (e) => {
    const rect = btn.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    btn.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
  });
  btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
});

window.addEventListener('click', (e) => {
  if (cursorRing) {
    cursorRing.style.transition = 'none';
    cursorRing.style.transform = 'translate(-50%, -50%) scale(2.5)';
    cursorRing.style.backgroundColor = 'rgba(212,169,106,0.1)';
    setTimeout(() => {
      cursorRing.style.transition = 'all 0.3s';
      cursorRing.style.transform = 'translate(-50%, -50%) scale(1)';
      cursorRing.style.backgroundColor = 'transparent';
    }, 150);
  }
});


/**
 * 9. ANIMATIONS & REVEALS
 */
const reveals = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -50px 0px' });
reveals.forEach(el => revealObserver.observe(el));

const heroBg = document.querySelector('.hero-bg-text');
window.addEventListener('scroll', () => {
  const y = window.scrollY;
  if (heroBg) heroBg.style.transform = `translate(-50%, calc(-50% + ${y * 0.3}px))`;
});

if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
  const scrollTrack = document.querySelector(".other-works-scroll");
  const scrollSection = document.querySelector("#other-works");
  if (scrollTrack && scrollSection) {
    gsap.to(scrollTrack, {
      x: () => -(scrollTrack.scrollWidth - window.innerWidth + window.innerWidth * 0.1),
      ease: "none",
      scrollTrigger: { 
        trigger: scrollSection, 
        start: "top top", 
        end: () => "+=" + (scrollTrack.scrollWidth + window.innerWidth * 0.1), 
        scrub: 1, 
        pin: true, 
        invalidateOnRefresh: true 
      }
    });
  }
}


/**
 * 10. UTILITIES (Ticker, Counters, Theme)
 */
const tickerTrack = document.querySelector('.ticker-track');
if (tickerTrack) tickerTrack.innerHTML += tickerTrack.innerHTML;

function animateCounter(el, target, duration = 2000) {
  const start = performance.now();
  const isFloat = target % 1 !== 0;
  function up(time) {
    const elapsed = time - start;
    const prog = Math.min(elapsed / duration, 1);
    const ease = 1 - Math.pow(1 - prog, 3);
    const curr = ease * target;
    el.textContent = isFloat ? curr.toFixed(1) : Math.floor(curr);
    if (prog < 1) requestAnimationFrame(up);
    else el.textContent = isFloat ? target.toFixed(1) : target;
  }
  requestAnimationFrame(up);
}
const counters = document.querySelectorAll('[data-count]');
const counterObs = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) { animateCounter(entry.target, parseFloat(entry.target.dataset.count)); counterObs.unobserve(entry.target); }
  });
}, { threshold: 0.5 });
counters.forEach(el => counterObs.observe(el));

const themeBtn = document.getElementById('theme-toggle');
const root = document.documentElement;
const initT = localStorage.getItem('portfolio-theme') || 'dark';
root.setAttribute('data-theme', initT);
themeBtn?.addEventListener('click', () => {
  const curr = root.getAttribute('data-theme');
  let next = (curr === 'dark') ? 'light' : (curr === 'light') ? 'cyber' : 'dark';
  root.setAttribute('data-theme', next);
  localStorage.setItem('portfolio-theme', next);
});

const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();


window.addEventListener('load', () => {
    // Site is ready
    console.log("Voyage Ready");
});


/**
 * 12. LUFFY CHATBOT LOGIC
 */
const luffyBox = document.getElementById('luffy-chatbot');
const luffyMsg = document.getElementById('luffy-greet-text');
const messages = {
  'hero': "Yo! I'm Luffy! Welcome to my friend's portfolio! Shishishi!",
  'about': "Joydip is super strong at building digital worlds!",
  'process': "Behind every great pirate is a solid strategy! Check out how he works!",
  'mastery': "Whoa! The Grand Line! Click the islands to see Joydip's skills!",
  'projects': "Look at all these bounties! Those are some awesome projects!",
  'other-works': "Whoosh! So fast! Quick deliverables scrolling by!",
  'play-mode-entry': "Check this out! A whole Gaming World for you to explore! Go for it!",
  'collaboration': "Wanna join our crew? Send him a message!"
};

if (luffyBox && luffyMsg && typeof gsap !== 'undefined') {
  let activeSec = '';
  const lObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        if (messages[id] && activeSec !== id) {
          activeSec = id;
          gsap.to(luffyBox, { y: 150, opacity: 0, duration: 0.3, onComplete: () => {
            luffyMsg.textContent = messages[id];
            gsap.to(luffyBox, { y: 0, opacity: 1, duration: 0.8, ease: "back.out(1.7)" });
          }});
        }
      }
    });
  }, { threshold: 0.4 });
  document.querySelectorAll('section').forEach(s => lObs.observe(s));
  
  luffyBox.querySelector('.luffy-avatar')?.addEventListener('click', () => {
    document.querySelector('#mastery')?.scrollIntoView({ behavior: 'smooth' });
  });
}


/**
 * 13. EASTER EGG (Keyword: "grandline")
 */
let buffer = "";
window.addEventListener("keydown", (e) => {
  buffer += e.key.toLowerCase();
  if (buffer.length > 9) buffer = buffer.slice(-9);
  if (buffer === "grandline") {
    document.body.classList.add('glitch-active');
    setTimeout(() => {
      document.body.classList.remove('glitch-active');
      document.querySelector('#mastery')?.scrollIntoView({ behavior: 'smooth' });
    }, 2000);
    buffer = "";
  }
});

/**
 * 14. ENVIRONMENT EFFECTS: DUST GENERATION
 */
function initEnvironment() {
  const dustLayer = document.getElementById('dust-layer');
  if (!dustLayer) return;

  const count = 20;
  for (let i = 0; i < count; i++) {
    const mote = document.createElement('div');
    mote.className = 'dust-mote';
    
    // Random position
    const x = Math.random() * 100;
    const y = Math.random() * 100;
    
    // Random animation settings
    const duration = 10 + Math.random() * 15;
    const delay = Math.random() * -20;
    const size = 1 + Math.random() * 2;
    
    mote.style.left = `${x}%`;
    mote.style.top = `${y}%`;
    mote.style.width = `${size}px`;
    mote.style.height = `${size}px`;
    mote.style.animationDuration = `${duration}s`;
    mote.style.animationDelay = `${delay}s`;
    
    dustLayer.appendChild(mote);
  }
}

// Initialize on load
window.addEventListener('load', () => {
  initEnvironment();
});

/**
 * 6. HIRE ME MODAL LOGIC
 */
const hireModal = document.getElementById('hire-modal');
const hireTriggers = document.querySelectorAll('.js-hire-me-trigger');
const hireClose = document.querySelector('.hire-modal-close');
const hireBackdrop = document.querySelector('.hire-modal-backdrop');

if (hireModal) {
  const openHireModal = () => {
    hireModal.style.display = 'flex';
    setTimeout(() => {
      hireModal.classList.add('active');
      document.body.style.overflow = 'hidden';
      
      // GSAP Entrance
      gsap.fromTo('.hire-modal-container', 
        { scale: 0.9, opacity: 0, y: 30 },
        { scale: 1, opacity: 1, y: 0, duration: 0.6, ease: "power4.out" }
      );
    }, 10);
  };

  const closeHireModal = () => {
    gsap.to('.hire-modal-container', {
      scale: 0.9,
      opacity: 0,
      y: 20,
      duration: 0.4,
      ease: "power2.inOut",
      onComplete: () => {
        hireModal.classList.remove('active');
        setTimeout(() => {
          hireModal.style.display = 'none';
          document.body.style.overflow = '';
        }, 300);
      }
    });
  };

  hireTriggers.forEach(trigger => {
    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      openHireModal();
    });
  });

  if (hireClose) hireClose.addEventListener('click', closeHireModal);
  if (hireBackdrop) hireBackdrop.addEventListener('click', closeHireModal);

  // Close on ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && hireModal.classList.contains('active')) {
      closeHireModal();
    }
  });

  // Handle Form Submission with AJAX
  const hireForm = hireModal.querySelector('.hire-form');
  const modalContent = hireModal.querySelector('.hire-modal-content');

  if (hireForm) {
      hireForm.addEventListener('submit', async (e) => {
          e.preventDefault();
          
          const submitBtn = hireForm.querySelector('.hire-submit-btn');
          const originalBtnText = submitBtn.innerHTML;
          
          // Loading State
          submitBtn.disabled = true;
          submitBtn.innerHTML = '<span>Setting Sail...</span>';

          const formData = new FormData(hireForm);

          // Developer Preview / Success Logic
          if (hireForm.action.includes('mqakezyz')) {
              console.warn("Portfolio: Form is in preview mode. Replace 'mqakezyz' with your Formspree ID to receive real emails.");
              setTimeout(() => {
                  showSuccessState();
              }, 1500);
              return;
          }

          try {
              const response = await fetch(hireForm.action, {
                  method: 'POST',
                  body: formData,
                  headers: {
                      'Accept': 'application/json'
                  }
              });

              if (response.ok) {
                  showSuccessState();
              } else {
                  throw new Error('Form configuration error');
              }
          } catch (error) {
              submitBtn.disabled = false;
              submitBtn.innerHTML = originalBtnText;
              alert('Form Error: Please ensure you have replaced the placeholder "mqakezyz" with your own Formspree ID in the HTML.');
          }
      });

      function showSuccessState() {
          gsap.to(hireForm, { opacity: 0, y: -20, duration: 0.4, onComplete: () => {
              hireForm.style.display = 'none';
              const successMsg = document.createElement('div');
              successMsg.className = 'hire-success-msg';
              successMsg.innerHTML = `
                  <div class="success-icon">✓</div>
                  <h3 class="hire-modal-title">Message Sent!</h3>
                  <p class="hire-modal-subtitle">The message is on its way across the Grand Line. I'll get back to you soon!</p>
                  <button class="btn-exp-view mt-md" onclick="location.reload()">Close</button>
              `;
              modalContent.appendChild(successMsg);
              gsap.from(successMsg, { opacity: 0, y: 20, duration: 0.5 });
          }});
      }
  }
}
/**
 * 15. HACKATHON BADGES INTERACTION
 */
function initBadge(id, title, desc, imgPath, tags) {
    const badge = document.getElementById(id);
    if (!badge) return;

    // Create tooltip dynamically
    const tooltipText = badge.getAttribute('data-tooltip');
    const tooltip = document.createElement('div');
    tooltip.className = 'badge-tooltip';
    tooltip.textContent = tooltipText;
    badge.appendChild(tooltip);

    badge.addEventListener('click', (e) => {
        e.stopPropagation();
        if (projectModal && pmTitle && pmDesc && pmGalleryTrack) {
            triggerSceneChange(() => {
                pmTitle.textContent = title;
                pmDesc.innerHTML = desc;
                if (pmTags) pmTags.innerHTML = tags;
                
                pmGalleryTrack.innerHTML = '';
                const img = document.createElement('img');
                img.src = imgPath;
                img.alt = title;
                pmGalleryTrack.appendChild(img);
                
                if (pmGalleryNav) pmGalleryNav.innerHTML = '';
                if (pmPrev) pmPrev.style.display = 'none';
                if (pmNext) pmNext.style.display = 'none';
                pmGalleryTrack.style.transform = 'translateX(0)';
                if (pmLink) pmLink.style.display = 'none';

                openM(projectModal);
            });
        }
    });
}

// Initialize individual badges
initBadge(
    'hack-badge', 
    'Hackathon Runner Up Certificate', 
    'Recognized for innovative performance at the <strong>Analytics Global Conference Event Hackathon 2026</strong>.', 
    'certificate/agc.jpeg',
    '<span class="project-tag">Hackathon</span><span class="project-tag">2nd Place</span>'
);

initBadge(
    'amity-badge', 
    'AI - WebForge Rank 3 Holder', 
    'Awarded for outstanding technical skill and innovation in the <strong>AI - WebForge Hackathon</strong> organized by Amity School of Engineering & Technology.', 
    'certificate/Amity.jpg',
    '<span class="project-tag">Hackathon</span><span class="project-tag">Rank 3</span><span class="project-tag">AI & Web</span>'
);
