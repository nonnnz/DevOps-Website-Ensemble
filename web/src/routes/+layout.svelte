<script>
  import '../app.css';
  import Navbar from '$lib/components/Navbar.svelte';
  import Footer from '$lib/components/Footer.svelte';
</script>

<div class="gradient-page flex min-h-screen w-full overflow-x-hidden flex-col">
  <Navbar />
  <main class="w-full min-w-0 flex-1 pt-24">
    <slot />
  </main>
  <Footer />
</div>
