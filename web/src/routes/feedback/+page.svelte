<script>
  import SectionHeader from '$lib/components/SectionHeader.svelte';
  import MetricCard from '$lib/components/MetricCard.svelte';
  import Button from '$lib/components/Button.svelte';
  import StatusPill from '$lib/components/StatusPill.svelte';
  import { formatDateTime, truncate } from '$lib/utils/format.js';
  import { toCSV, downloadCSV } from '$lib/utils/csv.js';

  export let data;
  $: items = data.items || [];

  // Filters
  let fModel = '';
  let fBackend = '';
  let fType = '';

  $: models = [...new Set(items.map((i) => i.model_id))].filter((m) => m && m !== '-');
  $: backends = [...new Set(items.map((i) => i.backend))].filter((b) => b && b !== '-');

  $: filtered = items.filter(
    (i) =>
      (!fModel || i.model_id === fModel) &&
      (!fBackend || i.backend === fBackend) &&
      (!fType || i.feedback_type === fType)
  );

  const types = ['good', 'bad', 'hallucination', 'unsafe'];
  const typeTone = { good: 'success', bad: 'warning', hallucination: 'warning', unsafe: 'danger' };

  $: counts = types.reduce((acc, t) => {
    acc[t] = items.filter((i) => i.feedback_type === t).length;
    return acc;
  }, {});

  function exportCSV() {
    const csv = toCSV(
      filtered.map((i) => ({
        created_at: i.created_at,
        feedback_type: i.feedback_type,
        model_id: i.model_id,
        backend: i.backend,
        user_prompt: i.user_prompt,
        comment: i.comment
      })),
      ['created_at', 'feedback_type', 'model_id', 'backend', 'user_prompt', 'comment']
    );
    downloadCSV(`feedback-${new Date().toISOString().slice(0, 10)}.csv`, csv);
  }
</script>

<svelte:head>
  <title>Feedback — Thai LLM</title>
</svelte:head>

<section class="section pt-12">
  <div class="container-app">
    <SectionHeader
      eyebrow="Feedback"
      title="Feedback dashboard"
      subtitle="User ratings collected from the playground, stored in PostgreSQL."
    />

    <!-- Counts -->
    <div class="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      <MetricCard label="👍 Good" value={counts.good} tone="success" />
      <MetricCard label="👎 Bad" value={counts.bad} tone="warning" />
      <MetricCard label="🌀 Hallucination" value={counts.hallucination} tone="warning" />
      <MetricCard label="⚠ Unsafe" value={counts.unsafe} tone="danger" />
    </div>

    <!-- Filters -->
    <div class="card-soft mt-8 flex flex-wrap items-end gap-4 p-5">
      <label class="block">
        <span class="label-soft">Model</span>
        <select bind:value={fModel} class="input-soft !w-auto min-w-[12rem]">
          <option value="">All models</option>
          {#each models as m}<option value={m}>{m}</option>{/each}
        </select>
      </label>
      <label class="block">
        <span class="label-soft">Backend</span>
        <select bind:value={fBackend} class="input-soft !w-auto min-w-[10rem]">
          <option value="">All backends</option>
          {#each backends as b}<option value={b}>{b}</option>{/each}
        </select>
      </label>
      <label class="block">
        <span class="label-soft">Feedback type</span>
        <select bind:value={fType} class="input-soft !w-auto min-w-[10rem]">
          <option value="">All types</option>
          {#each types as t}<option value={t}>{t}</option>{/each}
        </select>
      </label>
      <div class="ml-auto">
        <Button variant="outline" size="sm" on:click={exportCSV} disabled={filtered.length === 0}>Export CSV</Button>
      </div>
    </div>

    <!-- Table -->
    <div class="card-soft mt-6 overflow-hidden">
      <div class="scrollbar-thin overflow-x-auto">
        <table class="w-full min-w-[760px] text-left text-sm">
          <thead class="bg-surface text-xs uppercase tracking-wide text-textmuted">
            <tr>
              <th class="px-5 py-3">Time</th>
              <th class="px-5 py-3">Type</th>
              <th class="px-5 py-3">Model</th>
              <th class="px-5 py-3">Backend</th>
              <th class="px-5 py-3">Prompt</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-bordersoft">
            {#each filtered as i}
              <tr class="hover:bg-surface/60">
                <td class="whitespace-nowrap px-5 py-3 text-textmuted">{formatDateTime(i.created_at)}</td>
                <td class="px-5 py-3"><StatusPill label={i.feedback_type} tone={typeTone[i.feedback_type] || 'muted'} dot={false} /></td>
                <td class="px-5 py-3 font-mono text-xs text-textmuted">{i.model_id}</td>
                <td class="px-5 py-3 uppercase text-textmuted">{i.backend}</td>
                <td class="px-5 py-3 text-textmain">{truncate(i.user_prompt, 70)}</td>
              </tr>
            {/each}
            {#if filtered.length === 0}
              <tr><td colspan="5" class="px-5 py-10 text-center text-textmuted">
                No feedback yet. Try the <a href="/playground" class="text-primary">Playground</a> and rate a response.
              </td></tr>
            {/if}
          </tbody>
        </table>
      </div>
    </div>
  </div>
</section>
