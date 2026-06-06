<script>
  import SectionHeader from '$lib/components/SectionHeader.svelte';
  import MetricCard from '$lib/components/MetricCard.svelte';
  import { formatDateTime } from '$lib/utils/format.js';

  export let data;
  $: evaluations = data.evaluations || [];
  $: quality = evaluations.filter((e) => e.category === 'quality');
  $: serving = evaluations.filter((e) => e.category === 'serving');

  function tone(e) {
    if (e.benchmark_name === 'Error Rate') return e.score < 1 ? 'success' : 'danger';
    if (e.metric === '%') return e.score >= 85 ? 'success' : e.score >= 70 ? 'primary' : 'warning';
    return 'primary';
  }
</script>

<svelte:head>
  <title>Evaluation — Thai LLM</title>
</svelte:head>

<section class="section pt-12">
  <div class="container-app">
    <SectionHeader
      eyebrow="Evaluation"
      title="Model quality & serving metrics"
      subtitle="Benchmarks across Thai understanding, reasoning, safety and real-world serving performance."
    />

    <!-- Quality metrics -->
    <h3 class="mb-4 text-lg font-bold text-textmain">Model quality</h3>
    <div class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      {#each quality as e}
        <MetricCard
          label={e.benchmark_name}
          value={e.score}
          unit={e.metric}
          tone={tone(e)}
          progress={e.metric === '%' ? e.score : null}
          sublabel={e.notes}
        />
      {/each}
    </div>

    <!-- Serving metrics -->
    <h3 class="mb-4 mt-12 text-lg font-bold text-textmain">Serving metrics</h3>
    <div class="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {#each serving as e}
        <MetricCard label={e.benchmark_name} value={e.score} unit={e.metric} tone={tone(e)} sublabel={e.notes} />
      {/each}
    </div>

    <!-- Benchmark table -->
    <h3 class="mb-4 mt-12 text-lg font-bold text-textmain">Benchmark results</h3>
    <div class="card-soft overflow-hidden">
      <div class="scrollbar-thin overflow-x-auto">
        <table class="w-full min-w-[640px] text-left text-sm">
          <thead class="bg-surface text-xs uppercase tracking-wide text-textmuted">
            <tr>
              <th class="px-5 py-3">Benchmark</th>
              <th class="px-5 py-3">Category</th>
              <th class="px-5 py-3">Model</th>
              <th class="px-5 py-3">Score</th>
              <th class="px-5 py-3">Notes</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-bordersoft">
            {#each evaluations as e}
              <tr class="hover:bg-surface/60">
                <td class="px-5 py-3 font-medium text-textmain">{e.benchmark_name}</td>
                <td class="px-5 py-3 capitalize text-textmuted">{e.category}</td>
                <td class="px-5 py-3 font-mono text-xs text-textmuted">{e.model_id}</td>
                <td class="px-5 py-3 font-semibold text-textmain">{e.score} {e.metric}</td>
                <td class="px-5 py-3 text-textmuted">{e.notes || '-'}</td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    </div>
  </div>
</section>
