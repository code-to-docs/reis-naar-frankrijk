<script>
  import WeerWidget from "$lib/components/WeerWidget.svelte";
  import SpotVanDeDag from "$lib/components/SpotVanDeDag.svelte";
  import { E } from "$lib/emojis.js";
  import { config, getVertrekDatum } from "$lib/config.js";

  const vandaag = new Date();
  const vertrekDatum = getVertrekDatum(vandaag);
  const dagen = Math.ceil((vertrekDatum.getTime() - new Date().getTime()) / 86400000);
  const vertrekTekst = vertrekDatum.toLocaleDateString("nl-NL", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  });

  const routeTekst = config.routeTekst;

  function getReisFase() {
    if (dagen > 75) return "Voorbereiden";
    if (dagen > 30) return "Route en stops finetunen";
    if (dagen > 7) return "Bijna vertrek";
    return "Roadtripmodus";
  }

  function getAftelTekst() {
    if (dagen > 1) return E.KALENDER + " Nog " + dagen + " dagen";
    if (dagen === 1) return E.KALENDER + " Nog 1 dag!";
    if (dagen === 0) return E.FEEST + " Vandaag vertrekken we!";
    return E.AUTO + " We zijn onderweg!";
  }
</script>

<div class="page-transition page-shell home-page">
  <div class="quick-actions quick-actions-top">
    <a href="/budget" class="quick-btn">
      <div class="quick-content">
        <span>Nieuwe uitgave</span>
        <small>Kosten direct noteren</small>
      </div>
      <div class="icon">{E.GELD}</div>
    </a>
    <a href="/meer/wildlife" class="quick-btn">
      <div class="quick-content">
        <span>Wildlife zoeken</span>
        <small>Dieren in de regio</small>
      </div>
      <div class="icon">{E.POOT}</div>
    </a>
    <a href="/campings" class="quick-btn">
      <div class="quick-content">
        <span>Overnachtingen</span>
        <small>Planning en shortlist</small>
      </div>
      <div class="icon">{E.CAMPING}</div>
    </a>
    <a href="/poi" class="quick-btn">
      <div class="quick-content">
        <span>Onze POIs</span>
        <small>Routes en highlights</small>
      </div>
      <div class="icon">{E.PIN}</div>
    </a>
  </div>

  <WeerWidget />

  <div class="home-dashboard">
    <div class="dashboard-main">
      <SpotVanDeDag />

      <div class="card countdown-card">
        <div class="countdown-progress">
          <div class="countdown-fill" style="width: {Math.max(0, 100 - (dagen * 2))}%;"></div>
        </div>
        <div class="countdown-row">
          <div>
            <div class="aftelling-tekst">{getAftelTekst()}</div>
            <div class="aftelling-route">{routeTekst}</div>
            <div class="aftelling-meta">{E.AUTO} Fase: {getReisFase()}</div>
          </div>
          <div class="aftelling-icon">{E.KALENDER}</div>
        </div>
      </div>
    </div>

    <aside class="dashboard-side">
      <div class="card overzicht-card">
        <div class="overzicht-kop">{E.TARGET} Reisoverzicht</div>
        <div class="overzicht-rij">
          <span>Vertrekdatum</span>
          <strong>{vertrekTekst}</strong>
        </div>
        <div class="overzicht-rij">
          <span>Nog te gaan</span>
          <strong>{dagen} dagen</strong>
        </div>
        <div class="overzicht-rij">
          <span>Actieve route</span>
          <strong>{routeTekst}</strong>
        </div>
      </div>
    </aside>
  </div>
</div>

