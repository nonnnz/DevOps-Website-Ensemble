<script>
  /**
   * Reusable button / link.
   * @type {'primary'|'secondary'|'outline'|'ghost'|'danger'}
   */
  export let variant = 'primary';
  /** @type {'sm'|'md'|'lg'} */
  export let size = 'md';
  /** When set, renders an <a> instead of a <button>. */
  export let href = '';
  export let type = 'button';
  export let disabled = false;
  export let full = false;

  let className = '';
  export { className as class };

  const variants = {
    // Glowing cyan -> blue -> violet gradient that matches the futuristic background.
    primary:
      'bg-gradient-to-r from-[#22D3EE] via-primary to-[#7C5CFF] text-white shadow-[0_10px_30px_-8px_rgba(36,127,255,0.6)] hover:shadow-[0_14px_40px_-6px_rgba(36,127,255,0.8)] hover:brightness-[1.05]',
    secondary:
      'border border-primary/20 bg-primary-soft text-primary hover:bg-[#dceaff] hover:border-primary/40 dark:border-white/10 dark:bg-primary/20 dark:text-cyan-300 dark:hover:bg-primary/30',
    outline:
      'border border-bordersoft bg-white/70 text-textmain backdrop-blur-sm hover:border-primary hover:text-primary hover:shadow-[0_10px_30px_-12px_rgba(36,127,255,0.5)] dark:border-white/15 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10 dark:hover:border-white/30 dark:hover:text-white',
    ghost: 'text-textmuted hover:text-primary hover:bg-primary-soft dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/10',
    danger: 'bg-danger text-white hover:bg-red-600'
  };
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base'
  };

  $: classes = [
    'inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition duration-200 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-primary/30',
    variants[variant] || variants.primary,
    sizes[size] || sizes.md,
    full ? 'w-full' : '',
    disabled ? 'cursor-not-allowed opacity-50' : '',
    className
  ].join(' ');
</script>

{#if href}
  <a {href} class={classes} on:click>
    <slot />
  </a>
{:else}
  <button {type} {disabled} class={classes} on:click>
    <slot />
  </button>
{/if}
