<script>
  import GedeeldeLijst from "$lib/components/GedeeldeLijst.svelte";
  import { E } from "$lib/emojis.js";
</script>

<div class="page-transition page-shell">
  <GedeeldeLijst titel="Bezienswaardigheden" emoji={E.PIN}
    collectie="pois" metLink={true}
    placeholder="Naam plek..." />
</div>
