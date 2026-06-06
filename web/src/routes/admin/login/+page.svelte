<script>
  /**
   * Admin login — public page. Exchanges the admin token for an httpOnly
   * session cookie via POST /api/admin/session, then redirects to the config page.
   */
  import { goto } from '$app/navigation';
  import Button from '$lib/components/Button.svelte';

  let token = '';
  let busy = false;
  let errorMsg = '';

  async function login() {
    if (!token.trim() || busy) return;
    busy = true;
    errorMsg = '';
    try {
      const res = await fetch('/api/admin/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        errorMsg = data?.message || 'เข้าสู่ระบบไม่สำเร็จ';
        return;
      }
      token = '';
      await goto('/admin/config');
    } catch {
      errorMsg = 'เชื่อมต่อไม่ได้';
    } finally {
      busy = false;
    }
  }

  function onKeydown(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      login();
    }
  }
</script>

<svelte:head>
  <title>Admin Login - Super AI Engineer LLM</title>
  <meta name="robots" content="noindex" />
</svelte:head>

<section class="section pt-20">
  <div class="container-app max-w-md">
    <div class="card-soft p-8">
      <span class="eyebrow mb-3">Admin</span>
      <h1 class="text-2xl font-bold text-textmain">เข้าสู่ระบบผู้ดูแล</h1>
      <p class="mt-2 text-sm text-textmuted">กรอก Admin Token เพื่อเข้าถึงหน้าตั้งค่า</p>

      <label class="mt-6 block">
        <span class="label-soft">Admin Token</span>
        <input
          type="password"
          bind:value={token}
          on:keydown={onKeydown}
          autocomplete="off"
          class="input-soft font-mono"
          placeholder="••••••••••••"
        />
      </label>

      {#if errorMsg}
        <div class="mt-3 rounded-xl border border-danger/30 bg-danger/10 px-4 py-2 text-sm text-danger">
          {errorMsg}
        </div>
      {/if}

      <div class="mt-6">
        <Button on:click={login} disabled={busy || !token.trim()}>
          {busy ? 'กำลังเข้าสู่ระบบ…' : 'เข้าสู่ระบบ'}
        </Button>
      </div>
    </div>
  </div>
</section>
