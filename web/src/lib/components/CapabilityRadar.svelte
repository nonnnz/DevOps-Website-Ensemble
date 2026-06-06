<script>
  /** Capability radar (SVG): compares "ours" vs a selectable model across axes. */
  export let axes = [];
  export let models = [];

  $: ours = models.find((m) => m.ours) || models[0];
  $: others = models.filter((m) => ours && m.id !== ours.id);

  let compareId = '';
  $: if (!compareId && others.length) compareId = (others.find((m) => m.base) || others[0]).id;
  $: compare = models.find((m) => m.id === compareId);

  const cx = 160;
  const cy = 150;
  const R = 110;
  $: N = axes.length || 1;

  function point(i, val) {
    const ang = -Math.PI / 2 + (i * 2 * Math.PI) / N;
    const r = R * (val / 100);
    return [cx + Math.cos(ang) * r, cy + Math.sin(ang) * r];
  }
  function polyOf(m) {
    return axes.map((a, i) => point(i, m.scores[a.key] ?? 0).join(',')).join(' ');
  }
  function ringOf(pct) {
    return axes.map((a, i) => point(i, pct).join(',')).join(' ');
  }
  function labelOf(i) {
    const ang = -Math.PI / 2 + (i * 2 * Math.PI) / N;
    return { x: cx + Math.cos(ang) * (R + 20), y: cy + Math.sin(ang) * (R + 14) };
  }
</script>

<div class="card-soft flex flex-col p-5 sm:p-6">
  <div class="mb-3 flex items-center justify-between gap-3">
    <h3 class="text-lg font-bold text-textmain">Capability Radar</h3>
    <select bind:value={compareId} class="input-soft !w-auto py-1.5 text-xs">
      {#each others as m}<option value={m.id}>{m.name}</option>{/each}
    </select>
  </div>

  <div class="flex justify-center">
    <svg viewBox="0 0 320 300" class="h-auto w-full max-w-[340px]" role="img" aria-label="Capability radar">
      {#each [25, 50, 75, 100] as pct}
        <polygon points={ringOf(pct)} fill="none" stroke="#DCEBFF" stroke-width="1" />
      {/each}
      {#each axes as a, i}
        {@const p = point(i, 100)}
        {@const l = labelOf(i)}
        <line x1={cx} y1={cy} x2={p[0]} y2={p[1]} stroke="#DCEBFF" />
        <text x={l.x} y={l.y} fill="#64748B" font-size="9" text-anchor="middle">{a.name.split(' ')[0]}</text>
      {/each}
      {#if compare}
        <polygon points={polyOf(compare)} fill="rgba(124,92,255,.12)" stroke="#7C5CFF" stroke-width="2" />
      {/if}
      {#if ours}
        <polygon points={polyOf(ours)} fill="rgba(36,127,255,.18)" stroke="#247FFF" stroke-width="2" />
      {/if}
    </svg>
  </div>

  <div class="mt-2 flex flex-wrap justify-center gap-4 text-xs text-textmuted">
    <span class="inline-flex items-center gap-1.5"><span class="h-2.5 w-2.5 rounded-sm" style="background:#247FFF"></span>{ours?.name}</span>
    <span class="inline-flex items-center gap-1.5"><span class="h-2.5 w-2.5 rounded-sm" style="background:#7C5CFF"></span>{compare?.name}</span>
  </div>
</div>
