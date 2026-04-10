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
      <div class="gr-title">Gerechten checklist</div>
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
    border-radius: var(--radius-lg);
    padding: var(--ui-space-4);
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
    font-size: var(--font-size-xl);
    font-weight: var(--ui-weight-heavy);
    color: var(--bg-accent-hover);
    line-height: var(--ui-line-tight);
  }
  .gr-sub {
    margin-top: 2px;
    font-size: var(--font-size-sm);
    color: var(--text-secondary);
    line-height: var(--ui-line-compact);
  }
  .gr-mijn-perc {
    font-size: var(--font-size-xl);
    font-weight: var(--ui-weight-heavy);
    color: var(--color-success-base);
    line-height: var(--ui-line-tight);
  }
  .gr-bars {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .gr-bar-row {
    display: grid;
    grid-template-columns: 60px 1fr auto;
    align-items: center;
    gap: 8px;
  }
  .gr-name {
    font-size: var(--font-size-sm);
    color: var(--text-secondary);
    font-weight: var(--ui-weight-semibold);
  }
  .gr-val {
    font-size: var(--font-size-sm);
    color: var(--text-secondary);
    font-weight: var(--ui-weight-semibold);
  }
  .gr-bar {
    height: 8px;
    background: var(--bg-surface-sunken);
    border-radius: 99px;
    overflow: hidden;
  }
  .gr-fill {
    height: 100%;
    border-radius: 99px;
  }
  .gr-fill.dennis { background: linear-gradient(90deg, var(--border-accent), var(--color-primary-600)); }
  .gr-fill.franzi { background: linear-gradient(90deg, var(--color-primary-400), var(--color-primary-600)); }

  @media (min-width: 1100px) {
    .gr-stats-card {
      padding: var(--ui-space-5);
    }
    .gr-stats-top {
      margin-bottom: 12px;
    }
    .gr-title {
      font-size: clamp(1.55rem, 2.2vw, 1.85rem);
    }
    .gr-sub {
      font-size: var(--font-size-md);
    }
    .gr-mijn-perc {
      font-size: clamp(1.6rem, 2.2vw, 2rem);
    }
  }

  :global(html.dark) .gr-title { color: var(--text-primary); }
  :global(html.dark) .gr-sub,
  :global(html.dark) .gr-val { color: var(--text-tertiary); }
  :global(html.dark) .gr-name { color: var(--text-secondary); }
  :global(html.dark) .gr-bar { background: var(--bg-interactive-active); }
</style>



