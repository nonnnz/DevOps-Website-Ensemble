<script>
  /**
   * Feedback buttons for a single assistant response.
   * Saves to /api/feedback (PostgreSQL) tied to the playground log id.
   */
  export let logId = null;
  export let disabled = false;

  let chosen = null;
  let saving = false;
  let errorMsg = '';

  const options = [
    { type: 'good', label: '👍 Good', tone: 'success' },
    { type: 'bad', label: '👎 Bad', tone: 'warning' },
    { type: 'hallucination', label: '🌀 Hallucination', tone: 'warning' },
    { type: 'unsafe', label: '⚠ Unsafe', tone: 'danger' }
  ];

  const toneClass = {
    success: 'border-success/30 bg-success/10 text-success',
    warning: 'border-warning/30 bg-warning/10 text-warning',
    danger: 'border-danger/30 bg-danger/10 text-danger'
  };

  async function send(type) {
    if (!logId || saving || disabled) return;
    saving = true;
    errorMsg = '';
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playground_log_id: logId, feedback_type: type })
      });
      if (!res.ok) throw new Error(await res.text());
      chosen = type;
    } catch (err) {
      errorMsg = 'Could not save feedback.';
      console.error('feedback error', err);
    } finally {
      saving = false;
    }
  }
</script>

<div class="flex flex-wrap items-center gap-2">
  <span class="text-xs text-textmuted">Rate this response:</span>
  {#each options as opt}
    <button
      type="button"
      disabled={!logId || disabled || saving}
      on:click={() => send(opt.type)}
      class="rounded-full border px-3 py-1 text-xs font-medium transition disabled:cursor-not-allowed disabled:opacity-40 {chosen ===
      opt.type
        ? toneClass[opt.tone]
        : 'border-bordersoft text-textmuted hover:border-primary hover:text-primary'}"
    >
      {opt.label}
    </button>
  {/each}
  {#if chosen}
    <span class="text-xs text-success">Saved ✓</span>
  {/if}
  {#if errorMsg}
    <span class="text-xs text-danger">{errorMsg}</span>
  {/if}
</div>
