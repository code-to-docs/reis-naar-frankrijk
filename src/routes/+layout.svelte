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
    <h1 class="kies-vlag">{E_VLAG}</h1>
    <h2>Reis naar Frankrijk</h2>
    <p>Wie ben je?</p>
    <div class="kies-acties">
      <button class="btn-primary kies-knop" onclick={() => kiesNaam("Franzi")}>Franzi</button>
      <button class="btn-primary kies-knop" onclick={() => kiesNaam("Dennis")}>Dennis</button>
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
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100dvh;
    gap: 14px;
    text-align: center;
    padding: 24px;
  }

  .kies-vlag {
    font-size: clamp(3.2rem, 11vw, 5.2rem);
    line-height: 1;
  }

  .kies-scherm h2 {
    font-size: clamp(2rem, 8vw, 2.8rem);
    letter-spacing: -0.03em;
  }

  .kies-scherm p {
    color: var(--nav-text);
    font-size: 1.05rem;
    font-weight: 600;
  }

  .kies-acties {
    display: flex;
    gap: 12px;
    margin-top: 6px;
  }

  .kies-knop {
    font-size: 1.1rem;
    padding: 13px 24px;
    min-width: 136px;
    border-radius: 12px;
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
