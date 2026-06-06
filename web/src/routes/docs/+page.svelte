<script>
  import SectionHeader from '$lib/components/SectionHeader.svelte';

  export let data;
  $: docsEnabled = data?.flags?.enable_public_api_docs !== false;

  const sections = [
    { id: 'quickstart', label: 'Quickstart' },
    { id: 'api-reference', label: 'API Reference' },
    { id: 'authentication', label: 'Authentication' },
    { id: 'chat-completion', label: 'Chat Completion' },
    { id: 'streaming', label: 'Streaming' },
    { id: 'deployment', label: 'Deployment' },
    { id: 'limitations', label: 'Model Limitations' }
  ];

  // Code samples kept as strings (Svelte would otherwise parse the braces).
  const pythonExample = `from openai import OpenAI

client = OpenAI(
    base_url="https://api.example.com/v1",
    api_key="YOUR_API_KEY"
)

response = client.chat.completions.create(
    model="thai-llm-chat-v0.1",
    messages=[
        {"role": "user", "content": "ช่วยอธิบาย Machine Learning เป็นภาษาไทยง่าย ๆ"}
    ],
    temperature=0.7
)

print(response.choices[0].message.content)`;

  const curlExample = `curl https://api.example.com/v1/chat/completions \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "thai-llm-chat-v0.1",
    "messages": [
      {"role": "user", "content": "สวัสดีครับ"}
    ],
    "temperature": 0.7
  }'`;

  const streamingExample = `stream = client.chat.completions.create(
    model="thai-llm-chat-v0.1",
    messages=[{"role": "user", "content": "เล่านิทานสั้น ๆ"}],
    stream=True
)

for chunk in stream:
    delta = chunk.choices[0].delta.content or ""
    print(delta, end="", flush=True)`;

  const deployExample = `# Serve with vLLM (OpenAI-compatible) on B200 / LANTA
python -m vllm.entrypoints.openai.api_server \\
  --model thai-llm/thai-llm-chat-v0.1 \\
  --served-model-name thai-llm-chat-v0.1 \\
  --port 8000

# Point the portal at it (.env)
# LLM_API_MODE=real
# LLM_API_BASE_URL=http://your-b200-host:8000
# LLM_API_KEY=your-key`;
</script>

<svelte:head>
  <title>Docs — Thai LLM</title>
</svelte:head>

<section class="section pt-12">
  <div class="container-app">
    <SectionHeader
      eyebrow="Documentation"
      title="API documentation"
      subtitle="An OpenAI-compatible API — use the OpenAI SDK or plain HTTP."
    />

    {#if !docsEnabled}
      <div class="card-soft p-8 text-center text-textmuted">Public API docs are currently disabled by an administrator.</div>
    {:else}
      <div class="grid gap-8 lg:grid-cols-[220px_1fr]">
        <!-- TOC -->
        <aside class="hidden lg:block">
          <nav class="sticky top-24 space-y-1">
            {#each sections as s}
              <a href={`#${s.id}`} class="block rounded-lg px-3 py-2 text-sm text-textmuted transition hover:bg-primary-soft hover:text-primary">
                {s.label}
              </a>
            {/each}
          </nav>
        </aside>

        <!-- Content -->
        <div class="max-w-3xl space-y-10">
          <div id="quickstart" class="card-soft p-6 scroll-mt-24">
            <h2 class="text-xl font-bold text-textmain">Quickstart</h2>
            <p class="mt-2 text-textmuted">Install the OpenAI SDK and point it at the Thai LLM endpoint.</p>
            <pre class="code-block"><code>pip install openai</code></pre>
            <pre class="code-block"><code>{pythonExample}</code></pre>
          </div>

          <div id="api-reference" class="card-soft p-6 scroll-mt-24">
            <h2 class="text-xl font-bold text-textmain">API Reference</h2>
            <p class="mt-2 text-textmuted">Base URL: <code class="font-mono text-primary">https://api.example.com/v1</code></p>
            <ul class="mt-3 space-y-1 text-sm text-textmuted">
              <li><code class="font-mono text-textmain">POST /v1/chat/completions</code> — chat completion (stream optional)</li>
              <li><code class="font-mono text-textmain">GET /v1/models</code> — list available models</li>
            </ul>
          </div>

          <div id="authentication" class="card-soft p-6 scroll-mt-24">
            <h2 class="text-xl font-bold text-textmain">Authentication</h2>
            <p class="mt-2 text-textmuted">Pass your key as a Bearer token. Keep it server-side; never expose it in a browser.</p>
            <pre class="code-block"><code>Authorization: Bearer YOUR_API_KEY</code></pre>
          </div>

          <div id="chat-completion" class="card-soft p-6 scroll-mt-24">
            <h2 class="text-xl font-bold text-textmain">Chat Completion</h2>
            <p class="mt-2 text-textmuted">cURL example:</p>
            <pre class="code-block"><code>{curlExample}</code></pre>
          </div>

          <div id="streaming" class="card-soft p-6 scroll-mt-24">
            <h2 class="text-xl font-bold text-textmain">Streaming</h2>
            <p class="mt-2 text-textmuted">Set <code class="font-mono text-primary">stream=True</code> to receive tokens as they are generated.</p>
            <pre class="code-block"><code>{streamingExample}</code></pre>
          </div>

          <div id="deployment" class="card-soft p-6 scroll-mt-24">
            <h2 class="text-xl font-bold text-textmain">Deployment</h2>
            <p class="mt-2 text-textmuted">Serve with vLLM / TGI on B200 or LANTA, then switch the portal to real mode.</p>
            <pre class="code-block"><code>{deployExample}</code></pre>
          </div>

          <div id="limitations" class="card-soft p-6 scroll-mt-24">
            <h2 class="text-xl font-bold text-textmain">Model Limitations</h2>
            <ul class="mt-2 list-disc space-y-1 pl-5 text-textmuted">
              <li>This is an early version — outputs may contain errors or hallucinations.</li>
              <li>Not intended for medical, legal, or financial advice.</li>
              <li>Knowledge is limited to its training data cutoff.</li>
              <li>Always review generated content before production use.</li>
            </ul>
          </div>
        </div>
      </div>
    {/if}
  </div>
</section>

<style>
  .code-block {
    margin-top: 0.75rem;
    overflow-x: auto;
    border-radius: 0.75rem;
    background: #0f2a57;
    padding: 1rem;
    font-size: 0.8rem;
    line-height: 1.5;
    color: #e8f1ff;
  }
  .code-block :global(code) {
    font-family: 'JetBrains Mono', ui-monospace, monospace;
    white-space: pre;
  }
</style>
