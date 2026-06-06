<script>
  /**
   * PlaygroundChat — the interactive chat playground.
   * Calls /api/chat (NDJSON streaming), shows streaming responses, runtime
   * metrics, and per-response feedback (saved to PostgreSQL).
   */
  import { tick } from 'svelte';
  import Button from './Button.svelte';
  import RuntimeMetrics from './RuntimeMetrics.svelte';
  import FeedbackButtons from './FeedbackButtons.svelte';
  import { streamChatRequest } from '$lib/utils/chatStream.js';

  /** @type {Array<object>} */
  export let models = [];
  export let defaultModel = 'thai-llm-chat-v0.1';
  export let defaultBackend = 'auto';
  export let initialPrompt = '';
  export let enableStreaming = true;
  export let enableFeedback = true;
  export let enableRuntimeMetrics = true;

  // --- state --------------------------------------------------------------
  let systemPrompt = 'You are a helpful Thai assistant. Answer clearly in Thai.';
  let input = initialPrompt || '';
  /** @type {Array<{role:string, content:string, logId?:string|null}>} */
  let messages = [];
  let model = defaultModel;
  let backend = defaultBackend;
  let isStreaming = false;
  let errorMsg = '';
  let metrics = null;
  let controller = null;
  let chatEl;

  const settings = {
    temperature: 0.7,
    top_p: 0.95,
    max_tokens: 1024,
    repetition_penalty: 1.1,
    stream: enableStreaming
  };

  const backends = [
    { value: 'auto', label: 'Auto' },
    { value: 'b200', label: 'B200' },
    { value: 'lanta', label: 'LANTA' }
  ];

  $: activeModels = models.filter((m) => m.status !== 'disabled');

  async function scrollToBottom() {
    await tick();
    if (chatEl) chatEl.scrollTop = chatEl.scrollHeight;
  }

  async function send() {
    const text = input.trim();
    if (!text || isStreaming) return;

    errorMsg = '';
    metrics = null;
    input = '';

    // Build the payload message history (system + prior turns + new user turn).
    const history = messages.map((m) => ({ role: m.role, content: m.content }));
    const payloadMessages = [
      ...(systemPrompt.trim() ? [{ role: 'system', content: systemPrompt.trim() }] : []),
      ...history,
      { role: 'user', content: text }
    ];

    messages = [...messages, { role: 'user', content: text }, { role: 'assistant', content: '', logId: null }];
    const assistantIndex = messages.length - 1;
    isStreaming = true;
    await scrollToBottom();

    controller = new AbortController();

    await streamChatRequest(
      {
        messages: payloadMessages,
        model,
        backend,
        temperature: settings.temperature,
        top_p: settings.top_p,
        max_tokens: settings.max_tokens,
        repetition_penalty: settings.repetition_penalty,
        stream: settings.stream
      },
      {
        onMeta: (meta) => {
          metrics = { ...meta };
        },
        onDelta: (content) => {
          messages[assistantIndex].content += content;
          messages = messages; // trigger reactivity
          scrollToBottom();
        },
        onDone: (done) => {
          metrics = { ...metrics, ...done };
          messages[assistantIndex].logId = done.playground_log_id;
          messages = messages;
          if (done.status === 'error' && done.error_message) {
            errorMsg = done.error_message;
          }
        },
        onError: (message) => {
          errorMsg = message;
        }
      },
      controller.signal
    ).catch((err) => {
      if (err?.name !== 'AbortError') errorMsg = err?.message || 'Request failed';
    });

    isStreaming = false;
    controller = null;
    await scrollToBottom();
  }

  function stop() {
    controller?.abort();
    isStreaming = false;
  }

  function clearChat() {
    messages = [];
    metrics = null;
    errorMsg = '';
  }

  function onKeydown(e) {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      send();
    }
  }
</script>

