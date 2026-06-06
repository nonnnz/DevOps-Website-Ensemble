<script>
  import { formatNumber } from '$lib/utils/format.js';
  import StatusPill from './StatusPill.svelte';
  import { statusTone } from '$lib/utils/format.js';

  /** @type {object|null} */
  export let metrics = null;
</script>

<div class="card-soft p-5">
  <div class="mb-4 flex items-center justify-between">
    <h3 class="text-sm font-bold text-textmain">Runtime Metrics</h3>
    {#if metrics?.status}
      <StatusPill label={metrics.status} tone={statusTone[metrics.status] || 'muted'} />
    {/if}
  </div>

  {#if metrics}
    <dl class="grid grid-cols-2 gap-3 text-sm">
      <div class="rounded-xl bg-surface p-3">
        <dt class="text-xs text-textmuted">Backend</dt>
        <dd class="font-semibold uppercase text-textmain">{metrics.backend || '-'}</dd>
      </div>
      <div class="rounded-xl bg-surface p-3">
        <dt class="text-xs text-textmuted">Latency</dt>
        <dd class="font-semibold text-textmain">{formatNumber(metrics.latency_ms)} ms</dd>
      </div>
      <div class="rounded-xl bg-surface p-3">
        <dt class="text-xs text-textmuted">Tokens / sec</dt>
        <dd class="font-semibold text-textmain">{metrics.tokens_per_second ?? '-'}</dd>
      </div>
      <div class="rounded-xl bg-surface p-3">
        <dt class="text-xs text-textmuted">Output tokens</dt>
        <dd class="font-semibold text-textmain">{formatNumber(metrics.output_tokens)}</dd>
      </div>
      <div class="rounded-xl bg-surface p-3">
        <dt class="text-xs text-textmuted">Input tokens</dt>
        <dd class="font-semibold text-textmain">{formatNumber(metrics.input_tokens)}</dd>
      </div>
      <div class="rounded-xl bg-surface p-3">
        <dt class="text-xs text-textmuted">Request ID</dt>
        <dd class="truncate font-mono text-xs text-textmain" title={metrics.request_id}>{metrics.request_id || '-'}</dd>
      </div>
    </dl>
  {:else}
    <p class="text-sm text-textmuted">Send a message to see backend, latency and token metrics.</p>
  {/if}
</div>
