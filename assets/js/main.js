(function () {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const body = document.body;

  const preloader = document.querySelector('[data-preloader]');
  window.addEventListener('load', () => {
    setTimeout(() => preloader?.classList.add('hidden'), 350);
  });

  const header = document.querySelector('.site-header');
  const navToggle = document.querySelector('.menu-toggle');
  const navLinks = document.querySelector('.nav-links');
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';

  document.querySelectorAll('.nav-links a').forEach((a) => {
    if (a.getAttribute('href').endsWith(currentPath)) a.classList.add('active');
  });

  const closeMenu = () => {
    navLinks?.classList.remove('open');
    navToggle?.setAttribute('aria-expanded', 'false');
    body.classList.remove('menu-open');
  };

  navToggle?.addEventListener('click', () => {
    const expanded = navToggle.getAttribute('aria-expanded') === 'true';
    navToggle.setAttribute('aria-expanded', String(!expanded));
    navLinks?.classList.toggle('open', !expanded);
    body.classList.toggle('menu-open', !expanded);
    if (!expanded) navLinks?.querySelector('a')?.focus();
  });

  document.addEventListener('click', (e) => {
    if (!navLinks || !navToggle) return;
    if (!navLinks.contains(e.target) && !navToggle.contains(e.target)) closeMenu();
  });

  window.addEventListener('scroll', () => {
    header?.classList.toggle('scrolled', window.scrollY > 24);
    document.querySelector('.to-top')?.classList.toggle('show', window.scrollY > 420);
  });

  document.querySelector('.to-top')?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  const darkBtn = document.querySelector('[data-dark-toggle]');
  const applyTheme = (theme) => {
    body.classList.toggle('dark', theme === 'dark');
    darkBtn && (darkBtn.textContent = theme === 'dark' ? '☀️' : '🌙');
  };
  applyTheme(localStorage.getItem('theme') || 'light');
  darkBtn?.addEventListener('click', () => {
    const next = body.classList.contains('dark') ? 'light' : 'dark';
    localStorage.setItem('theme', next);
    applyTheme(next);
  });

  // Page transition
  document.querySelectorAll('a[data-transition]').forEach((link) => {
    link.addEventListener('click', (e) => {
      if (e.metaKey || e.ctrlKey || link.target === '_blank' || reduceMotion) return;
      const href = link.getAttribute('href');
      if (!href || href.startsWith('#')) return;
      e.preventDefault();
      document.querySelector('.page-transition')?.classList.add('leaving');
      setTimeout(() => (window.location.href = href), 250);
    });
  });

  // Scroll reveal
  const revealEls = document.querySelectorAll('.reveal');
  if (!reduceMotion && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    revealEls.forEach((el) => observer.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('visible'));
  }

  // Subtle hero parallax
  const hero = document.querySelector('.hero');
  if (hero && !reduceMotion) {
    hero.addEventListener('mousemove', (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 16;
      const y = (e.clientY / window.innerHeight - 0.5) * 16;
      hero.style.transform = `translate3d(${x * 0.3}px, ${y * 0.3}px, 0)`;
    });
  }

  // About page skill bars + counters
  const aboutBlock = document.querySelector('[data-about]');
  if (aboutBlock) {
    aboutBlock.querySelectorAll('.skill-fill').forEach((bar) => {
      bar.style.width = `${bar.dataset.value || 0}%`;
    });

    const animateCounter = (el) => {
      const target = Number(el.dataset.count || 0);
      let num = 0;
      const step = Math.max(1, Math.ceil(target / 80));
      const tick = () => {
        num += step;
        if (num >= target) num = target;
        el.textContent = num;
        if (num < target) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };
    aboutBlock.querySelectorAll('.counter').forEach(animateCounter);
  }

  // Portfolio filters + lightbox
  const portfolio = document.querySelector('[data-portfolio]');
  if (portfolio) {
    const chips = [...portfolio.querySelectorAll('.chip')];
    const cards = [...portfolio.querySelectorAll('.portfolio-item')];
    const modal = document.querySelector('#lightbox');
    const modalImg = modal?.querySelector('[data-lightbox-img]');
    const modalBody = modal?.querySelector('[data-lightbox-body]');
    let activeIndex = 0;

    chips.forEach((chip) => chip.addEventListener('click', () => {
      chips.forEach((c) => c.classList.remove('active'));
      chip.classList.add('active');
      const category = chip.dataset.filter;
      cards.forEach((card) => {
        card.style.display = category === 'all' || card.dataset.category === category ? '' : 'none';
      });
    }));

    const openModal = (index) => {
      const item = cards[index];
      if (!item) return;
      activeIndex = index;
      const data = item.dataset;
      if (modalImg) modalImg.src = data.image;
      if (modalBody) modalBody.innerHTML = `
        <h3>${data.title}</h3>
        <p><strong>Category:</strong> ${data.categoryLabel} | <strong>Tools:</strong> ${data.tools}</p>
        <p>${data.desc}</p>
        <div class="card"><h4>Case Study</h4><p><strong>Problem:</strong> ${data.problem}</p><p><strong>Process:</strong> ${data.process}</p><p><strong>Result:</strong> ${data.result}</p></div>
      `;
      modal?.classList.add('open');
    };

    cards.forEach((item, i) => item.addEventListener('click', () => openModal(i)));
    const closeLightbox = () => modal?.classList.remove('open');
    document.querySelector('[data-lightbox-close]')?.addEventListener('click', closeLightbox);
    document.querySelector('[data-lightbox-prev]')?.addEventListener('click', () => openModal((activeIndex - 1 + cards.length) % cards.length));
    document.querySelector('[data-lightbox-next]')?.addEventListener('click', () => openModal((activeIndex + 1) % cards.length));

    document.addEventListener('keydown', (e) => {
      if (!modal?.classList.contains('open')) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') openModal((activeIndex + 1) % cards.length);
      if (e.key === 'ArrowLeft') openModal((activeIndex - 1 + cards.length) % cards.length);
    });
  }

  // Pricing toggle
  const priceToggle = document.querySelector('[data-pricing-toggle]');
  if (priceToggle) {
    const btns = priceToggle.querySelectorAll('.toggle-btn');
    const prices = document.querySelectorAll('[data-price]');
    btns.forEach((btn) => btn.addEventListener('click', () => {
      btns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      const mode = btn.dataset.mode;
      prices.forEach((price) => {
        price.textContent = mode === 'monthly' ? price.dataset.monthly : price.dataset.project;
      });
    }));
  }

  // Testimonials slider
  const slider = document.querySelector('[data-slider]');
  if (slider) {
    const track = slider.querySelector('.slides');
    const slides = slider.querySelectorAll('.slide');
    let index = 0;
    const move = (i) => {
      index = (i + slides.length) % slides.length;
      track.style.transform = `translateX(-${index * 100}%)`;
    };
    slider.querySelector('[data-prev]')?.addEventListener('click', () => move(index - 1));
    slider.querySelector('[data-next]')?.addEventListener('click', () => move(index + 1));
    if (!reduceMotion) setInterval(() => move(index + 1), 5000);
  }

  // Contact + booking validation
  document.querySelectorAll('[data-validate-form]').forEach((form) => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const fields = form.querySelectorAll('[required]');
      let valid = true;
      fields.forEach((field) => {
        if (!field.value.trim()) valid = false;
        if (field.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value)) valid = false;
      });
      const msg = form.querySelector('[data-form-msg]');
      if (!valid) {
        msg.textContent = 'Please complete all required fields with valid information.';
        msg.style.color = '#DC2626';
        return;
      }
      msg.textContent = 'Great! Your message has been prepared successfully.';
      msg.style.color = '#2563EB';

      if (form.matches('[data-booking-form]')) {
        const data = Object.fromEntries(new FormData(form).entries());
        const summary = `Booking Request%0AName: ${data.name}%0AService: ${data.service}%0ADate: ${data.date}%0ATime: ${data.time}%0ABudget: ${data.budget}%0ANotes: ${data.notes || '-'}`;
        const wa = `https://wa.me/10000000000?text=${summary}`;
        window.open(wa, '_blank');
        const box = document.querySelector('[data-booking-summary]');
        if (box) box.innerHTML = `<h4>Booking Summary</h4><p>${decodeURIComponent(summary).replace(/\n/g, '<br>')}</p>`;
        const copyBtn = document.querySelector('[data-copy-summary]');
        copyBtn?.addEventListener('click', async () => {
          await navigator.clipboard.writeText(decodeURIComponent(summary));
          copyBtn.textContent = 'Copied ✓';
          setTimeout(() => (copyBtn.textContent = 'Copy Summary'), 1200);
        }, { once: true });
      }
    });
  });

  // FAQ accordion
  document.querySelectorAll('.accordion-trigger').forEach((btn) => {
    btn.addEventListener('click', () => {
      const content = btn.nextElementSibling;
      const open = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!open));
      content.style.maxHeight = open ? null : `${content.scrollHeight}px`;
    });
  });
})();
