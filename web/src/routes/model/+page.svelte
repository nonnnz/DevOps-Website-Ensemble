<script>
  import SectionHeader from '$lib/components/SectionHeader.svelte';
  import ModelCard from '$lib/components/ModelCard.svelte';
  import Button from '$lib/components/Button.svelte';
  import { site } from '$lib/data/site.js';

  export let data;
  $: models = data.models || [];
</script>

<svelte:head>
  <title>Models - Super AI Engineer LLM</title>
</svelte:head>

<section class="section pt-12">
  <div class="container-app">
    <SectionHeader
      eyebrow="Models"
      title="Super AI Engineer LLM model family"
      subtitle="Model variants, evaluation context, and deployment-ready engineering information."
    />

    <!-- Overview -->
    <div class="mb-10 grid gap-6 lg:grid-cols-3">
      <div class="card-soft p-6 lg:col-span-2">
        <h3 class="text-lg font-bold text-textmain">Model overview</h3>
        <p class="mt-2 leading-relaxed text-textmuted">
          The Super AI Engineer LLM family is built for Thai-first engineering workflows with curated Thai +
          multilingual data. It ships in three variants: <strong>base</strong>, <strong>instruct</strong>,
          and <strong>chat</strong>, covering everything from continued pretraining to production chat.
        </p>
        <div class="mt-5 flex flex-wrap gap-2">
          <Button href="/evaluation" size="sm">View Evaluation</Button>
          <Button href="/docs" size="sm" variant="outline">Read Doc</Button>
          <Button href={site.links.huggingface} size="sm" variant="outline">Hugging Face</Button>
        </div>
      </div>
      <div class="card-soft p-6">
        <h3 class="text-lg font-bold text-textmain">License</h3>
        <p class="mt-2 text-sm leading-relaxed text-textmuted">
          Released under <strong>Apache-2.0</strong>, free for research and commercial use. Please review
          the model card for intended use and limitations before deploying.
        </p>
      </div>
    </div>

    <!-- Version list / model cards -->
    <h3 class="mb-4 text-lg font-bold text-textmain">Available versions</h3>
    <div class="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
      {#each models as model}
        <ModelCard {model} />
      {/each}
    </div>

    {#if models.length === 0}
      <p class="text-textmuted">No models found. Run <code class="font-mono">npm run db:seed</code> to load demo models.</p>
    {/if}
  </div>
</section>
