<script>
  export let hover = false;
  export let padded = true;
  let className = '';
  export { className as class };
</script>

<div
  class="card-soft {padded ? 'p-6' : ''} {hover ? 'card-hover' : ''} {className}"
>
  <slot />
</div>
