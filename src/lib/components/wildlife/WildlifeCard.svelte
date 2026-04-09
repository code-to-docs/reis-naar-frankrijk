<script lang="ts">
  import { doc, setDoc, deleteDoc } from "firebase/firestore";
  import { db } from "$lib/firebase.js";
  import { toonSnackbar } from "$lib/stores.js";
  import { haptic } from "$lib/utils/haptic.js";
  import { categorieLabels, regioLabels, zeldzaamheidLabels } from "$lib/wildlifeData.js";
  import { E } from "$lib/emojis.js";
  import type { Spotting } from "$lib/types";

  let { 
    dier, 
    spotting, 
    foto, 
    isExpanded, 
    currentUser, 
    onToggle 
  } = $props<{ 
    dier: any; 
    spotting: Spotting | null | undefined; 
    foto: string; 
    isExpanded: boolean; 
    currentUser: string; 
    onToggle: () => void; 
  }>();

  let spotNotitie = $state("");
  let spotLocatie = $state("");

  async function saveSpottingDetails() {
    try {
      await setDoc(doc(db, "wildlife", dier.id), {
        gespot: true,
        door: currentUser,
        datum: new Date().toISOString(),
        notitie: spotNotitie,
        locatie: spotLocatie,
      });
      haptic("success");
      const emoji = categorieLabels[dier.categorie]?.emoji || E.POOT;
      toonSnackbar(dier.naam + " gespot!", "success", emoji);
      spotNotitie = "";
      spotLocatie = "";
      onToggle(); // Close after saving
    } catch (e) {
      console.error(e);
      toonSnackbar("Fout bij opslaan", "error", E.KRUIS);
    }
  }

  async function verwijderSpotting() {
    try {
      await deleteDoc(doc(db, "wildlife", dier.id));
      haptic("light");
      toonSnackbar("Spotting ongedaan gemaakt", "warning", E.UNDO);
    } catch (e) {
      console.error(e);
      toonSnackbar("Kon niet verwijderen", "error", E.KRUIS);
    }
  }
</script>

