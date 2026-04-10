<script lang="ts">
    import { E } from "$lib/emojis.js";
    import type { WeerDag } from "$lib/types.js";

    interface Props {
        weer: WeerDag[];
        laden: boolean;
        fout: string;
        weergegevenDagen: WeerDag[];
        isDesktop: boolean;
    }

    let { weer, laden, fout, weergegevenDagen, isDesktop }: Props = $props();
</script>

{#if laden}
  <div class="weer-laden">
    <div class="weer-spinner"></div>
    <span>Weer ophalen...</span>
  </div>
{:else if fout}
  <div class="weer-fout">{fout}</div>
{:else if weer.length > 0}
  <div class="weer-dagen">
    {#each weergegevenDagen as dag, i}
      <div class="weer-dag" class:vandaag={i === 0}>
        <div class="weer-dag-naam">{i === 0 ? "Vandaag" : dag.dagNaam.charAt(0).toUpperCase() + dag.dagNaam.slice(1)}</div>
        <div class="weer-dag-datum">{dag.datumKort}</div>
        <div class="weer-emoji">{dag.weerInfo.emoji}</div>
        <div class="weer-beschrijving">{dag.weerInfo.tekst}</div>
        <div class="weer-temps">
          <span class="temp-max">{dag.maxTemp}{E.GRADEN}</span>
          <span class="temp-min">{dag.minTemp}{E.GRADEN}</span>
        </div>
        <div class="weer-extra">
          {#if dag.neerslagKans > 0}
            <span>{E.DRUPPEL} {dag.neerslagKans}%</span>
          {/if}
          <span>{E.WIND} {dag.windMax} km/u</span>
        </div>
        {#if isDesktop}
          <div class="weer-desktop-meta">
            <span>Voelt als {dag.gevoelMax}{E.GRADEN}/{dag.gevoelMin}{E.GRADEN}</span>
            {#if dag.zonsopkomst && dag.zonsondergang}
              <span>Zon {dag.zonsopkomst} - Maan {dag.zonsondergang}</span>
            {/if}
          </div>
        {/if}
      </div>
    {/each}
  </div>
{/if}

<style>
  .weer-laden {
    display: flex;
    align-items: center;
    gap: 10px;
    justify-content: center;
    padding: 20px;
    color: var(--text-accent);
    font-size: 0.92rem;
  }
  .weer-spinner {
    width: 20px;
    height: 20px;
    border: 3px solid var(--bg-accent-subtle);
    border-top-color: var(--text-accent);
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  .weer-fout {
    text-align: center;
    color: var(--text-error);
    font-size: 0.85rem;
    padding: 14px;
  }

  .weer-dagen {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
  }
  .weer-dag {
    background: var(--bg-surface-sunken);
    border-radius: 16px;
    padding: 12px 10px 10px;
    text-align: center;
    border: 1px solid var(--border-default);
    transition: border-color 0.2s, background-color 0.2s;
  }
  .weer-dag.vandaag {
    background: var(--bg-accent-subtle);
    border-color: var(--border-accent);
    box-shadow: 0 2px 8px rgba(43, 121, 194, 0.16);
  }
  .weer-dag-naam {
    font-weight: 700;
    font-size: 0.82rem;
    color: var(--text-primary);
    margin-bottom: 1px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .weer-dag-datum {
    font-size: 0.78rem;
    color: var(--text-secondary);
    margin-bottom: 7px;
    font-weight: 500;
  }
  .weer-emoji {
    font-size: 2.2rem;
    line-height: 1;
    margin-bottom: 6px;
  }
  .weer-beschrijving {
    font-size: 0.88rem;
    color: var(--text-primary);
    margin-bottom: 8px;
    min-height: var(--ui-touch-compact);
    display: flex;
    align-items: center;
    justify-content: center;
    line-height: 1.25;
  }
  .weer-temps {
    display: flex;
    justify-content: center;
    align-items: baseline;
    gap: 8px;
    margin-bottom: 6px;
  }
  .temp-max {
    font-weight: 800;
    font-size: 2.05rem;
    color: var(--text-warning);
    line-height: 1;
  }
  .temp-min {
    font-size: 1.22rem;
    color: var(--text-secondary);
    font-weight: 700;
    align-self: flex-end;
    line-height: 1;
    margin-bottom: 1px;
  }
  .weer-extra {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 3px;
    font-size: 0.9rem;
    color: var(--text-primary);
    font-weight: 500;
  }
  .weer-desktop-meta {
    display: none;
  }

  :global(.weer-card.desktop) .weer-desktop-meta {
    display: flex;
    flex-direction: column;
    gap: 3px;
    margin-top: 8px;
    font-size: 0.78rem;
    color: var(--text-secondary);
    font-weight: var(--weight-semibold);
  }
</style>
