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
    gap: 14px;
    padding: 14px 16px;
    min-height: 52px;
    background: transparent;
    border: none;
    border-bottom: 1px solid var(--border-subtle, #f1f5f9);
    cursor: pointer;
    text-align: left;
    font-family: inherit;
    color: inherit;
    -webkit-tap-highlight-color: transparent;
    -webkit-user-select: none;
    user-select: none;
    touch-action: manipulation;
    transition:
      background-color 100ms ease,
      transform 100ms ease;
  }

  .list-item:last-child {
    border-bottom: none;
  }

  /* ---------- Hover ---------- */

  .list-item:hover:not(:active) {
    background: var(--hover-bg, #f8fafc);
  }

  /* ---------- Active ---------- */

  .list-item:active {
    background: var(--hover-bg, #f1f5f9);
    transform: scale(0.99);
  }

  /* ---------- Focus ---------- */

  .list-item:focus-visible {
    outline: none;
    box-shadow: inset 0 0 0 2px rgba(59, 108, 228, 0.4);
  }

  /* ---------- Emoji ---------- */

  .list-item-emoji {
    font-size: 1.4rem;
    flex-shrink: 0;
    line-height: 1;
  }

  /* ---------- Content ---------- */

  .list-item-content {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .list-item-label {
    font-size: 0.95rem;
    font-weight: 500;
    color: var(--tekst, #333);
    line-height: 1.3;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .list-item-subtitle {
    font-size: 0.8rem;
    font-weight: 400;
    color: var(--tekst-subtiel, #64748b);
    line-height: 1.3;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  /* ---------- Chevron ---------- */

  .list-item-chevron {
    flex-shrink: 0;
    color: var(--nav-text, #94a3b8);
    transition: transform 100ms ease;
  }

  .list-item:hover .list-item-chevron {
    transform: translateX(2px);
  }

  /* ---------- Accessory ---------- */

  .list-item-accessory {
    flex-shrink: 0;
    display: flex;
    align-items: center;
  }

  /* ---------- Dark mode ---------- */

  :global(html.dark) .list-item {
    border-bottom-color: var(--border-subtle, #1e293b);
  }

  :global(html.dark) .list-item:hover:not(:active) {
    background: var(--hover-bg, #1a1a1a);
  }

  :global(html.dark) .list-item:active {
    background: var(--hover-bg, #222222);
  }

  :global(html.dark) .list-item-label {
    color: var(--tekst, #e2e8f0);
  }

  :global(html.dark) .list-item-subtitle {
    color: var(--tekst-subtiel, #94a3b8);
  }

  :global(html.dark) .list-item-chevron {
    color: var(--nav-text, #64748b);
  }

  :global(html.dark) .list-item:focus-visible {
    box-shadow: inset 0 0 0 2px rgba(133, 174, 255, 0.4);
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