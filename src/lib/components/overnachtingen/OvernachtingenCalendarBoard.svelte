<script lang="ts">
  import type { KalenderCel, LocatieLegendaItem, OvernachtingView } from "./types.js";

  let {
    actieveWeergave,
    maandLabelText,
    kanVorigeMaand,
    kanVolgendeMaand,
    weekdagen,
    kalenderCels,
    selectieActief,
    locatieLegenda,
    isDagInSelectie,
    isDagSelectieStart,
    isDagSelectieEinde,
    onOpenKalender,
    onPrevMaand,
    onNextMaand,
    onDayMouseDown,
    onDayMouseEnter,
    onDayClick,
    onDayTouchStart,
    onDayKeydown,
    onOpenItemEditor,
    emojiKalender
  } = $props<{
    actieveWeergave: "overzicht" | "kalender";
    maandLabelText: string;
    kanVorigeMaand: boolean;
    kanVolgendeMaand: boolean;
    weekdagen: string[];
    kalenderCels: KalenderCel[];
    selectieActief: boolean;
    locatieLegenda: LocatieLegendaItem[];
    isDagInSelectie: (dayKey: string, isLeeg: boolean) => boolean;
    isDagSelectieStart: (dayKey: string, isLeeg: boolean) => boolean;
    isDagSelectieEinde: (dayKey: string, isLeeg: boolean) => boolean;
    onOpenKalender: () => void;
    onPrevMaand: () => void;
    onNextMaand: () => void;
    onDayMouseDown: (event: MouseEvent, dayKey: string, isLeeg: boolean) => void;
    onDayMouseEnter: (dayKey: string, isLeeg: boolean) => void;
    onDayClick: (dayKey: string, isLeeg: boolean, entries: OvernachtingView[]) => void;
    onDayTouchStart: (event: TouchEvent, dayKey: string, isLeeg: boolean) => void;
    onDayKeydown: (event: KeyboardEvent, dayKey: string, isLeeg: boolean, entries: OvernachtingView[]) => void;
    onOpenItemEditor: (item: OvernachtingView) => void;
    emojiKalender: string;
  }>();
</script>

