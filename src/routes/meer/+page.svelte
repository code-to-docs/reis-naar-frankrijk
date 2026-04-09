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

  function handleToggleDark() {
    appState.toggleDarkMode();
  }
</script>

<div class="page-transition meer-menu">
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
</div>

<style>
  .meer-menu { padding: 16px; }
  .meer-groep { margin-bottom: 16px; }
  .meer-groep-label {
    font-size: 0.72rem; font-weight: 600; color: var(--nav-text);
    text-transform: uppercase; letter-spacing: 0.5px; padding: 0 4px 6px 4px;
  }
  .meer-groep-items {
    background: var(--card-bg); border-radius: 14px; overflow: hidden;
    box-shadow: 0 1px 4px var(--card-shadow);
  }
  .meer-item {
    width: 100%; display: flex; align-items: center; gap: 14px;
    padding: 14px 16px; background: none; border: none;
    border-bottom: 1px solid var(--border-subtle); cursor: pointer;
    text-align: left; transition: background 0.15s ease;
    color: var(--nav-text); text-decoration: none;
  }
  .meer-item:last-child { border-bottom: none; }
  .meer-item:active { background: var(--hover-bg); }
  .meer-emoji { font-size: 1.4rem; flex-shrink: 0; }
  .meer-label { flex: 1; font-size: 0.95rem; font-weight: 500; color: var(--tekst); }
  .meer-arrow { flex-shrink: 0; }
  
  .dark-toggle-item {
    width: 100%; display: flex; align-items: center; gap: 14px;
    padding: 14px 16px; background: none; border: none; cursor: pointer;
    text-align: left;
  }
  .dark-toggle-emoji { font-size: 1.4rem; flex-shrink: 0; }
  .dark-toggle-label { flex: 1; font-size: 0.95rem; font-weight: 500; color: var(--tekst); }
  .toggle-track { width: 44px; height: 24px; background: #cbd5e1; border-radius: 12px; position: relative; transition: background 0.2s; }
  .toggle-track.active { background: #3b82f6; }
  .toggle-thumb { position: absolute; left: 2px; top: 2px; width: 20px; height: 20px; background: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.6rem; transition: transform 0.2s; box-shadow: 0 1px 2px rgba(0,0,0,0.2); }
  .toggle-track.active .toggle-thumb { transform: translateX(20px); }
  
  .meer-uitloggen {
    width: 100%; padding: 14px; background: none;
    border: 1.5px solid #fecaca; border-radius: 14px;
    color: #ef4444; font-size: 0.95rem; font-weight: 500;
    cursor: pointer; margin-top: 8px;
  }
  .meer-uitloggen:active { background: var(--hover-bg); }
</style>
