<script>
  import Button from '$lib/components/Button.svelte';
  import SectionHeader from '$lib/components/SectionHeader.svelte';
  import MascotStage from '$lib/components/MascotStage.svelte';
  import FuturisticBackground from '$lib/components/FuturisticBackground.svelte';
  import MetricCard from '$lib/components/MetricCard.svelte';
  import GalleryImageCard from '$lib/components/GalleryImageCard.svelte';
  import { site } from '$lib/data/site.js';
  import { modelHighlights, evalSnapshot } from '$lib/data/home.js';
  import { galleryImages } from '$lib/data/gallery.js';
  import { researchCards } from '$lib/data/research.js';
  import { reveal } from '$lib/utils/reveal.js';

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

  $: mascotMode = data?.flags?.enable_webgl_mascot === false ? 'placeholder' : 'spline';

  const sponsorLogos = [
    { src: '/sponsors/aiat.png', name: 'AIAT' },
    { src: '/sponsors/nectec.png', name: 'NECTEC' },
    { src: '/sponsors/ministerssci.png', name: 'MHESI' },
    { src: '/sponsors/pmub.png', name: 'PMU-B' },
    { src: '/sponsors/siit.png', name: 'SIIT' },
    { src: '/sponsors/rmutl.png', name: 'RMUTL' },
    { src: '/sponsors/ailoveu.png', name: 'AI LOVE U' },
    { src: '/sponsors/rwp.png', name: 'RWP' },
    { src: '/sponsors/sksw.png', name: 'SKSW' }
  ];
  const mascotMessages = [
    'สวัสดี คนไทย 👋',
    'ลองเล่น Playground กันไหม?',
    'ถามอะไรก็ได้เลยครับ',
    'Thai LLM • built from scratch'
  ];
  const communityChannels = [
    { title: 'Discord', desc: 'Chat with the team and community in real time.', href: site.links.discord, cta: 'Join Discord' },
    { title: 'GitHub', desc: 'Source code, issues, and pull requests.', href: site.links.github, cta: 'Open GitHub' },
    { title: 'Hugging Face', desc: 'Model weights, datasets, and demos.', href: site.links.huggingface, cta: 'View models' },
    { title: 'X', desc: 'Announcements and project updates.', href: site.links.x, cta: 'Follow updates' }
  ];
  const contributionLinks = [
    { title: 'Contributing guide', desc: 'Set up the repo and submit improvements.', href: site.links.github + '/blob/main/CONTRIBUTING.md' },
    { title: 'Dataset contribution', desc: 'Share high-quality Thai data for future model work.', href: site.links.github + '/issues/new?labels=dataset' },
    { title: 'Report an issue', desc: 'Tell us about UI bugs, model issues, or rough edges.', href: site.links.github + '/issues/new?labels=bug' },
    { title: 'Request a feature', desc: 'Suggest product, evaluation, or documentation ideas.', href: site.links.github + '/issues/new?labels=enhancement' }
  ];
</script>

<svelte:head>
  <title>Super AI Engineer LLM</title>
</svelte:head>

<!-- HERO -->
<section class="section relative overflow-hidden pt-28 sm:pt-32 lg:pt-24">
  <FuturisticBackground />
  <div class="container-app relative z-10 grid items-center gap-12 lg:grid-cols-2">
    <div>
      <span class="eyebrow mb-5 rise">Super AI Engineer LLM</span>
      <h1 class="rise text-4xl font-extrabold leading-tight text-textmain sm:text-5xl lg:text-6xl text-balance" style="animation-delay:.08s">
        Super AI Engineer<br />LLM
      </h1>
      <p class="rise mt-5 max-w-xl text-lg leading-relaxed text-textmuted" style="animation-delay:.16s">
        {site.description}
      </p>
      <div class="rise mt-8 flex flex-wrap gap-3" style="animation-delay:.24s">
        <Button href="/playground" size="lg">Playground</Button>
        <Button href="/docs" size="lg" variant="outline">View Doc</Button>
      </div>
    </div>

    <div class="rise relative" style="animation-delay:.2s">
      <MascotStage
        mode={mascotMode}
        splineUrl={site.mascot.splineUrl}
        src="/models/mascot.glb"
        autoRotate
        interactive
        messages={mascotMessages}
        pills={[]}
        framed={false}
      />
    </div>
  </div>
</section>

