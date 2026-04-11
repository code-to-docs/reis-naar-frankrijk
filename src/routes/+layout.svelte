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
    try {
      const opgeslagen = localStorage.getItem("naam") || "";
      naam = opgeslagen;
    } catch {
      naam = "";
    }
  }

  /** @param {string} n */
  function kiesNaam(n) {
    naam = n;
    try {
      localStorage.setItem("naam", n);
    } catch {
      // Ignore storage errors and continue with in-memory state.
    }
    appState.init(n);
  }

  onMount(() => {
    if (naam) appState.init(naam);
    else {
      appState.isDarkMode = document.documentElement.classList.contains("dark");
      appState.applyDarkMode();
    }
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
    gap: var(--ui-space-4);
    text-align: center;
    padding: var(--ui-space-6);
  }

  .kies-vlag {
    font-size: clamp(3.2rem, 11vw, 5.2rem);
    line-height: 1;
  }

  .kies-scherm h2 {
    font-size: var(--ui-text-2xl);
    letter-spacing: -0.03em;
  }

  .kies-scherm p {
    color: var(--nav-text);
    font-size: var(--text-base);
    font-weight: var(--ui-weight-semibold);
  }

  .kies-acties {
    display: flex;
    gap: var(--ui-space-3);
    margin-top: var(--space-1-5);
  }

  .kies-knop {
    font-size: var(--text-lg);
    min-width: calc(var(--space-16) + var(--space-12) + var(--space-6));
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
      grid-template-columns: var(--nav-sidebar-width) minmax(0, 1fr);
      align-items: start;
      gap: var(--space-4);
      padding: var(--space-3) var(--space-3) 0;
    }
  }
</style>
