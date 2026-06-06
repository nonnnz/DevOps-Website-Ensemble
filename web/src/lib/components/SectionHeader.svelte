<script>
  export let eyebrow = '';
  export let title = '';
  export let subtitle = '';
  export let center = false;
</script>

<div class="{center ? 'mx-auto max-w-2xl text-center' : 'max-w-2xl'} mb-10">
  {#if eyebrow}
    <span class="eyebrow mb-3">{eyebrow}</span>
  {/if}
  <h2 class="text-3xl font-bold text-textmain sm:text-4xl text-balance">{title}</h2>
  {#if subtitle}
    <p class="mt-3 text-base leading-relaxed text-textmuted">{subtitle}</p>
  {/if}
  <slot />
</div>