<!-- MODEL HIGHLIGHTS -->
<section class="section" use:reveal>
  <div class="container-app">
    <SectionHeader
      eyebrow="Why this model"
      title="Designed for Thai engineering workflows"
      subtitle="A Thai-first model platform for language, reasoning, evaluation, and practical AI engineering."
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

<!-- EVALUATION SNAPSHOT -->
<section class="section" use:reveal>
  <div class="container-app">
    <SectionHeader eyebrow="Evaluation snapshot" title="Quality and serving at a glance">
      <div class="mt-4"><Button href="/evaluation" variant="outline" size="sm">See full evaluation</Button></div>
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
<section class="section" use:reveal>
  <div class="container-app grid gap-6 lg:grid-cols-2">
    <div class="card-soft p-8">
      <span class="eyebrow mb-4">Research</span>
      <h3 class="text-2xl font-bold text-textmain">Open research and technical reports</h3>
      <p class="mt-2 text-textmuted">From tokenizer design to serving infrastructure, built transparently.</p>
      <ul class="mt-5 space-y-2 text-sm">
        {#each researchCards.slice(0, 4) as r}
          <li class="flex items-center gap-2 text-textmain"><span class="text-primary">-</span>{r.title}</li>
        {/each}
      </ul>
      <div class="mt-6"><Button href="/research" variant="secondary" size="sm">Explore research</Button></div>
    </div>
    <div class="card-soft p-8">
      <span class="eyebrow mb-4">Doc</span>
      <h3 class="text-2xl font-bold text-textmain">Start building in minutes</h3>
      <p class="mt-2 text-textmuted">A familiar API shape for teams that need fast integration.</p>
      <pre class="scrollbar-thin mt-5 overflow-x-auto rounded-xl bg-[#0F2A57] p-4 text-xs text-blue-50"><code>{heroSnippet}</code></pre>
      <div class="mt-6"><Button href="/docs" variant="secondary" size="sm">Read the doc</Button></div>
    </div>
  </div>
</section>

<!-- GALLERY -->
<section class="section" use:reveal>
  <div class="container-app">
    <SectionHeader
      eyebrow="Gallery"
      title="Project atmosphere"
      subtitle="A flexible image gallery for photos from workshops, research sessions, demos, and events."
      center
    />
    <div class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {#each galleryImages as image, i}
        <GalleryImageCard item={image} index={i} />
      {/each}
    </div>
  </div>
</section>

<!-- SPONSORS -->
<section class="section" use:reveal>
  <div class="container-app">
    <SectionHeader
      eyebrow="Sponsors"
      title="Partner logos"
      subtitle="A clean logo strip for organizations supporting Super AI Engineer LLM."
      center
    />
    <div class="card-soft grid grid-cols-2 gap-4 p-6 sm:grid-cols-3">
      {#each sponsorLogos as logo}
        <div class="flex h-24 items-center justify-center rounded-xl bg-surface/60 p-4">
          <img
            src={logo.src}
            alt={logo.name}
            title={logo.name}
            loading="lazy"
            class="logo-img max-h-16 max-w-[82%] object-contain"
          />
        </div>
      {/each}
    </div>
  </div>
</section>

<!-- COMMUNITY -->
<section class="section" use:reveal>
  <div class="container-app">
    <SectionHeader
      eyebrow="Community"
      title="Get involved"
      subtitle="Join the Super AI Engineer LLM community and help shape the next Thai-first AI platform."
      center
    />

    <div class="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {#each communityChannels as channel}
        <a href={channel.href} class="card-soft card-hover flex h-full flex-col p-6">
          <h3 class="text-lg font-bold text-textmain">{channel.title}</h3>
          <p class="mt-2 flex-1 text-sm leading-relaxed text-textmuted">{channel.desc}</p>
          <span class="mt-4 text-sm font-semibold text-primary">{channel.cta} -></span>
        </a>
      {/each}
    </div>

    <div class="mt-10 grid gap-5 sm:grid-cols-2">
      {#each contributionLinks as item}
        <a href={item.href} class="card-soft card-hover flex items-start gap-4 p-6">
          <span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">
            <svg viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M5 12h14M13 6l6 6-6 6" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </span>
          <div>
            <h3 class="font-bold text-textmain">{item.title}</h3>
            <p class="mt-1 text-sm leading-relaxed text-textmuted">{item.desc}</p>
          </div>
        </a>
      {/each}
    </div>
  </div>
</section>
