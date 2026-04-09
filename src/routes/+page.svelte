<script>
  import WeerWidget from "$lib/components/WeerWidget.svelte";
  import SpotVanDeDag from "$lib/components/SpotVanDeDag.svelte";
  import { E } from "$lib/emojis.js";

  const vandaag = new Date();
  const vertrekDatum = new Date(vandaag.getFullYear(), 6, 14);
  if (vandaag > vertrekDatum) vertrekDatum.setFullYear(vandaag.getFullYear() + 1);
  const dagen = Math.ceil((vertrekDatum.getTime() - new Date().getTime()) / 86400000);

  const routeTekst = "Loz\u00E8re \u2192 Cantal \u2192 Pyr\u00E9n\u00E9es Ari\u00E9geoises";

  function getAftelTekst() {
    if (dagen > 1) return E.KALENDER + " Nog " + dagen + " dagen";
    if (dagen === 1) return E.KALENDER + " Nog 1 dag!";
    if (dagen === 0) return E.FEEST + " Vandaag vertrekken we!";
    return E.AUTO + " We zijn onderweg!";
  }
</script>

<div class="page-transition page-shell">
  <WeerWidget />
  <SpotVanDeDag />

  <div class="card countdown-card">
    <div class="countdown-progress">
      <div class="countdown-fill" style="width: {Math.max(0, 100 - (dagen * 2))}%;"></div>
    </div>
    <div class="aftelling-tekst">{getAftelTekst()}</div>
    <div class="aftelling-route">{routeTekst}</div>
  </div>

  <div class="quick-actions">
    <a href="/budget" class="quick-btn">
      <div class="icon">{E.GELD}</div>
      <span>Nieuwe uitgave</span>
    </a>
    <a href="/meer/wildlife" class="quick-btn">
      <div class="icon">{E.POOT}</div>
      <span>Wildlife zoeken</span>
    </a>
    <a href="/campings" class="quick-btn">
      <div class="icon">{E.CAMPING}</div>
      <span>Bekijk campings</span>
    </a>
    <a href="/poi" class="quick-btn">
      <div class="icon">{E.PIN}</div>
      <span>Onze POIs</span>
    </a>
  </div>
</div>

<style>
  .countdown-card {
    text-align: center;
    background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
    color: white;
    position: relative;
    overflow: hidden;
    padding: 24px 16px;
  }
  .countdown-progress {
    position: absolute; top: 0; left: 0; right: 0; height: 4px;
    background: rgba(255,255,255,0.2);
  }
  .countdown-fill {
    height: 100%; background: #ff4757; transition: width 1s ease-in-out;
  }
  .aftelling-tekst { font-size: 24px; font-weight: 700; margin-bottom: 8px; color: white; }
  .aftelling-route { font-size: 14px; opacity: 0.9; color: white; }

  .quick-actions {
    display: grid; grid-template-columns: 1fr 1fr; gap: 12px;
    padding: 0 0 4px 0;
  }
  .quick-btn {
    background: var(--card-bg);
    border-radius: 12px;
    padding: 16px;
    text-align: center;
    text-decoration: none;
    color: var(--tekst);
    box-shadow: 0 2px 8px var(--card-shadow);
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    gap: 8px;
    border: 1px solid var(--border-subtle);
  }
  .quick-btn:active { transform: scale(0.96); }
  .quick-btn .icon {
    font-size: 28px; background: var(--hover-bg); width: 56px; height: 56px;
    display: flex; align-items: center; justify-content: center;
    border-radius: 50%; margin-bottom: 4px;
  }
  .quick-btn span { font-size: 13px; font-weight: 600; color: var(--nav-text); }
</style>
