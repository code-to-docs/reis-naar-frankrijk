<script>
  import "../app.css";
  import Navigation from "$lib/components/Navigation.svelte";
  import { appState } from "$lib/stores.svelte.js";
  import Snackbar from "$lib/components/Snackbar.svelte";
  import Header from "$lib/components/Header.svelte";

  let { children } = $props();
  let naam = $state("");

  const E_VLAG = "\u{1F1EB}\u{1F1F7}";

  if (typeof localStorage !== "undefined") {
    const opgeslagen = localStorage.getItem("naam") || "";
    naam = opgeslagen;
    if (opgeslagen) {
      appState.init(opgeslagen);
    }
  }

  function kiesNaam(n) {
    naam = n;
    localStorage.setItem("naam", n);
    appState.init(n);
  }
</script>

{#if !naam}
  <div class="kies-scherm">
    <h1 style="font-size:80px;">{E_VLAG}</h1>
    <h2>Reis naar Frankrijk</h2>
    <p>Wie ben je?</p>
    <div style="display:flex;gap:16px;margin-top:20px;">
      <button class="btn-primary" style="font-size:20px;padding:16px 32px;"
        onclick={() => kiesNaam("Franzi")}>Franzi</button>
      <button class="btn-primary" style="font-size:20px;padding:16px 32px;"
        onclick={() => kiesNaam("Dennis")}>Dennis</button>
    </div>
  </div>
{:else}
  <Header />
  {@render children()}
  <Snackbar />
  <Navigation />
{/if}

<style>
  .kies-scherm {
    display: flex; flex-direction: column; align-items: center;
    justify-content: center; height: 100dvh; gap: 16px;
  }
</style>