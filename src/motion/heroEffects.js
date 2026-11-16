/**
 * Interactive 3D animations for DevFest Madurai 2026 Hero:
 * - Central 3D Developer Portal & Brackets levitation floating oscillation
 * - Natural 3D mouse parallax tilt & position tracking (X/Y rotation & depth translation)
 * - Gentle hover glow intensification and smooth return to rest
 * - Concentric water base projection pulsing
 * - Real-time Google-colored cosmic energy particles around the portal
 */
import { gsap } from 'gsap';

export function mountHeroEffects() {
  const character = document.getElementById('hero-character');
  const portal = document.getElementById('hero-portal');
  const symbol = document.getElementById('hero-symbol');
  const badges = document.getElementById('hero-badges');
  const waterBase = document.getElementById('hero-water-base');
  const canvas = document.getElementById('hero-particles');
  const stage = document.getElementById('stage-ui');

  let destroyed = false;
  let particleRaf = null;

  // 1. Subtle Resting Floating Levitation (Smooth sine oscillation)
  const tweens = [];

  if (symbol) {
    tweens.push(
      gsap.fromTo(
        symbol,
        { y: 0 },
        {
          y: -4,
          duration: 3.2,
          ease: 'sine.inOut',
          yoyo: true,
          repeat: -1,
        }
      )
    );
  }

  if (character) {
    tweens.push(
      gsap.fromTo(
        character,
        { y: 0 },
        {
          y: -2.5,
          duration: 3.8,
          ease: 'sine.inOut',
          yoyo: true,
          repeat: -1,
        }
      )
    );
  }

  if (badges) {
    tweens.push(
      gsap.fromTo(
        badges,
        { y: 0 },
        {
          y: -3.5,
          duration: 3.5,
          ease: 'sine.inOut',
          yoyo: true,
          repeat: -1,
        }
      )
    );
  }

  if (portal) {
    tweens.push(
      gsap.fromTo(
        portal,
        { filter: 'brightness(1)' },
        {
          filter: 'brightness(1.03)',
          duration: 4.2,
          ease: 'sine.inOut',
          yoyo: true,
          repeat: -1,
        }
      )
    );
  }

  if (waterBase) {
    tweens.push(
      gsap.fromTo(
        waterBase,
        { opacity: 0.96 },
        {
          opacity: 1.0,
          duration: 2.8,
          ease: 'sine.inOut',
          yoyo: true,
          repeat: -1,
        }
      )
    );
  }

  // 2. Interactive 3D Cursor Parallax & Depth Tilt
  let restingTimer = null;

  function onPointerMove(e) {
    if (destroyed || document.documentElement.classList.contains('paused')) return;

    const nx = (e.clientX / window.innerWidth - 0.5) * 2;
    const ny = (e.clientY / window.innerHeight - 0.5) * 2;

    // 3D Developer Brackets (foreground layer: highest parallax + 3D tilt)
    if (symbol) {
      gsap.to(symbol, {
        x: nx * 9,
        y: ny * 6 - 2, // combine with idle
        rotateY: nx * 5,
        rotateX: -ny * 4,
        transformPerspective: 800,
        duration: 0.7,
        ease: 'power2.out',
        overwrite: 'auto',
      });
    }

    // Orbiting Badges (mid-foreground)
    if (badges) {
      gsap.to(badges, {
        x: nx * 6.5,
        y: ny * 4.5 - 1.5,
        rotateY: nx * 3.5,
        rotateX: -ny * 2.5,
        transformPerspective: 800,
        duration: 0.8,
        ease: 'power2.out',
        overwrite: 'auto',
      });
    }

    // Central Sphere & Network (midground)
    if (character) {
      gsap.to(character, {
        x: nx * 4,
        y: ny * 3 - 1,
        rotateY: nx * 2,
        rotateX: -ny * 1.5,
        transformPerspective: 800,
        duration: 0.9,
        ease: 'power2.out',
        overwrite: 'auto',
      });
    }

    // Portal Concentric Rings (background portal frame)
    if (portal) {
      gsap.to(portal, {
        x: nx * 2.5,
        y: ny * 1.8,
        rotateZ: nx * 0.8,
        duration: 1.1,
        ease: 'power2.out',
        overwrite: 'auto',
      });
    }

    // Reset timer to return smoothly to rest when pointer pauses
    clearTimeout(restingTimer);
    restingTimer = setTimeout(() => {
      if (destroyed) return;
      const targets = [symbol, badges, character, portal].filter(Boolean);
      gsap.to(targets, {
        x: 0,
        y: 0,
        rotateX: 0,
        rotateY: 0,
        rotateZ: 0,
        duration: 1.4,
        ease: 'power2.out',
        overwrite: 'auto',
      });
    }, 2800);
  }

  function onPointerLeave() {
    if (destroyed) return;
    const targets = [symbol, badges, character, portal].filter(Boolean);
    gsap.to(targets, {
      x: 0,
      y: 0,
      rotateX: 0,
      rotateY: 0,
      rotateZ: 0,
      duration: 1.2,
      ease: 'power2.out',
      overwrite: 'auto',
    });
  }

  window.addEventListener('pointermove', onPointerMove, { passive: true });
  document.addEventListener('mouseleave', onPointerLeave, { passive: true });

  // 3. Hover Glow Intensification
  function onStageEnter() {
    if (destroyed || document.documentElement.classList.contains('paused')) return;
    if (symbol) {
      gsap.to(symbol, {
        filter: 'brightness(1.08) drop-shadow(0 0 20px rgba(66, 133, 244, 0.4))',
        duration: 0.5,
        overwrite: 'auto',
      });
    }
    if (portal) {
      gsap.to(portal, {
        filter: 'brightness(1.06) drop-shadow(0 0 22px rgba(168, 85, 247, 0.35))',
        duration: 0.5,
        overwrite: 'auto',
      });
    }
  }

  function onStageLeave() {
    if (destroyed) return;
    if (symbol) {
      gsap.to(symbol, {
        filter: 'brightness(1)',
        duration: 0.7,
        overwrite: 'auto',
      });
    }
    if (portal) {
      gsap.to(portal, {
        filter: 'brightness(1)',
        duration: 0.7,
        overwrite: 'auto',
      });
    }
  }

  if (stage) {
    stage.addEventListener('pointerenter', onStageEnter);
    stage.addEventListener('pointerleave', onStageLeave);
  }

  // 4. Subtle Ambient Particle Micro-Sparkles around Portal Ring
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let W = (canvas.width = window.innerWidth);
    let H = (canvas.height = window.innerHeight);

    const onResize = () => {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', onResize, { passive: true });

    const PARTICLE_COUNT = 24;
    // Google Developer ecosystem brand accents: Blue, Red, Yellow, Green, Violet
    const colors = [
      'rgba(66, 133, 244, 0.45)',  // Blue
      'rgba(234, 67, 53, 0.45)',   // Red
      'rgba(251, 188, 5, 0.45)',   // Yellow
      'rgba(52, 168, 83, 0.45)',   // Green
      'rgba(168, 85, 247, 0.40)',  // Violet
      'rgba(255, 255, 255, 0.55)', // Starlight white
    ];

    const particles = Array.from({ length: PARTICLE_COUNT }, (_, i) => {
      const angle = (i / PARTICLE_COUNT) * Math.PI * 2;
      const radiusX = H * 0.35;
      const radiusY = H * 0.32;
      return {
        angle,
        radiusX,
        radiusY,
        size: 1.1 + (i % 3) * 0.4,
        speed: 0.0018 + (i % 4) * 0.0008,
        color: colors[i % colors.length],
        pulse: i * 0.5,
      };
    });

    function renderParticles() {
      if (destroyed) return;
      ctx.clearRect(0, 0, W, H);

      if (!document.documentElement.classList.contains('paused')) {
        // Portal center at normalized coordinates (941 / 1720 = ~0.547, 431 / 864 = ~0.499)
        const cx = W * 0.547;
        const cy = H * 0.499;

        for (const p of particles) {
          p.pulse += 0.035;
          p.angle += p.speed;
          const x = cx + Math.cos(p.angle) * p.radiusX;
          const y = cy + Math.sin(p.angle) * p.radiusY;

          const currentAlpha = 0.18 + 0.25 * Math.sin(p.pulse);
          ctx.save();
          ctx.globalAlpha = Math.max(0, currentAlpha);
          ctx.fillStyle = p.color;
          ctx.shadowBlur = 6;
          ctx.shadowColor = p.color;
          ctx.beginPath();
          ctx.arc(x, y, p.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      }

      particleRaf = requestAnimationFrame(renderParticles);
    }

    renderParticles();
  }

  return function cleanup() {
    destroyed = true;
    clearTimeout(restingTimer);
    window.removeEventListener('pointermove', onPointerMove);
    document.removeEventListener('mouseleave', onPointerLeave);
    if (stage) {
      stage.removeEventListener('pointerenter', onStageEnter);
      stage.removeEventListener('pointerleave', onStageLeave);
    }
    if (particleRaf) cancelAnimationFrame(particleRaf);
    for (const tw of tweens) {
      tw.kill();
    }
  };
}
