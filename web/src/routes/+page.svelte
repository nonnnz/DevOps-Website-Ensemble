<script>
  import Button from '$lib/components/Button.svelte';
  import SectionHeader from '$lib/components/SectionHeader.svelte';
  import MascotStage from '$lib/components/MascotStage.svelte';
  import MetricCard from '$lib/components/MetricCard.svelte';
  import UseCaseCard from '$lib/components/UseCaseCard.svelte';
  import { site } from '$lib/data/site.js';
  import { modelHighlights, infraSteps, evalSnapshot } from '$lib/data/home.js';
  import { useCases } from '$lib/data/gallery.js';
  import { researchCards } from '$lib/data/research.js';

  // Kept as a string so Svelte does not parse the braces in the code sample.
  const heroSnippet = `from openai import OpenAI

client = OpenAI(
    base_url="https://api.example.com/v1",
    api_key="YOUR_API_KEY"
)
response = client.chat.completions.create(
    model="thai-llm-chat-v0.1",
    messages=[{"role": "user", "content": "สวัสดีครับ"}]
)`;

  export let data;
  // Spline 3D mascot by default; admins can force the SVG placeholder by turning
  // off the "WebGL mascot" feature flag in /admin/config.
  $: mascotMode = data?.flags?.enable_webgl_mascot === false ? 'placeholder' : 'spline';
  $: galleryEnabled = data?.flags?.enable_gallery_prompts !== false;
</script>

<svelte:head>
  <title>Thai LLM — Built From Scratch</title>
</svelte:head>

<!-- HERO -->
<section class="section pt-12 sm:pt-16">
  <div class="container-app grid items-center gap-12 lg:grid-cols-2">
    <div>
      <span class="eyebrow mb-5">🇹🇭 Thai-first Large Language Model</span>
      <h1 class="text-4xl font-extrabold leading-tight text-textmain sm:text-5xl lg:text-6xl text-balance">
        Thai LLM<br />Built From Scratch
      </h1>
      <p class="mt-5 max-w-xl text-lg leading-relaxed text-textmuted">
        {site.description}
      </p>
      <div class="mt-8 flex flex-wrap gap-3">
        <Button href="/playground" size="lg">Try Playground</Button>
        <Button href="/docs" size="lg" variant="outline">View Docs</Button>
      </div>
      <div class="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-textmuted">
        <span>✓ OpenAI-compatible API</span>
        <span>✓ Streaming responses</span>
        <span>✓ B200 / LANTA ready</span>
      </div>
    </div>

    <div class="relative">
      <MascotStage
        mode={mascotMode}
        splineUrl={site.mascot.splineUrl}
        src="/models/mascot.glb"
        autoRotate
        interactive
      />
    </div>
  </div>
</section>

<!-- MODEL HIGHLIGHTS -->
<section class="section">
  <div class="container-app">
    <SectionHeader
      eyebrow="Why this model"
      title="Designed for Thai, from the ground up"
      subtitle="Not a fine-tune — a model pretrained for Thai language, reasoning, and culture."
      center
    />
    <div class="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {#each modelHighlights as h}
        <div class="card-soft card-hover p-6">
          <div class="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-primary-soft text-primary">
            <svg viewBox="0 0 24 24" class="h-6 w-6" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 2l2.4 5.6L20 9l-4 4 1 6-5-2.8L7 19l1-6-4-4 5.6-1.4z" stroke-linejoin="round" stroke-linecap="round" />
            </svg>
          </div>
          <h3 class="text-base font-bold text-textmain">{h.title}</h3>
          <p class="mt-2 text-sm leading-relaxed text-textmuted">{h.description}</p>
        </div>
      {/each}
    </div>
  </div>
</section>

