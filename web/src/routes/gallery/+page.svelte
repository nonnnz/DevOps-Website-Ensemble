<script>
  import SectionHeader from '$lib/components/SectionHeader.svelte';
  import UseCaseCard from '$lib/components/UseCaseCard.svelte';
  import { useCases } from '$lib/data/gallery.js';

  export let data;
  $: enablePrompt = data?.flags?.enable_gallery_prompts !== false;
</script>

<svelte:head>
  <title>Gallery — Thai LLM</title>
</svelte:head>

<section class="section pt-12">
  <div class="container-app">
    <SectionHeader
      eyebrow="Gallery"
      title="Use cases & examples"
      subtitle="Real Thai-language scenarios. Click ‘Try in Playground’ to load the sample prompt."
    />

    <div class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {#each useCases as uc}
        <UseCaseCard useCase={uc} {enablePrompt} />
      {/each}
    </div>
  </div>
</section>
