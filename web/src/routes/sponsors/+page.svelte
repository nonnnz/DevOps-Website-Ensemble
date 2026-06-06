<script>
  import SectionHeader from '$lib/components/SectionHeader.svelte';
  import Button from '$lib/components/Button.svelte';
  import { site } from '$lib/data/site.js';

  const groups = [
    { title: 'Compute Partners', desc: 'GPU compute for pretraining & serving (B200, LANTA).', count: 4 },
    { title: 'Research Partners', desc: 'Universities and labs advancing Thai NLP.', count: 3 },
    { title: 'Dataset Partners', desc: 'Organizations contributing high-quality Thai data.', count: 3 },
    { title: 'Community Partners', desc: 'Communities helping test, evaluate, and spread the word.', count: 4 }
  ];
</script>

<svelte:head>
  <title>Sponsors — Thai LLM</title>
</svelte:head>

<section class="section pt-12">
  <div class="container-app">
    <SectionHeader
      eyebrow="Sponsors"
      title="Powered by our partners"
      subtitle="Building a Thai-first LLM takes compute, data, and community. Thank you to everyone making it possible."
      center
    />

    <!-- Logo strip placeholder -->
    <div class="card-soft mb-12 grid grid-cols-2 gap-4 p-6 sm:grid-cols-3 lg:grid-cols-6">
      {#each Array(6) as _, i}
        <div class="flex h-16 items-center justify-center rounded-xl bg-surface text-sm font-semibold text-textmuted">
          Logo {i + 1}
        </div>
      {/each}
    </div>

    <!-- Partner groups -->
    <div class="grid gap-5 sm:grid-cols-2">
      {#each groups as g}
        <div class="card-soft p-6">
          <h3 class="text-lg font-bold text-textmain">{g.title}</h3>
          <p class="mt-1 text-sm text-textmuted">{g.desc}</p>
          <div class="mt-4 flex flex-wrap gap-3">
            {#each Array(g.count) as _, i}
              <div class="flex h-12 w-28 items-center justify-center rounded-lg border border-bordersoft bg-white text-xs text-textmuted">
                Partner {i + 1}
              </div>
            {/each}
          </div>
        </div>
      {/each}
    </div>

    <!-- Become a sponsor -->
    <div class="mt-12 overflow-hidden rounded-3xl bg-primary px-6 py-12 text-center text-white sm:px-12">
      <h2 class="text-2xl font-bold sm:text-3xl">Become a sponsor</h2>
      <p class="mx-auto mt-2 max-w-xl text-blue-50">
        Support open Thai AI with compute, data, or funding. Your logo can be here.
      </p>
      <div class="mt-6 flex justify-center gap-3">
        <Button href={site.links.discord} variant="secondary" size="lg">Get in touch</Button>
      </div>
    </div>
  </div>
</section>
