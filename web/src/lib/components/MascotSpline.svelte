<script>
  /**
   * Client-only Spline mascot.
   * Renders the <spline-viewer> web component (from the Spline export) and loads
   * a scene from a .splinecode URL. Dynamically imported by MascotStage ONLY in
   * the browser, so the viewer never runs during SSR.
   *
   * On any failure (viewer script blocked, scene URL error, load timeout) it
   * dispatches `fail`, and MascotStage falls back to the SVG placeholder.
   *
   * Scene URL comes from the Spline export (spline-robot-head.html):
   *   https://prod.spline.design/<id>/scene.splinecode
   */
  import { onMount, createEventDispatcher } from 'svelte';

  export let url = '';
  // Spline drives its own camera/auto-rotate inside the scene; we only gate input.
  export let interactive = true;

  const VIEWER_SRC = 'https://unpkg.com/@splinetool/viewer/build/spline-viewer.js';
  const LOAD_TIMEOUT_MS = 15000;

  const dispatch = createEventDispatcher();

  let ready = false; // <spline-viewer> custom element is defined
  let viewerEl;

  /** @param {number} ms */
  const timeout = (ms) => new Promise((_, reject) => setTimeout(() => reject(new Error('spline timeout')), ms));

  function fail(reason) {
    console.warn('[MascotSpline] falling back to placeholder:', reason);
    dispatch('fail');
  }

  onMount(async () => {
    if (typeof window === 'undefined' || !('customElements' in window)) {
      fail('no custom elements support');
      return;
    }
    try {
      if (!customElements.get('spline-viewer')) {
        // Inject the viewer module script once (matches the Spline export).
        if (!document.querySelector('script[data-spline-viewer]')) {
          const script = document.createElement('script');
          script.type = 'module';
          script.src = VIEWER_SRC;
          script.dataset.splineViewer = 'true';
          script.addEventListener('error', () => fail('viewer script failed to load'));
          document.head.appendChild(script);
        }
        await Promise.race([customElements.whenDefined('spline-viewer'), timeout(LOAD_TIMEOUT_MS)]);
      }
      ready = true;
    } catch (err) {
      fail(err?.message || 'load error');
    }
  });
</script>

{#if ready}
  <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
  <spline-viewer
    bind:this={viewerEl}
    url={url}
    loading-anim-type="spinner-small-light"
    style="width:100%;height:100%;display:block;background:transparent;{interactive ? '' : 'pointer-events:none;'}"
    on:error={() => fail('scene error event')}
  ></spline-viewer>
{:else}
  <div class="flex flex-col items-center gap-3 text-primary">
    <span class="h-10 w-10 animate-spin rounded-full border-2 border-primary/30 border-t-primary"></span>
    <span class="text-sm font-medium">Loading 3D mascot…</span>
  </div>
{/if}
