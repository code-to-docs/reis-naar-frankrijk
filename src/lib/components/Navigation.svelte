<script lang="ts">
  import { page } from "$app/stores";
  import { onMount } from "svelte";
  import { E } from "$lib/emojis.js";
  import { appState } from "$lib/stores.svelte.js";

  let online = $state(true);

  const paginas = [
    { id: "/", emoji: "\u{1F3E0}", label: "Home" },
    { id: "/campings", emoji: E.CAMPING, label: "Campings" },
    { id: "/poi", emoji: E.PIN, label: "POIs" },
    { id: "/budget", emoji: E.GELD, label: "Budget" },
    { id: "/meer", emoji: "\u2630", label: "Meer" }
  ];

  const isActive = (path: string) =>
    $page.url.pathname === path || ($page.url.pathname.startsWith("/meer") && path === "/meer");

  onMount(() => {
    online = navigator.onLine;
    const goOnline = () => (online = true);
    const goOffline = () => (online = false);
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
    <span>Geen internet - data wordt lokaal bewaard</span>
  </div>
{/if}

<nav class="nav-bar">
  <div class="nav-desktop-profile">
    <div class="profile-avatar">{appState.gebruiker?.charAt(0) || "?"}</div>
    <div class="profile-meta">
      <strong>{appState.gebruiker || "Gebruiker"}</strong>
      <span>Reismodus actief</span>
    </div>
  </div>

  <div class="nav-links">
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
  </div>
</nav>

<style>
  .nav-desktop-profile,
  .profile-avatar,
  .profile-meta {
    display: none;
  }

  .nav-links {
    display: flex;
    justify-content: space-around;
    width: 100%;
  }

  .offline-bar {
    position: fixed;
    bottom: 78px;
    left: 0; right: 0;
    background: #fef2f2;
    color: #991b1b;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 7px 16px;
    font-size: 0.78rem;
    font-weight: 500;
    z-index: 99;
    max-width: var(--app-max-width);
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
    padding: 8px 0 calc(env(safe-area-inset-bottom, 8px) + 2px) 0;
    box-shadow: 0 -2px 14px var(--nav-shadow);
    z-index: 100;
    max-width: var(--app-max-width);
    margin: 0 auto;
    border-top: 1px solid var(--border-subtle);
  }

  .nav-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    background: none;
    border: none;
    text-decoration: none;
    justify-content: center;
    min-height: 64px;
    min-width: 62px;
    padding: 5px 10px;
    cursor: pointer;
    position: relative;
    transition: transform 0.15s ease;
    -webkit-tap-highlight-color: transparent;
  }
  .nav-item:active { transform: scale(0.92); }

  .nav-emoji {
    font-size: 24px;
    line-height: 1;
    margin-bottom: 4px;
    transition: transform 0.2s ease;
  }
  .nav-item.active .nav-emoji { transform: scale(1.08); }

  .nav-label {
    font-size: 12px;
    font-weight: 600;
    color: var(--nav-text);
    transition: color 0.2s ease;
    line-height: 1;
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

  @media (min-width: 1100px) {
    .offline-bar {
      left: max(14px, calc((100vw - var(--app-max-width)) / 2 + 14px));
      right: auto;
      width: 220px;
      bottom: 14px;
      border-radius: 12px;
      max-width: none;
      z-index: 130;
      padding: 8px 10px;
      text-align: center;
    }

    .nav-bar {
      position: sticky;
      top: 14px;
      left: auto;
      right: auto;
      bottom: auto;
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      gap: 12px;
      width: 220px;
      border-radius: 18px;
      padding: 14px 10px;
      box-shadow: 0 6px 22px var(--nav-shadow);
      border: 1px solid var(--border-subtle);
      min-height: calc(100dvh - 28px);
      margin: 0;
    }

    .nav-desktop-profile {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 4px 8px 14px;
      border-bottom: 1px solid var(--border-subtle);
    }

    .profile-avatar {
      width: 46px;
      height: 46px;
      border-radius: 50%;
      background: linear-gradient(135deg, #0f4d84, #2b79c2);
      color: #fff;
      font-size: 1.15rem;
      font-weight: 700;
      align-items: center;
      justify-content: center;
      display: flex;
      text-transform: uppercase;
      border: 2px solid rgba(255, 255, 255, 0.65);
    }

    .profile-meta {
      display: flex;
      flex-direction: column;
      gap: 2px;
      min-width: 0;
    }

    .profile-meta strong {
      font-size: 1rem;
      line-height: 1.1;
      color: var(--heading);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .profile-meta span {
      font-size: 0.74rem;
      color: var(--nav-text);
      font-weight: 500;
    }

    .nav-links {
      flex-direction: column;
      gap: 6px;
      align-items: stretch;
    }

    .nav-item {
      flex-direction: row;
      justify-content: flex-start;
      gap: 10px;
      width: 100%;
      min-height: 46px;
      border-radius: 12px;
      padding: 9px 12px;
      transition: background-color 0.2s ease, transform 0.15s ease;
    }

    .nav-item:hover {
      background: var(--hover-bg);
    }

    .nav-emoji {
      margin: 0;
      font-size: 20px;
      min-width: 22px;
      text-align: center;
    }

    .nav-label {
      font-size: 0.98rem;
      line-height: 1.1;
    }

    .nav-item.active {
      background: var(--hover-bg);
    }

    .nav-indicator {
      top: 50%;
      left: 5px;
      transform: translateY(-50%);
      width: 3px;
      height: 22px;
      border-radius: 3px;
    }
  }
</style>