<!-- LIVE INFRASTRUCTURE -->
<section class="section">
  <div class="container-app">
    <SectionHeader
      eyebrow="Live infrastructure"
      title="From your prompt to GPU and back"
      subtitle="The same path a real request takes — ready to connect to B200 or LANTA compute."
      center
    />
    <div class="card-soft p-6 sm:p-8">
      <div class="flex flex-col items-stretch gap-3 lg:flex-row lg:items-center">
        {#each infraSteps as step, i}
          <div class="flex flex-1 flex-col items-center rounded-2xl bg-surface px-4 py-5 text-center">
            <span class="text-sm font-bold text-textmain">{step.label}</span>
            <span class="mt-1 text-xs text-textmuted">{step.sub}</span>
          </div>
          {#if i < infraSteps.length - 1}
            <div class="flex items-center justify-center text-primary lg:rotate-0">
              <svg viewBox="0 0 24 24" class="h-5 w-5 rotate-90 lg:rotate-0" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M5 12h14M13 6l6 6-6 6" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </div>
          {/if}
        {/each}
      </div>
    </div>
  </div>
</section>

<!-- EVALUATION SNAPSHOT -->
<section class="section">
  <div class="container-app">
    <SectionHeader eyebrow="Evaluation snapshot" title="Quality + serving at a glance">
      <div class="mt-4"><Button href="/evaluation" variant="outline" size="sm">See full evaluation →</Button></div>
    </SectionHeader>
    <div class="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {#each evalSnapshot as e}
        <MetricCard
          label={e.label}
          value={e.value}
          unit={e.unit}
          tone={e.tone}
          progress={e.unit === '%' ? e.value : null}
        />
      {/each}
    </div>
  </div>
</section>

<!-- RESEARCH & DOCS PREVIEW -->
<section class="section">
  <div class="container-app grid gap-6 lg:grid-cols-2">
    <div class="card-soft p-8">
      <span class="eyebrow mb-4">Research</span>
      <h3 class="text-2xl font-bold text-textmain">Open research & technical reports</h3>
      <p class="mt-2 text-textmuted">From tokenizer design to serving infrastructure — built transparently.</p>
      <ul class="mt-5 space-y-2 text-sm">
        {#each researchCards.slice(0, 4) as r}
          <li class="flex items-center gap-2 text-textmain"><span class="text-primary">▸</span>{r.title}</li>
        {/each}
      </ul>
      <div class="mt-6"><Button href="/research" variant="secondary" size="sm">Explore research →</Button></div>
    </div>
    <div class="card-soft p-8">
      <span class="eyebrow mb-4">Docs</span>
      <h3 class="text-2xl font-bold text-textmain">Start building in minutes</h3>
      <p class="mt-2 text-textmuted">An OpenAI-compatible API you already know how to use.</p>
      <pre class="scrollbar-thin mt-5 overflow-x-auto rounded-xl bg-[#0F2A57] p-4 text-xs text-blue-50"><code>{heroSnippet}</code></pre>
      <div class="mt-6"><Button href="/docs" variant="secondary" size="sm">Read the docs →</Button></div>
    </div>
  </div>
</section>

<!-- GALLERY PREVIEW -->
<section class="section">
  <div class="container-app">
    <SectionHeader eyebrow="Use cases" title="What you can build" center />
    <div class="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {#each useCases.slice(0, 4) as uc}
        <UseCaseCard useCase={uc} enablePrompt={galleryEnabled} />
      {/each}
    </div>
    <div class="mt-8 text-center"><Button href="/gallery" variant="outline">View all use cases →</Button></div>
  </div>
</section>

<!-- COMMUNITY CTA -->
<section class="section">
  <div class="container-app">
    <div class="relative overflow-hidden rounded-3xl bg-primary px-6 py-14 text-center text-white sm:px-12">
      <div class="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white/10 blur-3xl"></div>
      <h2 class="text-3xl font-bold sm:text-4xl">Join the Thai LLM community</h2>
      <p class="mx-auto mt-3 max-w-xl text-blue-50">
        Contribute datasets, run evaluations, report issues, or help build a Thai-first AI future.
      </p>
      <div class="mt-8 flex flex-wrap justify-center gap-3">
        <Button href={site.links.discord} variant="secondary" size="lg">Join Discord</Button>
        <Button href="/community" size="lg" variant="outline" class="!border-white/40 !bg-white/10 !text-white hover:!bg-white/20">
          Get involved
        </Button>
      </div>
    </div>
  </div>
</section>
