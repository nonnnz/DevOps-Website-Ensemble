<script>
  import SectionHeader from '$lib/components/SectionHeader.svelte';
  import MetricCard from '$lib/components/MetricCard.svelte';
  import Leaderboard from '$lib/components/Leaderboard.svelte';
  import CapabilityRadar from '$lib/components/CapabilityRadar.svelte';

  export let data;
  $: evaluations = data.evaluations || [];
  $: evalAxes = data.evalBoard?.axes || [];
  $: evalModels = data.evalBoard?.models || [];

  // Eval API example (kept as a string so Svelte does not parse the braces).
  const evalCurl = `curl -X POST https://your-host/eval/Qwen-Thai-SFT \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "Qwen-Thai-SFT",
    "tasks": { "exam": 71, "math": 58, "inst": 74, "safe": 91 }
  }'`;
  $: serving = evaluations.filter((e) => e.category === 'serving');

  function tone(e) {
    if (e.benchmark_name === 'Error Rate') return e.score < 1 ? 'success' : 'danger';
    if (e.metric === '%') return e.score >= 85 ? 'success' : e.score >= 70 ? 'primary' : 'warning';
    return 'primary';
  }
</script>

<svelte:head>
  <title>Evaluation - Super AI Engineer LLM</title>
</svelte:head>

<section class="section pt-32">
  <div class="container-app">
    <SectionHeader
      eyebrow="Evaluation"
      title="Model quality & serving metrics"
      subtitle="Benchmarks across Thai understanding, reasoning, safety and real-world serving performance."
    />

    <!-- Leaderboard + Capability Radar -->
    <div class="mb-14 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
      <Leaderboard axes={evalAxes} models={evalModels} />
      <CapabilityRadar axes={evalAxes} models={evalModels} />
    </div>

    <!-- Serving metrics -->
    <h3 class="mb-4 text-lg font-bold text-textmain">Serving metrics</h3>
    <div class="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {#each serving as e}
        <MetricCard label={e.benchmark_name} value={e.score} unit={e.metric} tone={tone(e)} sublabel={e.notes} />
      {/each}
    </div>

    <!-- Eval API -->
    <div class="card-soft mt-12 p-6">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <h3 class="text-lg font-bold text-textmain">Submit eval results — API</h3>
        <code class="rounded-lg bg-primary-soft px-2.5 py-1 font-mono text-xs text-primary">POST /eval/{'{model_id}'}</code>
      </div>
      <p class="mt-2 text-sm text-textmuted">
        ส่งผล eval หลาย task ของแต่ละโมเดลเข้ามา แล้ว Leaderboard + Radar จะอัปเดตตาม
        (task keys: exam, math, inst, chat, trans, nlu, legal, safe · ค่า 0–100)
      </p>
      <pre class="eval-code"><code>{evalCurl}</code></pre>
      <p class="mt-2 text-xs text-textmuted">เอกสารฉบับเต็มที่ <code class="font-mono">web/EVAL_API.md</code></p>
    </div>
  </div>
</section>

<style>
  .eval-code {
    margin-top: 0.75rem;
    overflow-x: auto;
    border-radius: 0.75rem;
    background: #0f2a57;
    padding: 1rem;
    font-size: 0.8rem;
    line-height: 1.55;
    color: #e8f1ff;
  }
  .eval-code :global(code) {
    font-family: 'JetBrains Mono', ui-monospace, monospace;
    white-space: pre;
  }
</style>
