<script>
  import { site, navLinks } from '$lib/data/site.js';
  const year = new Date().getFullYear();
</script>

<footer class="mt-10 w-full overflow-x-hidden border-t border-primary/10 bg-[#f4f8ff] dark:bg-[#030914] dark:border-white/10">
  <div class="container-app grid min-w-0 gap-8 py-12 md:grid-cols-4">
    <!-- Brand -->
    <div class="min-w-0 md:col-span-2">
      <div class="flex min-w-0 items-center gap-2.5">
        <span class="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white">●</span>
        <span class="min-w-0 truncate text-lg font-extrabold text-textmain dark:text-white">{site.name}</span>
      </div>
      <p class="mt-3 max-w-sm text-sm leading-relaxed text-textmuted dark:text-slate-400">
        {site.description}
      </p>
      <div class="mt-4 flex flex-wrap gap-3 text-sm">
        <a href={site.links.github}      class="link-muted">GitHub</a>
        <a href={site.links.huggingface} class="link-muted">Hugging Face</a>
        <a href={site.links.discord}     class="link-muted">Discord</a>
        <a href={site.links.x}           class="link-muted">X</a>
      </div>
    </div>

    <!-- Explore -->
    <div>
      <h4 class="text-sm font-semibold text-textmain dark:text-white">Explore</h4>
      <ul class="mt-3 space-y-2 text-sm">
        {#each navLinks.slice(0, 5) as link}
          <li><a href={link.href} class="link-muted">{link.label}</a></li>
        {/each}
      </ul>
    </div>

    <!-- Connect -->
    <div>
      <h4 class="text-sm font-semibold text-textmain dark:text-white">Connect</h4>
      <ul class="mt-3 space-y-2 text-sm">
        <li><a href={site.links.github}      class="link-muted">GitHub</a></li>
        <li><a href={site.links.huggingface} class="link-muted">Hugging Face</a></li>
        <li><a href={site.links.discord}     class="link-muted">Discord</a></li>
        <li><a href={site.links.x}           class="link-muted">X</a></li>
      </ul>
    </div>
  </div>

  <div class="border-t border-primary/8 dark:border-white/10">
    <div class="container-app flex min-w-0 flex-col items-center justify-between gap-2 py-5 text-center text-xs text-textmuted dark:text-slate-500 sm:flex-row sm:text-left">
      <p class="min-w-0">© {year} {site.name}.</p>
      <p class="min-w-0">Powered by SvelteKit · Evaluation · Research · Engineering-ready demos</p>
    </div>
  </div>
</footer>
