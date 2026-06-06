<script>
  /**
   * Admin status panel (section D): test backend connectivity / chat completion.
   * Calls /api/status/test which records each result to status_checks.
   */
  import Button from './Button.svelte';
  import StatusPill from './StatusPill.svelte';
  import { statusTone } from '$lib/utils/format.js';

  const targets = [
    { backend: 'b200', label: 'Test B200 Endpoint' },
    { backend: 'lanta', label: 'Test LANTA Endpoint' },
    { backend: 'chat', label: 'Test Chat Completion' }
  ];

  /** @type {Record<string, {loading?:boolean, status?:string, latency_ms?:number, error_message?:string}>} */
  let results = {};

  async function test(backend) {
    results[backend] = { loading: true };
    results = results;
    try {
      const res = await fetch('/api/status/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ backend })
      });
      const data = await res.json();
      results[backend] = { ...data, loading: false };
    } catch (err) {
      results[backend] = { status: 'offline', error_message: String(err), loading: false };
    } finally {
      results = results;
    }
  }
</script>

<div class="card-soft p-6">
  <h3 class="text-base font-bold text-textmain">D. Status Check</h3>
  <p class="mt-1 text-sm text-textmuted">In mock mode these return simulated results. In real mode they ping your configured endpoints.</p>

  <div class="mt-5 space-y-3">
    {#each targets as t}
      <div class="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-bordersoft bg-surface px-4 py-3">
        <Button variant="outline" size="sm" on:click={() => test(t.backend)} disabled={results[t.backend]?.loading}>
          {results[t.backend]?.loading ? 'Testing…' : t.label}
        </Button>

        {#if results[t.backend] && !results[t.backend].loading}
          <div class="flex items-center gap-3 text-sm">
            <StatusPill label={results[t.backend].status} tone={statusTone[results[t.backend].status] || 'muted'} />
            {#if results[t.backend].latency_ms != null}
              <span class="text-textmuted">{results[t.backend].latency_ms} ms</span>
            {/if}
            {#if results[t.backend].error_message}
              <span class="max-w-[16rem] truncate text-danger" title={results[t.backend].error_message}>
                {results[t.backend].error_message}
              </span>
            {/if}
          </div>
        {/if}
      </div>
    {/each}
  </div>
</div>
