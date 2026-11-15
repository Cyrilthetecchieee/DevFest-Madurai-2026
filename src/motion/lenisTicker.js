/** Lenis smooth scroll synced 1:1 with GSAP ticker, ScrollTrigger, and stageBus telemetry. */
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { prefersReducedMotion } from '../utils/env.js';
import { stageBus } from './stageBus.js';

gsap.registerPlugin(ScrollTrigger);

export function createLenisController() {
  let lenis = null;
  let paused = false;
  let tickerAttached = false;
  let lastY = window.scrollY || 0;
  let lastProgressEmitted = -1;

  const syncScrollBus = () => {
    const scrollY = window.scrollY || document.documentElement.scrollTop || 0;
    const scrollMax = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const progress = Math.max(0, Math.min(1, scrollY / scrollMax));
    const rawVel = scrollY - lastY;
    lastY = scrollY;

    stageBus.scrollY = scrollY;
    stageBus.scrollMax = scrollMax;
    stageBus.scrollProgress = progress;
    stageBus.scrollVelocity = stageBus.scrollVelocity * 0.78 + Math.max(-1, Math.min(1, rawVel / 64)) * 0.22;

    if (Math.abs(progress - lastProgressEmitted) > 0.002) {
      lastProgressEmitted = progress;
      document.documentElement.style.setProperty('--scroll-progress', progress.toFixed(4));
    }
  };

  const tick = (timeSeconds) => {
    if (lenis && !paused) {
      lenis.raf(timeSeconds * 1000);
    }
    syncScrollBus();
  };

  function init() {
    if (lenis || prefersReducedMotion()) {
      window.addEventListener('scroll', syncScrollBus, { passive: true });
      syncScrollBus();
      return;
    }

    lenis = new Lenis({
      lerp: 0.095,
      smoothWheel: true,
      syncTouch: false,
    });

    lenis.on('scroll', () => {
      ScrollTrigger.update();
      syncScrollBus();
    });

    if (!tickerAttached) {
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);
      tickerAttached = true;
    }
    syncScrollBus();
  }

  function setPaused(nextPaused) {
    paused = Boolean(nextPaused);
    if (!lenis) return;
    if (paused) lenis.stop();
    else lenis.start();
  }

  function scrollTo(target, { immediate = false, offset } = {}) {
    if (typeof target === 'string') {
      const cleanTarget = target.trim();
      if (!cleanTarget || cleanTarget === '#' || cleanTarget === '#top' || cleanTarget === '#home') {
        if (lenis && !immediate) lenis.scrollTo(0, { duration: 0.85 });
        else window.scrollTo({ top: 0, behavior: immediate ? 'auto' : 'smooth' });
        return true;
      }
      let el = null;
      try {
        el = document.querySelector(cleanTarget);
      } catch {
        return false;
      }
      if (el) {
        const computedMargin = parseFloat(window.getComputedStyle(el).scrollMarginTop) || 0;
        const targetOffset = offset !== undefined ? offset : (computedMargin ? -computedMargin : -76);
        if (lenis && !immediate) {
          lenis.scrollTo(el, { duration: 1.05, offset: targetOffset });
        } else {
          el.scrollIntoView({ behavior: immediate ? 'auto' : 'smooth' });
        }
        return true;
      }
    }
    if (typeof target === 'number') {
      if (lenis && !immediate) lenis.scrollTo(target, { duration: 0.75 });
      else window.scrollTo({ top: target, behavior: immediate ? 'auto' : 'smooth' });
      return true;
    }
    if (target && target.nodeType === 1) {
      const computedMargin = parseFloat(window.getComputedStyle(target).scrollMarginTop) || 0;
      const targetOffset = offset !== undefined ? offset : (computedMargin ? -computedMargin : -76);
      if (lenis && !immediate) {
        lenis.scrollTo(target, { duration: 1.05, offset: targetOffset });
      } else {
        target.scrollIntoView({ behavior: immediate ? 'auto' : 'smooth' });
      }
      return true;
    }
    return false;
  }

  function refresh() {
    ScrollTrigger.refresh();
    syncScrollBus();
  }

  function destroy() {
    window.removeEventListener('scroll', syncScrollBus);
    if (tickerAttached) {
      gsap.ticker.remove(tick);
      tickerAttached = false;
    }
    if (lenis) {
      lenis.destroy();
      lenis = null;
    }
  }

  return { init, setPaused, scrollTo, refresh, destroy };
}
