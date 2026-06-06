<script>
  import SectionHeader from '$lib/components/SectionHeader.svelte';

  const sponsorLogos = ['Logo 1', 'Logo 2', 'Logo 3', 'Logo 4', 'Logo 5', 'Logo 6'];
</script>

<svelte:head>
  <title>Sponsors - Super AI Engineer LLM</title>
</svelte:head>

<section class="section pt-12">
  <div class="container-app">
    <SectionHeader
      eyebrow="Sponsors"
      title="Partner logos"
      subtitle="A clean logo strip for organizations supporting Super AI Engineer LLM."
      center
    />

    <div class="card-soft grid grid-cols-2 gap-4 p-6 sm:grid-cols-3 lg:grid-cols-6">
      {#each sponsorLogos as logo}
        <div class="flex h-16 items-center justify-center rounded-xl bg-surface text-sm font-semibold text-textmuted">
          {logo}
        </div>
      {/each}
    </div>
  </div>
</section>
