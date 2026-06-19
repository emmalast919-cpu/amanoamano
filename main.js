/* ============================================================
   A MANO A MANO — Global Script
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {

  /* ── Mobile hamburger ── */
  const hamburger  = document.querySelector('.hamburger');
  const mobileMenu = document.querySelector('.mobile-menu');
  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('open');
      mobileMenu.classList.toggle('open');
    });
    mobileMenu.querySelectorAll('a').forEach(a =>
      a.addEventListener('click', () => {
        hamburger.classList.remove('open');
        mobileMenu.classList.remove('open');
      })
    );
  }

  /* ── Navbar scroll ── */
  const navbar = document.querySelector('.navbar');
  if (navbar) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 40) {
        navbar.style.boxShadow = '0 2px 20px rgba(0,0,0,0.1)';
      } else {
        navbar.style.boxShadow = '0 1px 8px rgba(0,0,0,0.06)';
      }
    });
  }

  /* ── Google Maps redirect ── */
  const MAP_URL = 'https://www.google.com/maps/search/?api=1&query=A+Mano+A+Mano+Via+Reggio+123+88900+Crotone+KR';
  document.querySelectorAll('[data-map-link]').forEach(el =>
    el.addEventListener('click', () => window.open(MAP_URL, '_blank'))
  );

  /* ── Deliveroo link ── */
  const DELIVEROO = 'https://deliveroo.it/it/menu/crotone/crotone/a-mano-a-mano-via-reggio-123';
  document.querySelectorAll('[data-deliveroo]').forEach(el =>
    el.addEventListener('click', e => { e.preventDefault(); window.open(DELIVEROO, '_blank'); })
  );

  /* ── Pizza tabs ── */
  document.querySelectorAll('.pizza-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.pizza-tab').forEach(t => t.classList.remove('active-red','active-white'));
      document.querySelectorAll('.pizza-panel').forEach(p => p.classList.remove('active'));
      const target = tab.dataset.tab;
      tab.classList.add(target === 'red' ? 'active-red' : 'active-white');
      document.getElementById('panel-' + target)?.classList.add('active');
    });
  });

  /* ── Active nav link ── */
  const path = window.location.pathname;
  document.querySelectorAll('.nav-center a, .mobile-menu a').forEach(a => {
    const href = a.getAttribute('href') || '';
    if (
      (href === '/' && (path === '/' || path.endsWith('index.html'))) ||
      (href.length > 1 && path.includes(href.replace('.html','')))
    ) a.classList.add('active');
  });

  /* ── Scroll-in animation ── */
  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.style.opacity   = '1';
        e.target.style.transform = 'translateY(0)';
        observer.unobserve(e.target);
      }
    });
  }, { threshold: 0.07 });

  document.querySelectorAll(
    '.feature-card, .menu-item, .menu-preview-card, .file-card, .drink-item, .drinks-category, .menu-category'
  ).forEach((el, i) => {
    el.style.opacity   = '0';
    el.style.transform = 'translateY(16px)';
    el.style.transition = `opacity 0.4s ease ${i * 0.035}s, transform 0.4s ease ${i * 0.035}s, border-color 0.25s ease, box-shadow 0.25s ease`;
    observer.observe(el);
  });
});