{#if actieveWeergave === "kalender"}
  <div class="card ov-calendar-card">
    <div class="ov-calendar-head">
      <button class="ov-month-btn" onclick={onPrevMaand} disabled={!kanVorigeMaand}>Vorige</button>
      <strong>{maandLabelText}</strong>
      <button class="ov-month-btn" onclick={onNextMaand} disabled={!kanVolgendeMaand}>Volgende</button>
    </div>
    <p class="ov-calendar-hint">Tik op een dag voor 1 nacht, of swipe/drag over meerdere dagen voor een reeks.</p>

    <div class="ov-weekdays">
      {#each weekdagen as wd}
        <div>{wd}</div>
      {/each}
    </div>

    <div class="ov-grid" class:selecting={selectieActief}>
      {#each kalenderCels as cel (cel.key)}
        <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
        <div
          class="ov-day"
          class:leeg={cel.isLeeg}
          class:vandaag={cel.isVandaag}
          class:geselecteerd={isDagInSelectie(cel.key, cel.isLeeg)}
          class:selectiestart={isDagSelectieStart(cel.key, cel.isLeeg)}
          class:selectieeinde={isDagSelectieEinde(cel.key, cel.isLeeg)}
          data-daykey={cel.isLeeg ? undefined : cel.key}
          role={cel.isLeeg ? undefined : "button"}
          tabindex={cel.isLeeg ? undefined : 0}
          aria-label={cel.isLeeg ? undefined : `Kies datum ${cel.key}`}
          onmousedown={(event) => onDayMouseDown(event, cel.key, cel.isLeeg)}
          onmouseenter={() => onDayMouseEnter(cel.key, cel.isLeeg)}
          onclick={() => onDayClick(cel.key, cel.isLeeg, cel.entries)}
          ontouchstart={(event) => onDayTouchStart(event, cel.key, cel.isLeeg)}
          onkeydown={(event) => onDayKeydown(event, cel.key, cel.isLeeg, cel.entries)}
        >
          {#if cel.dagNummer !== null}
            <div class="ov-day-number">{cel.dagNummer}</div>
            {#if cel.entries.length > 0}
              <div class="ov-day-events">
                {#each cel.entries.slice(0, 2) as ent}
                  <button
                    type="button"
                    class="ov-chip ov-chip-btn"
                    style={`--loc-kleur:${ent.kleur}`}
                    title={`${ent.naam} (${ent.nachtenSafe} nacht${ent.nachtenSafe > 1 ? "en" : ""})`}
                    onmousedown={(event) => event.stopPropagation()}
                    ontouchstart={(event) => event.stopPropagation()}
                    onclick={(event) => {
                      event.stopPropagation();
                      onOpenItemEditor(ent);
                    }}
                  >
                    <span>{ent.naam}</span>
                  </button>
                {/each}
                {#if cel.entries.length > 2}
                  <div class="ov-more">+{cel.entries.length - 2}</div>
                {/if}
              </div>
            {/if}
          {/if}
        </div>
      {/each}
    </div>

    {#if locatieLegenda.length > 0}
      <div class="ov-legend">
        {#each locatieLegenda as l}
          <div class="ov-legend-item">
            <span class="ov-legend-dot" style={`background:${l.kleur}`}></span>
            <span>{l.naam}</span>
          </div>
        {/each}
      </div>
    {/if}
  </div>
{:else}
  <div class="card ov-calendar-teaser">
    <div>
      <h3>{emojiKalender} Kalenderplanning</h3>
      <p>Gebruik de kalender wanneer je data wilt plannen of aanpassen. In overzicht zie je direct je verblijven en shortlist.</p>
    </div>
    <button class="ov-secondary-btn" onclick={onOpenKalender}>Open kalender</button>
  </div>
{/if}

<style>
  .ov-secondary-btn {
    width: auto;
    min-height: var(--btn-height);
    border: 1px solid var(--input-border);
    background: color-mix(in srgb, var(--card-bg) 84%, var(--bg-accent-subtle));
    color: var(--blauw);
    font-size: var(--font-size-sm);
    font-weight: var(--ui-weight-semibold);
    padding: 0 var(--space-3);
    border-radius: var(--btn-radius);
  }

  .ov-calendar-card {
    margin: 0;
    padding: 14px;
  }
  .ov-calendar-teaser {
    margin: 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-2-5);
    border: 1px solid var(--border-subtle);
  }
  .ov-calendar-teaser h3 {
    margin: 0;
    font-size: var(--font-size-lg);
  }
  .ov-calendar-teaser p {
    margin: var(--space-1) 0 0;
    color: var(--nav-text);
    font-size: var(--font-size-sm);
    max-width: 66ch;
  }
  .ov-calendar-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: var(--space-2-5);
  }
  .ov-calendar-head strong {
    font-size: var(--font-size-lg);
    text-transform: capitalize;
    color: var(--heading);
  }
  .ov-calendar-hint {
    margin: -2px 0 var(--space-2-5);
    font-size: var(--font-size-sm);
    color: var(--nav-text);
    font-weight: var(--weight-medium);
  }
  .ov-month-btn {
    width: auto;
    min-height: var(--btn-height-compact);
    padding: 0 var(--space-2-5);
    font-size: var(--font-size-sm);
    font-weight: var(--ui-weight-semibold);
    border: 1px solid var(--input-border);
    background: var(--hover-bg);
    color: var(--heading);
    border-radius: var(--btn-radius);
  }
  .ov-month-btn:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }

  .ov-weekdays {
    display: grid;
    grid-template-columns: repeat(7, minmax(0, 1fr));
    gap: var(--space-1-5);
    margin-bottom: var(--space-1-5);
  }
  .ov-weekdays div {
    text-align: center;
    font-size: var(--font-size-xs);
    font-weight: var(--weight-bold);
    color: var(--nav-text);
  }

  .ov-grid {
    display: grid;
    grid-template-columns: repeat(7, minmax(0, 1fr));
    gap: var(--space-1-5);
  }
  .ov-grid.selecting {
    user-select: none;
  }
  .ov-day {
    appearance: none;
    width: 100%;
    min-height: 88px;
    border: 1px solid var(--input-border);
    border-radius: var(--radius-md);
    padding: var(--space-1-5);
    background: var(--card-bg);
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
    cursor: pointer;
    transition: border-color 120ms ease, background-color 120ms ease, box-shadow 120ms ease;
    touch-action: none;
    text-align: left;
    font: inherit;
  }
  .ov-day.leeg {
    background: var(--hover-bg);
    border-style: dashed;
    opacity: 0.55;
    cursor: default;
    touch-action: auto;
  }
  .ov-day.vandaag {
    background: color-mix(in srgb, var(--card-bg) 84%, var(--color-warning-light));
    border-color: color-mix(in srgb, var(--color-warning-base) 44%, var(--color-warning-light));
    box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--color-warning-base) 38%, transparent);
  }
  .ov-day.geselecteerd {
    background: color-mix(in srgb, var(--card-bg) 80%, var(--bg-accent-subtle));
    border-color: color-mix(in srgb, var(--blauw) 40%, var(--border-strong));
  }
  .ov-day.vandaag.geselecteerd {
    background: color-mix(in srgb, var(--card-bg) 72%, var(--bg-accent-subtle));
    border-color: var(--blauw);
    box-shadow:
      inset 0 0 0 1px color-mix(in srgb, var(--blauw) 32%, transparent),
      inset 0 0 0 3px color-mix(in srgb, var(--color-warning-base) 30%, transparent);
  }
  .ov-day.selectiestart,
  .ov-day.selectieeinde {
    border-color: var(--blauw);
    box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--blauw) 35%, transparent);
  }
  .ov-day-number {
    font-size: var(--font-size-sm);
    font-weight: var(--ui-weight-heavy);
    color: var(--heading);
  }
  .ov-day-events {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
  }
  .ov-chip {
    --loc-kleur: var(--color-primary-600);
    font-size: 0.72rem;
    font-weight: var(--weight-bold);
    border-radius: var(--radius-md);
    padding: 3px 5px;
    background: color-mix(in srgb, var(--loc-kleur) 16%, var(--bg-surface));
    border: 1px solid color-mix(in srgb, var(--loc-kleur) 35%, var(--bg-surface));
    color: var(--text-primary);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .ov-chip span {
    display: block;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .ov-chip-btn {
    appearance: none;
    width: 100%;
    text-align: left;
    cursor: pointer;
    font: inherit;
  }
  .ov-more {
    font-size: 0.72rem;
    color: var(--nav-text);
    font-weight: var(--weight-bold);
    padding-left: 2px;
  }

  .ov-legend {
    display: flex;
    flex-wrap: wrap;
    gap: 7px var(--space-3);
    margin-top: var(--space-3);
  }
  .ov-legend-item {
    display: inline-flex;
    align-items: center;
    gap: var(--space-1-5);
    font-size: var(--font-size-xs);
    color: var(--tekst);
    font-weight: var(--weight-semibold);
  }
  .ov-legend-dot {
    width: var(--space-2-5);
    height: var(--space-2-5);
    border-radius: var(--radius-full);
    border: 1px solid rgba(255, 255, 255, 0.9);
    box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.06);
  }

  @media (max-width: 760px) {
    .ov-calendar-teaser {
      display: grid;
      gap: var(--space-2-5);
    }
    .ov-calendar-teaser .ov-secondary-btn {
      width: 100%;
    }
    .ov-day {
      min-height: 76px;
    }
    .ov-chip {
      font-size: 0.64rem;
      padding: 2px var(--space-1);
    }
  }

  :global(html.dark) .ov-calendar-hint,
  :global(html.dark) .ov-weekdays div,
  :global(html.dark) .ov-more {
    color: var(--text-tertiary);
  }
  :global(html.dark) .ov-day,
  :global(html.dark) .ov-month-btn {
    background: var(--bg-surface-raised);
    border-color: var(--border-strong);
  }
  :global(html.dark) .ov-day.leeg {
    background: var(--bg-surface);
  }
   :global(html.dark) .ov-day.geselecteerd {
    background: color-mix(in srgb, var(--color-primary-900) 42%, var(--bg-surface));
    border-color: var(--border-accent);
  }
  :global(html.dark) .ov-day.vandaag {
    background: color-mix(in srgb, var(--color-warning-dark) 35%, var(--bg-surface));
    border-color: var(--color-warning-base);
    box-shadow: inset 0 0 0 1px rgba(245, 158, 11, 0.35);
  }
  :global(html.dark) .ov-day.vandaag.geselecteerd {
    background: color-mix(in srgb, var(--color-primary-800) 42%, var(--bg-surface));
    border-color: var(--border-accent);
    box-shadow:
      inset 0 0 0 1px color-mix(in srgb, var(--border-accent) 45%, transparent),
      inset 0 0 0 3px color-mix(in srgb, var(--color-warning-base) 28%, transparent);
  }
  :global(html.dark) .ov-day-number,
  :global(html.dark) .ov-calendar-head strong {
    color: var(--text-primary);
  }
  :global(html.dark) .ov-legend-item {
    color: var(--text-secondary);
  }
  :global(html.dark) .ov-chip {
    color: var(--text-primary);
  }
  :global(html.dark) .ov-secondary-btn {
    background: var(--bg-accent-subtle);
    color: var(--text-accent);
    border-color: var(--border-accent);
  }
</style>


