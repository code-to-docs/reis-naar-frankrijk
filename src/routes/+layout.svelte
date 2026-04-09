<script>
  import { onMount } from "svelte";
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
  }

  /** @param {string} n */
  function kiesNaam(n) {
    naam = n;
    localStorage.setItem("naam", n);
    appState.init(n);
  }

  onMount(() => {
    if (naam) appState.init(naam);
    else appState.applyDarkMode();
  });

  // Reading isDarkMode creates a reactive dependency so applyDarkMode()
  // runs whenever the toggle changes.
  $effect(() => {
    const _dark = appState.isDarkMode;
    appState.applyDarkMode();
  });
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
  <div class="app-shell">
    <Navigation />
    <div class="app-main">
      <Header />
      {@render children()}
      <Snackbar />
    </div>
  </div>
{/if}

<style>
  .kies-scherm {
    display: flex; flex-direction: column; align-items: center;
    justify-content: center; height: 100dvh; gap: 16px;
  }

  .app-shell {
    width: min(100%, var(--app-max-width));
    margin: 0 auto;
  }

  .app-main {
    min-width: 0;
  }

  @media (min-width: 1100px) {
    .app-shell {
      display: grid;
      grid-template-columns: 220px minmax(0, 1fr);
      align-items: start;
      gap: 16px;
      padding: 14px 14px 0;
    }
  }
</style>
