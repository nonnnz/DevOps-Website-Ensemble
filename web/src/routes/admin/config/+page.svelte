<script>
  import ConfigForm from '$lib/components/ConfigForm.svelte';
  import ApiStatusPanel from '$lib/components/ApiStatusPanel.svelte';
  import Button from '$lib/components/Button.svelte';
  import StatusPill from '$lib/components/StatusPill.svelte';
  import { statusTone } from '$lib/utils/format.js';

  export let data;

  let models = [...(data.models || [])];

  // --- Model config (section B) editor -----------------------------------
  function blankModel() {
    return {
      model_id: '',
      display_name: '',
      model_type: 'chat',
      parameters: '8B',
      context_length: 8192,
      max_output_tokens: 2048,
      status: 'active',
      license: 'Apache-2.0',
      hf_url: '',
      download_url: '',
      supports_b200: true,
      supports_lanta: true
    };
  }

  let form = blankModel();
  let savingModel = false;
  let modelMsg = '';

  const modelTypes = ['base', 'instruct', 'chat'];
  const statuses = ['active', 'hidden', 'disabled'];

  function editModel(m) {
    form = { ...m };
    modelMsg = '';
  }
  function newModel() {
    form = blankModel();
    modelMsg = '';
  }

  async function saveModel() {
    if (!form.model_id.trim()) {
      modelMsg = 'model_id is required';
      return;
    }
    savingModel = true;
    modelMsg = '';
    try {
      const res = await fetch('/api/models', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      if (!res.ok) throw new Error(await res.text());
      const { model } = await res.json();
      // Upsert into local list.
      const idx = models.findIndex((m) => m.model_id === model.model_id);
      if (idx >= 0) models[idx] = model;
      else models = [...models, model];
      models = models;
      modelMsg = 'Saved ✓';
    } catch (err) {
      modelMsg = 'Save failed (is the DB running?)';
      console.error(err);
    } finally {
      savingModel = false;
    }
  }
</script>

<svelte:head>
  <title>Admin Config — Thai LLM</title>
</svelte:head>

<section class="section pt-12">
  <div class="container-app max-w-5xl">
    <div class="mb-8">
      <span class="eyebrow mb-3">Admin · ML DevOps</span>
      <h1 class="text-3xl font-bold text-textmain sm:text-4xl">Configuration</h1>
      <p class="mt-2 text-textmuted">Configure inference backends, models, feature flags, and run status checks.</p>
      <div class="mt-3 rounded-xl border border-warning/30 bg-warning/10 px-4 py-2 text-sm text-warning">
        ⚠ No authentication yet — protect <code class="font-mono">/admin/*</code> in <code class="font-mono">hooks.server.js</code> before deploying.
      </div>
    </div>

    <!-- A. API Backend Config + C. Feature Flags -->
    <ConfigForm apiConfig={data.apiConfig} featureFlags={data.featureFlags} />

    <!-- B. Model Config -->
    <div class="mt-8 card-soft p-6">
      <div class="flex items-center justify-between">
        <h3 class="text-base font-bold text-textmain">B. Model Config</h3>
        <Button variant="ghost" size="sm" on:click={newModel}>+ New model</Button>
      </div>

      <!-- existing models -->
      <div class="mt-4 scrollbar-thin overflow-x-auto">
        <table class="w-full min-w-[640px] text-left text-sm">
          <thead class="bg-surface text-xs uppercase tracking-wide text-textmuted">
            <tr>
              <th class="px-4 py-2">Model ID</th>
              <th class="px-4 py-2">Type</th>
              <th class="px-4 py-2">Params</th>
              <th class="px-4 py-2">Status</th>
              <th class="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody class="divide-y divide-bordersoft">
            {#each models as m}
              <tr class="hover:bg-surface/60">
                <td class="px-4 py-2 font-mono text-xs text-textmain">{m.model_id}</td>
                <td class="px-4 py-2 capitalize text-textmuted">{m.model_type}</td>
                <td class="px-4 py-2 text-textmuted">{m.parameters}</td>
                <td class="px-4 py-2"><StatusPill label={m.status} tone={statusTone[m.status] || 'muted'} dot={false} /></td>
                <td class="px-4 py-2 text-right"><button class="text-xs font-semibold text-primary" on:click={() => editModel(m)}>Edit</button></td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>

      <!-- model editor -->
      <div class="mt-6 rounded-2xl border border-bordersoft bg-surface p-5">
        <h4 class="mb-4 text-sm font-bold text-textmain">{form.model_id ? `Edit: ${form.model_id}` : 'New model'}</h4>
        <div class="grid gap-4 sm:grid-cols-2">
          <label class="block"><span class="label-soft">Model ID (API id)</span><input bind:value={form.model_id} class="input-soft font-mono" placeholder="thai-llm-chat-v0.1" /></label>
          <label class="block"><span class="label-soft">Display name</span><input bind:value={form.display_name} class="input-soft" /></label>
          <label class="block"><span class="label-soft">Type</span>
            <select bind:value={form.model_type} class="input-soft">{#each modelTypes as t}<option value={t}>{t}</option>{/each}</select>
          </label>
          <label class="block"><span class="label-soft">Parameters</span><input bind:value={form.parameters} class="input-soft" placeholder="8B" /></label>
          <label class="block"><span class="label-soft">Context length</span><input type="number" bind:value={form.context_length} class="input-soft" /></label>
          <label class="block"><span class="label-soft">Max output tokens</span><input type="number" bind:value={form.max_output_tokens} class="input-soft" /></label>
          <label class="block"><span class="label-soft">Status</span>
            <select bind:value={form.status} class="input-soft">{#each statuses as s}<option value={s}>{s}</option>{/each}</select>
          </label>
          <label class="block"><span class="label-soft">License</span><input bind:value={form.license} class="input-soft" /></label>
          <label class="block sm:col-span-2"><span class="label-soft">Hugging Face URL</span><input bind:value={form.hf_url} class="input-soft" /></label>
          <label class="block sm:col-span-2"><span class="label-soft">Download URL</span><input bind:value={form.download_url} class="input-soft" /></label>
          <label class="flex items-center gap-2"><input type="checkbox" bind:checked={form.supports_b200} class="h-4 w-4 accent-primary" /><span class="text-sm text-textmain">Supports B200</span></label>
          <label class="flex items-center gap-2"><input type="checkbox" bind:checked={form.supports_lanta} class="h-4 w-4 accent-primary" /><span class="text-sm text-textmain">Supports LANTA</span></label>
        </div>
        <div class="mt-5 flex items-center gap-3">
          <Button on:click={saveModel} disabled={savingModel}>{savingModel ? 'Saving…' : 'Save model'}</Button>
          {#if modelMsg}<span class="text-sm font-medium {modelMsg.includes('✓') ? 'text-success' : 'text-danger'}">{modelMsg}</span>{/if}
        </div>
      </div>
    </div>

    <!-- D. Status Check -->
    <div class="mt-8">
      <ApiStatusPanel />
    </div>
  </div>
</section>
