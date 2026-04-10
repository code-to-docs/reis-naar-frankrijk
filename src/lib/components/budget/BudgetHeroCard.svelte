<script lang="ts">
  import BudgetChart from "$lib/components/BudgetChart.svelte";
  import { E } from "$lib/emojis.js";
  import { formatEuroGroot } from "$lib/utils/formatters.js";
  import { getBudgetProgressTone } from "$lib/utils/dashboard.js";

  interface Props {
    uitgaven: Array<{ categorie?: string; bedrag?: number | string }>;
    budget: number;
    totaal: number;
    resterend: number;
    percentage: number;
    onToggleBudgetEdit: () => void;
  }

  let { uitgaven, budget, totaal, resterend, percentage, onToggleBudgetEdit }: Props = $props();

  let spendTone = $derived.by(() => (resterend >= 0 ? "ok" : "over"));
  let progressTone = $derived.by(() => getBudgetProgressTone(percentage));
  let progressValue = $derived.by(() => Math.min(Math.max(percentage, 0), 100));
</script>

<div class="hero-card">
  <div class="hero-top">
    <BudgetChart {uitgaven} {budget} />
    <div class="hero-info">
      <div class="hero-label">Resterend</div>
      <div class="hero-bedrag" class:is-over={spendTone === "over"}>
        {resterend < 0 ? "-" : ""}{formatEuroGroot(Math.abs(resterend))}
      </div>
      <div class="hero-sub">
        <span>van {formatEuroGroot(budget)}</span>
        <button class="edit-budget-btn" onclick={onToggleBudgetEdit} aria-label="Pas totaalbudget aan">
          {E.PEN}
        </button>
      </div>
      <div class="hero-bar-wrap">
        <progress
          class="hero-progress"
          class:tone-ok={progressTone === "ok"}
          class:tone-warn={progressTone === "warn"}
          class:tone-over={progressTone === "over"}
          value={progressValue}
          max="100"
          aria-label="Budgetverbruik in procenten"
        ></progress>
      </div>
      <div class="hero-uitgegeven">{formatEuroGroot(totaal)} uitgegeven</div>
    </div>
  </div>
</div>

<style>
  .hero-card {
    background: var(--bg-surface);
    border-radius: var(--radius-xl);
    padding: var(--space-5);
    margin-bottom: var(--space-3);
    box-shadow: var(--shadow-md);
  }
  .hero-top {
    display: flex;
    align-items: center;
    gap: var(--space-5);
  }
  .hero-info {
    flex: 1;
  }
  .hero-label {
    font-size: var(--text-xs);
    color: var(--text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.03em;
    font-weight: var(--weight-semibold);
  }
  .hero-bedrag {
    font-size: var(--text-2xl);
    font-weight: var(--ui-weight-heavy);
    line-height: var(--leading-tight);
    margin: var(--space-1) 0;
    color: var(--text-success);
  }
  .hero-bedrag.is-over {
    color: var(--text-error);
  }
  .hero-sub {
    font-size: var(--text-sm);
    color: var(--text-secondary);
    display: flex;
    align-items: center;
    gap: var(--space-1-5);
  }
  .edit-budget-btn {
    background: color-mix(in srgb, var(--card-bg) 82%, var(--bg-accent-subtle));
    border: 1px solid color-mix(in srgb, var(--input-border) 80%, var(--border-default));
    font-size: var(--text-xs);
    cursor: pointer;
    min-height: var(--btn-height-compact);
    min-width: var(--btn-height-compact);
    padding: 0;
    opacity: 0.85;
    color: var(--text-accent);
  }
  .edit-budget-btn:active {
    opacity: 1;
  }
  .hero-bar-wrap {
    margin: var(--space-2) 0 var(--space-1-5);
  }
  .hero-progress {
    width: 100%;
    height: var(--space-1-5);
    display: block;
    border: none;
    border-radius: var(--radius-sm);
    overflow: hidden;
    background: var(--bg-surface-sunken);
    color: var(--color-success-dark);
    accent-color: currentColor;
  }
  .hero-progress.tone-ok {
    color: var(--color-success-dark);
  }
  .hero-progress.tone-warn {
    color: var(--color-warning-dark);
  }
  .hero-progress.tone-over {
    color: var(--color-error-dark);
  }
  .hero-progress::-webkit-progress-bar {
    background: var(--bg-surface-sunken);
    border-radius: var(--radius-sm);
  }
  .hero-progress::-webkit-progress-value {
    background: currentColor;
    border-radius: var(--radius-sm);
    transition: width var(--duration-slow) var(--ease-default);
  }
  .hero-progress::-moz-progress-bar {
    background: currentColor;
    border-radius: var(--radius-sm);
    transition: width var(--duration-slow) var(--ease-default);
  }
  .hero-uitgegeven {
    font-size: var(--text-xs);
    color: var(--text-secondary);
  }
</style>
