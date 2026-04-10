<script lang="ts">
  import { budgetCatMap } from "$lib/budgetCategories.js";
  import { E } from "$lib/emojis.js";

  type UitgaveLike = { categorie?: string; bedrag?: number | string };
  type PerCat = Record<string, number>;
  type LegendaItem = { label: string; kleur: string; bedrag: string };

  let { uitgaven = [], budget = 2500 } = $props<{ uitgaven?: UitgaveLike[]; budget?: number }>();

  const EURO = E.EURO;

  function calcPerCategorie(items: UitgaveLike[]): { perCat: PerCat; totaal: number } {
    const perCat: PerCat = {};
    for (const key of Object.keys(budgetCatMap)) perCat[key] = 0;
    if (perCat.overig === undefined) perCat.overig = 0;

    for (const u of items) {
      const cat = typeof u.categorie === "string" && perCat[u.categorie] !== undefined ? u.categorie : "overig";
      perCat[cat] += Number(u.bedrag) || 0;
    }

    const totaal = Object.values(perCat).reduce((sum, val) => sum + val, 0);
    return { perCat, totaal };
  }

  let chartData = $derived.by(() => {
    const { perCat, totaal } = calcPerCategorie(uitgaven);
    const actief = Object.entries(perCat).filter(([_, v]) => v > 0);
    return { perCat, totaal, actief };
  });

  let centerPercentage = $derived.by(() => {
    return chartData.totaal === 0 || budget <= 0 ? 0 : Math.round((chartData.totaal / budget) * 100);
  });

  let legendaItems = $derived.by(() => {
    return Object.entries(budgetCatMap)
      .filter(([key]) => chartData.perCat[key] > 0)
      .sort((a, b) => chartData.perCat[b[0]] - chartData.perCat[a[0]])
      .map(([key, cat]) => ({
        label: cat.label,
        kleur: cat.kleur,
        bedrag: EURO + chartData.perCat[key].toFixed(0)
      }));
  });

  let segments = $derived.by(() => {
    const r = 38; // Radius of SVG circle
    const c = 2 * Math.PI * r; // Circumference
    const { totaal, actief } = chartData;

    // Empty state placeholder
    if (actief.length === 0) {
      return [{
        kleur: "var(--bg-surface-sunken)",
        dashArray: `${c} ${c}`,
        transform: "rotate(-90 50 50)"
      }];
    }

    // Dynamic segments
    let currentAngle = -90;
    return actief.map(([k, v]) => {
      const percentage = v / totaal;
      const spacing = actief.length > 1 ? 2 : 0; // Small visual gap between slices
      const dashLength = Math.max(0, (percentage * c) - spacing);
      
      const segmentData = {
        kleur: budgetCatMap[k]?.kleur || "var(--text-secondary)",
        dashArray: `${dashLength} ${c}`,
        transform: `rotate(${currentAngle} 50 50)`
      };

      currentAngle += percentage * 360;
      return segmentData;
    });
  });
</script>

<div class="chart-container">
  <svg viewBox="0 0 100 100" class="donut-svg">
    {#each segments as seg, idx (`${idx}-${seg.kleur}`)}
      <circle
        cx="50" cy="50" r="38"
        fill="transparent"
        stroke={seg.kleur}
        stroke-width="12"
        stroke-linecap="round"
        stroke-dasharray={seg.dashArray}
        transform={seg.transform}
        style="transition: stroke-dasharray 0.6s cubic-bezier(0.16, 1, 0.3, 1), transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);"
      />
    {/each}
  </svg>
  <div class="donut-center">
    <span>{centerPercentage}%</span>
  </div>
</div>

{#if legendaItems.length > 0}
  <div class="chart-legenda">
    {#each legendaItems as item}
      <div class="legenda-item">
        <span class="legenda-kleur" style="background:{item.kleur}"></span>
        <span class="legenda-label">{item.label}</span>
        <span class="legenda-bedrag">{item.bedrag}</span>
      </div>
    {/each}
  </div>
{/if}

<style>
  .chart-container {
    position: relative;
    width: 120px;
    height: 120px;
    flex-shrink: 0;
  }
  .donut-svg {
    width: 100%;
    height: 100%;
    transform: scale(1.05); /* Slight optical bump */
  }
  .donut-center {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 22px;
    font-weight: 800;
    color: var(--heading);
    pointer-events: none;
  }
  .chart-legenda {
    display: flex;
    flex-wrap: wrap;
    gap: 4px 12px;
    margin-top: 12px;
  }
  .legenda-item {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 0.72rem;
  }
  .legenda-kleur {
    width: 7px;
    height: 7px;
    border-radius: 2px;
    flex-shrink: 0;
  }
  .legenda-label { color: var(--nav-text); transition: color 0.2s; }
  .legenda-bedrag { color: var(--heading); font-weight: var(--weight-semibold); transition: color 0.2s; }

  :global(html.dark) .donut-center { color: var(--text-primary); }
  :global(html.dark) .legenda-label { color: var(--text-tertiary); }
  :global(html.dark) .legenda-bedrag { color: var(--text-primary); }
</style>


