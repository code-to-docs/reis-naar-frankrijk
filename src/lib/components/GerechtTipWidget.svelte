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

<a href="/meer/gerechten" class="card food-tip-card ui-widget-card">
  <div class="ui-widget-head">
    <div>
      <div class="ui-widget-title">{E.ETEN} Proeftip van vandaag</div>
      <div class="ui-widget-kicker">{tipUitleg}</div>
    </div>
  </div>

  {#if dagTip}
    <div class="ui-widget-name">{dagTip.emoji || E.ETEN} {dagTip.naam}</div>
    <div class="ui-widget-subtitle">{dagTip.frans}</div>
    <p class="ui-widget-copy food-tip-desc">{dagTip.omschrijving}</p>
    <div class="ui-widget-chips">
      <span class="food-chip ui-chip ui-chip--muted">{getStreekLabel(getHoofdStreek(dagTip))}</span>
      <span class="food-chip ui-chip ui-chip--muted">{getSoortLabel(dagTip.soort)}</span>
      <span class="food-chip ui-chip ui-chip--muted">{dagTip.vegetarisch ? "Vegetarisch" : dagTip.vis ? "Vis" : "Non-veg"}</span>
    </div>
  {/if}
</a>

<style>
  .food-tip-card {
    margin: 0;
    border: 1px solid var(--border-subtle);
    background:
      radial-gradient(100% 65% at 12% 0%, color-mix(in srgb, #0ea5a4 12%, var(--card-bg)) 0%, transparent 66%),
      var(--card-bg);
  }
  .food-tip-desc {
    margin: 0;
  }
  .food-chip {
    min-height: 28px;
  }

  :global(html.dark) .food-tip-card {
    background:
      radial-gradient(100% 70% at 10% 0%, rgba(14, 165, 164, 0.18) 0%, transparent 66%),
      #111827;
    border-color: #334155;
  }
  :global(html.dark) .food-tip-desc {
    color: #cbd5e1;
  }
</style>
