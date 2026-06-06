<script>
  /**
   * FuturisticBackground — a clean, airy, high-tech white background layer.
   *
   * Bright white base + very soft color gradients, glowing blobs, floating
   * particles, thin sci-fi grid lines, glassmorphism panels and holographic
   * sheen. Purely decorative: absolute, behind content, pointer-events-none.
   *
   * Place inside a `position: relative; overflow: hidden` parent and keep page
   * content above it with `relative z-10`.
   *
   * Accessibility / perf:
   *   - aria-hidden (decorative)
   *   - particle field is a fixed, deterministic array (SSR-safe, no hydration drift)
   *   - all motion is paused by the global prefers-reduced-motion rule in app.css
   */

  // Deterministic particles: [left%, size px, duration s, delay s (negative = mid-cycle), color]
  const particles = [
    { l: 4, s: 5, d: 18, delay: -2, c: 'rgba(34,211,238,0.65)' },
    { l: 12, s: 3, d: 22, delay: -9, c: 'rgba(37,99,235,0.5)' },
    { l: 19, s: 6, d: 16, delay: -5, c: 'rgba(167,139,250,0.6)' },
    { l: 27, s: 4, d: 26, delay: -14, c: 'rgba(249,168,212,0.6)' },
    { l: 34, s: 3, d: 20, delay: -1, c: 'rgba(34,211,238,0.55)' },
    { l: 41, s: 7, d: 24, delay: -11, c: 'rgba(167,139,250,0.5)' },
    { l: 48, s: 4, d: 17, delay: -6, c: 'rgba(37,99,235,0.55)' },
    { l: 55, s: 5, d: 23, delay: -16, c: 'rgba(249,168,212,0.55)' },
    { l: 62, s: 3, d: 19, delay: -3, c: 'rgba(34,211,238,0.6)' },
    { l: 68, s: 6, d: 25, delay: -12, c: 'rgba(167,139,250,0.55)' },
    { l: 74, s: 4, d: 21, delay: -7, c: 'rgba(37,99,235,0.5)' },
    { l: 80, s: 5, d: 15, delay: -4, c: 'rgba(249,168,212,0.6)' },
    { l: 86, s: 3, d: 27, delay: -18, c: 'rgba(34,211,238,0.5)' },
    { l: 91, s: 6, d: 20, delay: -8, c: 'rgba(167,139,250,0.6)' },
    { l: 96, s: 4, d: 24, delay: -13, c: 'rgba(249,168,212,0.55)' },
    { l: 9, s: 4, d: 28, delay: -20, c: 'rgba(167,139,250,0.45)' },
    { l: 58, s: 3, d: 30, delay: -22, c: 'rgba(34,211,238,0.45)' },
    { l: 30, s: 5, d: 29, delay: -10, c: 'rgba(249,168,212,0.5)' }
  ];
</script>

