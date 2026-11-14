/** Environment, preference, storage, and capability probes. */

export function isConstrainedData() {
  const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  if (!conn) return false;
  return Boolean(conn.saveData) || /(^|-)2g$/i.test(conn.effectiveType || '');
}

export function prefersReducedMotion() {
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
}

export function isSmallViewport() {
  return window.innerWidth <= 820;
}

export function supportsViewTransitions() {
  return typeof document.startViewTransition === 'function' && !prefersReducedMotion();
}

let cachedSoftwareGL = null;

export function detectSoftwareRenderer() {
  if (cachedSoftwareGL !== null) return cachedSoftwareGL;
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) {
      cachedSoftwareGL = true;
      return true;
    }
    const dbg = gl.getExtension('WEBGL_debug_renderer_info');
    const rendererStr = dbg
      ? `${gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL)} ${gl.getParameter(dbg.UNMASKED_VENDOR_WEBGL)}`
      : `${gl.getParameter(gl.RENDERER)} ${gl.getParameter(gl.VENDOR)}`;
    cachedSoftwareGL = /swiftshader|llvmpipe|softpipe|mesa offscreen|microsoft basic|subzero/i.test(rendererStr);
  } catch {
    cachedSoftwareGL = false;
  }
  return cachedSoftwareGL;
}

export function detectWebGL() {
  try {
    const canvas = document.createElement('canvas');
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext('webgl2') || canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    );
  } catch {
    return false;
  }
}

export function readSessionFlag(key) {
  try {
    return window.sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

export function writeSessionFlag(key, value) {
  try {
    window.sessionStorage.setItem(key, value);
  } catch {
    // Storage disabled in private browsing contexts
  }
}
