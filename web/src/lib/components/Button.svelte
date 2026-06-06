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
    primary: 'bg-primary text-white hover:bg-primary-deep shadow-soft',
    secondary: 'bg-primary-soft text-primary hover:bg-[#dceaff]',
    outline: 'border border-bordersoft bg-white text-textmain hover:border-primary hover:text-primary',
    ghost: 'text-textmuted hover:text-primary hover:bg-primary-soft',
    danger: 'bg-danger text-white hover:bg-red-600'
  };
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base'
  };

  $: classes = [
    'inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition focus:outline-none focus:ring-2 focus:ring-primary/30',
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
