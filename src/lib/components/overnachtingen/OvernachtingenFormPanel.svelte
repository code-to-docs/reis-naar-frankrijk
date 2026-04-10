<script lang="ts">
  import type { OvernachtingType } from "$lib/types.js";

  type TypeOptie = { id: string; label: string; emoji: string };
  type FormValues = {
    naam: string;
    type: OvernachtingType;
    startDatum: string;
    nachten: string;
    latitude: string;
    longitude: string;
    adres: string;
    websiteUrl: string;
    bookingUrl: string;
    notities: string;
  };

  let {
    showPlanningForm,
    showShortlistForm,
    editItemId,
    typeOpties,
    formValues,
    vertrekPreview,
    gpsBezig,
    emojiKalender,
    emojiPin,
    onFieldChange,
    onSubmitPlanning,
    onSubmitShortlist,
    onGebruikGps,
    onCloseForms,
    setPlanningFormEl,
    setShortlistFormEl
  } = $props<{
    showPlanningForm: boolean;
    showShortlistForm: boolean;
    editItemId: string | null;
    typeOpties: ReadonlyArray<TypeOptie>;
    formValues: FormValues;
    vertrekPreview: string;
    gpsBezig: boolean;
    emojiKalender: string;
    emojiPin: string;
    onFieldChange: (field: keyof FormValues, value: string) => void;
    onSubmitPlanning: () => void;
    onSubmitShortlist: () => void;
    onGebruikGps: () => void;
    onCloseForms: () => void;
    setPlanningFormEl: (el: HTMLDivElement | null) => void;
    setShortlistFormEl: (el: HTMLDivElement | null) => void;
  }>();

  let planningFormEl = $state<HTMLDivElement | null>(null);
  let shortlistFormEl = $state<HTMLDivElement | null>(null);

  $effect(() => {
    setPlanningFormEl(planningFormEl);
  });

  $effect(() => {
    setShortlistFormEl(shortlistFormEl);
  });
</script>

