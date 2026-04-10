<script lang="ts">
  /**
   * OvernachtingenTabs.svelte
   * Horizontal bar with subtle KPIs and view-switching tabs.
   */
  let { actieveWeergave, ingeplandeCount, shortlistCount, onChange } = $props<{
    actieveWeergave: string;
    ingeplandeCount: number;
    shortlistCount: number;
    onChange: (val: string) => void;
  }>();
</script>

<div class="ov-tabs-wrapper">
  <div class="ov-kpi-bar">
    <span class="kpi-text">{ingeplandeCount} geplande nachten</span>
    <span class="kpi-divider">|</span>
    <span class="kpi-text">{shortlistCount} shortlist locaties</span>
  </div>

  <div class="tabs-container">
    <button 
      class="tab-button" 
      class:active={actieveWeergave === 'overzicht'} 
      onclick={() => onChange('overzicht')}
      aria-label="Toon overzicht"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="tab-icon"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>
      <span>Overzicht</span>
    </button>
    <button 
      class="tab-button" 
      class:active={actieveWeergave === 'kalender'} 
      onclick={() => onChange('kalender')}
      aria-label="Toon kalender"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="tab-icon"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
      <span>Kalender</span>
    </button>
    <button 
      class="tab-button" 
      class:active={actieveWeergave === 'kaart'} 
      onclick={() => onChange('kaart')}
      aria-label="Toon kaart"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="tab-icon"><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/><line x1="9" x2="9" y1="3" y2="18"/><line x1="15" x2="15" y1="6" y2="21"/></svg>
      <span>Kaart</span>
    </button>
  </div>
</div>

<style>
  .ov-tabs-wrapper {
    background: var(--bg-surface);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-sm);
    margin-bottom: var(--space-4);
    border: 1px solid var(--border-subtle);
    overflow: hidden;
  }

  .ov-kpi-bar {
    padding: var(--space-3) var(--space-4);
    display: flex;
    align-items: center;
    gap: var(--space-3);
    font-size: var(--text-sm);
    color: var(--text-secondary);
    background: color-mix(in srgb, var(--bg-app) 40%, var(--bg-surface));
    border-bottom: 1px solid var(--border-subtle);
  }

  .kpi-divider {
    color: var(--border-strong);
    opacity: 0.5;
  }

  .tab-icon {
    opacity: 0.7;
    flex-shrink: 0;
  }

  .tab-button.active .tab-icon {
    opacity: 1;
    color: var(--text-accent);
  }

  @media (max-width: var(--breakpoint-md)) {
    .ov-kpi-bar {
      padding: var(--space-2-5) var(--space-3);
      gap: var(--space-2);
    }
    .kpi-text {
      font-size: var(--text-xs);
    }
    .tab-button {
      flex: 1;
      justify-content: center;
      padding-inline: var(--space-1);
      font-size: var(--text-xs);
    }
    .tab-button span {
      display: inline-block; /* Keep text even on mobile */
    }
  }
</style>
