<script lang="ts">
  import { onDestroy } from "svelte";
  import { appState } from '$lib/stores.svelte.js';
  import { haptic } from '$lib/utils/haptic.js';

  let zichtbaar = $state(false);
  let verdwijnt = $state(false);
  let timer: ReturnType<typeof setTimeout> | null = null;
  let dismissTimer: ReturnType<typeof setTimeout> | null = null;

  let snack = $derived(appState.snackbar);

  $effect(() => {
    if (snack) {
      verdwijnt = false;
      zichtbaar = true;
      haptic('light');
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => dismiss(), 2500);
    }
  });

  function dismiss() {
    verdwijnt = true;
    if (dismissTimer) clearTimeout(dismissTimer);
    dismissTimer = setTimeout(() => {
      zichtbaar = false;
      verdwijnt = false;
      appState.snackbar = null;
    }, 300);
  }

  onDestroy(() => {
    if (timer) clearTimeout(timer);
    if (dismissTimer) clearTimeout(dismissTimer);
  });
</script>

{#if zichtbaar && snack}
  <button class="snackbar-overlay" onclick={dismiss} aria-label="Sluit melding">
    <div class="snackbar snackbar-{snack.type || 'success'}" class:verdwijnt role="status" aria-live="polite">
      {#if snack.emoji}
        <span class="snackbar-emoji">{snack.emoji}</span>
      {/if}
      <span class="snackbar-tekst">{snack.tekst}</span>
    </div>
  </button>
{/if}

<style>
  .snackbar-overlay {
    position: fixed;
    bottom: var(--space-20);
    left: 0;
    right: 0;
    display: flex;
    justify-content: center;
    z-index: 9999;
    background: none;
    border: none;
    padding: 0 var(--space-4);
    cursor: pointer;
  }

  .snackbar {
    display: flex;
    align-items: center;
    gap: var(--space-2-5);
    padding: var(--space-3) var(--space-6);
    border-radius: var(--radius-lg);
    border: 2px solid;
    font-size: var(--text-base);
    font-weight: var(--weight-semibold);
    box-shadow: var(--shadow-lg);
    animation: snackIn 0.3s var(--ease-spring);
    max-width: 92%;
  }

  .snackbar.verdwijnt {
    animation: snackOut 0.3s var(--ease-default) forwards;
  }

  .snackbar-success {
    background: var(--color-success-light);
    border-color: var(--color-success-base);
    color: var(--text-success);
  }
  .snackbar-error {
    background: var(--color-error-light);
    border-color: var(--color-error-base);
    color: var(--text-error);
  }
  .snackbar-info {
    background: var(--bg-accent-subtle);
    border-color: var(--text-accent);
    color: var(--text-accent);
  }
  .snackbar-warning {
    background: var(--color-warning-light);
    border-color: var(--color-warning-base);
    color: var(--text-warning);
  }

  .snackbar-emoji {
    font-size: var(--text-lg);
    flex-shrink: 0;
  }
  .snackbar-tekst {
    line-height: var(--leading-snug);
  }

  @keyframes snackIn {
    from {
      transform: translateY(var(--space-8)) scale(0.9);
      opacity: 0;
    }
    to {
      transform: translateY(0) scale(1);
      opacity: 1;
    }
  }

  @keyframes snackOut {
    from {
      transform: translateY(0) scale(1);
      opacity: 1;
    }
    to {
      transform: translateY(var(--space-8)) scale(0.9);
      opacity: 0;
    }
  }
</style>
