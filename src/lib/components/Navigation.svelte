<script>
  import { page } from "$app/stores";
  import { onMount } from "svelte";

  let online = $state(true);
  import { E } from "$lib/emojis.js";

  const paginas = [
    { id: "/",         emoji: "\u{1F3E0}", label: "Home" },
    { id: "/campings", emoji: E.CAMPING, label: "Campings" },
    { id: "/poi",      emoji: E.PIN,  label: "POIs" },
    { id: "/budget",   emoji: E.GELD, label: "Budget" },
    { id: "/meer",     emoji: "\u2630", label: "Meer" },
  ];

  const isActive = (path) => $page.url.pathname === path || ($page.url.pathname.startsWith('/meer') && path === '/meer');

  onMount(() => {
    online = navigator.onLine;
    const goOnline = () => online = true;
    const goOffline = () => online = false;
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  });
</script>

{#if !online}
  <div class="offline-bar">
    <span class="offline-dot"></span>
    <span>Geen internet — data wordt lokaal bewaard</span>
  </div>
{/if}

<nav class="nav-bar">
  {#each paginas as p}
    {@const active = isActive(p.id)}
    <a href={p.id} class="nav-item" class:active>
      <span class="nav-emoji">{p.emoji}</span>
      <span class="nav-label">{p.label}</span>
      {#if active}
        <div class="nav-indicator"></div>
      {/if}
    </a>
  {/each}
</nav>

<style>
  .offline-bar {
    position: fixed;
    bottom: 62px;
    left: 0; right: 0;
    background: #fef2f2;
    color: #991b1b;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 6px 16px;
    font-size: 0.75rem;
    font-weight: 500;
    z-index: 99;
    max-width: 600px;
    margin: 0 auto;
    animation: slideUp 0.3s ease-out;
  }
  .offline-dot {
    width: 8px; height: 8px;
    background: #ef4444;
    border-radius: 50%;
    animation: pulse 2s infinite;
  }
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.4; }
  }
  @keyframes slideUp {
    from { transform: translateY(10px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }

  .nav-bar {
    position: fixed;
    bottom: 0; left: 0; right: 0;
    background: var(--nav-bg);
    display: flex;
    justify-content: space-around;
    padding: 6px 0 env(safe-area-inset-bottom, 8px) 0;
    box-shadow: 0 -1px 10px var(--nav-shadow);
    z-index: 100;
    max-width: 600px;
    margin: 0 auto;
  }

  .nav-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    background: none;
    border: none;
    text-decoration: none;
    padding: 4px 12px;
    cursor: pointer;
    position: relative;
    transition: transform 0.15s ease;
    -webkit-tap-highlight-color: transparent;
  }
  .nav-item:active { transform: scale(0.92); }

  .nav-emoji {
    font-size: 22px;
    line-height: 1;
    margin-bottom: 2px;
    transition: transform 0.2s ease;
  }
  .nav-item.active .nav-emoji { transform: scale(1.15); }

  .nav-label {
    font-size: 10px;
    font-weight: 500;
    color: var(--nav-text);
    transition: color 0.2s ease;
  }
  .nav-item.active .nav-label {
    color: var(--nav-active);
    font-weight: 700;
  }

  .nav-indicator {
    position: absolute;
    top: -6px;
    width: 20px;
    height: 3px;
    background: var(--nav-active);
    border-radius: 2px;
  }
</style>