<div class="wl-card" class:gespot={!!spotting}>
  <button type="button" class="wl-hoofd" onclick={onToggle}>
    <div class="wl-foto-wrap">
      {#if foto}
        <img src={foto} alt={dier.naam} class="wl-foto" loading="lazy" decoding="async" />
      {:else}
        <div class="wl-foto-ph">{categorieLabels[dier.categorie]?.emoji || E.POOT}</div>
      {/if}
      {#if spotting}
        <div class="wl-gespot-dot"></div>
      {/if}
    </div>
    <div class="wl-info">
      <div class="wl-naam-rij">
        <strong class="wl-naam">{dier.naam}</strong>
        <span class="wl-ster" style="color:{zeldzaamheidLabels[dier.zeldzaamheid]?.kleur}">{zeldzaamheidLabels[dier.zeldzaamheid]?.emoji}</span>
      </div>
      <div class="wl-frans">{dier.frans}</div>
      <div class="wl-tags">
        {#each dier.regios as regio}
          <span class="wl-tag">{regioLabels[regio]?.emoji} {regioLabels[regio]?.label}</span>
        {/each}
      </div>
    </div>
    <svg class="wl-chevron" class:open={isExpanded} width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M6 8L10 12L14 8" stroke="#94a3b8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  </button>

  {#if isExpanded}
    <div class="wl-detail">
      <p class="wl-beschrijving">{dier.info}</p>
      {#if dier.tip}
        <div class="wl-tip">
          <span class="wl-tip-icon">{E.TIP}</span>
          <span class="wl-tip-tekst">{dier.tip}</span>
        </div>
      {/if}
      {#if spotting}
        <div class="wl-spotting">
          <div class="wl-spotting-head">{E.CHECK} Gespot door {spotting.door}</div>
          {#if spotting.datum}
            <div class="wl-spotting-row">{E.KALENDER} {new Date(spotting.datum).toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric" })}</div>
          {/if}
          {#if spotting.locatie}
            <div class="wl-spotting-row">{E.PIN} {spotting.locatie}</div>
          {/if}
          {#if spotting.notitie}
            <div class="wl-spotting-row">{E.NOTITIE} {spotting.notitie}</div>
          {/if}
        </div>
      {/if}
      {#if !spotting}
        <div class="wl-spot-form">
          <input type="text" class="wl-spot-input" placeholder="{E.PIN} Locatie (optioneel)" bind:value={spotLocatie} />
          <input type="text" class="wl-spot-input" placeholder="{E.NOTITIE} Notitie (optioneel)" bind:value={spotNotitie} />
          <button class="wl-spot-btn" onclick={saveSpottingDetails}>
            {E.CHECK} {dier.naam} gespot!
          </button>
        </div>
      {:else}
        <button class="wl-unspot" onclick={verwijderSpotting}>
          {E.UNDO} Spotting ongedaan maken
        </button>
      {/if}
      <div class="wl-links">
        <a href={"https://en.wikipedia.org/wiki/" + dier.wiki} target="_blank" rel="noopener" class="wl-link wiki">{E.WIKI} Wikipedia</a>
        {#if dier.geluid}
          <a href={dier.geluid} target="_blank" rel="noopener" class="wl-link geluid">{E.GELUID} Geluid</a>
        {/if}
      </div>
    </div>
  {/if}
</div>

<style>
  .wl-card {
    background: white; border-radius: 14px; overflow: hidden;
    box-shadow: 0 1px 4px rgba(0,0,0,0.06); border: 2px solid transparent;
    transition: border-color 0.2s;
  }
  .wl-card.gespot { border-color: #10b981; background: #f0fdf4; }
  .wl-hoofd { display: flex; width: 100%; background: none; border: none; text-align: left; align-items: center; gap: 12px; padding: 12px; cursor: pointer; }
  .wl-foto-wrap { position: relative; flex-shrink: 0; }
  .wl-foto { width: 56px; height: 56px; border-radius: 12px; object-fit: cover; }
  .wl-foto-ph {
    width: 56px; height: 56px; border-radius: 12px; background: #f1f5f9;
    display: flex; align-items: center; justify-content: center; font-size: 1.6rem;
  }
  .wl-gespot-dot {
    position: absolute; top: -3px; right: -3px; width: 14px; height: 14px;
    background: #10b981; border: 2px solid white; border-radius: 50%;
  }
  .wl-info { flex: 1; min-width: 0; }
  .wl-naam-rij { display: flex; align-items: center; gap: 6px; }
  .wl-naam { font-size: 0.95rem; color: #1e293b; }
  .wl-ster { font-size: 0.7rem; letter-spacing: -1px; }
  .wl-frans { font-size: 0.78rem; color: #94a3b8; font-style: italic; }
  .wl-tags { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 3px; }
  .wl-tag { font-size: 0.68rem; background: #f1f5f9; padding: 2px 7px; border-radius: 8px; color: #64748b; }
  .wl-chevron { flex-shrink: 0; transition: transform 0.2s ease; }
  .wl-chevron.open { transform: rotate(180deg); }

  .wl-detail { padding: 0 14px 14px 14px; border-top: 1px solid #f1f5f9; }
  .wl-beschrijving { font-size: 0.85rem; line-height: 1.5; color: #475569; margin: 12px 0; }
  .wl-tip {
    display: flex; gap: 8px; align-items: flex-start;
    background: #EBF5FB; padding: 10px 12px; border-radius: 10px; margin-bottom: 12px;
  }
  .wl-tip-icon { font-size: 1rem; flex-shrink: 0; }
  .wl-tip-tekst { font-size: 0.82rem; line-height: 1.4; color: #1a5276; }
  .wl-spotting { background: #f0fdf4; padding: 12px; border-radius: 10px; margin-bottom: 12px; }
  .wl-spotting-head { font-weight: 600; font-size: 0.85rem; margin-bottom: 4px; color: #166534; }
  .wl-spotting-row { font-size: 0.82rem; color: #475569; padding: 2px 0; }
  .wl-spot-form { display: flex; flex-direction: column; gap: 8px; margin-bottom: 12px; }
  .wl-spot-input {
    padding: 10px 12px; border: 1.5px solid #e2e8f0; border-radius: 10px;
    font-size: 0.85rem; outline: none; transition: border-color 0.2s; box-sizing: border-box;
  }
  .wl-spot-input:focus { border-color: #10b981; }
  .wl-spot-btn {
    padding: 12px; background: #10b981; color: white; border: none;
    border-radius: 12px; font-size: 0.9rem; font-weight: 600; cursor: pointer;
  }
  .wl-spot-btn:active { background: #059669; }
  .wl-unspot {
    padding: 8px 16px; background: none; border: 1.5px solid #e2e8f0;
    border-radius: 10px; font-size: 0.8rem; color: #94a3b8; cursor: pointer; margin-bottom: 12px;
  }
  .wl-unspot:active { border-color: #ef4444; color: #ef4444; }
  .wl-links { display: flex; gap: 8px; flex-wrap: wrap; }
  .wl-link {
    padding: 7px 14px; border-radius: 20px; font-size: 0.78rem;
    text-decoration: none; font-weight: 500;
  }
  .wl-link.wiki { background: #EBF5FB; color: #1565C0; }
  .wl-link.geluid { background: #FFF7ED; color: #c2410c; }
  .wl-link:active { opacity: 0.7; }
  
  :global(html.dark) .wl-card { background: var(--card-bg); }
  :global(html.dark) .wl-card.gespot { background: #071a10; border-color: #10b981; }
  :global(html.dark) .wl-naam { color: #e2e8f0; }
  :global(html.dark) .wl-foto-ph { background: #334155; }
  :global(html.dark) .wl-detail { border-top-color: #334155; }
  :global(html.dark) .wl-beschrijving { color: #94a3b8; }
  :global(html.dark) .wl-tip { background: #1e3a5f; }
  :global(html.dark) .wl-tip-tekst { color: #93c5fd; }
  :global(html.dark) .wl-spotting { background: #0f2d1c; }
  :global(html.dark) .wl-spotting-head { color: #34d399; }
  :global(html.dark) .wl-spot-input { background: #000000; border-color: #334155; color: #e2e8f0; }
  :global(html.dark) .wl-tag { background: #334155; color: #94a3b8; }
  :global(html.dark) .wl-link.wiki { background: #1e3a5f; color: #93c5fd; }
  :global(html.dark) .wl-link.geluid { background: #3b2006; color: #fdba74; }
</style>
