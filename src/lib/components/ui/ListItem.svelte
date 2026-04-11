<script>
  let {
    emoji = "",
    label = "",
    subtitle = "",
    arrow = true,
    onclick,
    children = null
  } = $props();

  // arrow: toont standaard chevron rechts
  // children: overschrijft de chevron (bijv. toggle, badge)
</script>

<button class="list-item" type="button" {onclick}>
  {#if emoji}
    <span class="list-item-emoji">{emoji}</span>
  {/if}
  <div class="list-item-content">
    <span class="list-item-label">{label}</span>
    {#if subtitle}
      <span class="list-item-subtitle">{subtitle}</span>
    {/if}
  </div>
  {#if children}
    <div class="list-item-accessory">
      {@render children()}
    </div>
  {:else if arrow}
    <svg class="list-item-chevron" width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M6 4L10 8L6 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  {/if}
</button>

<style>
  /* ==========================================
     ListItem Primitive
     Bron: UI_NORMPROFIEL sectie 10.6
     
     Bedoeld voor gebruik BINNEN een container
     (.meer-groep-items) die de card-achtergrond,
     border-radius en shadow levert.
     ========================================== */

  .list-item {
    width: 100%;
    display: flex;
    align-items: center;
    gap: var(--space-3-5);
    padding: var(--space-3-5) var(--space-4);
    min-height: var(--space-13);
    background: transparent;
    border: none;
    border-bottom: 1px solid var(--border-subtle);
    cursor: pointer;
    text-align: left;
    font-family: inherit;
    color: inherit;
    -webkit-tap-highlight-color: transparent;
    -webkit-user-select: none;
    user-select: none;
    touch-action: manipulation;
    transition:
      background-color var(--duration-fast) var(--ease-default),
      transform var(--duration-fast) var(--ease-default);
  }

  .list-item:last-child {
    border-bottom: none;
  }

  /* ---------- Hover ---------- */

  .list-item:hover:not(:active) {
    background: var(--hover-bg);
  }

  /* ---------- Active ---------- */

  .list-item:active {
    background: var(--bg-interactive-active);
    transform: scale(0.99);
  }

  /* ---------- Focus ---------- */

  .list-item:focus-visible {
    outline: none;
    box-shadow: var(--shadow-focus);
  }

  /* ---------- Emoji ---------- */

  .list-item-emoji {
    font-size: var(--text-lg);
    flex-shrink: 0;
    line-height: 1;
  }

  /* ---------- Content ---------- */

  .list-item-content {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: var(--space-0-5);
  }

  .list-item-label {
    font-size: var(--text-base);
    font-weight: var(--weight-medium);
    color: var(--tekst);
    line-height: var(--leading-snug);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .list-item-subtitle {
    font-size: var(--text-sm);
    font-weight: var(--weight-regular);
    color: var(--text-secondary);
    line-height: var(--leading-snug);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  /* ---------- Chevron ---------- */

  .list-item-chevron {
    flex-shrink: 0;
    color: var(--nav-text);
    transition: transform var(--duration-fast) var(--ease-default);
  }

  .list-item:hover .list-item-chevron {
    transform: translateX(var(--space-0-5));
  }

  /* ---------- Accessory ---------- */

  .list-item-accessory {
    flex-shrink: 0;
    display: flex;
    align-items: center;
  }

  /* ---------- Dark mode ---------- */

  :global(html.dark) .list-item {
    border-bottom-color: var(--border-subtle);
  }

  :global(html.dark) .list-item:hover:not(:active) {
    background: var(--hover-bg);
  }

  :global(html.dark) .list-item:active {
    background: var(--bg-interactive-active);
  }

  :global(html.dark) .list-item-label {
    color: var(--text-primary);
  }

  :global(html.dark) .list-item-subtitle {
    color: var(--text-secondary);
  }

  :global(html.dark) .list-item-chevron {
    color: var(--nav-text);
  }

  :global(html.dark) .list-item:focus-visible {
    box-shadow: var(--shadow-focus);
  }

  /* ---------- Reduced motion ---------- */

  @media (prefers-reduced-motion: reduce) {
    .list-item {
      transition: none;
    }
    .list-item:active {
      transform: none;
    }
    .list-item-chevron {
      transition: none;
    }
  }
</style>