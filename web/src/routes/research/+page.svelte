<script>
  import SectionHeader from '$lib/components/SectionHeader.svelte';
  import StatusPill from '$lib/components/StatusPill.svelte';
  import { researchCards } from '$lib/data/research.js';

  const statusTones = {
    'Open source': 'success',
    'In progress': 'primary',
    Draft: 'warning',
    'Coming soon': 'muted'
  };
</script>

<svelte:head>
  <title>Research — Thai LLM</title>
</svelte:head>

<section class="section pt-12">
  <div class="container-app">
    <SectionHeader
      eyebrow="Research"
      title="How the Thai LLM is built"
      subtitle="We share our methods openly — from tokenizer design to serving infrastructure."
    />

    <div class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {#each researchCards as card}
        <div class="card-soft card-hover flex h-full flex-col p-6">
          <div class="flex items-center justify-between">
            <span class="badge bg-primary-soft text-primary">{card.tag}</span>
            <StatusPill label={card.status} tone={statusTones[card.status] || 'muted'} dot={false} />
          </div>
          <h3 class="mt-4 text-lg font-bold text-textmain">{card.title}</h3>
          <p class="mt-2 flex-1 text-sm leading-relaxed text-textmuted">{card.description}</p>
          <span class="mt-4 text-sm font-semibold text-primary">Read more →</span>
        </div>
      {/each}
    </div>
  </div>
</section>
