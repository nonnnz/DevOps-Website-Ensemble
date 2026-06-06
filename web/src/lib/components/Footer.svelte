<script>
  import { site, navLinks } from '$lib/data/site.js';
  const year = new Date().getFullYear();
</script>

<footer class="mt-10 w-full overflow-x-hidden border-t border-bordersoft bg-surface">
  <div class="container-app grid min-w-0 gap-8 py-12 md:grid-cols-4">
    <div class="min-w-0 md:col-span-2">
      <div class="flex min-w-0 items-center gap-2">
        <span class="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white">●</span>
        <span class="min-w-0 truncate text-lg font-extrabold text-textmain">{site.name}</span>
      </div>
      <p class="mt-3 max-w-sm text-sm leading-relaxed text-textmuted">
        {site.description}
      </p>
      <div class="mt-4 flex gap-3 text-sm">
        <a href={site.links.github} class="link-muted">GitHub</a>
        <a href={site.links.huggingface} class="link-muted">Hugging Face</a>
        <a href={site.links.discord} class="link-muted">Discord</a>
        <a href={site.links.x} class="link-muted">X</a>
      </div>
    </div>

    <div>
      <h4 class="text-sm font-semibold text-textmain">Explore</h4>
      <ul class="mt-3 space-y-2 text-sm">
        {#each navLinks.slice(0, 5) as link}
          <li><a href={link.href} class="link-muted">{link.label}</a></li>
        {/each}
      </ul>
    </div>

    <div>
      <h4 class="text-sm font-semibold text-textmain">Connect</h4>
      <ul class="mt-3 space-y-2 text-sm">
        <li><a href={site.links.github} class="link-muted">GitHub</a></li>
        <li><a href={site.links.huggingface} class="link-muted">Hugging Face</a></li>
        <li><a href={site.links.discord} class="link-muted">Discord</a></li>
        <li><a href={site.links.x} class="link-muted">X</a></li>
      </ul>
    </div>
  </div>

  <div class="border-t border-bordersoft">
    <div class="container-app flex min-w-0 flex-col items-center justify-between gap-2 py-6 text-center text-xs text-textmuted sm:flex-row sm:text-left">
      <p class="min-w-0">© {year} {site.name}. Super AI Engineer LLM.</p>
      <p class="min-w-0">Powered by SvelteKit · Evaluation · Research · Engineering-ready demos</p>
    </div>
  </div>
</footer>
