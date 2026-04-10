<script>
  import WeerWidget from "$lib/components/WeerWidget.svelte";
  import SpotVanDeDag from "$lib/components/SpotVanDeDag.svelte";
  import GerechtTipWidget from "$lib/components/GerechtTipWidget.svelte";
  import { E } from "$lib/emojis.js";
</script>

<div class="page-transition page-shell home-page">
  <div class="quick-actions quick-actions-top">
    <a href="/budget?nieuw=1" class="quick-btn">
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
        <span>POI suggesties</span>
        <small>Stops en highlights</small>
      </div>
      <div class="icon">{E.PIN}</div>
    </a>
  </div>

  <WeerWidget />

  <div class="home-dashboard">
    <div class="dashboard-main">
      <SpotVanDeDag />
    </div>

    <aside class="dashboard-side">
      <GerechtTipWidget />
    </aside>
  </div>
</div>

<style>
  .home-page {
    display: grid;
    gap: var(--ui-space-4);
  }

  .quick-actions-top {
    margin: 0;
    padding: 0;
  }

  .home-dashboard {
    display: grid;
    gap: var(--ui-space-4);
  }

  .dashboard-main,
  .dashboard-side {
    display: grid;
    gap: var(--ui-space-4);
    align-content: start;
  }

  .quick-actions {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--ui-space-4);
    padding: 0;
  }
  .quick-btn {
    background: var(--card-bg);
    border-radius: var(--radius-md);
    padding: var(--ui-space-4);
    text-decoration: none;
    color: var(--tekst);
    box-shadow: 0 2px var(--space-2) var(--card-shadow);
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: var(--ui-space-2);
    border: 1px solid var(--border-subtle);
    min-height: 110px;
    transition: transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease;
  }
  .quick-btn:active { transform: scale(0.98); }
  .quick-btn:hover {
    box-shadow: 0 var(--space-1-5) 18px var(--card-shadow);
    border-color: color-mix(in srgb, var(--blauw) 35%, var(--border-subtle));
  }
  .quick-content {
    display: flex;
    flex-direction: column;
    gap: var(--ui-space-1);
    min-width: 0;
  }
  .quick-btn .icon {
    font-size: clamp(1.8rem, 4vw, var(--text-2xl));
    line-height: 1;
    flex-shrink: 0;
    filter: saturate(1.04);
  }
  .quick-btn span {
    font-size: clamp(var(--text-base), 2.8vw, var(--text-lg));
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
      padding: var(--ui-space-3);
    }
    .quick-btn span {
      font-size: var(--font-size-md);
    }
    .quick-btn small {
      font-size: var(--font-size-xs);
    }
  }

  @media (min-width: 1100px) {
    .quick-actions-top {
      grid-template-columns: repeat(4, minmax(0, 1fr));
    }
    .home-dashboard {
      grid-template-columns: minmax(0, 1.15fr) minmax(0, 1fr);
      gap: var(--ui-space-4);
    }
    .quick-btn {
      min-height: 116px;
      padding: var(--ui-space-4);
    }
    .quick-btn span {
      font-size: var(--font-size-lg);
    }
    .quick-btn small {
      font-size: var(--font-size-sm);
    }
  }

  :global(html.dark) .quick-btn span { color: var(--text-primary); }
  :global(html.dark) .quick-btn small { color: var(--text-tertiary); }
</style>

