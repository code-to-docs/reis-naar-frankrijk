<script>
  import { gebruiker } from "$lib/stores.js";
  import WeerWidget from "$lib/components/WeerWidget.svelte";
  import SpotVanDeDag from "$lib/components/SpotVanDeDag.svelte";
  import { E } from "$lib/emojis.js";

  const vertrekDatum = new Date("2025-07-14");
  const dagen = Math.ceil((vertrekDatum.getTime() - new Date().getTime()) / 86400000);

  // Route tekst als JS variabele (unicode fix)
  const routeTekst = "Loz\u00E8re " + "\u2192" + " Cantal " + "\u2192" + " Pyr\u00E9n\u00E9es Ari\u00E9geoises";

  // Aftelling tekst
  function getAftelTekst() {
    if (dagen > 1) return E.KALENDER + " Nog " + dagen + " dagen";
    if (dagen === 1) return E.KALENDER + " Nog 1 dag!";
    if (dagen === 0) return E.FEEST + " Vandaag vertrekken we!";
    return E.AUTO + " We zijn onderweg!";
  }
</script>

<div class="header">
  <h1>{E.VLAG} Frankrijk</h1>
  <p>Hoi {$gebruiker}!</p>
</div>

<div class="page-transition">
  <WeerWidget />
  <SpotVanDeDag />

  <div class="card aftelling-card">
    <div class="aftelling-tekst">{getAftelTekst()}</div>
    <div class="aftelling-route">{routeTekst}</div>
  </div>
</div>

<style>
  /* Aftelling kaart */
  .aftelling-card {
    text-align: center;
    padding: 20px 16px;
  }
  .aftelling-tekst {
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--heading);
  }
  .aftelling-route {
    margin-top: 6px;
    font-size: 0.85rem;
    font-weight: 400;
    color: var(--nav-text);
    letter-spacing: 0.3px;
  }
</style>