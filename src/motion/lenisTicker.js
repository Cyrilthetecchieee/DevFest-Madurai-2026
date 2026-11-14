/** Lenis smooth scroll synced 1:1 with GSAP ticker & ScrollTrigger. */
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { prefersReducedMotion } from '../utils/env.js';

gsap.registerPlugin(ScrollTrigger);

export function createLenisController() {
  let lenis = null;
  let paused = false;
  let tickerAttached = false;

  const tick = (timeSeconds) => {
    if (lenis && !paused) {
      lenis.raf(timeSeconds * 1000);
    }
  };

  function init() {
    if (lenis || prefersReducedMotion()) return;

    lenis = new Lenis({
      lerp: 0.1,
      smoothWheel: true,
      syncTouch: false,
    });

    lenis.on('scroll', ScrollTrigger.update);

    if (!tickerAttached) {
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);
      tickerAttached = true;
    }
  }

  function setPaused(nextPaused) {
    paused = Boolean(nextPaused);
    if (!lenis) return;
    if (paused) lenis.stop();
    else lenis.start();
  }

  function scrollTo(target, { immediate = false } = {}) {
    if (typeof target === 'string') {
      const el = document.querySelector(target);
      if (el) {
        if (lenis && !immediate) {
          lenis.scrollTo(el, { duration: 0.9 });
        } else {
          el.scrollIntoView({ behavior: immediate ? 'auto' : 'smooth' });
        }
        return true;
      }
    }
    if (typeof target === 'number') {
      if (lenis && !immediate) lenis.scrollTo(target, { duration: 0.6 });
      else window.scrollTo({ top: target, behavior: 'auto' });
      return true;
    }
    return false;
  }

  function refresh() {
    ScrollTrigger.refresh();
  }

  function destroy() {
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
