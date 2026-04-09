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
    background: white; border-radius: 16px; padding: 16px;
    margin-bottom: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.08);
  }
  .wl-stats-top { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 10px; }
  .wl-stats-nummer { display: flex; align-items: baseline; gap: 4px; }
  .wl-stats-groot { font-size: 2rem; font-weight: 800; color: #1a5276; line-height: 1; }
  .wl-stats-van { font-size: 1rem; color: #94a3b8; font-weight: 500; }
  .wl-stats-rechts { text-align: right; }
  .wl-stats-perc { font-size: 1.1rem; font-weight: 700; color: #10b981; }
  .wl-stats-label { font-size: 0.75rem; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; }
  .wl-stats-bar { height: 8px; background: #e2e8f0; border-radius: 4px; overflow: hidden; }
  .wl-stats-fill { height: 100%; background: linear-gradient(90deg, #10b981, #34d399); border-radius: 4px; transition: width 0.4s ease; }
  
  :global(html.dark) .wl-stats-card { background: var(--card-bg); }
  :global(html.dark) .wl-stats-groot { color: #f1f5f9; }
</style>
