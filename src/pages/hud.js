/**
 * Sticky Header (<= 64px), Active Section Observer, Accessible Mobile Drawer & Back-to-Top
 */
import { prefersReducedMotion } from '../utils/env.js';

export function initHud({ onMotionChange, onNavigate }) {
  const header = document.getElementById('stage-hud');
  const motionToggle = document.getElementById('motion-toggle');
  const motionLabel = document.getElementById('motion-label');
  const menuToggle = document.getElementById('menu-toggle');
  const drawerClose = document.getElementById('drawer-close');
  const drawerBackdrop = document.getElementById('hud-drawer-backdrop');
  const hudNav = document.getElementById('hud-nav');
  const backTopBtn = document.getElementById('global-back-top');

  let paused = prefersReducedMotion();
  let currentRoute = 'home';
  let activeObserver = null;

  const syncMotionUi = () => {
    document.documentElement.classList.toggle('paused', paused);
    if (motionLabel) motionLabel.textContent = paused ? 'MOTION: OFF' : 'MOTION: ON';
    if (motionToggle) {
      motionToggle.setAttribute('aria-pressed', paused ? 'true' : 'false');
      motionToggle.setAttribute('aria-label', paused ? 'Motion off' : 'Motion on');
    }
  };
  syncMotionUi();

  const getDrawerFocusable = () => {
    if (!hudNav) return [];
    return Array.from(
      hudNav.querySelectorAll('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'),
    );
  };

  const closeMenu = ({ restoreFocus = false } = {}) => {
    if (!hudNav || hudNav.hidden) return;
    hudNav.hidden = true;
    hudNav.classList.remove('open');
    if (drawerBackdrop) drawerBackdrop.hidden = true;
    document.body.style.overflow = '';
    menuToggle?.setAttribute('aria-expanded', 'false');
    if (restoreFocus) menuToggle?.focus();
  };

  const openMenu = () => {
    if (!hudNav) return;
    hudNav.hidden = false;
    hudNav.classList.add('open');
    if (drawerBackdrop) drawerBackdrop.hidden = false;
    document.body.style.overflow = 'hidden';
    menuToggle?.setAttribute('aria-expanded', 'true');
    window.requestAnimationFrame(() => {
      const focusables = getDrawerFocusable();
      focusables[0]?.focus();
    });
  };

  menuToggle?.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = !hudNav?.hidden;
    if (isOpen) closeMenu();
    else openMenu();
  });

  drawerClose?.addEventListener('click', () => closeMenu({ restoreFocus: true }));
  drawerBackdrop?.addEventListener('click', () => closeMenu({ restoreFocus: true }));

  header?.querySelectorAll('a[href]').forEach((link) => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (!href) return;
      if (link.target === '_blank') {
        closeMenu();
        return;
      }
      e.preventDefault();
      closeMenu();
      if (typeof onNavigate === 'function') {
        onNavigate(href);
      } else {
        window.location.href = href;
      }
    });
  });

  document.addEventListener('keydown', (e) => {
    if (!hudNav || hudNav.hidden) return;
    if (e.key === 'Escape') {
      e.preventDefault();
      closeMenu({ restoreFocus: true });
      return;
    }
    if (e.key === 'Tab') {
      const focusables = getDrawerFocusable();
      if (!focusables.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });

  motionToggle?.addEventListener('click', () => {
    paused = !paused;
    syncMotionUi();
    onMotionChange?.(paused);
  });

  const NAV_SECTION_MAP = {
    home: 'home',
    about: 'about',
    venue: 'about',
    agenda: 'agenda',
    tickets: 'agenda',
    speakers: 'speakers',
    sponsors: 'memories',
    memories: 'memories',
  };

  const setActiveNavSection = (sectionKey) => {
    const mapped = NAV_SECTION_MAP[sectionKey] || sectionKey;
    header?.querySelectorAll('.header-nav-link, .hud-nav-link').forEach((el) => {
      const matchesSection = el.dataset.section === mapped;
      const matchesRoute = el.dataset.route === currentRoute && !sectionKey;
      const active = matchesSection || matchesRoute;
      el.classList.toggle('active', active);
      if (active) el.setAttribute('aria-current', 'true');
      else el.removeAttribute('aria-current');
    });
  };

  const observeSections = () => {
    activeObserver?.disconnect();
    activeObserver = null;

    if (currentRoute !== 'home') {
      setActiveNavSection(currentRoute);
      return;
    }

    const targets = Array.from(document.querySelectorAll('#app-view [id]')).filter((el) =>
      ['home', 'about', 'venue', 'speakers', 'agenda', 'tickets', 'sponsors', 'memories'].includes(el.id),
    );
    if (!targets.length || !('IntersectionObserver' in window)) {
      setActiveNavSection('home');
      return;
    }

    activeObserver = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => Math.abs(a.boundingClientRect.top) - Math.abs(b.boundingClientRect.top));
        if (visible.length) {
          setActiveNavSection(visible[0].target.id);
        }
      },
      { rootMargin: '-84px 0px -55% 0px', threshold: 0.05 },
    );

    targets.forEach((el) => activeObserver.observe(el));
  };

  const syncScrollControls = () => {
    const scrolled = window.scrollY > 32;
    document.documentElement.classList.toggle('is-scrolled', scrolled);
    if (backTopBtn) {
      const showBackTop = window.scrollY > Math.max(420, window.innerHeight * 0.75);
      backTopBtn.hidden = !showBackTop;
    }
  };

  backTopBtn?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
  });

  const onHudResize = () => {
    if (window.innerWidth >= 1100) closeMenu();
  };
  window.addEventListener('resize', onHudResize, { passive: true });
  window.addEventListener('scroll', syncScrollControls, { passive: true });
  syncScrollControls();

  function setActiveRoute(routeKey) {
    currentRoute = routeKey;
    closeMenu();
    setActiveNavSection(routeKey === 'home' ? 'home' : routeKey);
    window.requestAnimationFrame(observeSections);
  }

  return {
    setActiveRoute,
    isPaused: () => paused,
  };
}
