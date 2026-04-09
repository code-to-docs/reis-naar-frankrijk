<script lang="ts">
  let {
    totaal = 0,
    dennisCount = 0,
    franziCount = 0,
    mijnCount = 0
  } = $props<{
    totaal: number;
    dennisCount: number;
    franziCount: number;
    mijnCount: number;
  }>();

  let dennisPerc = $derived(totaal > 0 ? Math.round((dennisCount / totaal) * 100) : 0);
  let franziPerc = $derived(totaal > 0 ? Math.round((franziCount / totaal) * 100) : 0);
  let mijnPerc = $derived(totaal > 0 ? Math.round((mijnCount / totaal) * 100) : 0);
</script>

<div class="gr-stats-card">
  <div class="gr-stats-top">
    <div>
      <div class="gr-title">🍽️ Gerechten Checklist</div>
      <div class="gr-sub">{mijnCount}/{totaal} door jou geproefd</div>
    </div>
    <div class="gr-mijn-perc">{mijnPerc}%</div>
  </div>

  <div class="gr-bars">
    <div class="gr-bar-row">
      <span class="gr-name">Dennis</span>
      <div class="gr-bar"><div class="gr-fill dennis" style="width:{dennisPerc}%"></div></div>
      <span class="gr-val">{dennisCount}/{totaal}</span>
    </div>
    <div class="gr-bar-row">
      <span class="gr-name">Franzi</span>
      <div class="gr-bar"><div class="gr-fill franzi" style="width:{franziPerc}%"></div></div>
      <span class="gr-val">{franziCount}/{totaal}</span>
    </div>
  </div>
</div>

<style>
  .gr-stats-card {
    background: var(--card-bg);
    border-radius: 16px;
    padding: 14px;
    box-shadow: 0 2px 10px var(--card-shadow);
    border: 1px solid var(--border-subtle);
  }
  .gr-stats-top {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 10px;
  }
  .gr-title {
    font-size: 1.06rem;
    font-weight: 800;
    color: #1a5276;
  }
  .gr-sub {
    margin-top: 2px;
    font-size: 0.82rem;
    color: #64748b;
  }
  .gr-mijn-perc {
    font-size: 1.2rem;
    font-weight: 800;
    color: #10b981;
    line-height: 1;
  }
  .gr-bars {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .gr-bar-row {
    display: grid;
    grid-template-columns: 52px 1fr auto;
    align-items: center;
    gap: 8px;
  }
  .gr-name {
    font-size: 0.78rem;
    color: #475569;
    font-weight: 700;
  }
  .gr-val {
    font-size: 0.75rem;
    color: #64748b;
    font-weight: 700;
  }
  .gr-bar {
    height: 8px;
    background: #e2e8f0;
    border-radius: 99px;
    overflow: hidden;
  }
  .gr-fill {
    height: 100%;
    border-radius: 99px;
  }
  .gr-fill.dennis { background: linear-gradient(90deg, #60a5fa, #2563eb); }
  .gr-fill.franzi { background: linear-gradient(90deg, #f472b6, #db2777); }

  :global(html.dark) .gr-title { color: #e2e8f0; }
  :global(html.dark) .gr-sub,
  :global(html.dark) .gr-val { color: #94a3b8; }
  :global(html.dark) .gr-name { color: #cbd5e1; }
  :global(html.dark) .gr-bar { background: #334155; }
</style>
