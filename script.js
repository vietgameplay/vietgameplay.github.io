/* VietGamePlay landing page interactions */

(() => {
  // -------- View switching --------
  const views = document.querySelectorAll('.view');
  const menuLinks = document.querySelectorAll('[data-view]');

  function showView(name) {
    views.forEach(v => v.classList.toggle('active', v.dataset.view === name));
    document.querySelectorAll('.menu-link').forEach(a =>
      a.classList.toggle('active', a.dataset.view === name)
    );
  }

  menuLinks.forEach(el => {
    el.addEventListener('click', e => {
      e.preventDefault();
      const target = el.dataset.view;
      if (target) showView(target);
    });
  });

  // -------- Product slider --------
  const slides = document.querySelectorAll('.slide');
  const thumbs = document.querySelectorAll('.thumb');
  const dots = document.querySelectorAll('.dot');
  const prevBtn = document.querySelector('.slider-arrow.prev');
  const nextBtn = document.querySelector('.slider-arrow.next');
  let current = 0;
  const featuredCount = slides.length; // big slider only shows top 3

  function setSlide(idx) {
    current = (idx + featuredCount) % featuredCount;
    slides.forEach((s, i) => s.classList.toggle('active', i === current));
    dots.forEach((d, i) => d.classList.toggle('active', i === current));
    // sync thumb highlight (only for featured indices)
    thumbs.forEach(t => {
      const slideIdx = parseInt(t.dataset.slide, 10);
      t.classList.toggle('active', slideIdx === current);
      if (t.getAttribute('role') === 'tab') {
        t.setAttribute('aria-selected', slideIdx === current ? 'true' : 'false');
      }
    });
  }

  prevBtn && prevBtn.addEventListener('click', () => setSlide(current - 1));
  nextBtn && nextBtn.addEventListener('click', () => setSlide(current + 1));

  thumbs.forEach(t => {
    t.addEventListener('click', () => {
      const slideIdx = parseInt(t.dataset.slide, 10);
      if (!Number.isNaN(slideIdx) && slideIdx < featuredCount) {
        setSlide(slideIdx);
      } else {
        // product exists but isn't in featured slider — bounce the slider
        const slider = document.querySelector('.slider');
        if (slider) {
          slider.animate(
            [{ transform: 'translateX(0)' }, { transform: 'translateX(-6px)' },
             { transform: 'translateX(6px)' }, { transform: 'translateX(0)' }],
            { duration: 280, easing: 'ease-in-out' }
          );
        }
      }
    });
  });

  // -------- Platform filter pills --------
  const pills = document.querySelectorAll('.pill');
  function applyFilter(platform) {
    thumbs.forEach(t => {
      const plats = (t.dataset.platform || '').split(/\s+/).filter(Boolean);
      const match = platform === 'all' || plats.includes(platform);
      t.classList.toggle('hidden', !match);
    });
    pills.forEach(p => {
      const on = p.dataset.filter === platform;
      p.classList.toggle('active', on);
      p.setAttribute('aria-selected', on ? 'true' : 'false');
    });
  }
  pills.forEach(p => p.addEventListener('click', () => applyFilter(p.dataset.filter)));

  // -------- Auto-advance on products view --------
  let autoTimer = null;
  function startAuto() {
    stopAuto();
    autoTimer = setInterval(() => setSlide(current + 1), 5000);
  }
  function stopAuto() { if (autoTimer) { clearInterval(autoTimer); autoTimer = null; } }

  // restart auto when the products view becomes active
  const observer = new MutationObserver(() => {
    const productsActive = document.querySelector('.view-products.active');
    productsActive ? startAuto() : stopAuto();
  });
  const products = document.querySelector('.view-products');
  if (products) observer.observe(products, { attributes: true, attributeFilter: ['class'] });

  // pause on hover
  const slider = document.querySelector('.slider');
  if (slider) {
    slider.addEventListener('mouseenter', stopAuto);
    slider.addEventListener('mouseleave', () => {
      if (document.querySelector('.view-products.active')) startAuto();
    });
  }

  // -------- Keyboard nav on slider --------
  document.addEventListener('keydown', e => {
    if (!document.querySelector('.view-products.active')) return;
    if (e.key === 'ArrowLeft')  setSlide(current - 1);
    if (e.key === 'ArrowRight') setSlide(current + 1);
  });

  // -------- Open store/website links in a new tab --------
  // Any <a> inside a slide's store-row should open in a new tab,
  // and placeholder href="#" links should be ignored instead of scrolling.
  document.querySelectorAll('.slide .store-row a').forEach(a => {
    const href = a.getAttribute('href') || '';
    a.setAttribute('target', '_blank');
    a.setAttribute('rel', 'noopener noreferrer');
    if (href === '' || href === '#') {
      a.addEventListener('click', e => e.preventDefault());
    }
  });

  // init
  setSlide(0);
  showView('home');
})();
