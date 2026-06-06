<script>
  import PlaygroundChat from '$lib/components/PlaygroundChat.svelte';
  import StatusPill from '$lib/components/StatusPill.svelte';
  import Button from '$lib/components/Button.svelte';

  export let data;

  $: flags = data.flags || {};
  $: playgroundOn = flags.enable_playground !== false;
  $: defaultModel = data.initialModel || data.defaultModelId || 'thai-llm-chat-v0.1';
  $: defaultBackend = data.apiConfig?.default_backend || 'auto';
  $: mode = data.apiConfig?.mode || 'mock';
</script>

<svelte:head>
  <title>Playground - Aksorn-LM</title>
</svelte:head>

<section class="section pt-10">
  <div class="container-app">
    <div class="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <span class="eyebrow mb-3">Playground</span>
        <h1 class="text-3xl font-bold text-textmain dark:text-white sm:text-4xl">Chat with Aksorn-LM</h1>
        <p class="mt-2 max-w-2xl text-textmuted dark:text-slate-400">
          Streaming responses, tunable parameters, and live runtime metrics — every request is logged.
        </p>
      </div>
      <div class="flex items-center gap-2">
        <StatusPill label={`mode: ${mode}`} tone={mode === 'real' ? 'success' : 'primary'} />
        <StatusPill label="Streaming API" tone="success" pulse />
      </div>
    </div>

    {#if playgroundOn}
      {#key `${data.initialPrompt}|${data.initialModel}`}
        <PlaygroundChat
          models={data.models}
          {defaultModel}
          {defaultBackend}
          initialPrompt={data.initialPrompt}
          enableStreaming={flags.enable_streaming !== false}
          enableFeedback={flags.enable_feedback !== false}
          enableRuntimeMetrics={flags.enable_runtime_metrics !== false}
        />
      {/key}
    {:else}
      <div class="card-soft p-10 text-center">
        <h2 class="text-xl font-bold text-textmain dark:text-white">Playground is currently disabled</h2>
        <p class="mt-2 text-textmuted dark:text-slate-400">An administrator turned this feature off.</p>
        <div class="mt-5"><Button href="/admin/config" variant="outline">Open Admin Config</Button></div>
      </div>
    {/if}
  </div>
</section>
