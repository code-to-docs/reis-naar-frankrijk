<script lang="ts">
  import { E } from "$lib/emojis.js";
  import { appState } from "$lib/stores.svelte.js";
  import {
    gerechtenData,
    gerechtenSoortLabels,
    gerechtenStreekLabels
  } from "$lib/gerechtenData.js";
  import type { Gerecht } from "$lib/types.js";

  const KERN_STREKEN = new Set(["lozere", "cantal", "pyrenees_ariegeoises"]);

  function getUserKey() {
    return (appState.gebruiker || "").toLowerCase().trim();
  }

  function getDagSeed(datum: Date, userKey: string) {
    const dagCode = Number(
      `${datum.getFullYear()}${String(datum.getMonth() + 1).padStart(2, "0")}${String(datum.getDate()).padStart(2, "0")}`
    );
    let userScore = 0;
    for (let i = 0; i < userKey.length; i++) userScore += userKey.charCodeAt(i);
    return dagCode + userScore;
  }

  function filterKernStreek(gerecht: Gerecht) {
    return gerecht.streken.some((streek) => KERN_STREKEN.has(streek));
  }

  function metPersoonVoorkeur(kandidaten: Gerecht[], userKey: string) {
    if (userKey !== "franzi") return kandidaten;
    const franziKandidaten = kandidaten.filter((gerecht) => gerecht.vegetarisch || gerecht.vis);
    return franziKandidaten.length ? franziKandidaten : kandidaten;
  }

  function getSoortLabel(soort: string) {
    return (gerechtenSoortLabels as Record<string, { label: string }>)[soort]?.label || soort;
  }

  function getHoofdStreek(gerecht: Gerecht) {
    return gerecht.streken.find((streek) => KERN_STREKEN.has(streek)) || gerecht.streken[0] || "alle";
  }

  function getStreekLabel(streek: string) {
    return (gerechtenStreekLabels as Record<string, { label: string }>)[streek]?.label || streek;
  }

  let userKey = $derived.by(() => getUserKey());

  let tipKandidaten = $derived.by(() => {
    const kern = gerechtenData.filter((gerecht) => filterKernStreek(gerecht));
    return metPersoonVoorkeur(kern, userKey);
  });

  let dagTip = $derived.by(() => {
    if (!tipKandidaten.length) return null;
    const seed = getDagSeed(new Date(), userKey);
    return tipKandidaten[seed % tipKandidaten.length];
  });

  let tipUitleg = $derived.by(() => {
    if (!dagTip) return "Geen proeftip beschikbaar.";
    if (userKey === "franzi") return "Afgestemd op Franzi met voorkeur voor vis/vegetarisch.";
    return "Lokale specialiteit uit jullie reisregio's.";
  });
</script>

<article class="card food-tip-card">
  <div class="food-tip-head">
    <div>
      <div class="food-tip-label">{E.ETEN} Proeftip van vandaag</div>
      <div class="food-tip-help">{tipUitleg}</div>
    </div>
    <a href="/meer/gerechten" class="food-tip-link">Open Gerechten</a>
  </div>

  {#if dagTip}
    <div class="food-tip-name">{dagTip.emoji || E.ETEN} {dagTip.naam}</div>
    <div class="food-tip-sub">{dagTip.frans}</div>
    <p class="food-tip-desc">{dagTip.omschrijving}</p>
    <div class="food-tip-chips">
      <span class="food-chip">{getStreekLabel(getHoofdStreek(dagTip))}</span>
      <span class="food-chip">{getSoortLabel(dagTip.soort)}</span>
      <span class="food-chip">{dagTip.vegetarisch ? "Vegetarisch" : dagTip.vis ? "Vis" : "Non-veg"}</span>
    </div>
  {/if}
</article>

<style>
  .food-tip-card {
    margin: 0;
    border: 1px solid var(--border-subtle);
    background:
      radial-gradient(100% 65% at 12% 0%, color-mix(in srgb, #0ea5a4 12%, var(--card-bg)) 0%, transparent 66%),
      var(--card-bg);
  }
  .food-tip-head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 10px;
    margin-bottom: 10px;
  }
  .food-tip-label {
    font-size: var(--font-size-xl);
    font-weight: var(--ui-weight-heavy);
    color: var(--heading);
    letter-spacing: -0.01em;
    line-height: var(--ui-line-tight);
  }
  .food-tip-help {
    margin-top: 2px;
    font-size: var(--font-size-sm);
    color: var(--nav-text);
    font-weight: var(--ui-weight-medium);
  }
  .food-tip-link {
    text-decoration: none;
    border: 1px solid var(--input-border);
    border-radius: 10px;
    padding: 6px 10px;
    color: var(--blauw);
    font-size: var(--font-size-sm);
    font-weight: var(--ui-weight-semibold);
    background: color-mix(in srgb, var(--card-bg) 84%, #e8f2fc);
    white-space: nowrap;
  }
  .food-tip-name {
    font-size: clamp(1.38rem, 4.2vw, 1.85rem);
    font-weight: var(--ui-weight-heavy);
    color: var(--heading);
    letter-spacing: -0.02em;
    line-height: var(--ui-line-tight);
  }
  .food-tip-sub {
    margin-top: 2px;
    font-style: italic;
    color: var(--nav-text);
    font-size: var(--font-size-md);
    font-weight: var(--ui-weight-medium);
  }
  .food-tip-desc {
    margin: 10px 0;
    color: var(--tekst);
    font-size: var(--font-size-sm);
    line-height: var(--ui-line-compact);
    font-weight: var(--ui-weight-medium);
  }
  .food-tip-chips {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
  .food-chip {
    border-radius: 999px;
    border: 1px solid var(--input-border);
    background: var(--hover-bg);
    color: var(--heading);
    font-size: var(--font-size-xs);
    font-weight: var(--ui-weight-semibold);
    padding: 4px 10px;
  }

  @media (max-width: 760px) {
    .food-tip-head {
      flex-direction: column;
      align-items: stretch;
      gap: 8px;
    }
    .food-tip-link {
      text-align: center;
    }
  }

  :global(html.dark) .food-tip-card {
    background:
      radial-gradient(100% 70% at 10% 0%, rgba(14, 165, 164, 0.18) 0%, transparent 66%),
      #111827;
    border-color: #334155;
  }
  :global(html.dark) .food-tip-link {
    background: #1e3a8a;
    border-color: #2563eb;
    color: #dbeafe;
  }
  :global(html.dark) .food-tip-label,
  :global(html.dark) .food-tip-name,
  :global(html.dark) .food-chip {
    color: #e2e8f0;
  }
  :global(html.dark) .food-tip-help,
  :global(html.dark) .food-tip-sub,
  :global(html.dark) .food-tip-desc {
    color: #cbd5e1;
  }
  :global(html.dark) .food-chip {
    background: #0f172a;
    border-color: #334155;
  }
</style>
