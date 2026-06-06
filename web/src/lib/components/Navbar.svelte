<script>
  import { page } from '$app/stores';
  import { navLinks } from '$lib/data/site.js';

  let open = false;
  $: path = $page.url.pathname;
  $: centerLinks = navLinks.filter((link) => link.href !== '/');
  const isActive = (href) => (href === '/' ? path === '/' : path.startsWith(href));
</script>

<header class="fixed inset-x-0 top-4 z-50 pointer-events-none">
  <nav class="container-app flex min-w-0 justify-center">

    <!-- ── Desktop pill ───────────────────────────────────────────────────── -->
    <div class="nav-pill pointer-events-auto hidden items-center gap-1.5 rounded-full border border-bordersoft/80 bg-white/90 px-2.5 py-2 shadow-card backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/80 xl:flex">
      <a
        href="/"
        class="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-white shadow-soft transition hover:bg-primary-deep focus:outline-none focus:ring-2 focus:ring-primary/30"
        aria-label="Home"
        title="Home"
      >
        <svg viewBox="0 0 24 24" class="h-6 w-6" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="8.5" cy="11" r="1.6" fill="currentColor" stroke="none" />
          <circle cx="15.5" cy="11" r="1.6" fill="currentColor" stroke="none" />
          <path d="M7 16h10" stroke-linecap="round" />
          <path d="M12 3v3" stroke-linecap="round" />
        </svg>
      </a>

      {#each centerLinks as link}
        <a
          href={link.href}
          class="rounded-full px-5 py-3 text-base font-semibold transition {isActive(link.href)
            ? 'bg-primary text-white shadow-soft'
            : 'text-textmuted hover:bg-primary-soft hover:text-primary dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white'}"
        >
          {link.label}
        </a>
      {/each}

      <a
        href="/playground"
        class="rounded-full bg-primary px-5 py-3 text-base font-semibold text-white shadow-soft transition hover:bg-primary-deep focus:outline-none focus:ring-2 focus:ring-primary/30"
      >
        Playground
      </a>
    </div>

    <!-- ── Mobile pill ────────────────────────────────────────────────────── -->
    <div class="nav-pill pointer-events-auto flex w-full max-w-md items-center justify-between gap-2 rounded-full border border-bordersoft/80 bg-white/90 px-2.5 py-2 shadow-card backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/80 xl:hidden">
      <a
        href="/"
        class="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-white shadow-soft"
        aria-label="Home"
        title="Home"
      >
        <svg viewBox="0 0 24 24" class="h-6 w-6" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="8.5" cy="11" r="1.6" fill="currentColor" stroke="none" />
          <circle cx="15.5" cy="11" r="1.6" fill="currentColor" stroke="none" />
          <path d="M7 16h10" stroke-linecap="round" />
          <path d="M12 3v3" stroke-linecap="round" />
        </svg>
      </a>

      <a href="/playground" class="rounded-full bg-primary-soft px-5 py-3 text-base font-semibold text-primary dark:bg-primary/20 dark:text-white">
        Playground
      </a>

      <button
        class="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-textmain transition hover:bg-primary-soft hover:text-primary dark:text-slate-200 dark:hover:bg-white/10 dark:hover:text-white"
        aria-label="Toggle menu"
        aria-expanded={open}
        on:click={() => (open = !open)}
      >
        <svg viewBox="0 0 24 24" class="h-7 w-7" fill="none" stroke="currentColor" stroke-width="2">
          {#if open}
            <path d="M6 6l12 12M18 6L6 18" stroke-linecap="round" />
          {:else}
            <path d="M4 7h16M4 12h16M4 17h16" stroke-linecap="round" />
          {/if}
        </svg>
      </button>
    </div>
  </nav>

  <!-- ── Mobile menu dropdown ───────────────────────────────────────────── -->
  {#if open}
    <div class="container-app pointer-events-auto mt-2 xl:hidden">
      <div class="nav-pill mx-auto grid max-w-md gap-1.5 rounded-2xl border border-bordersoft/80 bg-white/95 p-2.5 shadow-card backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/95">
        {#each navLinks as link}
          <a
            href={link.href}
            on:click={() => (open = false)}
            class="rounded-xl px-4 py-3 text-base font-medium {isActive(link.href)
              ? 'bg-primary-soft text-primary dark:bg-primary/20 dark:text-white'
              : 'text-textmuted hover:bg-primary-soft hover:text-primary dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white'}"
          >
            {link.label}
          </a>
        {/each}
      </div>
    </div>
  {/if}
</header>
