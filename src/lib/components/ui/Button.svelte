<script>
  let {
    variant = "primary",
    size = "md",
    disabled = false,
    fullWidth = false,
    type = "button",
    href = "",
    onclick = undefined,
    children = undefined,
    class: className = "",
    ...restProps
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
    class={`ui-btn ui-btn--${variant} ui-btn--${size} ${className}`.trim()}
    class:ui-btn--full={fullWidth}
    class:ui-btn--disabled={disabled}
    href={disabled ? undefined : href}
    aria-disabled={disabled ? "true" : undefined}
    tabindex={disabled ? -1 : undefined}
    onclick={handleLinkClick}
    {...restProps}
  >
    {@render children?.()}
  </a>
{:else}
  <button
    class={`ui-btn ui-btn--${variant} ui-btn--${size} ${className}`.trim()}
    class:ui-btn--full={fullWidth}
    type={type === "submit" || type === "reset" ? type : "button"}
    {disabled}
    onclick={onclick}
    {...restProps}
  >
    {@render children?.()}
  </button>
{/if}

<style>
  .ui-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: var(--ui-btn-gap);
    min-height: var(--ui-btn-height);
    padding-inline: var(--ui-btn-padding-inline);
    border-radius: var(--ui-btn-radius);
    border: 1px solid transparent;
    background: var(--bg-surface);
    color: var(--text-primary);
    font-size: var(--ui-btn-font-size);
    font-weight: var(--ui-btn-font-weight);
    font-family: inherit;
    line-height: var(--ui-line-compact);
    text-decoration: none;
    white-space: nowrap;
    cursor: pointer;
    touch-action: manipulation;
    transition:
      transform var(--duration-fast) var(--ease-default),
      background-color var(--duration-fast) var(--ease-default),
      border-color var(--duration-fast) var(--ease-default),
      box-shadow var(--duration-fast) var(--ease-default),
      color var(--duration-fast) var(--ease-default),
      opacity var(--duration-fast) var(--ease-default);
  }

  .ui-btn:active:not(:disabled):not(.ui-btn--disabled) {
    transform: scale(0.97);
  }

  .ui-btn:focus-visible {
    outline: none;
    box-shadow: var(--shadow-focus);
  }

  .ui-btn:disabled,
  .ui-btn--disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }

  .ui-btn--sm {
    min-height: var(--ui-btn-height-compact);
    padding-inline: var(--space-3);
    font-size: var(--text-sm);
    border-radius: var(--radius-md);
  }

  .ui-btn--md {
    min-height: var(--ui-btn-height);
    padding-inline: var(--ui-btn-padding-inline);
    font-size: var(--ui-btn-font-size);
    border-radius: var(--ui-btn-radius);
  }

  .ui-btn--lg {
    min-height: calc(var(--ui-btn-height) + var(--space-2));
    padding-inline: var(--space-5);
    font-size: var(--text-md);
    border-radius: var(--radius-xl);
  }

  .ui-btn--primary {
    background: var(--bg-accent);
    color: var(--text-inverse);
    border-color: var(--border-accent);
    box-shadow: var(--shadow-sm);
  }

  .ui-btn--primary:hover:not(:disabled):not(.ui-btn--disabled) {
    background: var(--bg-accent-hover);
    box-shadow: var(--shadow-md);
  }

  .ui-btn--secondary {
    background: var(--bg-surface);
    color: var(--text-primary);
    border-color: var(--border-default);
  }

  .ui-btn--secondary:hover:not(:disabled):not(.ui-btn--disabled) {
    background: var(--bg-interactive-hover);
    border-color: var(--border-strong);
  }

  .ui-btn--tertiary {
    background: transparent;
    color: var(--text-accent);
    border-color: transparent;
    box-shadow: none;
  }

  .ui-btn--tertiary:hover:not(:disabled):not(.ui-btn--disabled) {
    background: var(--bg-accent-subtle);
  }

  .ui-btn--destructive {
    background: color-mix(in srgb, var(--color-error-base) 92%, var(--color-error-dark));
    color: var(--text-inverse);
    border-color: var(--color-error-dark);
    box-shadow: var(--shadow-sm);
  }

  .ui-btn--destructive:hover:not(:disabled):not(.ui-btn--disabled) {
    background: var(--color-error-dark);
  }

  .ui-btn--ghost {
    background: transparent;
    color: var(--text-primary);
    border-color: transparent;
    box-shadow: none;
  }

  .ui-btn--ghost:hover:not(:disabled):not(.ui-btn--disabled) {
    background: var(--bg-interactive-hover);
  }

  .ui-btn--success {
    background: color-mix(in srgb, var(--color-success-dark) 88%, var(--color-success-base));
    color: var(--text-inverse);
    border-color: var(--color-success-base);
    box-shadow: var(--shadow-sm);
  }

  .ui-btn--success:hover:not(:disabled):not(.ui-btn--disabled) {
    background: var(--color-success-dark);
  }

  .ui-btn--full {
    width: 100%;
  }

  @media (prefers-reduced-motion: reduce) {
    .ui-btn {
      transition: none;
    }

    .ui-btn:active:not(:disabled):not(.ui-btn--disabled) {
      transform: none;
    }
  }
</style>
