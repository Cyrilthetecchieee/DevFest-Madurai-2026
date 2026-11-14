/**
 * Lightweight SPA Router — moves between Home (/), Speakers (/speakers), and Memories (/memories)
 * using native View Transitions API (when supported) or instant DOM swap,
 * keeping the persistent #gl-stage WebGL canvas untouched across all navigations.
 */
import { supportsViewTransitions, prefersReducedMotion } from '../utils/env.js';
import { mountTextMotion } from '../motion/textMotion.js';
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
  const canonicalHref = `https://devfest-madurai-2026.vercel.app${meta.canonical === '/' ? '/' : meta.canonical}`;
  const setMeta = (selector, attr, val) => {
    const el = document.querySelector(selector);
    if (el) el.setAttribute(attr, val);
  };
  setMeta('meta[name="description"]', 'content', meta.description);
  setMeta('link[rel="canonical"]', 'href', canonicalHref);
  setMeta('meta[property="og:title"]', 'content', meta.title);
  setMeta('meta[property="og:description"]', 'content', meta.description);
  setMeta('meta[property="og:url"]', 'content', canonicalHref);
  setMeta('meta[name="twitter:title"]', 'content', meta.title);
  setMeta('meta[name="twitter:description"]', 'content', meta.description);
}

function scrollToHashOrTop(hash, smooth = false) {
  const behavior = smooth && !prefersReducedMotion() ? 'smooth' : 'auto';
  if (hash) {
    const id = hash.startsWith('#') ? hash.slice(1) : hash;
    const target = id ? document.getElementById(id) : null;
    if (target) {
      target.scrollIntoView({ behavior, block: 'start' });
      return;
    }
  }
  window.scrollTo({ top: 0, behavior });
}

export function createRouter({ viewRoot, hud }) {
  let currentKey = resolveRouteKey(window.location.pathname);
  let cleanupCurrent = () => {};
  let cleanupMotion = () => {};
  let navToken = 0;

  function applyRoute(routeKey, hash = '') {
    cleanupMotion();
    cleanupCurrent();
    const entry = ROUTES[routeKey] || ROUTES.home;
    currentKey = routeKey;

    viewRoot.innerHTML = entry.render();
    updateHeadMetadata(entry.meta);
    hud.setActiveRoute(routeKey);
    cleanupCurrent = entry.mount(viewRoot) || (() => {});
    cleanupMotion = mountTextMotion(viewRoot) || (() => {});
    window.dispatchEvent(new CustomEvent('devfest:route-changed', { detail: { routeKey } }));

    if (hash) {
      window.requestAnimationFrame(() => scrollToHashOrTop(hash, false));
      window.setTimeout(() => scrollToHashOrTop(hash, false), 80);
    } else {
      window.scrollTo(0, 0);
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

    // Same page hash navigation: native scroll directly without re-rendering DOM
    if (nextKey === currentKey) {
      scrollToHashOrTop(nextHash, true);
      return;
    }

    if (token !== navToken) return;
    if (supportsViewTransitions() && !prefersReducedMotion()) {
      const transition = document.startViewTransition(() => {
        applyRoute(nextKey, nextHash);
      });
      await transition.finished.catch(() => {});
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
