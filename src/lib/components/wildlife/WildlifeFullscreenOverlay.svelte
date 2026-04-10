<script lang="ts">
  import { E } from "$lib/emojis.js";

  interface Props {
    naam: string;
    imageSrc: string;
    onClose: () => void;
  }

  let { naam, imageSrc, onClose }: Props = $props();
</script>

<div class="wl-fs-overlay" role="dialog" aria-modal="true" aria-label={`Foto van ${naam}`}>
  <button type="button" class="wl-fs-back" onclick={onClose}>{E.PIJL} Terug</button>
  <img src={imageSrc} alt={naam} class="wl-fs-img" />
</div>

<style>
  .wl-fs-overlay {
    position: fixed;
    inset: 0;
    z-index: 1200;
    background: color-mix(in srgb, var(--color-neutral-950) 95%, transparent);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: var(--space-12) var(--space-3) var(--space-4) var(--space-3);
  }
  .wl-fs-img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    object-position: center;
  }
  .wl-fs-back {
    position: absolute;
    top: var(--space-2-5);
    left: var(--space-2-5);
    border: none;
    border-radius: var(--radius-full);
    padding: var(--space-2) var(--space-3);
    background: color-mix(in srgb, var(--bg-surface) 14%, transparent);
    color: var(--text-inverse);
    font-size: var(--text-sm);
    font-weight: var(--ui-weight-bold);
    cursor: pointer;
  }
  .wl-fs-back:active {
    opacity: 0.75;
  }
</style>
