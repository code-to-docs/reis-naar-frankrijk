<script lang="ts">
  import { createGerechtenContext } from "./context.svelte";
  import GerechtenHeader from "./components/GerechtenHeader.svelte";
  import GerechtenList from "./components/GerechtenList.svelte";
  import GerechtenTipCard from "./components/GerechtenTipCard.svelte";
  import GerechtenStats from "./components/GerechtenStats.svelte";
  import { gerechtenData } from "$lib/gerechtenData.js";
  import { onMount } from "svelte";

  // Initialize modular context
  const ctx = createGerechtenContext();
  const { filters, checks, gps } = ctx;

  // Derive stats for GerechtenStats component
  let totaal = $derived(gerechtenData.length);
  let dennisCount = $derived(gerechtenData.filter((g) => !!checks.checksByDish[g.id]?.dennis).length);
  let franziCount = $derived(gerechtenData.filter((g) => !!checks.checksByDish[g.id]?.franzi).length);
  let mijnCount = $derived(gerechtenData.filter((g) => !!checks.checksByDish[g.id]?.[ctx.userKey]).length);

  onMount(() => {
    // Force initial GPS load if not yet attempted
    if (!gps.gpsGeprobeerd) {
      void gps.refreshGpsTip();
    }
  });
</script>

<section class="gr-page">
  <GerechtenStats {totaal} {dennisCount} {franziCount} {mijnCount} />

  <GerechtenTipCard />

  <GerechtenHeader />

  <GerechtenList />
</section>

<style>
  .gr-page {
    display: flex;
    flex-direction: column;
    gap: var(--ui-space-3);
  }

  @media (min-width: 1100px) {
    .gr-page {
      gap: var(--ui-space-4);
    }
  }
</style>
