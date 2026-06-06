<script>
  import SectionHeader from '$lib/components/SectionHeader.svelte';
  import GalleryImageCard from '$lib/components/GalleryImageCard.svelte';
  import { galleryImages } from '$lib/data/gallery.js';
</script>

<svelte:head>
  <title>Gallery - Super AI Engineer LLM</title>
</svelte:head>

<section class="section pt-12">
  <div class="container-app">
    <SectionHeader
      eyebrow="Gallery"
      title="Project atmosphere"
      subtitle="A flexible image gallery for photos from workshops, research sessions, demos, and events."
    />

    <div class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {#each galleryImages as image, i}
        <GalleryImageCard item={image} index={i} />
      {/each}
    </div>
  </div>
</section>
