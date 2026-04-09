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

      <div class="quick-actions">
        <a href="/budget" class="quick-btn">
          <div class="quick-content">
            <span>Nieuwe uitgave</span>
            <small>Kosten meteen registreren</small>
          </div>
          <div class="icon">{E.GELD}</div>
        </a>
        <a href="/meer/wildlife" class="quick-btn">
          <div class="quick-content">
            <span>Wildlife zoeken</span>
            <small>Check dieren in de regio</small>
          </div>
          <div class="icon">{E.POOT}</div>
        </a>
        <a href="/campings" class="quick-btn">
          <div class="quick-content">
            <span>Bekijk overnachtingen</span>
            <small>Snel naar je verblijfopties</small>
          </div>
          <div class="icon">{E.CAMPING}</div>
        </a>
        <a href="/poi" class="quick-btn">
          <div class="quick-content">
            <span>Onze POIs</span>
            <small>Routes en highlights bekijken</small>
          </div>
          <div class="icon">{E.PIN}</div>
        </a>
      </div>
    </aside>
  </div>
</div>

<style>
  .home-dashboard {
    display: grid;
    gap: 12px;
  }

  .dashboard-main,
  .dashboard-side {
    display: grid;
    gap: 12px;
    align-content: start;
  }

  .countdown-card {
    background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
    color: white;
    position: relative;
    overflow: hidden;
    padding: 18px 16px;
    border-radius: 18px;
  }
  .countdown-progress {
    position: absolute; top: 0; left: 0; right: 0; height: 4px;
    background: rgba(255,255,255,0.2);
  }
  .countdown-fill {
    height: 100%; background: #ff4757; transition: width 1s ease-in-out;
  }
  .countdown-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }
  .aftelling-tekst {
    font-size: clamp(2rem, 7vw, 3rem);
    font-weight: 800;
    margin-bottom: 2px;
    color: white;
    line-height: 1.05;
    letter-spacing: -0.03em;
  }
  .aftelling-route {
    font-size: 1.01rem;
    opacity: 0.92;
    color: white;
    font-weight: 500;
  }
  .aftelling-meta {
    margin-top: 8px;
    font-size: 0.86rem;
    color: rgba(255, 255, 255, 0.92);
    font-weight: 600;
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
    border-radius: 16px;
    margin: 0;
  }
  .overzicht-kop {
    font-size: 1.2rem;
    font-weight: 800;
    color: #0f172a;
    margin-bottom: 10px;
    letter-spacing: -0.01em;
  }
  .overzicht-rij {
    display: flex;
    justify-content: space-between;
    gap: 10px;
    align-items: baseline;
    border-bottom: 1px dashed #e2e8f0;
    padding: 7px 0;
  }
  .overzicht-rij:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }
  .overzicht-rij span {
    font-size: 0.88rem;
    color: #64748b;
    flex-shrink: 0;
  }
  .overzicht-rij strong {
    font-size: 0.92rem;
    color: #0f172a;
    text-align: right;
  }

  .quick-actions {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    padding: 0 0 4px 0;
  }
  .quick-btn {
    background: var(--card-bg);
    border-radius: 16px;
    padding: 16px 14px;
    text-decoration: none;
    color: var(--tekst);
    box-shadow: 0 2px 8px var(--card-shadow);
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    border: 1px solid var(--border-subtle);
    min-height: 98px;
  }
  .quick-btn:active { transform: scale(0.96); }
  .quick-content {
    display: flex;
    flex-direction: column;
    gap: 5px;
    min-width: 0;
  }
  .quick-btn .icon {
    font-size: 2.15rem;
    line-height: 1;
    flex-shrink: 0;
    filter: saturate(1.04);
  }
  .quick-btn span {
    font-size: clamp(1.05rem, 3.8vw, 1.35rem);
    font-weight: 800;
    color: #111827;
    letter-spacing: -0.01em;
    line-height: 1.05;
    text-align: left;
    max-width: 120px;
  }
  .quick-btn small {
    font-size: 0.8rem;
    color: #64748b;
    line-height: 1.2;
    font-weight: 500;
  }

  @media (min-width: 1100px) {
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
    .quick-actions { grid-template-columns: 1fr 1fr; }
    .quick-btn {
      min-height: 114px;
      padding: 18px 16px;
    }
    .quick-btn span {
      max-width: none;
      font-size: 1.35rem;
    }
    .quick-btn small {
      font-size: 0.86rem;
    }
    .overzicht-kop {
      font-size: 1.32rem;
    }
  }

  :global(html.dark) .quick-btn span { color: #e2e8f0; }
  :global(html.dark) .quick-btn small { color: #94a3b8; }
  :global(html.dark) .overzicht-kop,
  :global(html.dark) .overzicht-rij strong { color: #e2e8f0; }
  :global(html.dark) .overzicht-rij span { color: #94a3b8; }
  :global(html.dark) .overzicht-rij { border-bottom-color: #334155; }
</style>
