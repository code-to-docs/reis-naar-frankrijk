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
    padding: var(--space-5) var(--space-4) var(--space-4);
    text-align: left;
    position: relative;
    z-index: 99;
    border-bottom: 2px solid var(--white-a10);
    box-shadow: 0 var(--space-1) var(--space-3) var(--black-a10);
    width: min(100%, var(--content-max-width));
    margin: var(--space-2-5) auto 0;
    border-radius: var(--radius-lg) var(--radius-lg) var(--radius-sm) var(--radius-sm);
  }
  .header h1 {
    color: var(--text-inverse);
    margin-bottom: var(--space-1);
    font-size: clamp(1.75rem, 4.8vw, 2.35rem);
    line-height: var(--leading-tight);
    letter-spacing: var(--tracking-tighter);
  }
  .header p {
    color: var(--white-a90);
    font-size: var(--text-base);
    font-weight: var(--ui-weight-medium);
    margin: 0;
  }

  @media (max-width: 768px) {
    .header {
      margin-inline: var(--space-2-5);
      width: auto;
      border-radius: var(--radius-xl) var(--radius-xl) var(--radius-sm) var(--radius-sm);
      padding: var(--space-4);
    }
    .header h1 { font-size: clamp(1.95rem, 8vw, 2.2rem); }
    .header p { font-size: var(--text-base); }
  }

  @media (min-width: 1100px) {
    .header {
      text-align: center;
      margin: 0 auto;
      padding: var(--space-8) var(--space-6) var(--space-8);
      border-radius: var(--radius-lg);
      border-bottom-width: 1px;
      background:
        linear-gradient(130deg, var(--color-primary-900), var(--color-primary-800)),
        radial-gradient(circle at 18% 15%, var(--white-a15), transparent 45%),
        radial-gradient(circle at 84% 82%, var(--white-a10), transparent 40%);
    }

    .header h1 {
      font-size: clamp(2.3rem, 3.5vw, 3.15rem);
      margin-bottom: var(--space-1-5);
      letter-spacing: var(--tracking-tighter);
    }

    .header p {
      font-size: var(--text-lg);
      color: var(--white-a90);
    }
  }

  :global(html.dark) .header {
    background: linear-gradient(135deg, var(--color-primary-900) 0%, var(--color-primary-800) 100%);
    border-bottom-color: var(--border-accent-subtle);
    box-shadow: 0 var(--space-1) var(--space-3) var(--black-a35);
  }
</style>
