<script>
  export let label = '';
  /** @type {'success'|'primary'|'warning'|'danger'|'muted'} */
  export let tone = 'primary';
  export let dot = true;
  export let pulse = false;

  const tones = {
    success: 'bg-success/10 text-success border-success/20',
    primary: 'bg-primary-soft text-primary border-primary/20',
    warning: 'bg-warning/10 text-warning border-warning/20',
    danger: 'bg-danger/10 text-danger border-danger/20',
    muted: 'bg-slate-100 text-textmuted border-slate-200'
  };
  const dots = {
    success: 'bg-success',
    primary: 'bg-primary',
    warning: 'bg-warning',
    danger: 'bg-danger',
    muted: 'bg-slate-400'
  };
</script>

<span class="badge border {tones[tone] || tones.primary}">
  {#if dot}
    <span class="h-1.5 w-1.5 rounded-full {dots[tone] || dots.primary} {pulse ? 'animate-pulseSoft' : ''}"></span>
  {/if}
  {label}
</span>
