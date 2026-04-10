<script>
  import { appState } from "$lib/stores.svelte.js";
  import { E } from "$lib/emojis.js";



  const meerGroepen = [
    {
      label: "Reis",
      items: [
        { id:"activiteiten",  emoji: E.TARGET, label:"Activiteiten" },
        { id:"zwemplekken",   emoji: E.ZWEM,   label:"Zwemplekken" },
        { id:"wildlife",      emoji: E.VOGEL,  label:"Wildlife" },
      ]
    },
    {
      label: "Lijsten",
      items: [
        { id:"boodschappen",  emoji: E.WINKEL, label:"Boodschappen" },
        { id:"paklijst",      emoji: E.LIJST,  label:"Paklijst" },
        { id:"gerechten",     emoji: E.ETEN,   label:"Gerechten" },
      ]
    },
    {
      label: "Overig",
      items: [
        { id:"dagboek",       emoji: E.BOEK,   label:"Dagboek" },
        { id:"noodinfo",      emoji: E.WARN,   label:"Noodinfo" },
      ]
    }
  ];
  const showTokenTest = import.meta.env.DEV;

  function handleToggleDark() {
    appState.toggleDarkMode();
  }
</script>

<div class="page-transition page-shell meer-menu">
  {#each meerGroepen as groep}
    <div class="meer-groep">
      <div class="meer-groep-label">{groep.label}</div>
      <div class="meer-groep-items">
        {#each groep.items as o}
          <a class="meer-item" href={"/meer/" + o.id}>
            <span class="meer-emoji">{o.emoji}</span>
            <span class="meer-label">{o.label}</span>
            <svg class="meer-arrow" width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M6 4L10 8L6 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </a>
        {/each}
      </div>
    </div>
  {/each}

  <div class="meer-groep">
    <div class="meer-groep-label">Instellingen</div>
    <div class="meer-groep-items">
      <button class="dark-toggle-item" onclick={handleToggleDark}>
        <span class="dark-toggle-emoji">{appState.isDarkMode ? "\u2600\uFE0F" : "\u{1F319}"}</span>
        <span class="dark-toggle-label">{appState.isDarkMode ? "Light mode" : "Dark mode"}</span>
        <div class="toggle-track" class:active={appState.isDarkMode}>
          <div class="toggle-thumb">
            {appState.isDarkMode ? "\u{1F319}" : "\u2600\uFE0F"}
          </div>
        </div>
      </button>
    </div>
  </div>

  <button class="meer-uitloggen" onclick={() => { localStorage.removeItem("naam"); location.reload(); }}>
    {E.DEUR} Uitloggen
  </button>

  {#if showTokenTest}
    <section class="test-card" aria-label="UI tokens testkaart">
      <h2 class="test-title">Token Test</h2>
      <p class="test-body">Als dit er goed uitziet, werken de tokens.</p>
      <button class="test-button" type="button">Primaire actie</button>
    </section>
  {/if}
</div>

<style>
  .meer-menu { padding-top: 12px; }
  .meer-groep { margin-bottom: var(--ui-space-4); }
  .meer-groep-label {
    font-size: var(--font-size-xs); font-weight: var(--ui-weight-bold); color: var(--nav-text);
    text-transform: uppercase; letter-spacing: 0.04em; padding: 0 4px 6px 4px;
  }
  .meer-groep-items {
    background: var(--card-bg); border-radius: var(--radius-md); overflow: hidden;
    box-shadow: 0 1px 4px var(--card-shadow);
  }
  .meer-item {
    width: 100%; display: flex; align-items: center; gap: 14px;
    min-height: 58px; padding: 0 16px; background: none; border: none;
    border-bottom: 1px solid var(--border-subtle); cursor: pointer;
    text-align: left; transition: background 0.15s ease;
    color: var(--nav-text); text-decoration: none;
  }
  .meer-item:last-child { border-bottom: none; }
  .meer-item:active { background: var(--hover-bg); }
  .meer-emoji { font-size: 1.4rem; flex-shrink: 0; }
  .meer-label { flex: 1; font-size: var(--font-size-md); font-weight: var(--ui-weight-medium); color: var(--tekst); }
  .meer-arrow { flex-shrink: 0; }

  .meer-uitloggen {
    width: 100%;
    background: color-mix(in srgb, var(--card-bg) 88%, #fff0ef);
    border: 1px solid color-mix(in srgb, var(--rood) 30%, var(--input-border));
    border-radius: var(--radius-md);
    color: var(--rood);
    font-size: var(--font-size-md);
    font-weight: var(--ui-weight-semibold);
    cursor: pointer;
    margin-top: 8px;
  }
  .meer-uitloggen:active { background: var(--hover-bg); }

  .test-card {
    background: var(--bg-surface);
    padding: var(--space-6);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-md);
    border: 1px solid var(--border-default);
    max-width: 400px;
    margin: var(--space-8) auto 0;
  }

  .test-title {
    font-size: var(--text-xl);
    font-weight: var(--weight-semibold);
    color: var(--text-primary);
    margin-bottom: var(--space-2);
  }

  .test-body {
    font-size: var(--text-base);
    color: var(--text-secondary);
    margin-bottom: var(--space-4);
  }

  .test-button {
    background: var(--bg-accent);
    color: var(--text-inverse);
    padding: var(--space-2-5) var(--space-4);
    border: none;
    border-radius: var(--radius-md);
    font-size: var(--text-base);
    font-weight: var(--weight-medium);
    cursor: pointer;
    transition: background var(--duration-fast) var(--ease-default);
  }

  .test-button:hover {
    background: var(--bg-accent-hover);
  }
</style>
