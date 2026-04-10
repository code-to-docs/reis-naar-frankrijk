<script lang="ts">
  /**
   * OvernachtingenHeader.svelte
   * Compact SaaS header with title and primary actions.
   */
  let { onPlanOvernachting, onVoegShortlistToe } = $props<{
    onPlanOvernachting: () => void;
    onVoegShortlistToe: () => void;
  }>();
</script>

<header class="ov-header">
  <div class="header-content">
    <h1 class="text-title">Overnachtingen</h1>
    <p class="text-caption">Plan verblijven, beheer shortlist en bekijk je reis per datum</p>
  </div>
  <div class="action-row">
    <button class="button button-secondary" onclick={onVoegShortlistToe}>
      + Voeg shortlist toe
    </button>
    <button class="button button-primary" onclick={onPlanOvernachting}>
      + Plan overnachting
    </button>
  </div>
</header>

<style>
  .ov-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: var(--space-4);
    margin-bottom: var(--space-6);
  }

  .header-content {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
  }

  .action-row {
    display: flex;
    gap: var(--space-3);
  }

  @media (max-width: 640px) {
    .ov-header {
      flex-direction: column;
      align-items: flex-start;
      gap: var(--space-5);
    }
    .action-row {
      width: 100%;
    }
    .action-row button {
      flex: 1;
      padding-inline: var(--space-2);
      font-size: var(--text-sm);
    }
  }
</style>
