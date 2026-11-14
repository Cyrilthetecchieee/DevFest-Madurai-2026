/**
 * Generative Tamil Pulli & Sikku Kolam Engine (S2)
 * Produces mathematical diamond pulli matrices and continuous interlaced Bezier loops
 * for SVG self-drawing, interactive canvas proximity threading, deterministic Badge seeds,
 * and 3D particle morph coordinates.
 */

export function hashSeed(input = 'DEVFEST MADURAI 2026') {
  let h = 2166136261 >>> 0;
  const s = String(input);
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function makeRng(seedNum) {
  let s = seedNum || 1;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

/**
 * Generates deterministic Tamil Pulli dots + continuous interlaced Kambi/Sikku paths.
 * @returns {{ viewBox: string, dots: Array<{x:number,y:number,r:number}>, paths: Array<{d:string, lengthGuess:number, layer:number}>, samples: Array<{x:number,y:number}> }}
 */
export function generateKolamSpec({
  gridRadius = 3,
  size = 400,
  seed = 'MADURAI-2026',
  complexity = 1,
} = {}) {
  const rng = makeRng(hashSeed(seed));
  const half = size / 2;
  const spacing = (size * 0.68) / (gridRadius * 2 + 1.4);

  // 1. Pulli diamond lattice rotated 45deg or ortho+diamond
  const dots = [];
  for (let iy = -gridRadius; iy <= gridRadius; iy++) {
    const span = gridRadius - Math.abs(iy);
    for (let ix = -span; ix <= span; ix++) {
      dots.push({
        x: Number((half + ix * spacing).toFixed(2)),
        y: Number((half + iy * spacing).toFixed(2)),
        r: Math.abs(ix) + Math.abs(iy) === 0 ? 3.2 : 2.3,
      });
    }
  }

  const paths = [];
  const samples = [];

  // Helper to evaluate parametric rosette / interlaced sikku braid and record samples
  const buildClosedLoop = (pts, layer = 0) => {
    if (pts.length < 4) return '';
    let d = '';
    const n = pts.length;
    for (let i = 0; i < n; i++) {
      const p0 = pts[(i - 1 + n) % n];
      const p1 = pts[i];
      const p2 = pts[(i + 1) % n];
      const p3 = pts[(i + 2) % n];

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      if (i === 0) d += `M ${p1.x.toFixed(1)},${p1.y.toFixed(1)} `;
      d += `C ${cp1x.toFixed(1)},${cp1y.toFixed(1)} ${cp2x.toFixed(1)},${cp2y.toFixed(1)} ${p2.x.toFixed(1)},${p2.y.toFixed(1)} `;

      if (samples.length < 2200) {
        samples.push({ x: (p1.x - half) / half, y: (half - p1.y) / half });
      }
    }
    d += 'Z';
    paths.push({ d, layer });
    return d;
  };

  const petals = gridRadius >= 3 ? 8 : 4;
  const phaseShift = (rng() - 0.5) * 0.16;
  const ampA = spacing * (0.55 + 0.18 * rng());
  const ampB = spacing * (0.36 + 0.14 * rng());

  // Layer 0: Outer Sikku Perimeter Loop weaving around outer pullis
  const outerPts = [];
  const stepsOuter = 96;
  const outerR = gridRadius * spacing * 1.12;
  for (let i = 0; i < stepsOuter; i++) {
    const t = (i / stepsOuter) * Math.PI * 2;
    const lobe = Math.cos(petals * t) * ampA + Math.cos(petals * 2 * t + phaseShift) * (ampB * 0.45);
    const r = outerR + lobe;
    outerPts.push({
      x: half + Math.cos(t) * r,
      y: half + Math.sin(t) * r,
    });
  }
  buildClosedLoop(outerPts, 0);

  // Layer 1: Cross-braid cardinal figure-eight infinity loops (2 orthogonal Lissajous weaves)
  const axes = [0, Math.PI / 2, Math.PI / 4, -Math.PI / 4].slice(0, complexity > 0.7 ? 4 : 2);
  const braidSteps = 64;
  const majorR = gridRadius * spacing * 0.94;
  const minorW = spacing * (0.42 + 0.12 * rng());

  axes.forEach((angle, idx) => {
    const pts = [];
    const cosA = Math.cos(angle);
    const sinA = Math.sin(angle);
    for (let i = 0; i < braidSteps; i++) {
      const t = (i / braidSteps) * Math.PI * 2;
      const lx = Math.sin(t) * majorR * (idx >= 2 ? 0.88 : 1.0);
      const ly = Math.sin(2 * t) * minorW * 0.9 + Math.sin(4 * t) * minorW * 0.18;
      pts.push({
        x: half + lx * cosA - ly * sinA,
        y: half + lx * sinA + ly * cosA,
      });
    }
    buildClosedLoop(pts, idx < 2 ? 1 : 2);
  });

  // Layer 2: Central Star / Lotus Seat around origin pulli
  const centerPts = [];
  const innerR = spacing * 0.62;
  for (let i = 0; i < 48; i++) {
    const t = (i / 48) * Math.PI * 2;
    const r = innerR + Math.cos(4 * t) * (spacing * 0.24);
    centerPts.push({
      x: half + Math.cos(t) * r,
      y: half + Math.sin(t) * r,
    });
  }
  buildClosedLoop(centerPts, 2);

  return {
    viewBox: `0 0 ${size} ${size}`,
    size,
    dots,
    paths,
    samples,
  };
}

/**
 * Interactive SVG + Pointer Proximity Kolam Controller
 * Draws lines using real stroke-dashoffset physics and brightens / pulses loops near cursor.
 */
export function mountInteractiveKolamSvg(container, {
  gridRadius = 3,
  size = 420,
  seed = 'DEVFEST-MADURAI-2026',
  drawOnScroll = false,
  className = 'kolam-svg',
} = {}) {
  if (!container) return null;
  const spec = generateKolamSpec({ gridRadius, size, seed, complexity: 1 });
  const ns = 'http://www.w3.org/2000/svg';
  const uid = `kl_${Math.random().toString(36).slice(2, 8)}`;

  const svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('viewBox', spec.viewBox);
  svg.setAttribute('class', className);
  svg.setAttribute('aria-hidden', 'true');

  const defs = document.createElementNS(ns, 'defs');
  defs.innerHTML = `
    <linearGradient id="${uid}_grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#5ef3ff" />
      <stop offset="55%" stop-color="#f3f6ff" stop-opacity="0.92" />
      <stop offset="100%" stop-color="#9b5cff" />
    </linearGradient>
    <filter id="${uid}_glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="2.6" result="blur" />
      <feMerge>
        <feMergeNode in="blur" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
  `;
  svg.appendChild(defs);

  // Pulli dots
  const dotGroup = document.createElementNS(ns, 'g');
  dotGroup.setAttribute('class', 'kolam-dots');
  const dotEls = spec.dots.map((pt) => {
    const c = document.createElementNS(ns, 'circle');
    c.setAttribute('cx', String(pt.x));
    c.setAttribute('cy', String(pt.y));
    c.setAttribute('r', String(pt.r));
    c.setAttribute('fill', '#5ef3ff');
    c.setAttribute('opacity', '0.78');
    dotGroup.appendChild(c);
    return { el: c, x: pt.x, y: pt.y, baseR: pt.r };
  });
  svg.appendChild(dotGroup);

  // Interlaced paths
  const pathGroup = document.createElementNS(ns, 'g');
  pathGroup.setAttribute('filter', `url(#${uid}_glow)`);
  const pathMeta = spec.paths.map((item) => {
    const p = document.createElementNS(ns, 'path');
    p.setAttribute('d', item.d);
    p.setAttribute('fill', 'none');
    p.setAttribute('stroke', item.layer === 1 ? '#5ef3ff' : `url(#${uid}_grad)`);
    p.setAttribute('stroke-width', item.layer === 0 ? '2' : '1.5');
    p.setAttribute('stroke-linecap', 'round');
    p.setAttribute('stroke-linejoin', 'round');
    p.setAttribute('opacity', item.layer === 0 ? '0.92' : '0.76');
    pathGroup.appendChild(p);
    return p;
  });
  svg.appendChild(pathGroup);
  container.innerHTML = '';
  container.appendChild(svg);

  // Measure path lengths for draw-in animations
  const lengths = pathMeta.map((p) => {
    const len = typeof p.getTotalLength === 'function' ? p.getTotalLength() : 900;
    p.style.strokeDasharray = `${len} ${len}`;
    p.style.strokeDashoffset = drawOnScroll ? `${len}` : '0';
    return len;
  });

  function setProgress(t) {
    const clamped = Math.max(0, Math.min(1, t));
    pathMeta.forEach((p, idx) => {
      const staggered = Math.max(0, Math.min(1, (clamped - idx * 0.08) / (1 - idx * 0.06)));
      p.style.strokeDashoffset = String(lengths[idx] * (1 - staggered));
    });
    const dotScale = 0.35 + 0.65 * Math.min(1, clamped * 1.4);
    dotEls.forEach(({ el }) => {
      el.setAttribute('opacity', String((0.18 + 0.72 * dotScale).toFixed(2)));
    });
  }

  // Interactive pointer-threading proximity highlight
  const onPointerMove = (e) => {
    const rect = svg.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const sx = ((e.clientX - rect.left) / rect.width) * size;
    const sy = ((e.clientY - rect.top) / rect.height) * size;

    dotEls.forEach(({ el, x, y, baseR }) => {
      const d = Math.hypot(x - sx, y - sy);
      const boost = Math.max(0, 1 - d / (size * 0.34));
      el.setAttribute('r', (baseR + boost * 2.8).toFixed(2));
      el.setAttribute('fill', boost > 0.35 ? '#f3f6ff' : '#5ef3ff');
      el.setAttribute('opacity', (0.65 + boost * 0.35).toFixed(2));
    });

    const centerDist = Math.hypot(sx - size / 2, sy - size / 2);
    const activeRing = Math.max(0, 1 - centerDist / (size * 0.7));
    pathMeta.forEach((p, idx) => {
      const w = 1.4 + activeRing * (idx % 2 === 0 ? 1.4 : 0.9);
      p.setAttribute('stroke-width', w.toFixed(2));
    });
  };

  container.addEventListener('pointermove', onPointerMove, { passive: true });

  return {
    svg,
    spec,
    setProgress,
    destroy() {
      container.removeEventListener('pointermove', onPointerMove);
    },
  };
}
