<script>
  /**
   * Admin config form: API Backend Config (A) + Feature Flags (C).
   * Saves to /api/config. The real API key is never shown or stored — only a
   * masked placeholder; the live key must be set in env (LLM_API_KEY).
   */
  import Button from './Button.svelte';

  export let apiConfig = {};
  export let featureFlags = {};

  // Local editable copies.
  let cfg = { ...apiConfig };
  let flags = { ...featureFlags };
  let apiKeyInput = '';
  let saving = false;
  let savedMsg = '';
  let errorMsg = '';

  const modes = ['mock', 'real'];
  const backends = ['auto', 'b200', 'lanta'];
  const serverTypes = ['vLLM', 'TGI', 'Triton', 'Custom'];

  const flagFields = [
    { key: 'enable_playground', label: 'Enable Playground' },
    { key: 'enable_streaming', label: 'Enable Streaming' },
    { key: 'enable_feedback', label: 'Enable Feedback' },
    { key: 'enable_gallery_prompts', label: 'Enable Gallery Prompts' },
    { key: 'enable_runtime_metrics', label: 'Enable Runtime Metrics' },
    { key: 'enable_public_api_docs', label: 'Enable Public API Docs' },
    { key: 'enable_webgl_mascot', label: 'Enable WebGL Mascot' }
  ];

  async function save() {
    saving = true;
    savedMsg = '';
    errorMsg = '';
    try {
      const apiConfigPayload = { ...cfg };
      // Only send a raw key if the admin typed a new one.
      if (apiKeyInput.trim()) apiConfigPayload.api_key = apiKeyInput.trim();

      const res = await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiConfig: apiConfigPayload, featureFlags: flags })
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      if (data.apiConfig) cfg = { ...cfg, ...data.apiConfig };
      if (data.featureFlags) flags = { ...flags, ...data.featureFlags };
      apiKeyInput = '';
      savedMsg = 'Saved ✓';
    } catch (err) {
      errorMsg = 'Save failed. Is the database running?';
      console.error(err);
    } finally {
      saving = false;
    }
  }
</script>

<div class="space-y-6">
  <!-- A. API Backend Config -->
  <div class="card-soft p-6">
    <h3 class="text-base font-bold text-textmain">A. API Backend Config</h3>
    <p class="mt-1 text-sm text-textmuted">Switch between mock and real inference, and point the adapter at B200 / LANTA.</p>

    <div class="mt-5 grid gap-4 sm:grid-cols-2">
      <label class="block">
        <span class="label-soft">API mode</span>
        <select bind:value={cfg.mode} class="input-soft">
          {#each modes as m}<option value={m}>{m}</option>{/each}
        </select>
      </label>
      <label class="block">
        <span class="label-soft">Default backend</span>
        <select bind:value={cfg.default_backend} class="input-soft">
          {#each backends as b}<option value={b}>{b}</option>{/each}
        </select>
      </label>
      <label class="block">
        <span class="label-soft">B200 endpoint URL</span>
        <input bind:value={cfg.b200_endpoint} class="input-soft" placeholder="https://b200.example.com" />
      </label>
      <label class="block">
        <span class="label-soft">LANTA endpoint URL</span>
        <input bind:value={cfg.lanta_endpoint} class="input-soft" placeholder="https://lanta.example.com" />
      </label>
      <label class="block sm:col-span-2">
        <span class="label-soft">OpenAI-compatible base URL</span>
        <input bind:value={cfg.openai_base_url} class="input-soft" placeholder="https://api.example.com" />
      </label>
      <label class="block">
        <span class="label-soft">Model server type</span>
        <select bind:value={cfg.model_server_type} class="input-soft">
          {#each serverTypes as t}<option value={t}>{t}</option>{/each}
        </select>
      </label>
      <label class="block">
        <span class="label-soft">API key (stored masked — real key goes in .env)</span>
        <input
          type="password"
          bind:value={apiKeyInput}
          class="input-soft font-mono"
          placeholder={cfg.api_key_placeholder ? cfg.api_key_placeholder : 'set LLM_API_KEY in .env'}
        />
      </label>
      <label class="block">
        <span class="label-soft">Timeout (seconds)</span>
        <input type="number" min="1" max="600" bind:value={cfg.timeout_seconds} class="input-soft" />
      </label>
      <label class="block">
        <span class="label-soft">Max concurrent requests</span>
        <input type="number" min="1" max="1024" bind:value={cfg.max_concurrent_requests} class="input-soft" />
      </label>
      <label class="block">
        <span class="label-soft">Rate limit / minute</span>
        <input type="number" min="1" bind:value={cfg.rate_limit_per_minute} class="input-soft" />
      </label>
    </div>
  </div>

  <!-- C. Feature Flags -->
  <div class="card-soft p-6">
    <h3 class="text-base font-bold text-textmain">C. Feature Flags</h3>
    <div class="mt-4 grid gap-3 sm:grid-cols-2">
      {#each flagFields as f}
        <label class="flex items-center justify-between rounded-xl border border-bordersoft bg-surface px-4 py-3">
          <span class="text-sm text-textmain">{f.label}</span>
          <input type="checkbox" bind:checked={flags[f.key]} class="h-5 w-5 accent-primary" />
        </label>
      {/each}
    </div>
  </div>

  <div class="flex items-center gap-3">
    <Button on:click={save} disabled={saving}>{saving ? 'Saving…' : 'Save configuration'}</Button>
    {#if savedMsg}<span class="text-sm font-medium text-success">{savedMsg}</span>{/if}
    {#if errorMsg}<span class="text-sm font-medium text-danger">{errorMsg}</span>{/if}
  </div>
</div>
