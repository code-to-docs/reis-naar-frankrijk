<script lang="ts">
  let { 
    aantalGespot = 0, 
    totaal = 0, 
    gespotPerc = 0 
  } = $props<{ aantalGespot: number; totaal: number; gespotPerc: number; }>();
</script>

<div class="wl-stats-card">
  <div class="wl-stats-top">
    <div class="wl-stats-nummer">
      <span class="wl-stats-groot">{aantalGespot}</span>
      <span class="wl-stats-van">/ {totaal}</span>
    </div>
    <div class="wl-stats-rechts">
      <div class="wl-stats-perc">{gespotPerc}%</div>
      <div class="wl-stats-label">gespot</div>
    </div>
  </div>
  <div class="wl-stats-bar">
    <div class="wl-stats-fill" style="width:{gespotPerc}%"></div>
  </div>
</div>

<style>
  .wl-stats-card {
    background: var(--card-bg);
    border-radius: var(--radius-lg);
    padding: var(--space-4);
    margin-bottom: var(--space-3);
    box-shadow: 0 2px var(--space-2-5) rgba(0,0,0,0.08);
  }
  .wl-stats-top { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: var(--space-2-5); }
  .wl-stats-nummer { display: flex; align-items: baseline; gap: var(--space-1); }
  .wl-stats-groot {
    font-size: clamp(2.1rem, 5vw, 2.75rem);
    font-weight: var(--ui-weight-heavy);
    color: var(--text-accent);
    line-height: var(--ui-line-tight);
  }
  .wl-stats-van {
    font-size: var(--font-size-lg);
    color: var(--text-tertiary);
    font-weight: var(--ui-weight-medium);
  }
  .wl-stats-rechts { text-align: right; }
  .wl-stats-perc {
    font-size: var(--font-size-lg);
    font-weight: var(--ui-weight-bold);
    color: var(--color-success-base);
    line-height: var(--ui-line-tight);
  }
  .wl-stats-label {
    font-size: var(--font-size-xs);
    color: var(--text-tertiary);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  .wl-stats-bar { height: var(--space-2); background: var(--bg-surface-sunken); border-radius: var(--radius-sm); overflow: hidden; }
  .wl-stats-fill { height: 100%; background: linear-gradient(90deg, var(--color-success-base), var(--color-success-light)); border-radius: var(--radius-sm); transition: width 0.4s ease; }

  @media (min-width: 1100px) {
    .wl-stats-card {
      padding: var(--ui-space-5);
      margin-bottom: 14px;
    }
    .wl-stats-top {
      margin-bottom: var(--space-3);
    }
    .wl-stats-groot {
      font-size: clamp(2.45rem, 4.3vw, 3.2rem);
    }
    .wl-stats-perc {
      font-size: var(--font-size-xl);
    }
  }
  
  :global(html.dark) .wl-stats-card { background: var(--card-bg); }
  :global(html.dark) .wl-stats-groot { color: var(--text-primary); }
</style>
