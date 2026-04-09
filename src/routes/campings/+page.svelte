<script>
  import GedeeldeLijst from "$lib/components/GedeeldeLijst.svelte";
  import { E } from "$lib/emojis.js";
</script>

<div class="page-transition page-shell">
  <GedeeldeLijst titel="Overnachtingen" emoji={E.CAMPING}
    collectie="campings" metLink={true}
    placeholder="Naam camping, Airbnb of hotel..."
    toonDesktopTitel={false} />
</div>
