<script module>
  let inputCounter = 0;
</script>

<script>
  let {
    id = "",
    type = "text",
    value = $bindable(""),
    placeholder = "",
    label = "",
    help = "",
    error = "",
    disabled = false,
    required = false,
    fullWidth = true,
    oninput = undefined,
    onkeydown = undefined
  } = $props();

  const fallbackId = `ui-input-${++inputCounter}`;
  const inputId = $derived(id || fallbackId);
  const describedById = $derived(error ? `${inputId}-error` : help ? `${inputId}-help` : undefined);
</script>

<div class="ui-field" class:ui-field--full={fullWidth}>
  {#if label}
    <label class="ui-field__label" for={inputId}>{label}</label>
  {/if}

  <input
    id={inputId}
    class="ui-input"
    class:ui-input--error={!!error}
    {type}
    bind:value
    {placeholder}
    {disabled}
    {required}
    {oninput}
    {onkeydown}
    aria-invalid={!!error}
    aria-describedby={describedById}
  />

  {#if error}
    <p class="ui-field__error" id={inputId + "-error"} role="alert">{error}</p>
  {:else if help}
    <p class="ui-field__help" id={inputId + "-help"}>{help}</p>
  {/if}
</div>

<style>
  .ui-field {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
  }

  .ui-field--full {
    width: 100%;
  }

  .ui-field__label {
    font-size: var(--text-sm);
    font-weight: var(--ui-weight-semibold);
    line-height: var(--ui-line-tight);
    color: var(--text-primary);
  }

  .ui-input {
    width: 100%;
    min-height: var(--ui-touch-min);
    margin: 0;
    padding-inline: var(--space-3);
    padding-block: var(--space-2-5);
    border: 1px solid var(--input-border);
    border-radius: var(--radius-md);
    background: var(--input-bg);
    color: var(--text-primary);
    font-family: inherit;
    font-size: var(--text-base);
    line-height: var(--ui-line-compact);
    transition:
      border-color var(--duration-fast) var(--ease-default),
      box-shadow var(--duration-fast) var(--ease-default),
      background-color var(--duration-fast) var(--ease-default);
  }

  .ui-input:hover:not(:disabled) {
    border-color: var(--border-strong);
  }

  .ui-input:focus {
    outline: none;
    border-color: var(--input-focus);
    box-shadow: var(--shadow-focus);
  }

  .ui-input::placeholder {
    color: var(--input-placeholder);
  }

  .ui-input:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    background: var(--bg-surface-sunken);
  }

  .ui-input--error {
    border-color: var(--color-error-base);
  }

  .ui-input--error:focus {
    outline: 2px solid var(--color-error-base);
    outline-offset: 1px;
    box-shadow: none;
  }

  .ui-field__help,
  .ui-field__error {
    margin: 0;
    font-size: var(--text-sm);
    line-height: var(--ui-line-compact);
  }

  .ui-field__help {
    color: var(--text-secondary);
  }

  .ui-field__error {
    color: var(--text-error);
    font-weight: var(--ui-weight-medium);
  }

  @media (prefers-reduced-motion: reduce) {
    .ui-input {
      transition: none;
    }
  }
</style>
