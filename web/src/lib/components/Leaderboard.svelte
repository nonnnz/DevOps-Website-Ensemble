<script>
  /** Leaderboard table: models × capability axes + overall, ranked, ours highlighted. */
  export let axes = [];
  export let models = [];

  let showDelta = false;
  $: base = models.find((m) => m.base);
  $: ranked = [...models].sort((a, b) => b.overall - a.overall);

  const short = (name) => name.split(' ')[0];
  function tone(v) {
    return v >= 80 ? 'text-success' : v >= 65 ? 'text-primary' : v >= 50 ? 'text-warning' : 'text-danger';
  }
</script>

<div class="card-soft p-5 sm:p-6">
  <div class="mb-4 flex items-center justify-between gap-3">
    <h3 class="text-lg font-bold text-textmain">Leaderboard</h3>
    {#if base}
      <button
        type="button"
        on:click={() => (showDelta = !showDelta)}
        class="rounded-full border px-3 py-1 text-xs font-medium transition {showDelta
          ? 'border-primary bg-primary-soft text-primary'
          : 'border-bordersoft text-textmuted hover:text-primary'}"
      >
        Δ vs {short(base.name)}: {showDelta ? 'ON' : 'OFF'}
      </button>
    {/if}
  </div>

  <div class="scrollbar-thin overflow-x-auto">
    <table class="w-full min-w-[700px] text-center text-sm">
      <thead class="text-[11px] uppercase tracking-wide text-textmuted">
        <tr>
          <th class="px-2 py-2 text-left">Model</th>
          {#each axes as a}<th class="px-2 py-2" title={a.name}>{short(a.name)}</th>{/each}
          <th class="px-2 py-2">Overall</th>
        </tr>
      </thead>
      <tbody>
        {#each ranked as m, ri}
          <tr class="border-t border-bordersoft {m.ours ? 'bg-primary-soft/60' : 'hover:bg-surface/60'}">
            <td class="whitespace-nowrap px-2 py-2.5 text-left">
              <span class="mr-2 text-xs text-textmuted">{ri + 1}</span>
              <span class="font-semibold {m.ours ? 'text-primary' : 'text-textmain'}">{m.name}</span>
              {#if m.ours}<span class="badge ml-2 bg-primary-soft text-primary">ours</span>{/if}
            </td>
            {#each axes as a}
              {@const v = m.scores[a.key] ?? 0}
              <td class="px-2 py-2.5 font-mono">
                <span class={tone(v)}>{v}</span>
                {#if showDelta && base && !m.base}
                  {@const dd = v - (base.scores[a.key] ?? 0)}
                  <span class="block text-[10px] {dd >= 0 ? 'text-success' : 'text-danger'}">
                    {dd >= 0 ? '+' : ''}{dd}
                  </span>
                {/if}
              </td>
            {/each}
            <td class="px-2 py-2.5 font-mono font-bold {tone(m.overall)}">{m.overall}</td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>

  <p class="mt-3 text-xs text-textmuted">
    แถวไฮไลต์ = โมเดลของเรา · เปิด Δ เพื่อดูว่าดีขึ้น/ถอยจาก base · คะแนน normalize 0–100
  </p>
</div>
