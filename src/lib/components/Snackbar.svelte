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
  <button class="snackbar-overlay" onclick={dismiss}>
    <div class="snackbar snackbar-{snack.type || 'success'}" class:verdwijnt>
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
    bottom: 80px;
    left: 0;
    right: 0;
    display: flex;
    justify-content: center;
    z-index: 9999;
    background: none;
    border: none;
    padding: 0 16px;
    cursor: pointer;
  }

  .snackbar {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 14px 22px;
    border-radius: 14px;
    border: 2px solid;
    font-size: 0.92rem;
    font-weight: var(--weight-semibold);
    box-shadow: 0 6px 24px rgba(0,0,0,0.18);
    animation: snackIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    max-width: 92%;
  }

  .snackbar.verdwijnt {
    animation: snackOut 0.3s ease-in forwards;
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
    font-size: 1.3rem;
    flex-shrink: 0;
  }
  .snackbar-tekst {
    line-height: 1.3;
  }

  @keyframes snackIn {
    from {
      transform: translateY(30px) scale(0.9);
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
      transform: translateY(30px) scale(0.9);
      opacity: 0;
    }
  }
</style>
