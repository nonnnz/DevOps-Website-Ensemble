<script>
  import '../app.css';
  import Navbar from '$lib/components/Navbar.svelte';
  import Footer from '$lib/components/Footer.svelte';
</script>

<div class="gradient-page flex min-h-screen flex-col">
  <Navbar />
  <main class="flex-1">
    <slot />
  </main>
  <Footer />
</div>
