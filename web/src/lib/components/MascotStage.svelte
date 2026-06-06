<script>
  /**
   * MascotStage — a floating 3D-style stage for the project mascot.
   *
   * Modes:
   *   - 'placeholder' (default): polished CSS/SVG mascot, no 3D deps needed
   *   - 'image'      : static image from `src`
   *   - 'spline'     : Spline <spline-viewer> scene from `splineUrl` (lazy, client-side)
   *   - 'webgl'      : real WebGL via Threlte/Three.js from `src` (.glb, lazy, client-side)
   *
   * The 3D modes load ONLY in the browser (never during SSR) and gracefully fall
   * back to the placeholder if deps are missing, the asset is absent, or loading fails.
   *
   * TODO (3D team):
   *   - Put the final model at /static/models/mascot.glb
   *   - Switch the home page usage to mode="webgl"
   *   - Tune camera / scale / lighting in MascotWebGL.svelte
   */
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import { heroPills } from '$lib/data/site.js';
  import StatusPill from './StatusPill.svelte';

  /** @type {'placeholder'|'image'|'spline'|'webgl'} */
  export let mode = 'placeholder';
  export let src = '';
  /** Spline scene URL (.splinecode) for mode="spline". */
  export let splineUrl = '';
  export let autoRotate = true;
  export let interactive = true;
  export let pills = heroPills;

  let WebGLComponent = null;
  let webglFailed = false;
  let loadingWebGL = false;

  let SplineComponent = null;
  let splineFailed = false;
  let loadingSpline = false;

  // What we actually render right now (failed 3D modes fall back to placeholder).
  $: resolvedMode =
    (mode === 'webgl' && webglFailed) || (mode === 'spline' && splineFailed) ? 'placeholder' : mode;

  onMount(async () => {
    if (!browser) return;

    if (mode === 'webgl') {
      loadingWebGL = true;
      try {
        WebGLComponent = (await import('./MascotWebGL.svelte')).default;
      } catch (err) {
        console.warn('[MascotStage] WebGL unavailable, using placeholder:', err);
        webglFailed = true;
      } finally {
        loadingWebGL = false;
      }
    }

    if (mode === 'spline') {
      loadingSpline = true;
      try {
        SplineComponent = (await import('./MascotSpline.svelte')).default;
      } catch (err) {
        console.warn('[MascotStage] Spline unavailable, using placeholder:', err);
        splineFailed = true;
      } finally {
        loadingSpline = false;
      }
    }
  });

  function handleWebGLFail() {
    webglFailed = true;
  }
  function handleSplineFail() {
    splineFailed = true;
  }
</script>

