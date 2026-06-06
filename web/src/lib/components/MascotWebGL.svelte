<script>
  /**
   * Client-only WebGL mascot, rendered with Threlte (Three.js).
   * This file is dynamically imported by MascotStage ONLY in the browser, so the
   * heavy 3D dependencies never run during SSR.
   *
   * On any load failure (missing .glb, decode error) it dispatches `fail`, and
   * MascotStage falls back to the SVG placeholder.
   *
   * TODO (3D team): tune camera position, fov, target, model scale & lighting
   * once the final mascot.glb is available.
   */
  import { onMount, createEventDispatcher } from 'svelte';
  import { Canvas, T } from '@threlte/core';
  import { OrbitControls } from '@threlte/extras';
  import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

  export let src = '/models/mascot.glb';
  export let autoRotate = true;
  export let interactive = true;

  const dispatch = createEventDispatcher();

  let scene = null;
  let ready = false;

  onMount(() => {
    const loader = new GLTFLoader();
    loader.load(
      src,
      (gltf) => {
        scene = gltf.scene;
        ready = true;
      },
      undefined,
      (err) => {
        console.warn('[MascotWebGL] failed to load model:', src, err);
        dispatch('fail');
      }
    );
  });
</script>

<Canvas>
  <T.PerspectiveCamera makeDefault position={[0, 1.2, 4.5]} fov={45}>
    <OrbitControls
      enableZoom={interactive}
      enablePan={false}
      enableRotate={interactive}
      autoRotate={autoRotate}
      autoRotateSpeed={1.4}
      target={[0, 0.8, 0]}
    />
  </T.PerspectiveCamera>

  <!-- Soft studio lighting in the brand palette -->
  <T.AmbientLight intensity={0.75} />
  <T.DirectionalLight position={[4, 6, 4]} intensity={1.1} />
  <T.DirectionalLight position={[-4, 2, -3]} intensity={0.45} color="#247FFF" />

  {#if ready && scene}
    <T is={scene} position={[0, 0, 0]} />
  {/if}
</Canvas>
