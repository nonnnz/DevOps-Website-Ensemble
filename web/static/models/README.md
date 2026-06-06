# 3D Mascot models

Put the final mascot here as `mascot.glb` (or `.gltf`).

```
static/models/mascot.glb
```

Then switch the mascot to WebGL mode on the home page:

```svelte
<MascotStage mode="webgl" src="/models/mascot.glb" autoRotate interactive />
```

Until a real model exists, `MascotStage` automatically falls back to the polished
CSS/SVG **placeholder** mascot — so the site looks good with no `.glb` present.

TODO (ML / 3D team):
- Drop the final `.glb` file in this folder.
- Tune camera position, model scale, rotation and lighting in
  `src/lib/components/MascotWebGL.svelte` after the asset is final.
