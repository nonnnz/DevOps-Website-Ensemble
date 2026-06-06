<script>
  import Button from './Button.svelte';
  /** @type {{title:string, description:string, prompt:string}} */
  export let useCase;
  /** When false, the "Try in Playground" button is hidden. */
  export let enablePrompt = true;
</script>

<div class="card-soft card-hover flex h-full flex-col p-6">
  <h3 class="text-lg font-bold text-textmain">{useCase.title}</h3>
  <p class="mt-2 text-sm leading-relaxed text-textmuted">{useCase.description}</p>

  <div class="mt-4 rounded-xl border border-bordersoft bg-surface p-3">
    <p class="text-xs font-semibold uppercase tracking-wide text-textmuted">Sample prompt</p>
    <p class="mt-1 text-sm text-textmain">{useCase.prompt}</p>
  </div>

  <div class="mt-auto pt-4">
    {#if enablePrompt}
      <Button href={`/playground?prompt=${encodeURIComponent(useCase.prompt)}`} variant="secondary" size="sm" full>
        Try in Playground →
      </Button>
    {/if}
  </div>
</div>
