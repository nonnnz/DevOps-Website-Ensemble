<script>
  import SectionHeader from '$lib/components/SectionHeader.svelte';
  import { site } from '$lib/data/site.js';

  const channels = [
    { title: 'Discord', desc: 'Chat with the team and community in real time.', href: site.links.discord, cta: 'Join Discord' },
    { title: 'GitHub', desc: 'Source code, issues, and pull requests.', href: site.links.github, cta: 'Open GitHub' },
    { title: 'Hugging Face', desc: 'Model weights, datasets, and demos.', href: site.links.huggingface, cta: 'View on HF' },
    { title: 'X', desc: 'Announcements and updates.', href: site.links.x, cta: 'Follow on X' }
  ];

  const contribute = [
    { title: 'Contributing guide', desc: 'How to set up the repo and submit your first PR.', href: site.links.github + '/blob/main/CONTRIBUTING.md' },
    { title: 'Dataset contribution', desc: 'Share high-quality Thai text data to improve the model.', href: site.links.github + '/issues/new?labels=dataset' },
    { title: 'Report an issue', desc: 'Found a bug or a bad output? Let us know.', href: site.links.github + '/issues/new?labels=bug' },
    { title: 'Request a feature', desc: 'Have an idea? Open a feature request.', href: site.links.github + '/issues/new?labels=enhancement' }
  ];
</script>

<svelte:head>
  <title>Community — Thai LLM</title>
</svelte:head>

<section class="section pt-12">
  <div class="container-app">
    <SectionHeader
      eyebrow="Community"
      title="Get involved"
      subtitle="Thai LLM is built in the open. Join us and help shape a Thai-first AI future."
      center
    />

    <!-- Channels -->
    <div class="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {#each channels as c}
        <a href={c.href} class="card-soft card-hover flex flex-col p-6">
          <h3 class="text-lg font-bold text-textmain">{c.title}</h3>
          <p class="mt-2 flex-1 text-sm text-textmuted">{c.desc}</p>
          <span class="mt-4 text-sm font-semibold text-primary">{c.cta} →</span>
        </a>
      {/each}
    </div>

    <!-- Contribute -->
    <h3 class="mb-4 mt-12 text-lg font-bold text-textmain">Ways to contribute</h3>
    <div class="grid gap-5 sm:grid-cols-2">
      {#each contribute as c}
        <a href={c.href} class="card-soft card-hover flex items-start gap-4 p-6">
          <span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">→</span>
          <div>
            <h4 class="font-bold text-textmain">{c.title}</h4>
            <p class="mt-1 text-sm text-textmuted">{c.desc}</p>
          </div>
        </a>
      {/each}
    </div>
  </div>
</section>
