<script>
  import { onMount } from "svelte";
  import { Chart, DoughnutController, ArcElement, Tooltip } from "chart.js";
  Chart.register(DoughnutController, ArcElement, Tooltip);

  let { uitgaven = [], budget = 2500 } = $props();

  const EURO = "\u20AC";

  const categorieen = {
    dining:       { label: "Uit eten",     kleur: "#FF6B6B" },
    boodschappen: { label: "Boodschappen", kleur: "#4ECDC4" },
    overnachting: { label: "Overnachting", kleur: "#45B7D1" },
    benzine:      { label: "Benzine",      kleur: "#F9CA24" },
    tol:          { label: "Tol",          kleur: "#A29BFE" },
    uitjes:       { label: "Uitjes",       kleur: "#FD79A8" },
    overig:       { label: "Overig",       kleur: "#636E72" }
  };

  let canvasEl = $state(null);
  let chartInstance = null;
  let legendaItems = $state([]);

  function getTotaalPerCategorie() {
    const result = {};
    for (const key of Object.keys(categorieen)) result[key] = 0;
    for (const u of uitgaven) {
      const cat = u.categorie || "overig";
      if (result[cat] !== undefined) result[cat] += Number(u.bedrag) || 0;
      else result["overig"] += Number(u.bedrag) || 0;
    }
    return result;
  }

  function getTotaal(perCat) {
    return Object.values(perCat).reduce((a, b) => a + b, 0);
  }

  function updateLegenda() {
    const perCat = getTotaalPerCategorie();
    legendaItems = Object.entries(categorieen)
      .filter(([key]) => perCat[key] > 0)
      .map(([key, cat]) => ({
        label: cat.label,
        kleur: cat.kleur,
        bedrag: EURO + perCat[key].toFixed(0)
      }));
  }

  const centerTextPlugin = {
    id: "centerText",
    afterDraw(chart) {
      const { ctx, chartArea } = chart;
      if (!chartArea) return;
      const centerX = (chartArea.left + chartArea.right) / 2;
      const centerY = (chartArea.top + chartArea.bottom) / 2;
      const pct = chart.config.options.plugins.centerText.percentage;

      ctx.save();
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      ctx.font = "bold 22px system-ui, -apple-system, sans-serif";
      ctx.fillStyle = "#1e293b";
      ctx.fillText(pct + "%", centerX, centerY);

      ctx.restore();
    }
  };

  function buildChart() {
    if (!canvasEl) return;
    if (chartInstance) chartInstance.destroy();

    const perCat = getTotaalPerCategorie();
    const totaal = getTotaal(perCat);
    const pct = totaal === 0 ? 0 : Math.round((totaal / budget) * 100);
    const actief = Object.entries(perCat).filter(([_, v]) => v > 0);

    let labels, data, colors;
    if (actief.length === 0) {
      labels = ["Nog niets"];
      data = [1];
      colors = ["#e2e8f0"];
    } else {
      labels = actief.map(([k]) => categorieen[k].label);
      data = actief.map(([_, v]) => v);
      colors = actief.map(([k]) => categorieen[k].kleur);
    }

    chartInstance = new Chart(canvasEl, {
      type: "doughnut",
      data: {
        labels,
        datasets: [{
          data,
          backgroundColor: colors,
          borderWidth: 2,
          borderColor: "#ffffff",
          borderRadius: 4,
          spacing: 2
        }]
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
              label: function(ctx) { return " " + EURO + ctx.parsed.toFixed(2); }
            }
          },
          centerText: { percentage: pct }
        }
      },
      plugins: [centerTextPlugin]
    });
    updateLegenda();
  }

  onMount(() => {
    buildChart();
    return () => { if (chartInstance) chartInstance.destroy(); };
  });

  $effect(() => {
    const _t1 = uitgaven.length;
    const _t2 = budget;
    if (canvasEl) buildChart();
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
  .legenda-label { color: #64748b; }
  .legenda-bedrag { color: #1e293b; font-weight: 600; }
</style>