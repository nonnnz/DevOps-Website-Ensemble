<script>
  import { page } from '$app/stores';
  import Button from './Button.svelte';
  import { site, navLinks } from '$lib/data/site.js';

  let open = false;
  $: path = $page.url.pathname;
  const isActive = (href) => (href === '/' ? path === '/' : path.startsWith(href));
</script>

<header class="sticky top-0 z-50 border-b border-bordersoft/70 bg-white/80 backdrop-blur-lg">
  <nav class="container-app flex h-16 items-center justify-between gap-4">
    <!-- Logo -->
    <a href="/" class="flex items-center gap-2 shrink-0">
      <span class="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white shadow-soft">
        <svg viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="8.5" cy="11" r="1.6" fill="currentColor" stroke="none" />
          <circle cx="15.5" cy="11" r="1.6" fill="currentColor" stroke="none" />
          <path d="M7 16h10" stroke-linecap="round" />
          <path d="M12 3v3" stroke-linecap="round" />
        </svg>
      </span>
      <span class="text-lg font-extrabold tracking-tight text-textmain">{site.name}</span>
    </a>

    <!-- Desktop links -->
    <div class="hidden items-center gap-0.5 xl:flex">
      {#each navLinks as link}
        <a
          href={link.href}
          class="rounded-lg px-3 py-2 text-sm font-medium transition {isActive(link.href)
            ? 'text-primary'
            : 'text-textmuted hover:text-primary'}"
        >
          {link.label}
        </a>
      {/each}
    </div>

    <!-- Desktop right buttons -->
    <div class="hidden items-center gap-2 lg:flex">
      <a href={site.links.github} class="link-muted p-2" aria-label="GitHub" title="GitHub">
        <svg viewBox="0 0 24 24" class="h-5 w-5" fill="currentColor"><path d="M12 .5C5.7.5.5 5.7.5 12c0 5.1 3.3 9.4 7.9 10.9.6.1.8-.2.8-.6v-2c-3.2.7-3.9-1.4-3.9-1.4-.5-1.3-1.3-1.7-1.3-1.7-1.1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.7 1.3 3.4 1 .1-.7.4-1.3.7-1.6-2.6-.3-5.3-1.3-5.3-5.8 0-1.3.5-2.3 1.2-3.1-.1-.3-.5-1.5.1-3.1 0 0 1-.3 3.3 1.2a11.5 11.5 0 0 1 6 0C17.3 4.6 18.3 5 18.3 5c.6 1.6.2 2.8.1 3.1.8.8 1.2 1.8 1.2 3.1 0 4.5-2.7 5.5-5.3 5.8.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6A11.5 11.5 0 0 0 23.5 12C23.5 5.7 18.3.5 12 .5z"/></svg>
      </a>
      <a href={site.links.huggingface} class="link-muted p-2" aria-label="Hugging Face" title="Hugging Face">
        <span class="text-lg">🤗</span>
      </a>
      <a href={site.links.discord} class="link-muted p-2" aria-label="Discord" title="Discord">
        <svg viewBox="0 0 24 24" class="h-5 w-5" fill="currentColor"><path d="M20 4.4A19 19 0 0 0 15.3 3l-.2.5a14 14 0 0 1 4.1 2 13 13 0 0 0-11.2 0 14 14 0 0 1 4.1-2L11.9 3A19 19 0 0 0 7.1 4.4 19.7 19.7 0 0 0 3.7 17a19 19 0 0 0 5.8 2.9l.5-.8a12 12 0 0 1-2-.9l.5-.4a13.6 13.6 0 0 0 11.5 0l.5.4a12 12 0 0 1-2 .9l.5.8a19 19 0 0 0 5.8-2.9 19.7 19.7 0 0 0-3.4-12.6zM9.5 14.5c-.9 0-1.7-.9-1.7-1.9s.8-1.9 1.7-1.9 1.7.9 1.7 1.9-.8 1.9-1.7 1.9zm5 0c-.9 0-1.7-.9-1.7-1.9s.8-1.9 1.7-1.9 1.7.9 1.7 1.9-.8 1.9-1.7 1.9z"/></svg>
      </a>
      <Button href="/playground" size="sm">Try Playground</Button>
    </div>

    <!-- Mobile toggle -->
    <button
      class="rounded-lg p-2 text-textmain xl:hidden"
      aria-label="Toggle menu"
      aria-expanded={open}
      on:click={() => (open = !open)}
    >
      <svg viewBox="0 0 24 24" class="h-6 w-6" fill="none" stroke="currentColor" stroke-width="2">
        {#if open}
          <path d="M6 6l12 12M18 6L6 18" stroke-linecap="round" />
        {:else}
          <path d="M4 7h16M4 12h16M4 17h16" stroke-linecap="round" />
        {/if}
      </svg>
    </button>
  </nav>

  <!-- Mobile menu -->
  {#if open}
    <div class="border-t border-bordersoft bg-white xl:hidden">
      <div class="container-app grid gap-1 py-4">
        {#each navLinks as link}
          <a
            href={link.href}
            on:click={() => (open = false)}
            class="rounded-lg px-3 py-2 text-sm font-medium {isActive(link.href)
              ? 'bg-primary-soft text-primary'
              : 'text-textmuted hover:bg-primary-soft hover:text-primary'}"
          >
            {link.label}
          </a>
        {/each}
        <div class="mt-2 flex gap-2">
          <Button href={site.links.github} variant="outline" size="sm" full>GitHub</Button>
          <Button href="/playground" size="sm" full>Try Playground</Button>
        </div>
      </div>
    </div>
  {/if}
</header>