<div class="relative">
  <!-- Floating stage card -->
  <div
    class="gradient-stage glow-primary relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-3xl border border-bordersoft p-6 sm:aspect-[4/3] lg:aspect-square"
  >
    <!-- soft radial accents -->
    <div class="pointer-events-none absolute -left-10 -top-10 h-40 w-40 rounded-full bg-primary/20 blur-3xl"></div>
    <div class="pointer-events-none absolute -bottom-10 -right-10 h-44 w-44 rounded-full bg-primary/15 blur-3xl"></div>

    {#if resolvedMode === 'spline' && SplineComponent}
      <div class="absolute inset-0">
        <svelte:component this={SplineComponent} url={splineUrl} {interactive} on:fail={handleSplineFail} />
      </div>
    {:else if resolvedMode === 'spline' && loadingSpline}
      <div class="flex flex-col items-center gap-3 text-primary">
        <span class="h-10 w-10 animate-spin rounded-full border-2 border-primary/30 border-t-primary"></span>
        <span class="text-sm font-medium">Loading 3D mascot…</span>
      </div>
    {:else if resolvedMode === 'webgl' && WebGLComponent}
      <div class="absolute inset-0">
        <svelte:component this={WebGLComponent} {src} {autoRotate} {interactive} on:fail={handleWebGLFail} />
      </div>
    {:else if resolvedMode === 'webgl' && loadingWebGL}
      <div class="flex flex-col items-center gap-3 text-primary">
        <span class="h-10 w-10 animate-spin rounded-full border-2 border-primary/30 border-t-primary"></span>
        <span class="text-sm font-medium">Loading 3D mascot…</span>
      </div>
    {:else if resolvedMode === 'image'}
      <img src={src} alt="Thai LLM mascot" class="max-h-full max-w-full animate-float object-contain" />
    {:else}
      <!-- Placeholder mascot (pure SVG/CSS, primary color #247FFF) -->
      <div class="animate-float">
        <svg viewBox="0 0 220 240" class="h-56 w-56 drop-shadow-xl sm:h-64 sm:w-64" role="img" aria-label="Thai LLM mascot placeholder">
          <defs>
            <linearGradient id="body" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stop-color="#4A95FF" />
              <stop offset="1" stop-color="#1F6FE0" />
            </linearGradient>
            <radialGradient id="cheek" cx="0.5" cy="0.5" r="0.5">
              <stop offset="0" stop-color="#A7CBFF" />
              <stop offset="1" stop-color="#A7CBFF" stop-opacity="0" />
            </radialGradient>
          </defs>

          <!-- antenna -->
          <line x1="110" y1="36" x2="110" y2="58" stroke="#1F6FE0" stroke-width="5" stroke-linecap="round" />
          <circle cx="110" cy="30" r="9" fill="#EAF3FF" stroke="#247FFF" stroke-width="3" />

          <!-- head -->
          <rect x="40" y="56" width="140" height="120" rx="38" fill="url(#body)" />
          <!-- face screen -->
          <rect x="58" y="78" width="104" height="76" rx="26" fill="#0F2A57" />
          <!-- eyes -->
          <circle cx="92" cy="116" r="11" fill="#EAF3FF" />
          <circle cx="128" cy="116" r="11" fill="#EAF3FF" />
          <circle cx="94" cy="118" r="4" fill="#0F2A57" />
          <circle cx="130" cy="118" r="4" fill="#0F2A57" />
          <!-- smile -->
          <path d="M92 138 q18 16 36 0" fill="none" stroke="#4A95FF" stroke-width="4" stroke-linecap="round" />
          <!-- cheeks -->
          <circle cx="70" cy="132" r="12" fill="url(#cheek)" />
          <circle cx="150" cy="132" r="12" fill="url(#cheek)" />

          <!-- body / collar -->
          <rect x="74" y="176" width="72" height="34" rx="16" fill="url(#body)" />
          <rect x="92" y="186" width="36" height="6" rx="3" fill="#EAF3FF" />

          <!-- floating base shadow -->
          <ellipse cx="110" cy="226" rx="56" ry="9" fill="#247FFF" opacity="0.18" />
        </svg>
      </div>
    {/if}

    <!-- Status pills around the mascot (desktop: corners) -->
    <div class="pointer-events-none absolute inset-0 hidden md:block">
      {#if pills[0]}<div class="absolute left-4 top-4"><StatusPill label={pills[0].label} tone={pills[0].tone} pulse /></div>{/if}
      {#if pills[1]}<div class="absolute right-4 top-4"><StatusPill label={pills[1].label} tone={pills[1].tone} /></div>{/if}
      {#if pills[2]}<div class="absolute bottom-4 left-4"><StatusPill label={pills[2].label} tone={pills[2].tone} /></div>{/if}
      {#if pills[3]}<div class="absolute bottom-4 right-4"><StatusPill label={pills[3].label} tone={pills[3].tone} pulse /></div>{/if}
    </div>
  </div>

  <!-- Status pills (mobile: wrapped row below the stage) -->
  <div class="mt-4 flex flex-wrap justify-center gap-2 md:hidden">
    {#each pills as pill}
      <StatusPill label={pill.label} tone={pill.tone} />
    {/each}
  </div>
</div>
