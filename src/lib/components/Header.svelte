<script>
  import { page } from "$app/stores";
  import { appState } from "$lib/stores.svelte.js";
  import { E } from "$lib/emojis.js";

  let title = $derived.by(() => {
    switch ($page.url.pathname) {
      case "/": return `FR Frankrijk`;
      case "/budget": return `${E.GELD} Vakantiebudget`;
      case "/campings": return `${E.CAMPING} Overnachtingen`;
      case "/poi": return `${E.PIN} POI suggesties`;
      case "/meer": return "Menu & Instellingen";
      default:
        if ($page.url.pathname.startsWith("/meer/wildlife")) return `${E.VOGEL} Wildlife`;
        return `${E.VLAG} Frankrijk`;
    }
  });

  let subtitle = $derived.by(() => {
    switch ($page.url.pathname) {
      case "/":
        return `Hoi ${appState.gebruiker}!`;
      case "/poi":
        return "Leuke stops, uitzichten en uitstapjes voor onderweg.";
      default:
        return "";
    }
  });
</script>

<div class="header">
  <h1>{title}</h1>
  {#if subtitle}<p>{subtitle}</p>{/if}
</div>

<style>
  .header {
    background: linear-gradient(135deg, var(--header-bg) 0%, var(--bg-accent-hover) 100%);
    color: var(--text-inverse);
    padding: 20px 18px 18px;
    text-align: left;
    position: relative;
    z-index: 99;
    border-bottom: 2px solid rgba(255,255,255,0.1);
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    width: min(100%, var(--content-max-width));
    margin: 10px auto 0;
    border-radius: var(--radius-lg) var(--radius-lg) var(--radius-sm) var(--radius-sm);
  }
  .header h1 {
    color: var(--text-inverse);
    margin-bottom: 5px;
    font-size: clamp(1.75rem, 4.8vw, 2.35rem);
    line-height: 1.05;
    letter-spacing: -0.02em;
  }
  .header p {
    color: rgba(255, 255, 255, 0.85);
    font-size: var(--font-size-md);
    font-weight: var(--ui-weight-medium);
    margin: 0;
  }

  @media (max-width: 640px) {
    .header {
      margin-inline: 10px;
      width: auto;
      border-radius: var(--radius-xl) var(--radius-xl) var(--radius-sm) var(--radius-sm);
      padding: 18px 16px 16px;
    }
    .header h1 { font-size: clamp(1.95rem, 8vw, 2.2rem); }
    .header p { font-size: var(--font-size-md); }
  }

  @media (min-width: 1100px) {
    .header {
      text-align: center;
      margin: 0 auto;
      padding: 36px 24px 34px;
      border-radius: var(--radius-lg);
      border-bottom-width: 1px;
      background:
        linear-gradient(130deg, rgba(0, 38, 84, 0.9), rgba(26, 82, 118, 0.86)),
        radial-gradient(circle at 18% 15%, rgba(255, 255, 255, 0.16), transparent 45%),
        radial-gradient(circle at 84% 82%, rgba(255, 255, 255, 0.12), transparent 40%);
    }

    .header h1 {
      font-size: clamp(2.3rem, 3.5vw, 3.15rem);
      margin-bottom: 6px;
      letter-spacing: -0.03em;
    }

    .header p {
      font-size: var(--font-size-lg);
      color: rgba(255, 255, 255, 0.9);
    }
  }

  :global(html.dark) .header {
    background: linear-gradient(135deg, var(--color-primary-900) 0%, var(--color-primary-800) 100%);
    border-bottom-color: rgba(59, 130, 246, 0.2);
    box-shadow: 0 4px 12px rgba(0,0,0,0.35);
  }
</style>
