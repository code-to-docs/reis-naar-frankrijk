<script lang="ts">
  import { onMount } from "svelte";
  import {
    Chart,
    DoughnutController,
    ArcElement,
    Tooltip,
    type Chart as ChartJs,
    type ChartConfiguration,
    type Plugin
  } from "chart.js";
  import { budgetCatMap } from "$lib/budgetCategories.js";
  import { E } from "$lib/emojis.js";

  Chart.register(DoughnutController, ArcElement, Tooltip);

  type UitgaveLike = { categorie?: string; bedrag?: number | string };
  type PerCat = Record<string, number>;
  type LegendaItem = { label: string; kleur: string; bedrag: string };

  let { uitgaven = [], budget = 2500 } = $props<{ uitgaven?: UitgaveLike[]; budget?: number }>();

  const EURO = E.EURO;
  let canvasEl = $state<HTMLCanvasElement | null>(null);
  let chartInstance: ChartJs<"doughnut", number[], string> | null = null;
  let legendaItems = $state<LegendaItem[]>([]);
  let centerPercentage = 0;

  function getTotaalPerCategorie(): PerCat {
    const result: PerCat = {};
    for (const key of Object.keys(budgetCatMap)) result[key] = 0;
    if (result.overig === undefined) result.overig = 0;

    for (const u of uitgaven) {
      const cat = typeof u.categorie === "string" && result[u.categorie] !== undefined ? u.categorie : "overig";
      result[cat] += Number(u.bedrag) || 0;
    }
    return result;
  }

  function getTotaal(perCat: PerCat) {
    return Object.values(perCat).reduce((a, b) => a + b, 0);
  }

  function getVisualData(perCat: PerCat) {
    const actief = Object.entries(perCat).filter(([_, v]) => v > 0);
    if (actief.length === 0) {
      return {
        labels: ["Nog niets"],
        data: [1],
        colors: ["#e2e8f0"]
      };
    }
    return {
      labels: actief.map(([k]) => budgetCatMap[k]?.label || k),
      data: actief.map(([_, v]) => v),
      colors: actief.map(([k]) => budgetCatMap[k]?.kleur || "#64748b")
    };
  }

  function updateLegenda(perCat: PerCat) {
    legendaItems = Object.entries(budgetCatMap)
      .filter(([key]) => perCat[key] > 0)
      .map(([key, cat]) => ({
        label: cat.label,
        kleur: cat.kleur,
        bedrag: EURO + perCat[key].toFixed(0)
      }));
  }

  const centerTextPlugin: Plugin<"doughnut"> = {
    id: "centerText",
    afterDraw(chart) {
      const { ctx, chartArea } = chart;
      if (!chartArea) return;

      const centerX = (chartArea.left + chartArea.right) / 2;
      const centerY = (chartArea.top + chartArea.bottom) / 2;

      ctx.save();
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.font = "bold 22px system-ui, -apple-system, sans-serif";
      const isDark = typeof document !== "undefined" && document.documentElement.classList.contains("dark");
      ctx.fillStyle = isDark ? "#e2e8f0" : "#1e293b";
      ctx.fillText(`${centerPercentage}%`, centerX, centerY);
      ctx.restore();
    }
  };

  function buildChart() {
    if (!canvasEl) return;
    chartInstance?.destroy();

    const perCat = getTotaalPerCategorie();
    const totaal = getTotaal(perCat);
    centerPercentage = totaal === 0 || budget <= 0 ? 0 : Math.round((totaal / budget) * 100);
    const { labels, data, colors } = getVisualData(perCat);

    const config: ChartConfiguration<"doughnut", number[], string> = {
      type: "doughnut",
      data: {
        labels,
        datasets: [
          {
            data,
            backgroundColor: colors,
            borderWidth: 2,
            borderColor: "#ffffff",
            borderRadius: 4,
            spacing: 2
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        cutout: "70%",
        animation: { duration: 600, easing: "easeOutQuart" },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: "#1e293b",
            padding: 10,
            cornerRadius: 8,
            callbacks: {
              label: (ctx) => " " + EURO + ctx.parsed.toFixed(2)
            }
          }
        }
      },
      plugins: [centerTextPlugin]
    };

    chartInstance = new Chart(canvasEl, config);
    updateLegenda(perCat);
  }

  function updateChart() {
    if (!chartInstance) return buildChart();

    const perCat = getTotaalPerCategorie();
    const totaal = getTotaal(perCat);
    centerPercentage = totaal === 0 || budget <= 0 ? 0 : Math.round((totaal / budget) * 100);
    const { labels, data, colors } = getVisualData(perCat);

    chartInstance.data.labels = labels;
    const dataset = chartInstance.data.datasets[0];
    if (dataset) {
      dataset.data = data;
      dataset.backgroundColor = colors;
    }
    chartInstance.update();
    updateLegenda(perCat);
  }

  onMount(() => {
    buildChart();
    return () => {
      chartInstance?.destroy();
      chartInstance = null;
    };
  });

  $effect(() => {
    const _count = uitgaven.length;
    const _budget = budget;
    if (chartInstance) updateChart();
    else if (canvasEl) buildChart();
  });
</script>

<div class="chart-mini">
  <canvas bind:this={canvasEl}></canvas>
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
  .chart-mini {
    width: 120px;
    height: 120px;
    flex-shrink: 0;
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
  .legenda-label { color: #64748b; transition: color 0.2s; }
  .legenda-bedrag { color: #1e293b; font-weight: 600; transition: color 0.2s; }

  :global(html.dark) .legenda-label { color: #94a3b8; }
  :global(html.dark) .legenda-bedrag { color: #e2e8f0; }
</style>
