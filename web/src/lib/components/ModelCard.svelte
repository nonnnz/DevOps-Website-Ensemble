<script>
  import Button from './Button.svelte';
  import StatusPill from './StatusPill.svelte';
  import { statusTone } from '$lib/utils/format.js';

  /** @type {object} */
  export let model;
</script>

<div class="card-soft card-hover flex flex-col p-6">
  <div class="flex items-start justify-between gap-3">
    <div>
      <h3 class="text-lg font-bold text-textmain">{model.display_name}</h3>
      <p class="font-mono text-xs text-textmuted">{model.model_id}</p>
    </div>
    <StatusPill label={model.status} tone={statusTone[model.status] || 'muted'} />
  </div>

  <dl class="mt-5 grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
    <div>
      <dt class="text-xs text-textmuted">Type</dt>
      <dd class="font-medium capitalize text-textmain">{model.model_type}</dd>
    </div>
    <div>
      <dt class="text-xs text-textmuted">Parameters</dt>
      <dd class="font-medium text-textmain">{model.parameters}</dd>
    </div>
    <div>
      <dt class="text-xs text-textmuted">Context</dt>
      <dd class="font-medium text-textmain">{model.context_length?.toLocaleString?.() ?? model.context_length} tokens</dd>
    </div>
    <div>
      <dt class="text-xs text-textmuted">Max output</dt>
      <dd class="font-medium text-textmain">{model.max_output_tokens?.toLocaleString?.() ?? model.max_output_tokens}</dd>
    </div>
    <div>
      <dt class="text-xs text-textmuted">License</dt>
      <dd class="font-medium text-textmain">{model.license}</dd>
    </div>
    <div>
      <dt class="text-xs text-textmuted">Backends</dt>
      <dd class="flex flex-wrap gap-1">
        {#if model.supports_b200}<span class="badge bg-primary-soft text-primary">B200</span>{/if}
        {#if model.supports_lanta}<span class="badge bg-primary-soft text-primary">LANTA</span>{/if}
      </dd>
    </div>
  </dl>

  <div class="mt-6 flex flex-wrap gap-2 pt-4 border-t border-bordersoft">
    {#if model.hf_url}
      <Button href={model.hf_url} variant="outline" size="sm">Hugging Face</Button>
    {/if}
    {#if model.download_url}
      <Button href={model.download_url} variant="outline" size="sm">Download</Button>
    {/if}
    <Button href={`/playground?model=${encodeURIComponent(model.model_id)}`} variant="secondary" size="sm">
      API access
    </Button>
  </div>
</div>
