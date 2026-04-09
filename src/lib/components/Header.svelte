<script>
  import { page } from "$app/stores";
  import { appState } from "$lib/stores.svelte.js";
  import { E } from "$lib/emojis.js";

  let title = $derived.by(() => {
    switch ($page.url.pathname) {
      case "/": return `${E.VLAG} Frankrijk`;
      case "/budget": return `${E.GELD} Vakantiebudget`;
      case "/campings": return `${E.CAMPING} Campings`;
      case "/poi": return `${E.PIN} Bezienswaardigheden`;
      case "/meer": return "Menu & Instellingen";
      default:
        if ($page.url.pathname.startsWith("/meer/wildlife")) return `${E.VOGEL} Wildlife`;
        return `${E.VLAG} Frankrijk`;
    }
  });

  let subtitle = $derived($page.url.pathname === "/" ? `Hoi ${appState.gebruiker}!` : "");
</script>

<div class="header">
  <h1>{title}</h1>
  {#if subtitle}<p>{subtitle}</p>{/if}
</div>

<style>
  .header {
    background: linear-gradient(135deg, var(--header-bg) 0%, #1a5276 100%);
    color: white;
    padding: 24px 16px;
    text-align: center;
    position: sticky;
    top: 0;
    z-index: 99;
    border-bottom: 2px solid rgba(255,255,255,0.1);
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  }
  .header h1 {
    color: #ffffff;
    margin-bottom: 4px;
    font-size: 1.5rem;
  }
  .header p {
    color: rgba(255, 255, 255, 0.85);
    font-size: 0.95rem;
    margin: 0;
  }

  :global(html.dark) .header {
    background: linear-gradient(135deg, #0c2d48 0%, #1e3a5f 100%);
    border-bottom-color: rgba(59, 130, 246, 0.2);
    box-shadow: 0 4px 12px rgba(0,0,0,0.35);
  }
</style>
