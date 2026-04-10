<script lang="ts">
  /**
   * OvernachtingenEmptyState.svelte
   * Centralized empty state for when no overnachtingen or shortlist items are present.
   */
  let { onPlanOvernachting, onVoegShortlistToe } = $props<{
    onPlanOvernachting: () => void;
    onVoegShortlistToe: () => void;
  }>();
</script>

<div class="empty-state">
  <div class="empty-state-icon" aria-hidden="true">
    <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round">
      <path d="M19 20 12 4 5 20"/>
      <path d="m12 4 4 16"/>
      <path d="m12 4-4 16"/>
      <path d="M12 12V4"/>
      <path d="M9 20h6"/>
    </svg>
  </div>
  <div class="empty-state-text">
    <h2 class="empty-state-title">Je hebt nog geen overnachtingen gepland.</h2>
    <p class="empty-state-subtitle">
      Begin met het plannen van je route door locaties te kiezen of voeg interessante plekken toe aan je shortlist om later te beslissen.
    </p>
  </div>
  <div class="empty-state-actions">
    <button class="button button-secondary" onclick={onVoegShortlistToe}>
      + Voeg shortlist toe
    </button>
    <button class="button button-primary" onclick={onPlanOvernachting}>
      + Plan overnachting
    </button>
  </div>
</div>

<style>
  .empty-state-text {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }

  @media (max-width: 640px) {
    .empty-state-actions {
      flex-direction: column;
      width: 100%;
    }
    .empty-state-actions button {
      width: 100%;
    }
    .empty-state-subtitle {
     font-size: var(--text-sm);
    }
  }
</style>
