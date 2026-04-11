<script>
  let {
    variant = "default",
    padding = "md",
    hoverable = false,
    disabled = false,
    href = "",
    onclick = undefined,
    children = undefined
  } = $props();

  /**
   * @param {MouseEvent} event
   */
  function handleLinkClick(event) {
    if (disabled) {
      event.preventDefault();
      return;
    }
    onclick?.(event);
  }
</script>

{#if href}
  <a
    class={`ui-card ui-card--${variant} ui-card--pad-${padding}`}
    class:ui-card--hoverable={hoverable}
    class:ui-card--disabled={disabled}
    href={disabled ? undefined : href}
    aria-disabled={disabled ? "true" : undefined}
    tabindex={disabled ? -1 : undefined}
    onclick={handleLinkClick}
  >
    {@render children?.()}
  </a>
{:else if onclick}
  <button
    class={`ui-card ui-card--${variant} ui-card--pad-${padding}`}
    class:ui-card--hoverable={hoverable}
    {disabled}
    onclick={onclick}
    type="button"
  >
    {@render children?.()}
  </button>
{:else}
  <div class={`ui-card ui-card--${variant} ui-card--pad-${padding}`}>
    {@render children?.()}
  </div>
{/if}

<style>
  .ui-card {
    display: block;
    width: 100%;
    background: var(--bg-surface);
    color: inherit;
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-sm);
    text-align: left;
    font: inherit;
    text-decoration: none;
    transition:
      box-shadow var(--duration-normal) var(--ease-default),
      border-color var(--duration-fast) var(--ease-default),
      transform var(--duration-fast) var(--ease-default);
  }

  button.ui-card {
    cursor: pointer;
  }

  .ui-card--pad-none {
    padding: var(--space-0);
  }

  .ui-card--pad-sm {
    padding: var(--space-3);
  }

  .ui-card--pad-md {
    padding: var(--space-4);
  }

  .ui-card--pad-lg {
    padding: var(--space-5);
  }

  .ui-card--default {
    background: var(--bg-surface);
    color: var(--text-primary);
  }

  .ui-card--accent {
    background: var(--header-bg);
    color: var(--text-inverse);
    border-color: color-mix(in srgb, var(--header-bg) 70%, var(--border-default));
  }

  .ui-card--success {
    background: color-mix(in srgb, var(--bg-surface) 74%, var(--color-success-light));
    color: var(--text-primary);
    border-color: color-mix(in srgb, var(--color-success-base) 45%, var(--border-default));
  }

  .ui-card--sunken {
    background: var(--bg-surface-sunken);
    color: var(--text-primary);
    box-shadow: none;
  }

  .ui-card--hoverable:hover:not(.ui-card--disabled):not(:disabled) {
    box-shadow: var(--shadow-md);
    border-color: var(--border-strong);
  }

  .ui-card:focus-visible {
    outline: none;
    box-shadow: var(--shadow-focus);
  }

  button.ui-card:active:not(:disabled),
  .ui-card--hoverable:active:not(.ui-card--disabled) {
    transform: scale(0.99);
  }

  .ui-card--disabled,
  .ui-card:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }

  @media (prefers-reduced-motion: reduce) {
    .ui-card {
      transition: none;
    }

    button.ui-card:active:not(:disabled),
    .ui-card--hoverable:active:not(.ui-card--disabled) {
      transform: none;
    }
  }
</style>
