<script lang="ts">
  import { onMount } from 'svelte';
  import {
    collection, onSnapshot, addDoc, updateDoc,
    deleteDoc, doc, serverTimestamp, query, orderBy,
    type DocumentData,
    type QuerySnapshot
  } from 'firebase/firestore';
  import { db } from '$lib/firebase.js';
  import { appState, toonSnackbar } from '$lib/stores.svelte.js';
  import { E } from '$lib/emojis.js';
  import type { LijstItem } from '$lib/types.js';
  import Button from '$lib/components/ui/Button.svelte';
  import Card from '$lib/components/ui/Card.svelte';
  import Input from '$lib/components/ui/Input.svelte';

  type GedeeldLijstItem = LijstItem & { id: string };

  let {
    titel = '',
    emoji = '',
    collectie = '',
    afvinkbaar = false,
    metLink = false,
    placeholder = 'Nieuw item...',
    toonDesktopTitel = true
  } = $props<{
    titel?: string;
    emoji?: string;
    collectie?: string;
    afvinkbaar?: boolean;
    metLink?: boolean;
    placeholder?: string;
    toonDesktopTitel?: boolean;
  }>();

  let items = $state<GedeeldLijstItem[]>([]);
  let nieuwItem = $state('');
  let extraVeld = $state('');
  let linkVeld = $state('');
  let toonForm = $state(false);
  let unsubscribe: (() => void) | undefined;

  let aantalGedaan = $derived(items.filter(i => i.gedaan).length);

  function normalizeHttpUrl(raw: string): string | null {
    const trimmed = String(raw || "").trim();
    if (!trimmed) return null;

    const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;

    try {
      const parsed = new URL(withProtocol);
      if (parsed.protocol === "http:" || parsed.protocol === "https:") return parsed.href;
    } catch {
      return null;
    }

    return null;
  }

  function getSafeMapLink(item: GedeeldLijstItem): string | null {
    return normalizeHttpUrl(item.mapsLink || "");
  }

  function mapItems(snapshot: QuerySnapshot<DocumentData>, sorteerClientSide = false) {
    const mapped: GedeeldLijstItem[] = snapshot.docs.map((entry) => ({
      id: entry.id,
      ...(entry.data() as Omit<LijstItem, 'id'>)
    }));
    if (sorteerClientSide) {
      mapped.sort((a, b) => (a.datum?.seconds || 0) - (b.datum?.seconds || 0));
    }
    items = mapped;
  }

  onMount(() => {
    const ref = collection(db, collectie);
    const sorted = query(ref, orderBy("datum", "asc"));

    unsubscribe = onSnapshot(
      sorted,
      (snapshot) => mapItems(snapshot, false),
      () => {
        unsubscribe?.();
        unsubscribe = onSnapshot(ref, (snapshot) => mapItems(snapshot, true));
      }
    );

    return () => unsubscribe?.();
  });

  async function voegToe() {
    if (!nieuwItem.trim()) return;
    const data: Record<string, unknown> = {
      naam: nieuwItem.trim(),
      door: appState.gebruiker,
      datum: serverTimestamp()
    };
    if (afvinkbaar) data.gedaan = false;
    if (extraVeld.trim()) data.notities = extraVeld.trim();
    if (metLink && linkVeld.trim()) {
      const veiligeLink = normalizeHttpUrl(linkVeld);
      if (!veiligeLink) {
        toonSnackbar("Gebruik een geldige http(s)-link", "warning", E.WARN);
        return;
      }
      data.mapsLink = veiligeLink;
    }
    try {
      await addDoc(collection(db, collectie), data);
      nieuwItem = '';
      extraVeld = '';
      linkVeld = '';
      toonForm = false;
      toonSnackbar("Opgeslagen", "success", E.CHECK);
    } catch (e) {
      console.error(e);
      toonSnackbar("Fout bij opslaan", "error", E.KRUIS);
    }
  }

  async function toggle(item: GedeeldLijstItem) {
    try {
      await updateDoc(doc(db, collectie, item.id), {
        gedaan: !item.gedaan,
        afgevinktDoor: appState.gebruiker
      });
    } catch (e) {
      console.error(e);
      toonSnackbar("Actie mislukt", "error", E.KRUIS);
    }
  }

  async function verwijder(id: string) {
    if (confirm('Verwijderen?')) {
      try {
        await deleteDoc(doc(db, collectie, id));
        toonSnackbar("Verwijderd", "success", E.PRULLENBAK);
      } catch (e) {
        console.error(e);
        toonSnackbar("Actie mislukt", "error", E.KRUIS);
      }
    }
  }
</script>

