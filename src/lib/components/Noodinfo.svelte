<script>
  import { E } from "$lib/emojis.js";
</script>

<div class="noodinfo-page">
  <h2>{E.WARN} Noodinfo</h2>

  <div class="noodinfo-card alarm-card">
    <h3>{E.DEUR} Alarmnummers</h3>
    <p><a href="tel:112"><strong>112</strong></a> - Algemeen noodgeval</p>
    <p><a href="tel:15"><strong>15</strong></a> - SAMU (ambulance)</p>
    <p><a href="tel:18"><strong>18</strong></a> - Pompiers (brandweer)</p>
    <p><a href="tel:17"><strong>17</strong></a> - Gendarmerie (politie)</p>
  </div>

  <div class="noodinfo-card">
    <h3>{E.PIN} Ziekenhuizen</h3>
    <p><strong>Lozère:</strong> CH Mende</p>
    <p><strong>Cantal:</strong> CH Aurillac / CH Saint-Flour</p>
    <p><strong>Ariège:</strong> CH Foix / CH Saint-Girons</p>
  </div>

  <div class="noodinfo-card">
    <h3>{E.CHECK} Nachtapotheek</h3>
    <p>Bel <a href="tel:3237"><strong>3237</strong></a></p>
  </div>

  <div class="noodinfo-card">
    <h3>{E.TIP} Tips</h3>
    <ul class="tips-list">
      <li>{E.WEER} Factor 50 op hoogte!</li>
      <li>{E.WIND} Weer slaat snel om boven 1500m</li>
      <li>{E.DRUPPEL} Min. 2L water pp meenemen</li>
      <li>{E.BENZINE} Tankstations zijn schaars!</li>
      <li>{E.WINKEL} Supermarkten sluiten vaak om 19:00</li>
    </ul>
  </div>
</div>

<style>
  .noodinfo-page {
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .noodinfo-page h2 {
    font-size: 1.4rem;
    margin: 0;
    letter-spacing: -0.01em;
  }

  .noodinfo-card {
    background: var(--card-bg);
    border-radius: 14px;
    padding: 14px 16px;
    box-shadow: 0 2px 10px var(--card-shadow);
    border: 1px solid var(--border-subtle);
  }

  .noodinfo-card h3 {
    font-size: 1rem;
    margin-bottom: 8px;
    color: var(--heading);
  }

  .noodinfo-card p {
    font-size: 0.9rem;
    line-height: 1.6;
    margin: 0;
    color: var(--tekst);
  }

  .noodinfo-card a {
    color: var(--blauw);
    text-decoration: none;
    font-weight: var(--weight-semibold);
  }

  .noodinfo-card a:active {
    opacity: 0.7;
  }

  .alarm-card {
    border-left: 4px solid var(--rood);
  }

  .tips-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .tips-list li {
    font-size: 0.9rem;
    line-height: 1.5;
    color: var(--tekst);
    padding: 6px 0;
    border-bottom: 1px solid var(--border-subtle);
  }

  .tips-list li:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }

  :global(html.dark) .alarm-card {
    border-left-color: var(--text-error);
  }
</style>

