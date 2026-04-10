<script lang="ts">
  import { page } from "$app/stores";
  import { onMount } from "svelte";
  import { E } from "$lib/emojis.js";
  import { appState } from "$lib/stores.svelte.js";

  let online = $state(true);

  const paginas = [
    { id: "/", emoji: "\u{1F3E0}", label: "Home" },
    { id: "/campings", emoji: E.CAMPING, label: "Overnachtingen" },
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
    {#each paginas as p (p.id)}
      {@const active = isActive(p.id)}
      <a href={p.id} class="nav-item" class:active aria-current={active ? "page" : undefined}>
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
    background: var(--color-error-light);
    color: var(--text-error);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-2);
    padding: 7px var(--space-4);
    font-size: var(--text-xs);
    font-weight: var(--weight-medium);
    z-index: 99;
    max-width: var(--app-max-width);
    margin: 0 auto;
    animation: slideUp var(--duration-slow) ease-out;
  }
  .offline-dot {
    width: var(--space-2); height: var(--space-2);
    background: var(--color-error-base);
    border-radius: var(--radius-full);
    animation: pulse 2s infinite;
  }
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.4; }
  }
  @keyframes slideUp {
    from { transform: translateY(var(--space-2-5)); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }

  .nav-bar {
    position: fixed;
    bottom: 0; left: 0; right: 0;
    background: var(--nav-bg);
    display: flex;
    justify-content: space-around;
    padding: var(--space-2) 0 calc(env(safe-area-inset-bottom, var(--space-2)) + 2px) 0;
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
    padding: 5px var(--space-2-5);
    cursor: pointer;
    position: relative;
    transition: transform 0.15s ease;
    -webkit-tap-highlight-color: transparent;
  }
  .nav-item:active { transform: scale(0.92); }

  .nav-emoji {
    font-size: var(--text-xl);
    line-height: 1;
    margin-bottom: var(--space-1);
    transition: transform var(--duration-normal) ease;
  }
  .nav-item.active .nav-emoji { transform: scale(1.08); }

  .nav-label {
    font-size: var(--text-xs);
    font-weight: var(--weight-semibold);
    color: var(--nav-text);
    transition: color var(--duration-normal) ease;
    line-height: 1.15;
  }
  .nav-item.active .nav-label {
    color: var(--nav-active);
    font-weight: var(--weight-bold);
  }

  .nav-indicator {
    position: absolute;
    top: -var(--space-1-5);
    width: var(--space-5);
    height: 3px;
    background: var(--nav-active);
    border-radius: var(--radius-sm);
  }

  @media (min-width: 1100px) {
    .offline-bar {
      left: max(14px, calc((100vw - var(--app-max-width)) / 2 + 14px));
      right: auto;
      width: 220px;
      bottom: 14px;
      border-radius: var(--radius-lg);
      max-width: none;
      z-index: 130;
      padding: var(--space-2) var(--space-2-5);
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
      gap: var(--space-3);
      width: 220px;
      border-radius: var(--radius-xl);
      padding: 14px var(--space-2-5);
      box-shadow: 0 var(--space-1-5) 22px var(--nav-shadow);
      border: 1px solid var(--border-subtle);
      min-height: calc(100dvh - 28px);
      margin: 0;
    }

    .nav-desktop-profile {
      display: flex;
      align-items: center;
      gap: var(--space-2-5);
      padding: var(--space-1) var(--space-2) 14px;
      border-bottom: 1px solid var(--border-subtle);
    }

    .profile-avatar {
      width: 46px;
      height: 46px;
      border-radius: var(--radius-full);
      background: linear-gradient(135deg, var(--color-primary-700), var(--border-accent));
      color: var(--text-inverse);
      font-size: 1.15rem;
      font-weight: var(--weight-bold);
      align-items: center;
      justify-content: center;
      display: flex;
      text-transform: uppercase;
      border: 2px solid color-mix(in srgb, var(--bg-surface) 65%, transparent);
    }

    .profile-meta {
      display: flex;
      flex-direction: column;
      gap: 2px;
      min-width: 0;
    }

    .profile-meta strong {
      font-size: var(--text-base);
      line-height: 1.1;
      color: var(--heading);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .profile-meta span {
      font-size: var(--text-xs);
      color: var(--nav-text);
      font-weight: var(--weight-medium);
    }

    .nav-links {
      flex-direction: column;
      gap: var(--space-1-5);
      align-items: stretch;
    }

    .nav-item {
      flex-direction: row;
      justify-content: flex-start;
      gap: var(--space-2-5);
      width: 100%;
      min-height: 46px;
      border-radius: var(--radius-lg);
      padding: 9px var(--space-3);
      transition: background-color var(--duration-normal) ease, transform 0.15s ease;
    }

    .nav-item:hover {
      background: var(--hover-bg);
    }

    .nav-emoji {
      margin: 0;
      font-size: var(--text-lg);
      min-width: 22px;
      text-align: center;
    }

    .nav-label {
      font-size: var(--text-base);
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
      border-radius: var(--radius-sm);
    }
  }
</style>



