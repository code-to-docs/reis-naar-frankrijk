<script>
  import GedeeldeLijst from "$lib/components/GedeeldeLijst.svelte";
  import { E } from "$lib/emojis.js";
</script>

<div class="page-transition page-shell">
  <GedeeldeLijst titel="Campings" emoji={E.CAMPING}
    collectie="campings" metLink={true}
    placeholder="Naam camping..." />
</div>