<div class="grid gap-6 lg:grid-cols-[1fr_320px]">
  <!-- Chat column -->
  <div class="card-soft flex flex-col overflow-hidden" style="min-height: 70vh;">
    <!-- toolbar -->
    <div class="flex flex-wrap items-center gap-2 border-b border-bordersoft p-3">
      <label class="flex items-center gap-2 text-xs text-textmuted">
        Model
        <select bind:value={model} class="input-soft !w-auto py-1.5 text-sm">
          {#each activeModels as m}
            <option value={m.model_id}>{m.display_name}</option>
          {/each}
          {#if activeModels.length === 0}
            <option value={defaultModel}>{defaultModel}</option>
          {/if}
        </select>
      </label>
      <label class="flex items-center gap-2 text-xs text-textmuted">
        Backend
        <select bind:value={backend} class="input-soft !w-auto py-1.5 text-sm">
          {#each backends as b}
            <option value={b.value}>{b.label}</option>
          {/each}
        </select>
      </label>
      <div class="ml-auto flex gap-2">
        <Button variant="ghost" size="sm" on:click={clearChat}>Clear</Button>
      </div>
    </div>

    <!-- messages -->
    <div bind:this={chatEl} class="scrollbar-thin flex-1 space-y-4 overflow-y-auto p-4">
      {#if messages.length === 0}
        <div class="flex h-full min-h-[40vh] flex-col items-center justify-center text-center text-textmuted">
          <span class="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-soft text-2xl">💬</span>
          <p class="font-medium text-textmain">Start chatting with Super AI Engineer LLM</p>
          <p class="mt-1 max-w-sm text-sm">Type a prompt below, or open the Gallery for ready-made examples.</p>
        </div>
      {/if}

      {#each messages as msg, i (i)}
        {#if msg.role === 'user'}
          <div class="flex justify-end">
            <div class="max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-br-sm bg-primary px-4 py-2.5 text-sm text-white">
              {msg.content}
            </div>
          </div>
        {:else}
          <div class="flex flex-col gap-2">
            <div class="max-w-[90%] whitespace-pre-wrap rounded-2xl rounded-bl-sm border border-bordersoft bg-surface px-4 py-2.5 text-sm leading-relaxed text-textmain">
              {#if msg.content}
                {msg.content}{#if isStreaming && i === messages.length - 1}<span class="ml-0.5 inline-block h-4 w-1.5 animate-pulseSoft bg-primary align-middle"></span>{/if}
              {:else if isStreaming}
                <span class="text-textmuted">กำลังคิด…</span>
              {/if}
            </div>
            {#if enableFeedback && msg.logId}
              <FeedbackButtons logId={msg.logId} />
            {/if}
          </div>
        {/if}
      {/each}

      {#if errorMsg}
        <div class="rounded-xl border border-danger/30 bg-danger/10 px-4 py-2 text-sm text-danger">
          {errorMsg}
        </div>
      {/if}
    </div>

    <!-- input -->
    <div class="border-t border-bordersoft p-3">
      <div class="flex items-end gap-2">
        <textarea
          bind:value={input}
          on:keydown={onKeydown}
          rows="2"
          placeholder="พิมพ์ข้อความ… (Ctrl/⌘ + Enter เพื่อส่ง)"
          class="input-soft resize-none"
        ></textarea>
        {#if isStreaming}
          <Button variant="outline" on:click={stop}>Stop</Button>
        {:else}
          <Button on:click={send} disabled={!input.trim()}>Send</Button>
        {/if}
      </div>
    </div>
  </div>

  <!-- Controls column -->
  <div class="space-y-6">
    <!-- system prompt -->
    <div class="card-soft p-5">
      <h3 class="mb-3 text-sm font-bold text-textmain">System Prompt</h3>
      <textarea bind:value={systemPrompt} rows="3" class="input-soft resize-none text-sm"></textarea>
    </div>

    <!-- generation params -->
    <div class="card-soft p-5">
      <h3 class="mb-4 text-sm font-bold text-textmain">Parameters</h3>
      <div class="space-y-4 text-sm">
        <div>
          <div class="flex justify-between">
            <span class="label-soft">Temperature</span><span class="text-textmuted">{settings.temperature}</span>
          </div>
          <input type="range" min="0" max="2" step="0.05" bind:value={settings.temperature} class="w-full accent-primary" />
        </div>
        <div>
          <div class="flex justify-between">
            <span class="label-soft">Top P</span><span class="text-textmuted">{settings.top_p}</span>
          </div>
          <input type="range" min="0" max="1" step="0.01" bind:value={settings.top_p} class="w-full accent-primary" />
        </div>
        <div>
          <div class="flex justify-between">
            <span class="label-soft">Max tokens</span><span class="text-textmuted">{settings.max_tokens}</span>
          </div>
          <input type="range" min="64" max="8192" step="64" bind:value={settings.max_tokens} class="w-full accent-primary" />
        </div>
        <div>
          <div class="flex justify-between">
            <span class="label-soft">Repetition penalty</span><span class="text-textmuted">{settings.repetition_penalty}</span>
          </div>
          <input type="range" min="0.5" max="2" step="0.05" bind:value={settings.repetition_penalty} class="w-full accent-primary" />
        </div>
        <label class="flex items-center justify-between pt-1">
          <span class="label-soft mb-0">Stream</span>
          <input type="checkbox" bind:checked={settings.stream} class="h-4 w-4 accent-primary" />
        </label>
      </div>
    </div>

    {#if enableRuntimeMetrics}
      <RuntimeMetrics {metrics} />
    {/if}
  </div>
</div>
