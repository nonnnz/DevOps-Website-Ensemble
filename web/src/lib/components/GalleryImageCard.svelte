<script>
  /** @type {{title:string, description?:string, src?:string, alt?:string}} */
  export let item;
  export let index = 0;

  const fallbackStyles = [
    'from-sky-100 via-white to-blue-200 text-primary',
    'from-emerald-100 via-white to-cyan-100 text-emerald-700',
    'from-amber-100 via-white to-rose-100 text-amber-700',
    'from-violet-100 via-white to-sky-100 text-violet-700',
    'from-slate-100 via-white to-indigo-100 text-slate-700',
    'from-lime-100 via-white to-teal-100 text-teal-700'
  ];

  $: fallbackClass = fallbackStyles[index % fallbackStyles.length];
</script>

<figure class="card-soft card-hover flex h-full flex-col overflow-hidden">
  <div class="aspect-[4/3] w-full overflow-hidden bg-surface">
    {#if item.src}
      <img src={item.src} alt={item.alt || item.title} class="h-full w-full object-cover" loading="lazy" />
    {:else}
      <div class={`flex h-full w-full items-center justify-center bg-gradient-to-br ${fallbackClass}`}>
        <div class="grid h-16 w-16 place-items-center rounded-2xl border border-white/70 bg-white/70 shadow-card">
          <svg viewBox="0 0 24 24" class="h-8 w-8" fill="none" stroke="currentColor" stroke-width="1.8">
            <path d="M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v11a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 17.5v-11z" />
            <path d="m6.5 17 4.2-4.2a1.4 1.4 0 0 1 2 0L17.5 17" stroke-linecap="round" stroke-linejoin="round" />
            <path d="m14.5 14 1.1-1.1a1.4 1.4 0 0 1 2 0L20 15.3" stroke-linecap="round" stroke-linejoin="round" />
            <circle cx="9" cy="8.5" r="1.3" />
          </svg>
        </div>
      </div>
    {/if}
  </div>
  <figcaption class="flex flex-1 flex-col p-5">
    <h3 class="text-base font-bold text-textmain">{item.title}</h3>
    {#if item.description}
      <p class="mt-2 text-sm leading-relaxed text-textmuted">{item.description}</p>
    {/if}
  </figcaption>
</figure>
