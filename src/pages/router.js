/**
 * Lightweight SPA Router — moves between Home (/), Speakers (/speakers), and Memories (/memories)
 * using View Transitions API (scoped exclusively to #app-view) or GSAP crossfade fallback,
 * keeping the persistent #gl-stage WebGL canvas untouched across all navigations.
 */
import { supportsViewTransitions, prefersReducedMotion } from '../utils/env.js';
import { HOME_META, renderHomePage, mountHomePage } from './home.js';
import { SPEAKERS_META, renderSpeakersPage, mountSpeakersPage } from './speakers.js';
import { MEMORIES_META, renderMemoriesPage, mountMemoriesPage } from './memories.js';

const ROUTES = {
  home: { meta: HOME_META, render: renderHomePage, mount: mountHomePage },
  speakers: { meta: SPEAKERS_META, render: renderSpeakersPage, mount: mountSpeakersPage },
  memories: { meta: MEMORIES_META, render: renderMemoriesPage, mount: mountMemoriesPage },
};

export function resolveRouteKey(pathname) {
  const clean = (pathname || '/').toLowerCase().replace(/\/+$/, '') || '/';
  if (clean === '/speakers' || clean === '/speakers.html') return 'speakers';
  if (clean === '/memories' || clean === '/memories.html') return 'memories';
  return 'home';
}

function normalizeUrlForHistory(href) {
  const url = new URL(href, window.location.origin);
  if (url.pathname === '/index.html') url.pathname = '/';
  else if (url.pathname === '/speakers.html') url.pathname = '/speakers';
  else if (url.pathname === '/memories.html') url.pathname = '/memories';
  return url;
}

function updateHeadMetadata(meta) {
  document.title = meta.title;
  const descEl = document.querySelector('meta[name="description"]');
  if (descEl) descEl.setAttribute('content', meta.description);
  const canonicalEl = document.querySelector('link[rel="canonical"]');
  if (canonicalEl) canonicalEl.setAttribute('href', `${window.location.origin}${meta.canonical}`);
}

export function createRouter({ viewRoot, hud, lenis }) {
  let currentKey = resolveRouteKey(window.location.pathname);
  let cleanupCurrent = () => {};
  let navToken = 0;

  function applyRoute(routeKey, hash = '') {
    cleanupCurrent();
    const entry = ROUTES[routeKey] || ROUTES.home;
    currentKey = routeKey;

    viewRoot.innerHTML = entry.render();
    updateHeadMetadata(entry.meta);
    hud.setActiveRoute(routeKey);
    cleanupCurrent = entry.mount(viewRoot) || (() => {});

    lenis.refresh();
    if (hash) {
      window.requestAnimationFrame(() => lenis.scrollTo(hash, { immediate: false }));
    } else {
      lenis.scrollTo(0, { immediate: true });
    }
  }

  async function navigate(rawHref, { pushHistory = true } = {}) {
    const targetUrl = normalizeUrlForHistory(rawHref);
    if (targetUrl.origin !== window.location.origin) {
      window.open(targetUrl.href, '_blank', 'noopener,noreferrer');
      return;
    }

    const nextKey = resolveRouteKey(targetUrl.pathname);
    const nextHash = targetUrl.hash;
    const token = ++navToken;

    if (pushHistory) {
      window.history.pushState({ routeKey: nextKey }, '', `${targetUrl.pathname}${nextHash}`);
    }

    // Same page hash navigation: smooth-scroll directly without re-rendering DOM
    if (nextKey === currentKey) {
      if (nextHash) {
        lenis.scrollTo(nextHash, { immediate: false });
      } else {
        lenis.scrollTo(0, { immediate: false });
      }
      return;
    }

    // Route change: View Transitions API (only #app-view participates) or GSAP fade fallback
    if (supportsViewTransitions()) {
      const transition = document.startViewTransition(() => {
        if (token !== navToken) return;
        applyRoute(nextKey, nextHash);
      });
      await transition.finished.catch(() => {});
    } else if (!prefersReducedMotion()) {
      const { default: gsap } = await import('gsap');
      await gsap.to(viewRoot, { opacity: 0, duration: 0.16, ease: 'power2.out' });
      if (token !== navToken) return;
      applyRoute(nextKey, nextHash);
      await gsap.to(viewRoot, { opacity: 1, duration: 0.24, ease: 'power2.out' });
    } else {
      applyRoute(nextKey, nextHash);
    }
  }

  // Intercept internal SPA links globally via delegated click listener
  document.addEventListener('click', (e) => {
    if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    const anchor = e.target.closest('a[href]');
    if (!anchor) return;
    if (anchor.target === '_blank' || anchor.hasAttribute('download')) return;

    const href = anchor.getAttribute('href');
    if (!href || href.startsWith('mailto:') || href.startsWith('tel:')) return;

    const url = new URL(href, window.location.origin);
    if (url.origin !== window.location.origin) return;

    const isKnownRoute = url.pathname === '/' ||
      url.pathname === '/index.html' ||
      url.pathname === '/speakers' ||
      url.pathname === '/speakers.html' ||
      url.pathname === '/memories' ||
      url.pathname === '/memories.html';

    if (anchor.dataset.spaLink === 'true' || href.startsWith('#') || isKnownRoute) {
      e.preventDefault();
      navigate(href, { pushHistory: true });
    }
  });

  window.addEventListener('popstate', () => {
    const nextKey = resolveRouteKey(window.location.pathname);
    navigate(`${nextKey === 'home' ? '/' : `/${nextKey}`}${window.location.hash}`, { pushHistory: false });
  });

  // Initial mount
  applyRoute(currentKey, window.location.hash);

  return { navigate, getRoute: () => currentKey };
}