<div class="fx" aria-hidden="true">
  <!-- soft color wash over the white base -->
  <div class="wash"></div>

  <!-- thin sci-fi grid lines (masked to fade out for airiness) -->
  <div class="lines"></div>

  <!-- glowing neon blobs -->
  <span class="blob blob-cyan"></span>
  <span class="blob blob-blue"></span>
  <span class="blob blob-lav"></span>
  <span class="blob blob-pink"></span>

  <!-- glassmorphism panels with holographic sheen -->
  <div class="panel panel-1"></div>
  <div class="panel panel-2"></div>

  <!-- thin HUD accent line -->
  <svg class="hud" viewBox="0 0 200 60" preserveAspectRatio="none">
    <line x1="0" y1="30" x2="160" y2="30" stroke="rgba(36,127,255,0.25)" stroke-width="0.5" />
    <circle cx="160" cy="30" r="2" fill="rgba(34,211,238,0.6)" />
    <circle cx="180" cy="30" r="1.2" fill="rgba(167,139,250,0.6)" />
  </svg>

  <!-- floating particles -->
  {#each particles as p}
    <span
      class="dot"
      style="left:{p.l}%; width:{p.s}px; height:{p.s}px; background:{p.c}; box-shadow:0 0 {p.s * 2.5}px {p.c}; animation-duration:{p.d}s; animation-delay:{p.delay}s;"
    ></span>
  {/each}

  <!-- soft central bloom keeps the middle bright + airy for content -->
  <div class="bloom"></div>
</div>

<style>
  .fx {
    position: absolute;
    inset: 0;
    overflow: hidden;
    pointer-events: none;
    z-index: 0;
  }

  .wash {
    position: absolute;
    inset: 0;
    background:
      radial-gradient(720px 400px at 16% 10%, rgba(34, 211, 238, 0.13), transparent 60%),
      radial-gradient(700px 440px at 86% 16%, rgba(167, 139, 250, 0.13), transparent 60%),
      radial-gradient(640px 400px at 78% 90%, rgba(249, 168, 212, 0.11), transparent 60%),
      radial-gradient(660px 420px at 18% 88%, rgba(37, 99, 235, 0.09), transparent 60%);
  }

  .lines {
    position: absolute;
    inset: 0;
    background-image:
      repeating-linear-gradient(90deg, rgba(36, 127, 255, 0.05) 0 1px, transparent 1px 86px),
      repeating-linear-gradient(0deg, rgba(167, 139, 250, 0.045) 0 1px, transparent 1px 86px);
    -webkit-mask-image: radial-gradient(circle at 50% 42%, #000 0%, transparent 78%);
    mask-image: radial-gradient(circle at 50% 42%, #000 0%, transparent 78%);
  }

  .blob {
    position: absolute;
    border-radius: 50%;
    filter: blur(64px);
    opacity: 0.4;
    will-change: transform;
  }
  .blob-cyan {
    width: 360px;
    height: 360px;
    background: #22d3ee;
    top: -70px;
    left: -50px;
    animation: drift1 20s ease-in-out infinite;
  }
  .blob-blue {
    width: 420px;
    height: 420px;
    background: #2563eb;
    top: 30%;
    right: -90px;
    opacity: 0.28;
    animation: drift2 26s ease-in-out infinite;
  }
  .blob-lav {
    width: 340px;
    height: 340px;
    background: #a78bfa;
    bottom: -80px;
    left: 28%;
    animation: drift3 23s ease-in-out infinite;
  }
  .blob-pink {
    width: 300px;
    height: 300px;
    background: #f9a8d4;
    top: 8%;
    left: 40%;
    opacity: 0.32;
    animation: drift1 28s ease-in-out infinite reverse;
  }

  .panel {
    position: absolute;
    border-radius: 26px;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.55), rgba(255, 255, 255, 0.12));
    border: 1px solid rgba(255, 255, 255, 0.7);
    box-shadow:
      0 30px 80px -40px rgba(36, 127, 255, 0.45),
      inset 0 1px 0 rgba(255, 255, 255, 0.8);
    backdrop-filter: blur(6px);
    -webkit-backdrop-filter: blur(6px);
    overflow: hidden;
    opacity: 0.7;
    will-change: transform;
  }
  .panel::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(
      115deg,
      transparent 30%,
      rgba(34, 211, 238, 0.18) 44%,
      rgba(167, 139, 250, 0.18) 56%,
      transparent 70%
    );
    transform: translateX(-65%);
    animation: shimmer 8s ease-in-out infinite;
  }
  .panel-1 {
    --r: -12deg;
    width: 220px;
    height: 150px;
    top: 14%;
    right: 8%;
    transform: rotate(var(--r));
    animation: panelFloat 14s ease-in-out infinite;
  }
  .panel-2 {
    --r: 8deg;
    width: 160px;
    height: 110px;
    bottom: 12%;
    left: 6%;
    transform: rotate(var(--r));
    animation: panelFloat 18s ease-in-out infinite reverse;
  }

  .hud {
    position: absolute;
    top: 22%;
    left: 4%;
    width: 180px;
    height: 50px;
    opacity: 0.5;
  }

  .dot {
    position: absolute;
    bottom: -10px;
    border-radius: 50%;
    animation-name: floatUp;
    animation-iteration-count: infinite;
    animation-timing-function: ease-in-out;
    will-change: transform, opacity;
  }

  .bloom {
    position: absolute;
    inset: 0;
    background: radial-gradient(46% 38% at 50% 32%, rgba(255, 255, 255, 0.65), transparent 72%);
  }

  @keyframes drift1 {
    0%,
    100% {
      transform: translate(0, 0) scale(1);
    }
    50% {
      transform: translate(40px, 30px) scale(1.08);
    }
  }
  @keyframes drift2 {
    0%,
    100% {
      transform: translate(0, 0) scale(1);
    }
    50% {
      transform: translate(-50px, 40px) scale(1.1);
    }
  }
  @keyframes drift3 {
    0%,
    100% {
      transform: translate(0, 0) scale(1);
    }
    50% {
      transform: translate(30px, -36px) scale(1.06);
    }
  }
  @keyframes shimmer {
    0% {
      transform: translateX(-65%);
    }
    55%,
    100% {
      transform: translateX(65%);
    }
  }
  @keyframes panelFloat {
    0%,
    100% {
      transform: translateY(0) rotate(var(--r, 0deg));
    }
    50% {
      transform: translateY(-16px) rotate(var(--r, 0deg));
    }
  }
  @keyframes floatUp {
    0% {
      transform: translateY(0) translateX(0);
      opacity: 0;
    }
    12% {
      opacity: 1;
    }
    88% {
      opacity: 0.85;
    }
    100% {
      transform: translateY(-340px) translateX(14px);
      opacity: 0;
    }
  }
</style>