<div class="gl-container">
  <h2 class="gl-title" class:desktop-hidden={!toonDesktopTitel}>{emoji} {titel}</h2>

  {#if afvinkbaar}
    <p class="gl-voortgang">{aantalGedaan}/{items.length} gedaan</p>
    <div class="progress-bar">
      <div class="progress-fill" style="width:{items.length ? (aantalGedaan/items.length)*100 : 0}%">
        {items.length ? Math.round((aantalGedaan/items.length)*100) : 0}%
      </div>
    </div>
  {/if}

  {#each items as item (item.id)}
    {@const veiligeMapsLink = getSafeMapLink(item)}
    <div class="checklist-item" class:gedaan={item.gedaan}>
      {#if afvinkbaar}
        <input type="checkbox" checked={item.gedaan}
          aria-label={`Markeer ${item.naam} als ${item.gedaan ? "niet gedaan" : "gedaan"}`}
          onchange={() => toggle(item)} />
      {/if}
      <div class="gl-item-content">
        <strong>{item.naam}</strong>
        {#if item.notities}
          <p class="gl-notitie">{item.notities}</p>
        {/if}
        {#if veiligeMapsLink}
          <a href={veiligeMapsLink} target="_blank" rel="noopener noreferrer" class="gl-maps-link">
            {E.PIN} Open in Maps
          </a>
        {/if}
        <small class="gl-meta">({item.door})</small>
      </div>
      <Button
        variant="destructive"
        size="sm"
        class="gl-trash-btn"
        aria-label={`Verwijder ${item.naam}`}
        onclick={() => verwijder(item.id)}
      >
        {E.PRULLENBAK}
      </Button>
    </div>
  {/each}

  {#if items.length === 0}
    <p class="gl-leeg">
      Nog niets toegevoegd
    </p>
  {/if}

  {#if toonForm}
    <Card class="gl-form-card">
      <form class="gl-form" onsubmit={(e) => { e.preventDefault(); voegToe(); }}>
        <Input bind:value={nieuwItem} placeholder={placeholder} />
        {#if metLink}
          <Input bind:value={linkVeld} type="url" placeholder="Google Maps link (optioneel)" />
        {/if}
        <textarea class="gl-textarea" bind:value={extraVeld} placeholder="Notities (optioneel)" rows="2"></textarea>
        <div class="gl-form-actions">
          <Button type="submit" variant="success" class="gl-submit">Opslaan</Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            class="gl-cancel"
            aria-label="Sluit formulier"
            onclick={() => toonForm = false}
          >
            {E.X}
          </Button>
        </div>
      </form>
    </Card>
  {:else}
    <Button class="gl-add-btn" variant="primary" fullWidth onclick={() => toonForm = true}>
      + Toevoegen
    </Button>
  {/if}
</div>

<style>
  .gl-container { padding: 0; }
  .gl-title {
    margin: 0 0 var(--space-3);
    color: var(--heading);
    font-size: clamp(1.55rem, 4.2vw, var(--text-2xl));
    letter-spacing: -0.02em;
    line-height: 1.05;
  }
  .gl-voortgang { color: var(--nav-text); margin-bottom: var(--space-1); font-size: var(--text-sm); }
  .progress-fill { background: var(--groen); }
  .gl-item-content { flex: 1; min-width: 0; }
  .gl-notitie { color: var(--nav-text); font-size: var(--text-sm); margin: var(--space-1) 0; }
  .gl-maps-link {
    display: inline-flex; align-items: center; gap: var(--space-1-5);
    color: var(--blauw); font-size: var(--text-xs); text-decoration: none;
    background: var(--hover-bg); padding: var(--space-1) var(--space-2-5); border-radius: var(--radius-full);
    margin-top: var(--space-1); border: 1px solid var(--border-subtle);
  }
  .gl-maps-link:active { opacity: 0.8; }
  .gl-meta { color: var(--nav-text); display: block; margin-top: var(--space-1); }
  :global(.gl-trash-btn) {
    min-width: var(--ui-btn-height-compact);
    padding-inline: var(--space-2);
    opacity: 0.75;
  }
  :global(.gl-trash-btn:active) {
    opacity: 1;
  }
  .gl-leeg { text-align: center; color: var(--nav-text); margin: var(--space-8) 0; }
  .gl-form {
    display: grid;
    gap: var(--space-2);
  }
  .gl-textarea {
    min-height: calc(var(--ui-touch-min) * 1.6);
    margin: 0;
  }
  .gl-form-actions { display: flex; gap: var(--space-2); }
  :global(.gl-submit) {
    flex: 1;
  }
  :global(.gl-cancel) {
    min-width: var(--ui-touch-min);
    padding-inline: var(--space-2);
  }
  :global(.gl-add-btn) {
    margin-top: var(--space-3);
    font-size: var(--text-lg);
    font-weight: var(--ui-weight-semibold);
  }

  @media (min-width: 1100px) {
    .gl-title.desktop-hidden {
      display: none;
    }
  }
</style>
