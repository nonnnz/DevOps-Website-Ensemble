<script>
  export let label = '';
  export let value = '';
  export let unit = '';
  export let sublabel = '';
  /** 0-100 progress, or null to hide the bar. */
  export let progress = null;
  /** @type {'primary'|'success'|'warning'|'danger'} */
  export let tone = 'primary';

  const bar = {
    primary: 'bg-primary',
    success: 'bg-success',
    warning: 'bg-warning',
    danger: 'bg-danger'
  };
</script>

<div class="card-soft card-hover p-5">
  <p class="text-sm font-medium text-textmuted">{label}</p>
  <div class="mt-1 flex items-baseline gap-1">
    <span class="text-3xl font-bold text-textmain">{value}</span>
    {#if unit}<span class="text-sm font-medium text-textmuted">{unit}</span>{/if}
  </div>
  {#if progress != null}
    <div class="mt-3 h-2 w-full overflow-hidden rounded-full bg-primary-soft">
      <div class="h-full rounded-full {bar[tone] || bar.primary}" style="width: {Math.min(100, Math.max(0, progress))}%"></div>
    </div>
  {/if}
  {#if sublabel}
    <p class="mt-2 text-xs text-textmuted">{sublabel}</p>
  {/if}
</div>