{#if showPlanningForm}
  <div class="card ov-form-card" bind:this={planningFormEl}>
    <div class="ov-form-head">
      <h3>{editItemId ? "Overnachting bewerken" : "Nieuwe overnachting"}</h3>
      <p>{editItemId ? "Pas de details aan en sla opnieuw op." : "Plan een verblijf direct op de kalender."}</p>
    </div>
    <form
      class="ov-form"
      onsubmit={(event) => {
        event.preventDefault();
        onSubmitPlanning();
      }}
    >
      <label>
        <span>Naam</span>
        <input
          value={formValues.naam}
          required
          placeholder="Bijv. Camping Le Lac"
          oninput={(event) => onFieldChange("naam", (event.currentTarget as HTMLInputElement).value)}
        />
      </label>

      <label>
        <span>Type</span>
        <select
          value={formValues.type}
          required
          onchange={(event) => onFieldChange("type", (event.currentTarget as HTMLSelectElement).value)}
        >
          {#each typeOpties as optie}
            <option value={optie.id}>{optie.label}</option>
          {/each}
        </select>
      </label>

      <label>
        <span>Aankomst datum</span>
        <input
          type="date"
          value={formValues.startDatum}
          required
          oninput={(event) => onFieldChange("startDatum", (event.currentTarget as HTMLInputElement).value)}
        />
      </label>

      <label>
        <span>Aantal nachten</span>
        <input
          type="number"
          min="1"
          max="60"
          step="1"
          value={formValues.nachten}
          required
          oninput={(event) => onFieldChange("nachten", (event.currentTarget as HTMLInputElement).value)}
        />
      </label>

      <label>
        <span>Latitude</span>
        <input
          value={formValues.latitude}
          placeholder="44.51234"
          inputmode="decimal"
          oninput={(event) => onFieldChange("latitude", (event.currentTarget as HTMLInputElement).value)}
        />
      </label>

      <label>
        <span>Longitude</span>
        <input
          value={formValues.longitude}
          placeholder="3.12345"
          inputmode="decimal"
          oninput={(event) => onFieldChange("longitude", (event.currentTarget as HTMLInputElement).value)}
        />
      </label>

      <label>
        <span>Adres (optioneel)</span>
        <input
          value={formValues.adres}
          placeholder="Bijv. Route de Florac 12, Meyrueis"
          oninput={(event) => onFieldChange("adres", (event.currentTarget as HTMLInputElement).value)}
        />
      </label>

      <label>
        <span>Website</span>
        <input
          value={formValues.websiteUrl}
          placeholder="site.fr/locatie"
          oninput={(event) => onFieldChange("websiteUrl", (event.currentTarget as HTMLInputElement).value)}
        />
      </label>

      <label>
        <span>Boekingslink</span>
        <input
          value={formValues.bookingUrl}
          placeholder="booking.com/..."
          oninput={(event) => onFieldChange("bookingUrl", (event.currentTarget as HTMLInputElement).value)}
        />
      </label>

      <label class="ov-notes">
        <span>Notities (optioneel)</span>
        <textarea
          value={formValues.notities}
          rows="2"
          placeholder="Bijv. late check-in mogelijk"
          oninput={(event) => onFieldChange("notities", (event.currentTarget as HTMLTextAreaElement).value)}
        ></textarea>
      </label>

      <div class="ov-preview">
        {#if vertrekPreview}
          <span>{emojiKalender} Uitcheck: {vertrekPreview}</span>
        {/if}
        <button type="button" class="ov-gps-btn" onclick={onGebruikGps} disabled={gpsBezig}>
          {gpsBezig ? "GPS ophalen..." : `${emojiPin} Gebruik huidige GPS`}
        </button>
      </div>

      <div class="ov-actions">
        <button class="btn-save" type="submit">{editItemId ? "Wijzigingen opslaan" : "Opslaan"}</button>
        <button class="btn-danger" type="button" onclick={onCloseForms}>X</button>
      </div>
    </form>
  </div>
{/if}

{#if showShortlistForm}
  <div class="card ov-form-card" bind:this={shortlistFormEl}>
    <div class="ov-form-head">
      <h3>{editItemId ? "Shortlist-locatie bewerken" : "Nieuwe shortlist-locatie"}</h3>
      <p>{editItemId ? "Werk de shortlist bij zonder de plek al in te plannen." : "Bewaar kansrijke locaties om later makkelijk te boeken."}</p>
    </div>
    <form
      class="ov-form"
      onsubmit={(event) => {
        event.preventDefault();
        onSubmitShortlist();
      }}
    >
      <label>
        <span>Naam</span>
        <input
          value={formValues.naam}
          required
          placeholder="Bijv. Eco BNB vallee du Tarn"
          oninput={(event) => onFieldChange("naam", (event.currentTarget as HTMLInputElement).value)}
        />
      </label>

      <label>
        <span>Type</span>
        <select
          value={formValues.type}
          required
          onchange={(event) => onFieldChange("type", (event.currentTarget as HTMLSelectElement).value)}
        >
          {#each typeOpties as optie}
            <option value={optie.id}>{optie.label}</option>
          {/each}
        </select>
      </label>

      <label class="ov-notes">
        <span>Adres</span>
        <input
          value={formValues.adres}
          required
          placeholder="Straat + plaats (bijv. Avenue Jean Jaures 8, Mende)"
          oninput={(event) => onFieldChange("adres", (event.currentTarget as HTMLInputElement).value)}
        />
      </label>

      <label>
        <span>Latitude</span>
        <input
          value={formValues.latitude}
          placeholder="44.51234"
          inputmode="decimal"
          oninput={(event) => onFieldChange("latitude", (event.currentTarget as HTMLInputElement).value)}
        />
      </label>

      <label>
        <span>Longitude</span>
        <input
          value={formValues.longitude}
          placeholder="3.12345"
          inputmode="decimal"
          oninput={(event) => onFieldChange("longitude", (event.currentTarget as HTMLInputElement).value)}
        />
      </label>

      <label>
        <span>Website</span>
        <input
          value={formValues.websiteUrl}
          placeholder="site.fr/locatie"
          oninput={(event) => onFieldChange("websiteUrl", (event.currentTarget as HTMLInputElement).value)}
        />
      </label>

      <label>
        <span>Boekingslink</span>
        <input
          value={formValues.bookingUrl}
          placeholder="booking.com/..."
          oninput={(event) => onFieldChange("bookingUrl", (event.currentTarget as HTMLInputElement).value)}
        />
      </label>

      <label class="ov-notes">
        <span>Waarom geschikt / notities</span>
        <textarea
          value={formValues.notities}
          rows="2"
          placeholder="Bijv. rustig, aan rivier, honden welkom"
          oninput={(event) => onFieldChange("notities", (event.currentTarget as HTMLTextAreaElement).value)}
        ></textarea>
      </label>

      <div class="ov-preview">
        <span>{emojiPin} Tip: voeg GPS toe voor snelle route in Google Maps.</span>
        <button type="button" class="ov-gps-btn" onclick={onGebruikGps} disabled={gpsBezig}>
          {gpsBezig ? "GPS ophalen..." : `${emojiPin} Gebruik huidige GPS`}
        </button>
      </div>

      <div class="ov-actions">
        <button class="btn-save" type="submit">{editItemId ? "Wijzigingen opslaan" : "Naar shortlist"}</button>
        <button class="btn-danger" type="button" onclick={onCloseForms}>X</button>
      </div>
    </form>
  </div>
{/if}

<style>
  .ov-form-card {
    margin: 0;
  }
  .ov-form-head {
    display: grid;
    gap: 4px;
    margin-bottom: 10px;
  }
  .ov-form-card h3 {
    margin: 0;
    font-size: var(--font-size-xl);
  }
  .ov-form-head p {
    margin: 0;
    color: var(--nav-text);
    font-size: var(--font-size-sm);
    font-weight: 500;
  }
  .ov-form {
    display: grid;
    gap: var(--ui-form-gap);
  }
  .ov-form label {
    display: grid;
    gap: 5px;
  }
  .ov-form label span {
    font-size: var(--font-size-xs);
    text-transform: uppercase;
    font-weight: 700;
    letter-spacing: 0.03em;
    color: var(--nav-text);
  }
  .ov-form input,
  .ov-form select,
  .ov-form textarea {
    margin: 0;
    font-size: var(--font-size-md);
    font-family: inherit;
  }
  .ov-form input,
  .ov-form select {
    min-height: var(--ui-touch-min);
    height: var(--ui-touch-min);
    padding-top: 0;
    padding-bottom: 0;
    line-height: var(--ui-line-compact);
  }
  .ov-notes {
    grid-column: 1 / -1;
  }
  .ov-preview {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    flex-wrap: wrap;
    color: var(--blauw);
    font-weight: 600;
    font-size: var(--font-size-sm);
  }
  .ov-gps-btn {
    width: auto;
    min-height: var(--btn-height);
    border: 1px solid var(--input-border);
    background: color-mix(in srgb, var(--card-bg) 84%, #e8f2fc);
    color: var(--blauw);
    font-size: var(--font-size-sm);
    font-weight: var(--ui-weight-semibold);
    padding: 0 12px;
    border-radius: var(--btn-radius);
  }
  .ov-actions {
    display: flex;
    gap: var(--ui-actions-gap);
  }
  .ov-actions .btn-save {
    flex: 1;
    width: auto;
  }
  .ov-actions .btn-danger {
    width: 52px;
    font-weight: 700;
    padding: 0;
  }

  @media (min-width: 840px) {
    .ov-form {
      grid-template-columns: 1fr 1fr;
    }
    .ov-preview,
    .ov-actions {
      grid-column: 1 / -1;
    }
  }

  :global(html.dark) .ov-form-head p {
    color: #94a3b8;
  }
  :global(html.dark) .ov-gps-btn {
    background: #1e3a8a;
    color: #dbeafe;
    border-color: #2563eb;
  }
</style>