<style>
  .home-page {
    display: grid;
    gap: var(--ui-space-3);
  }

  .quick-actions-top {
    margin: 0;
    padding: 0;
  }

  .home-dashboard {
    display: grid;
    gap: var(--ui-space-3);
  }

  .dashboard-main,
  .dashboard-side {
    display: grid;
    gap: var(--ui-space-3);
    align-content: start;
  }

  .countdown-card {
    background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
    color: white;
    position: relative;
    overflow: hidden;
    padding: var(--ui-space-4);
    border-radius: var(--radius-lg);
  }
  .countdown-progress {
    position: absolute; top: 0; left: 0; right: 0; height: 4px;
    background: rgba(255,255,255,0.2);
  }
  .countdown-fill {
    height: 100%;
    background: var(--rood);
    transition: width 1s ease-in-out;
  }
  .countdown-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--ui-space-3);
  }
  .aftelling-tekst {
    font-size: clamp(2rem, 7vw, 3rem);
    font-weight: var(--ui-weight-heavy);
    margin-bottom: 2px;
    color: white;
    line-height: var(--ui-line-tight);
    letter-spacing: -0.03em;
  }
  .aftelling-route {
    font-size: var(--font-size-md);
    opacity: 0.92;
    color: white;
    font-weight: var(--ui-weight-medium);
  }
  .aftelling-meta {
    margin-top: var(--ui-space-2);
    font-size: var(--font-size-sm);
    color: rgba(255, 255, 255, 0.92);
    font-weight: var(--ui-weight-semibold);
  }
  .aftelling-icon {
    width: 52px;
    height: 52px;
    border-radius: 14px;
    background: rgba(255,255,255,0.18);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 1.8rem;
    flex-shrink: 0;
  }

  .overzicht-card {
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-md);
    margin: 0;
  }
  .overzicht-kop {
    font-size: var(--font-size-xl);
    font-weight: var(--ui-weight-heavy);
    color: var(--heading);
    margin-bottom: var(--ui-space-2);
    letter-spacing: -0.01em;
    line-height: var(--ui-line-tight);
  }
  .overzicht-rij {
    display: flex;
    justify-content: space-between;
    gap: 10px;
    align-items: baseline;
    border-bottom: 1px dashed var(--border-subtle);
    padding: 8px 0;
  }
  .overzicht-rij:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }
  .overzicht-rij span {
    font-size: var(--font-size-sm);
    color: var(--nav-text);
    flex-shrink: 0;
  }
  .overzicht-rij strong {
    font-size: var(--font-size-md);
    color: var(--tekst);
    text-align: right;
    line-height: var(--ui-line-compact);
  }

  .quick-actions {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--ui-space-3);
    padding: 0;
  }
  .quick-btn {
    background: var(--card-bg);
    border-radius: var(--radius-md);
    padding: 14px;
    text-decoration: none;
    color: var(--tekst);
    box-shadow: 0 2px 8px var(--card-shadow);
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: var(--ui-space-2);
    border: 1px solid var(--border-subtle);
    min-height: 106px;
    transition: transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease;
  }
  .quick-btn:active { transform: scale(0.98); }
  .quick-btn:hover {
    box-shadow: 0 6px 18px var(--card-shadow);
    border-color: color-mix(in srgb, var(--blauw) 35%, var(--border-subtle));
  }
  .quick-content {
    display: flex;
    flex-direction: column;
    gap: var(--ui-space-1);
    min-width: 0;
  }
  .quick-btn .icon {
    font-size: 1.95rem;
    line-height: 1;
    flex-shrink: 0;
    filter: saturate(1.04);
  }
  .quick-btn span {
    font-size: clamp(1rem, 2.8vw, 1.25rem);
    font-weight: var(--ui-weight-heavy);
    color: var(--heading);
    letter-spacing: -0.01em;
    line-height: var(--ui-line-tight);
    text-align: left;
    max-width: 100%;
  }
  .quick-btn small {
    font-size: var(--font-size-sm);
    color: var(--nav-text);
    line-height: var(--ui-line-compact);
    font-weight: var(--ui-weight-medium);
  }

  @media (max-width: 760px) {
    .quick-btn {
      min-height: 96px;
      padding: 12px;
    }
    .quick-btn span {
      font-size: 1rem;
    }
    .quick-btn small {
      font-size: var(--font-size-xs);
    }
    .countdown-card {
      padding: 14px;
    }
  }

  @media (min-width: 1100px) {
    .quick-actions-top {
      grid-template-columns: repeat(4, minmax(0, 1fr));
    }
    .home-dashboard {
      grid-template-columns: minmax(0, 1.15fr) minmax(0, 1fr);
      gap: 14px;
    }
    .countdown-card {
      padding: 22px 20px;
    }
    .aftelling-tekst {
      font-size: clamp(2.1rem, 3.4vw, 3.2rem);
    }
    .aftelling-route {
      font-size: 1.06rem;
    }
    .quick-btn {
      min-height: 108px;
      padding: 14px;
    }
    .quick-btn span {
      font-size: 1.15rem;
    }
    .quick-btn small {
      font-size: var(--font-size-sm);
    }
    .overzicht-kop {
      font-size: 1.24rem;
    }
  }

  :global(html.dark) .quick-btn span { color: #e2e8f0; }
  :global(html.dark) .quick-btn small { color: #94a3b8; }
  :global(html.dark) .overzicht-kop,
  :global(html.dark) .overzicht-rij strong { color: #e2e8f0; }
  :global(html.dark) .overzicht-rij span { color: #94a3b8; }
  :global(html.dark) .overzicht-rij { border-bottom-color: #334155; }
</style>
